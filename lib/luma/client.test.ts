import { describe, expect, it, vi } from "vitest";
import {
  LumaApiError,
  fetchLumaGuestByEmail,
  getLumaConfig,
  listAllLumaGuests,
  mapLumaGuest,
} from "@/lib/luma/client";

const config = { apiKey: "test-key", eventId: "evt-TEST" };

function res(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}
const guest = (email: string, status: string, extra: Record<string, unknown> = {}) => ({
  user_email: email,
  user_name: null,
  user_first_name: "Ada",
  user_last_name: "Test",
  approval_status: status,
  registered_at: "2026-10-01T10:00:00.000Z",
  ...extra,
});

describe("getLumaConfig", () => {
  it("needs an API key and defaults the event id", () => {
    expect(getLumaConfig({})).toBeNull();
    expect(getLumaConfig({ LUMA_API_KEY: "  " })).toBeNull();
    expect(getLumaConfig({ LUMA_API_KEY: "k" })).toEqual({ apiKey: "k", eventId: "evt-IEb2nHBuHyLU7Jz" });
    expect(getLumaConfig({ LUMA_API_KEY: "k", LUMA_EVENT_API_ID: "evt-X" })?.eventId).toBe("evt-X");
  });
});

describe("mapLumaGuest", () => {
  it("normalises email and status, builds the name and parses the registration time", () => {
    const g = mapLumaGuest(guest(" Ada@Example.COM ", "Pending Approval"));
    expect(g).toEqual({
      email: "ada@example.com",
      name: "Ada Test",
      lumaStatus: "pending_approval",
      lumaRegisteredAt: new Date("2026-10-01T10:00:00.000Z"),
    });
  });
  it("skips entries without an email", () => {
    expect(mapLumaGuest({ approval_status: "approved" })).toBeNull();
    expect(mapLumaGuest({ user_email: "nope", approval_status: "approved" })).toBeNull();
  });
});

describe("fetchLumaGuestByEmail", () => {
  it("sends one read-only GET for the configured event with the API key header", async () => {
    const fetchImpl = vi.fn(async () => res(200, guest("ada@example.com", "approved")));
    const out = await fetchLumaGuestByEmail("Ada@Example.com", { config, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(out?.lumaStatus).toBe("approved");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://public-api.luma.com/v1/events/guests/get");
    expect(parsed.searchParams.get("event_id")).toBe("evt-TEST");
    expect(parsed.searchParams.get("id")).toBe("ada@example.com");
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>)["x-luma-api-key"]).toBe("test-key");
  });

  it("returns null for a 404 (not a guest)", async () => {
    const fetchImpl = vi.fn(async () => res(404, { message: "Guest not found.", code: null }));
    expect(await fetchLumaGuestByEmail("x@example.com", { config, fetchImpl: fetchImpl as unknown as typeof fetch })).toBeNull();
  });

  it("throws on auth errors, rate limits, server errors and network failures", async () => {
    for (const status of [401, 403, 429, 500]) {
      const fetchImpl = vi.fn(async () => res(status, { message: "x" }));
      await expect(
        fetchLumaGuestByEmail("x@example.com", { config, fetchImpl: fetchImpl as unknown as typeof fetch }),
      ).rejects.toBeInstanceOf(LumaApiError);
    }
    const boom = vi.fn(async () => {
      throw new Error("network");
    });
    await expect(
      fetchLumaGuestByEmail("x@example.com", { config, fetchImpl: boom as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(LumaApiError);
  });

  it("rejects an answer about a different guest", async () => {
    const fetchImpl = vi.fn(async () => res(200, guest("someone-else@example.com", "approved")));
    await expect(
      fetchLumaGuestByEmail("x@example.com", { config, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(LumaApiError);
  });

  it("throws when not configured", async () => {
    await expect(fetchLumaGuestByEmail("x@example.com", { config: null })).rejects.toBeInstanceOf(LumaApiError);
  });
});

describe("listAllLumaGuests", () => {
  it("follows next_cursor until has_more is false and de-duplicates by email", async () => {
    const pages = [
      { entries: [guest("a@example.com", "approved"), guest("b@example.com", "waitlist")], has_more: true, next_cursor: "c1" },
      { entries: [guest("B@example.com", "declined"), guest("c@example.com", "approved")], has_more: false, next_cursor: "c2" },
    ];
    const fetchImpl = vi.fn(async (url: string) => {
      const cursor = new URL(url).searchParams.get("pagination_cursor");
      return res(200, cursor ? pages[1] : pages[0]);
    });
    const out = await listAllLumaGuests({ config, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(out.pages).toBe(2);
    expect(out.guests.map((g) => [g.email, g.lumaStatus])).toEqual([
      ["a@example.com", "approved"],
      ["b@example.com", "declined"],
      ["c@example.com", "approved"],
    ]);
    for (const [url] of fetchImpl.mock.calls) expect(new URL(url).searchParams.get("event_id")).toBe("evt-TEST");
  });

  it("retries a 429 with backoff and then succeeds", async () => {
    let n = 0;
    const fetchImpl = vi.fn(async () => (n++ === 0 ? res(429, {}, { "retry-after": "1" }) : res(200, { entries: [], has_more: false })));
    const sleep = vi.fn(async () => {});
    const out = await listAllLumaGuests({ config, fetchImpl: fetchImpl as unknown as typeof fetch, sleep });
    expect(out.guests).toEqual([]);
    expect(sleep).toHaveBeenCalledWith(1000);
  });

  it("fails (no partial result) when a page keeps failing or the cursor does not advance", async () => {
    const always429 = vi.fn(async () => res(429, {}));
    await expect(
      listAllLumaGuests({ config, fetchImpl: always429 as unknown as typeof fetch, sleep: async () => {}, maxRetries: 2 }),
    ).rejects.toBeInstanceOf(LumaApiError);
    expect(always429).toHaveBeenCalledTimes(3);

    const loop = vi.fn(async () => res(200, { entries: [guest("a@example.com", "approved")], has_more: true, next_cursor: "same" }));
    await expect(listAllLumaGuests({ config, fetchImpl: loop as unknown as typeof fetch })).rejects.toBeInstanceOf(LumaApiError);
  });
});
