import { EVENT } from "@/lib/event";
import { normalizeEmail } from "@/lib/luma/email";

export type RegistrantLike = { email: string; lumaStatus: string | null } | null | undefined;

export const NOT_ON_GUEST_LIST_MESSAGE =
  `This email is not on the ${EVENT.name} guest list. Sign in with the same email you used to register on Luma` +
  ` (${EVENT.registration.url}). If you registered with another address, use that one.`;

export const DECLINED_MESSAGE =
  `Your Luma registration for ${EVENT.name} was declined, so the team portal is not available for this email.`;

/** Is a Luma guest-list entry allowed into the portal? */
export function isRegistrantAllowed(
  registrant: RegistrantLike,
  blockedStatuses: readonly string[] = EVENT.portal.blockedLumaStatuses,
): boolean {
  if (!registrant) return false;
  const status = (registrant.lumaStatus ?? "").trim().toLowerCase();
  return !blockedStatuses.map((s) => s.toLowerCase()).includes(status);
}

export type SignInDecision =
  | { allowed: true; reason: "super_admin" | "staff" | "guest_list" }
  | { allowed: false; reason: "not_on_list" | "blocked"; message: string };

/**
 * Pure decision used by the auth hooks. Staff and super admins bypass the guest list.
 */
export function decideSignIn(input: {
  email: string;
  superAdminEmails: ReadonlySet<string>;
  isStaff: boolean;
  registrant: RegistrantLike;
  blockedStatuses?: readonly string[];
}): SignInDecision {
  const email = normalizeEmail(input.email);
  if (input.superAdminEmails.has(email)) return { allowed: true, reason: "super_admin" };
  if (input.isStaff) return { allowed: true, reason: "staff" };
  if (!input.registrant) return { allowed: false, reason: "not_on_list", message: NOT_ON_GUEST_LIST_MESSAGE };
  if (!isRegistrantAllowed(input.registrant, input.blockedStatuses)) {
    return { allowed: false, reason: "blocked", message: DECLINED_MESSAGE };
  }
  return { allowed: true, reason: "guest_list" };
}
