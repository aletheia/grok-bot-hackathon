import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  decision: { allowed: true, reason: "guest_list" } as Record<string, unknown>,
  hits: new Map<string, number>(),
}));

vi.mock("@/db", () => ({ db: {} }));
vi.mock("better-auth/adapters/drizzle", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory");
  return { drizzleAdapter: () => memoryAdapter({ user: [], account: [], session: [], verification: [], twoFactor: [] }) };
});
vi.mock("@/lib/email/send", () => ({ sendEmail: state.sendEmail }));
vi.mock("@/lib/luma/service", () => ({
  checkPortalSignIn: async () => state.decision,
  getSuperAdminEmails: () => new Set<string>(),
}));
// In-memory stand-in with the same fixed-window semantics as the SQL in lib/auth/email-throttle.ts.
vi.mock("@/lib/auth/email-throttle", () => ({
  throttleKey: (ns: string, value: string) => `${ns}:${value}`,
  consumeThrottle: async (key: string, _windowSeconds: number, max: number) => {
    const next = (state.hits.get(key) ?? 0) + 1;
    state.hits.set(key, next);
    return next <= max;
  },
}));

process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
process.env.BETTER_AUTH_URL = "http://localhost:3000";

const { auth } = await import("@/lib/auth");

const NOT_ON_LIST = {
  allowed: false,
  reason: "not_on_list",
  code: "NOT_ON_GUEST_LIST",
  message: "This email is not on the guest list.",
};
const WAITLIST = { allowed: false, reason: "not_approved", code: "LUMA_NOT_APPROVED", message: "Not approved yet." };
const DECLINED = { allowed: false, reason: "declined", code: "LUMA_NOT_APPROVED", message: "Declined." };

function post(email: string, ip = "203.0.113.7") {
  return auth.handler(
    new Request("http://localhost:3000/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000", "x-forwarded-for": `${ip}, 10.0.0.1` },
      body: JSON.stringify({ email, type: "sign-in" }),
    }),
  );
}

const sent = () => state.sendEmail.mock.calls.map((c) => c[0] as { to: string; subject: string; html: string });

beforeEach(() => {
  state.sendEmail.mockReset();
  state.sendEmail.mockResolvedValue({ ok: true });
  state.decision = { allowed: true, reason: "guest_list" };
  state.hits.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("send-verification-otp through better-auth", () => {
  it("approved path is unchanged: 200 success and the code is emailed", async () => {
    const res = await post("ok@example.com");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(sent()).toHaveLength(1);
    const mail = sent()[0] as { subject: string; html: string; text?: string };
    expect(mail.subject).toBe("Grok Bot Hackathon Pavia");
    // The code is in the body (not the subject), on its own line in the text version.
    const code = /^(\d{6})$/m.exec(mail.text ?? "")?.[1];
    expect(code).toBeDefined();
    expect(mail.subject).not.toContain(code as string);
    expect(mail.html).toContain(`>${code}</p>`);
    expect(sent()[0].to).toBe("ok@example.com");
  });

  it("surfaces a failed send as an HTTP error instead of success:true, and logs it without the address or code", async () => {
    state.sendEmail.mockResolvedValue({ ok: false, error: "domain not verified (ok@example.com)" });
    const res = await post("ok@example.com");
    expect(res.status).toBe(500);
    const body = (await res.json()) as { code?: string; message?: string };
    expect(body.code).toBe("EMAIL_SEND_FAILED");
    expect(body.message).toBe("We could not send the code. Please try again later or contact the organisers.");
    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).toContain("sign-in code email failed");
    expect(logged).not.toContain("ok@example.com");
    expect(logged).not.toMatch(/\b\d{6}\b/);
    // The failure marker does not leak into the next request.
    state.sendEmail.mockResolvedValue({ ok: true });
    expect((await post("ok@example.com")).status).toBe(200);
  });

  it("a rejected send (network error) is surfaced too", async () => {
    state.sendEmail.mockRejectedValue(new Error("fetch failed"));
    const res = await post("ok@example.com");
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "EMAIL_SEND_FAILED" });
  });

  it("concurrent requests do not swap outcomes", async () => {
    state.sendEmail.mockImplementation(async (mail: { to: string }) => {
      await new Promise((r) => setTimeout(r, mail.to.startsWith("bad") ? 40 : 5));
      return mail.to.startsWith("bad") ? { ok: false, error: "refused" } : { ok: true };
    });
    const [bad, good1, good2] = await Promise.all([post("bad@example.com"), post("good1@example.com"), post("good2@example.com")]);
    expect(bad.status).toBe(500);
    expect(good1.status).toBe(200);
    expect(good2.status).toBe(200);
    expect(await good1.json()).toEqual({ success: true });
  });

  it("not registered: 403 NOT_ON_GUEST_LIST plus exactly one invite per address", async () => {
    state.decision = NOT_ON_LIST;
    const first = await post("New@Example.com");
    expect(first.status).toBe(403);
    expect(await first.json()).toMatchObject({ code: "NOT_ON_GUEST_LIST", message: NOT_ON_LIST.message });
    expect(sent()).toHaveLength(1);
    expect(sent()[0].to).toBe("new@example.com");
    expect(sent()[0].html).toContain("https://luma.com/spacexai-z1ys");

    const second = await post("new@example.com");
    expect(second.status).toBe(403);
    expect(await second.json()).toMatchObject({ code: "NOT_ON_GUEST_LIST", message: NOT_ON_LIST.message });
    expect(sent()).toHaveLength(1);
  });

  it("caps invites per IP and keeps answering 403", async () => {
    state.decision = NOT_ON_LIST;
    for (let i = 0; i < 8; i += 1) expect((await post(`user${i}@example.com`, "198.51.100.20")).status).toBe(403);
    expect(sent()).toHaveLength(5);
  });

  it("waitlisted / pending: 403 LUMA_NOT_APPROVED plus a status email without the register link", async () => {
    state.decision = WAITLIST;
    const res = await post("wait@example.com");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "LUMA_NOT_APPROVED", message: WAITLIST.message });
    expect(sent()).toHaveLength(1);
    expect(sent()[0].html).toContain("not approved yet");
    expect(sent()[0].html).toContain("no need to register again");
  });

  it("declined: 403 only, no email", async () => {
    state.decision = DECLINED;
    const res = await post("no@example.com");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "LUMA_NOT_APPROVED", message: DECLINED.message });
    expect(sent()).toHaveLength(0);
  });

  it("a provider failure while sending the invite does not change the 403 answer", async () => {
    state.decision = NOT_ON_LIST;
    state.sendEmail.mockResolvedValue({ ok: false, error: "boom" });
    const res = await post("new@example.com");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "NOT_ON_GUEST_LIST" });
  });

  it("an invalid address is never emailed", async () => {
    state.decision = NOT_ON_LIST;
    const res = await post("not an email");
    expect(res.status).toBe(403);
    expect(sent()).toHaveLength(0);
  });
});
