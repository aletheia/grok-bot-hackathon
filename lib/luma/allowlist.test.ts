import { describe, expect, it } from "vitest";
import {
  DECLINED_MESSAGE,
  NOT_APPROVED_MESSAGE,
  NOT_ON_GUEST_LIST_MESSAGE,
  decideSignIn,
  isRegistrantApproved,
  normalizeLumaStatus,
} from "@/lib/luma/allowlist";
import { normalizeEmail } from "@/lib/luma/email";

const none = new Set<string>();
const guest = (lumaStatus: string | null) => ({ email: "a@x.com", lumaStatus });
const decide = (lumaStatus: string | null) =>
  decideSignIn({ email: "a@x.com", superAdminEmails: none, isStaff: false, registrant: guest(lumaStatus) });

describe("allowlist matching", () => {
  it("normalises emails (trim + lower case)", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("normalises Luma status variants", () => {
    expect(normalizeLumaStatus(" Approved ")).toBe("approved");
    expect(normalizeLumaStatus("Pending Approval")).toBe("pending_approval");
    expect(normalizeLumaStatus("pending-approval")).toBe("pending_approval");
    expect(normalizeLumaStatus(null)).toBe("");
  });

  it("only approved guests pass (case-insensitive; 'Going' is Luma's UI label for approved)", () => {
    for (const ok of ["approved", "APPROVED", " Approved ", "going", "Going"]) {
      expect(isRegistrantApproved(guest(ok))).toBe(true);
    }
    for (const no of ["waitlist", "pending", "pending_approval", "Pending Approval", "invited", "declined", "", "  ", null, "unknown"]) {
      expect(isRegistrantApproved(guest(no))).toBe(false);
    }
    expect(isRegistrantApproved(null)).toBe(false);
  });

  it("allows approved guests", () => {
    expect(decide("approved")).toEqual({ allowed: true, reason: "guest_list" });
  });

  it("refuses not-yet-approved guests with the 'not approved' message", () => {
    for (const status of ["waitlist", "pending", "pending_approval", "invited", "", null]) {
      const d = decide(status);
      expect(d.allowed).toBe(false);
      if (!d.allowed) {
        expect(d.reason).toBe("not_approved");
        expect(d.code).toBe("LUMA_NOT_APPROVED");
        expect(d.message).toBe(NOT_APPROVED_MESSAGE);
      }
    }
    expect(NOT_APPROVED_MESSAGE).toBe(
      "Your Luma registration isn't approved yet. You can sign in once the organisers approve it on Luma.",
    );
  });

  it("refuses declined guests with their own message", () => {
    const d = decide("Declined");
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      expect(d.reason).toBe("declined");
      expect(d.message).toBe(DECLINED_MESSAGE);
    }
  });

  it("rejects emails that are not on the guest list with a distinct message pointing to Luma", () => {
    const d = decideSignIn({ email: "x@y.com", superAdminEmails: none, isStaff: false, registrant: null });
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      expect(d.reason).toBe("not_on_list");
      expect(d.code).toBe("NOT_ON_GUEST_LIST");
      expect(d.message).toBe(NOT_ON_GUEST_LIST_MESSAGE);
      expect(d.message).toContain("luma.com");
      expect(d.message).not.toBe(NOT_APPROVED_MESSAGE);
    }
  });

  it("lets super admins (case-insensitive) and staff bypass the list and the status", () => {
    expect(
      decideSignIn({ email: " Boss@Org.it ", superAdminEmails: new Set(["boss@org.it"]), isStaff: false, registrant: null }),
    ).toEqual({ allowed: true, reason: "super_admin" });
    expect(decideSignIn({ email: "m@org.it", superAdminEmails: none, isStaff: true, registrant: null })).toEqual({
      allowed: true,
      reason: "staff",
    });
    expect(
      decideSignIn({ email: "boss@org.it", superAdminEmails: new Set(["boss@org.it"]), isStaff: false, registrant: guest("waitlist") }),
    ).toEqual({ allowed: true, reason: "super_admin" });
  });
});
