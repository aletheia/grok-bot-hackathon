/**
 * Pure team rules (no DB). The service layer calls these inside transactions;
 * they are unit-tested in lib/teams/policy.test.ts.
 */
import { randomBytes } from "crypto";
import { AppError } from "@/lib/api/http";
import { TEAM_INVITE_ALPHABET, TEAM_LIMITS } from "@/lib/teams/constants";

import { TEAM_LOCK_AT } from "@/lib/teams/rules";

export { TEAM_LOCK_AT };

export function isTeamsLocked(now: Date = new Date(), lockAt: Date = TEAM_LOCK_AT): boolean {
  return now.getTime() > lockAt.getTime();
}

/** Throws 409 TEAMS_LOCKED after the lock instant. */
export function assertTeamsOpen(now: Date = new Date(), lockAt: Date = TEAM_LOCK_AT): void {
  if (isTeamsLocked(now, lockAt)) {
    throw new AppError(
      409,
      "TEAMS_LOCKED",
      "Teams are locked: since 31 October 2026 at 23:59 (Rome time) teams can no longer be created, joined or left.",
    );
  }
}

/** A team accepts joins while it has fewer than maxMembers. */
export function isTeamOpen(memberCount: number, maxMembers: number = TEAM_LIMITS.maxMembers): boolean {
  return memberCount < maxMembers;
}

export function assertCanJoin(memberCount: number, maxMembers: number = TEAM_LIMITS.maxMembers): void {
  if (!isTeamOpen(memberCount, maxMembers)) {
    throw new AppError(
      409,
      "TEAM_FULL",
      `This team is full: it already has the maximum of ${maxMembers} members.`,
    );
  }
}

/** Formed = has at least minMembers (guaranteed seats after the lock). */
export function isTeamFormed(memberCount: number, minMembers: number = TEAM_LIMITS.minMembers): boolean {
  return memberCount >= minMembers;
}

export type TeamSizeStatus = "forming" | "formed" | "full";

export function teamSizeStatus(memberCount: number): TeamSizeStatus {
  if (!isTeamOpen(memberCount)) return "full";
  return isTeamFormed(memberCount) ? "formed" : "forming";
}

/**
 * When the lead leaves, the role passes to the earliest-joined remaining member
 * (ties broken by membership id). Returns null when nobody is left.
 */
export function pickNextLead<M extends { userId: string; joinedAt: Date; id: string }>(
  members: readonly M[],
  leavingUserId: string,
): M | null {
  const remaining = members
    .filter((m) => m.userId !== leavingUserId)
    .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime() || a.id.localeCompare(b.id));
  return remaining[0] ?? null;
}

/**
 * Secret team code: TEAM_LIMITS.inviteCodeLength chars from a 32-symbol unambiguous
 * alphabet (no 0/O/1/I). 256 is a multiple of 32, so `byte % 32` is unbiased.
 * 32^8 ≈ 1.1e12 possible codes; uniqueness is enforced by a DB unique index + retry.
 */
export function generateTeamCode(random: (size: number) => Uint8Array = randomBytes): string {
  const length = TEAM_LIMITS.inviteCodeLength;
  const bytes = random(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += TEAM_INVITE_ALPHABET[bytes[i]! % TEAM_INVITE_ALPHABET.length];
  }
  return code;
}
