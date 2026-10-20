import { describe, expect, it } from "vitest";
import { decideSignIn, isRegistrantAllowed } from "@/lib/luma/allowlist";
import { normalizeEmail } from "@/lib/luma/email";

const none = new Set<string>();

describe("allowlist matching", () => {
  it("normalises emails (trim + lower case)", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("allows guests unless their Luma status is blocked (declined by default)", () => {
    expect(isRegistrantAllowed({ email: "a@x.com", lumaStatus: "approved" })).toBe(true);
    expect(isRegistrantAllowed({ email: "a@x.com", lumaStatus: "waitlist" })).toBe(true);
    expect(isRegistrantAllowed({ email: "a@x.com", lumaStatus: null })).toBe(true);
    expect(isRegistrantAllowed({ email: "a@x.com", lumaStatus: "Declined" })).toBe(false);
    expect(isRegistrantAllowed({ email: "a@x.com", lumaStatus: "waitlist" }, ["waitlist"])).toBe(false);
    expect(isRegistrantAllowed(null)).toBe(false);
  });

  it("rejects emails that are not on the guest list with a message pointing to Luma", () => {
    const decision = decideSignIn({ email: "x@y.com", superAdminEmails: none, isStaff: false, registrant: null });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.reason).toBe("not_on_list");
      expect(decision.message).toContain("luma.com");
    }
  });

  it("lets super admins (case-insensitive) and staff bypass the list", () => {
    expect(
      decideSignIn({ email: " Boss@Org.it ", superAdminEmails: new Set(["boss@org.it"]), isStaff: false, registrant: null }),
    ).toEqual({ allowed: true, reason: "super_admin" });
    expect(decideSignIn({ email: "m@org.it", superAdminEmails: none, isStaff: true, registrant: null })).toEqual({
      allowed: true,
      reason: "staff",
    });
  });

  it("blocks declined guests", () => {
    const d = decideSignIn({
      email: "a@x.com",
      superAdminEmails: none,
      isStaff: false,
      registrant: { email: "a@x.com", lumaStatus: "declined" },
    });
    expect(d.allowed).toBe(false);
  });
});
