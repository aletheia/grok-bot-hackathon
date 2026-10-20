import { EVENT } from "@/lib/event";

export const TEAM_LIMITS = {
  /** Team size rules come from lib/event.ts (4–6 for this event). */
  minMembers: EVENT.portal.team.minMembers,
  maxMembers: EVENT.portal.team.maxMembers,
  availableNoteMaxLength: 280,
  nameMinLength: 2,
  nameMaxLength: 64,
  descriptionMaxLength: 500,
  inviteCodeLength: 8,
  inviteCodeGenerationAttempts: 10,
  adminListDefaultLimit: 20,
  adminListMaxLimit: 100,
  adminTwoFactorMaxAgeSeconds: 15 * 60,
} as const;

export const TEAM_INVITE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export type AppUserRole =
  | "participant"
  | "moderator"
  | "reviewer"
  | "super_admin"
  | "judge"
  | "mentor";
export type TeamMembershipRole = "lead" | "member";
export type AdminMembershipAction = "assign-member" | "remove-member" | "transfer-lead";
