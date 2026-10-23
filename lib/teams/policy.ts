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

// ---------------------------------------------------------------------------
// Team code: normalisation, format and join checks
// ---------------------------------------------------------------------------

/** Exactly TEAM_LIMITS.inviteCodeLength symbols from TEAM_INVITE_ALPHABET (also enforced by a DB CHECK). */
export const TEAM_CODE_PATTERN = new RegExp(`^[${TEAM_INVITE_ALPHABET}]{${TEAM_LIMITS.inviteCodeLength}}$`);

/**
 * Canonical form of what a person typed or pasted: trimmed, upper-case, without spaces, hyphens or
 * underscores ("ab3k-9xzq" → "AB3K9XZQ"). Codes are stored in this form, so a plain equality lookup on the
 * unique index is a case-insensitive match.
 */
export function normalizeTeamCode(raw: string): string {
  return raw.replace(/[\s_-]+/g, "").toUpperCase();
}

export function isValidTeamCodeFormat(code: string): boolean {
  return TEAM_CODE_PATTERN.test(code);
}

/** Throws 400 INVALID_CODE_FORMAT with a message people can act on. */
export function assertValidTeamCodeFormat(code: string): void {
  if (!isValidTeamCodeFormat(code)) {
    throw new AppError(
      400,
      "INVALID_CODE_FORMAT",
      `That does not look like a team code. Team codes have ${TEAM_LIMITS.inviteCodeLength} letters and digits (never 0, 1, I or O): check it with the person who shared it.`,
    );
  }
}

/** True when a Postgres error is a unique violation on a team code index (race between two generated codes). */
export function isCodeCollisionError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const e = current as { code?: unknown; constraint?: unknown; constraint_name?: unknown; cause?: unknown };
    const constraint = String(e.constraint ?? e.constraint_name ?? "");
    if (e.code === "23505" && /team_invite_code_unique|team_join_code_unique/.test(constraint)) return true;
    current = e.cause;
  }
  return false;
}

export type JoinCheckInvite = {
  code: string;
  revokedAt: Date | null;
  expiresAt: Date | null;
  maxUses: number | null;
  usedCount: number;
};

export type JoinCheckTeam = {
  status: string;
  joinCode: string | null;
  memberCount: number;
  maxMembers: number;
};

/**
 * Every reason a code can be refused, in the order they are checked. The service calls this inside the join
 * transaction with the locked rows; the tests exercise it without a database.
 */
export function assertCodeJoinable(params: {
  code: string;
  invite: JoinCheckInvite | null;
  team: JoinCheckTeam | null;
  now?: Date;
  lockAt?: Date;
}): void {
  const now = params.now ?? new Date();
  assertTeamsOpen(now, params.lockAt);
  const { invite, team } = params;

  if (!invite || !team) {
    throw new AppError(
      404,
      "INVALID_INVITE_CODE",
      "We could not find a team with that code. Check it with the person who shared it and try again.",
    );
  }
  if (invite.revokedAt || team.joinCode !== params.code) {
    throw new AppError(
      409,
      "INVALID_INVITE_CODE",
      "That code is no longer active: the team lead has created a new one. Ask your team for the current code.",
    );
  }
  if (invite.expiresAt && invite.expiresAt.getTime() <= now.getTime()) {
    throw new AppError(409, "INVITE_EXPIRED", "That code has expired. Ask your team for a new one.");
  }
  if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
    throw new AppError(409, "INVITE_EXHAUSTED", "That code has already been used the maximum number of times.");
  }
  if (team.status !== "active") {
    throw new AppError(409, "TEAM_ARCHIVED", "That team no longer exists, so it cannot accept new members.");
  }
  assertCanJoin(team.memberCount, team.maxMembers);
}
