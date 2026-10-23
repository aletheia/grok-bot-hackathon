import { EVENT } from "@/lib/event";
import { normalizeEmail } from "@/lib/luma/email";

export type RegistrantLike = { email: string; lumaStatus: string | null } | null | undefined;

export const NOT_ON_GUEST_LIST_MESSAGE =
  `This email is not on the ${EVENT.name} guest list. Sign in with the same email you used to register on Luma` +
  ` (${EVENT.registration.url}). If you registered with another address, use that one.`;

export const NOT_APPROVED_MESSAGE =
  "Your Luma registration isn't approved yet. You can sign in once the organisers approve it on Luma.";

export const DECLINED_MESSAGE =
  `Your Luma registration for ${EVENT.name} was declined, so you can't sign in to the team portal with this email.`;

/** "Pending Approval" / "pending-approval" / " PENDING_APPROVAL " -> "pending_approval". */
export function normalizeLumaStatus(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/** Only confirmed (approved) Luma guests may enter the portal. */
export function isRegistrantApproved(
  registrant: RegistrantLike,
  approvedStatuses: readonly string[] = EVENT.portal.approvedLumaStatuses,
): boolean {
  if (!registrant) return false;
  const status = normalizeLumaStatus(registrant.lumaStatus);
  return status !== "" && approvedStatuses.map(normalizeLumaStatus).includes(status);
}

export type SignInDecision =
  | { allowed: true; reason: "super_admin" | "staff" | "guest_list" }
  | {
      allowed: false;
      reason: "not_on_list" | "not_approved" | "declined";
      code: "NOT_ON_GUEST_LIST" | "LUMA_NOT_APPROVED";
      message: string;
    };

/**
 * Pure decision used by the auth hooks. Staff and super admins bypass the guest list;
 * everyone else needs a guest-list row with an approved Luma status.
 */
export function decideSignIn(input: {
  email: string;
  superAdminEmails: ReadonlySet<string>;
  isStaff: boolean;
  registrant: RegistrantLike;
  approvedStatuses?: readonly string[];
}): SignInDecision {
  const email = normalizeEmail(input.email);
  if (input.superAdminEmails.has(email)) return { allowed: true, reason: "super_admin" };
  if (input.isStaff) return { allowed: true, reason: "staff" };
  if (!input.registrant) {
    return { allowed: false, reason: "not_on_list", code: "NOT_ON_GUEST_LIST", message: NOT_ON_GUEST_LIST_MESSAGE };
  }
  if (!isRegistrantApproved(input.registrant, input.approvedStatuses)) {
    const declined = normalizeLumaStatus(input.registrant.lumaStatus) === "declined";
    return {
      allowed: false,
      reason: declined ? "declined" : "not_approved",
      code: "LUMA_NOT_APPROVED",
      message: declined ? DECLINED_MESSAGE : NOT_APPROVED_MESSAGE,
    };
  }
  return { allowed: true, reason: "guest_list" };
}
