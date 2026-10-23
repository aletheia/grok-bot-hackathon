import { describe, expect, it, vi } from "vitest";
import { decideSignIn } from "@/lib/luma/allowlist";
import { LumaApiError } from "@/lib/luma/client";
import type { LumaGuest } from "@/lib/luma/csv";
import { createLiveLookupGuard, resolveRegistrantWithLuma } from "@/lib/luma/live";
import { diffLumaSync } from "@/lib/luma/sync-diff";

const g = (email: string, status: string | null): LumaGuest => ({ email, name: null, lumaStatus: status, lumaRegisteredAt: null });
const decide = (registrant: { email: string; lumaStatus: string | null } | null | undefined) =>
  decideSignIn({ email: "a@example.com", superAdminEmails: new Set(), isStaff: false, registrant });

describe("live Luma check at sign-in", () => {
  it("does not call Luma when the local row is already approved", async () => {
    const lookup = vi.fn();
    const out = await resolveRegistrantWithLuma("a@example.com", { email: "a@example.com", lumaStatus: "approved" }, { enabled: true, lookup, save: vi.fn() });
    expect(lookup).not.toHaveBeenCalled();
    expect(decide(out.registrant).allowed).toBe(true);
  });

  it("allows an unknown email that Luma reports as approved, and saves it", async () => {
    const save = vi.fn(async () => {});
    const out = await resolveRegistrantWithLuma("a@example.com", null, { enabled: true, lookup: async () => g("a@example.com", "approved"), save });
    expect(out.source).toBe("luma");
    expect(save).toHaveBeenCalledOnce();
    expect(decide(out.registrant).allowed).toBe(true);
  });

  it("promotes a locally waitlisted guest who is now approved on Luma", async () => {
    const out = await resolveRegistrantWithLuma("a@example.com", { email: "a@example.com", lumaStatus: "waitlist" }, { enabled: true, lookup: async () => g("a@example.com", "approved"), save: async () => {} });
    expect(decide(out.registrant).allowed).toBe(true);
  });

  it("keeps the existing messages for waitlist / pending / declined and not-on-list", async () => {
    const results: Record<string, string> = {};
    for (const status of ["waitlist", "pending_approval", "declined"]) {
      const out = await resolveRegistrantWithLuma("a@example.com", null, { enabled: true, lookup: async () => g("a@example.com", status), save: async () => {} });
      const d = decide(out.registrant);
      expect(d.allowed).toBe(false);
      results[status] = d.allowed ? "" : d.reason;
    }
    expect(results).toEqual({ waitlist: "not_approved", pending_approval: "not_approved", declined: "declined" });
    const none = await resolveRegistrantWithLuma("a@example.com", null, { enabled: true, lookup: async () => null, save: async () => {} });
    const d = decide(none.registrant);
    expect(!d.allowed && d.reason).toBe("not_on_list");
  });

  it("never opens access on a Luma error, when disabled, or when saving fails the other way round", async () => {
    const failing = await resolveRegistrantWithLuma("a@example.com", { email: "a@example.com", lumaStatus: "declined" }, { enabled: true, lookup: async () => { throw new LumaApiError("down", 500); }, save: vi.fn() });
    expect(failing.source).toBe("local");
    expect(decide(failing.registrant).allowed).toBe(false);
    const unknownFailing = await resolveRegistrantWithLuma("a@example.com", null, { enabled: true, lookup: async () => { throw new LumaApiError("429", 429); }, save: vi.fn() });
    expect(decide(unknownFailing.registrant).allowed).toBe(false);
    const lookup = vi.fn();
    const disabled = await resolveRegistrantWithLuma("a@example.com", null, { enabled: false, lookup, save: vi.fn() });
    expect(lookup).not.toHaveBeenCalled();
    expect(decide(disabled.registrant).allowed).toBe(false);
  });

  it("still uses Luma's answer when writing the row fails", async () => {
    const out = await resolveRegistrantWithLuma("a@example.com", null, { enabled: true, lookup: async () => g("a@example.com", "approved"), save: async () => { throw new Error("db"); } });
    expect(decide(out.registrant).allowed).toBe(true);
  });
});

describe("live lookup guard", () => {
  it("caches answers briefly and enforces a per-minute budget", async () => {
    let t = 0;
    const guard = createLiveLookupGuard({ ttlMs: 1000, maxPerMinute: 2, now: () => t });
    const lookup = vi.fn(async () => null);
    await guard.run("a@example.com", lookup);
    await guard.run("a@example.com", lookup);
    expect(lookup).toHaveBeenCalledTimes(1);
    await guard.run("b@example.com", lookup);
    await expect(guard.run("c@example.com", lookup)).rejects.toBeInstanceOf(LumaApiError);
    t = 61_000;
    await expect(guard.run("c@example.com", lookup)).resolves.toBeNull();
  });
});

describe("sync diff", () => {
  it("counts new rows, status changes, downgrades and upgrades without exposing guests", () => {
    const local = [
      { email: "a@example.com", lumaStatus: "approved" },
      { email: "b@example.com", lumaStatus: "waitlist" },
      { email: "c@example.com", lumaStatus: "approved" },
      { email: "gone@example.com", lumaStatus: "approved" },
    ];
    const remote = [g("a@example.com", "declined"), g("b@example.com", "approved"), g("c@example.com", "approved"), g("d@example.com", "waitlist")];
    expect(diffLumaSync(local, remote)).toEqual({
      fetched: 4,
      inserted: 1,
      existing: 3,
      statusChanged: 2,
      downgraded: 1,
      upgraded: 1,
      byStatus: { declined: 1, approved: 2, waitlist: 1 },
      missingFromLuma: 1,
    });
  });
});
