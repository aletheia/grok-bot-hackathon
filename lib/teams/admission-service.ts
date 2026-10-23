import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { team, user } from "@/db/schema/auth";
import { lumaRegistrant } from "@/db/schema/luma";
import { teamMember } from "@/db/schema/teams";
import { EVENT } from "@/lib/event";
import { isRegistrantApproved } from "@/lib/luma/allowlist";
import { computeAdmission, type AdmissionTeam } from "@/lib/teams/admission";
import { TEAM_LIMITS } from "@/lib/teams/constants";
import { TEAM_LOCK_AT, isTeamsLocked } from "@/lib/teams/policy";

/** Loads teams + Luma guest list and runs the pure admission rules. Read-only; sends nothing. */
export async function getAdmissionOverview() {
  const memberRows = await db
    .select({
      teamId: team.id,
      teamName: team.name,
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    .from(teamMember)
    .innerJoin(team, eq(team.id, teamMember.teamId))
    .innerJoin(user, eq(user.id, teamMember.userId))
    .where(and(isNull(teamMember.leftAt), eq(team.status, "active")));


  const guests = await db
    .select({
      email: lumaRegistrant.email,
      guestName: lumaRegistrant.name,
      lumaStatus: lumaRegistrant.lumaStatus,
      lumaRegisteredAt: lumaRegistrant.lumaRegisteredAt,
      importedAt: lumaRegistrant.importedAt,
      userId: user.id,
      userName: user.name,
      teamId: user.teamId,
      accountCreatedAt: user.createdAt,
      availableForTeamAt: user.availableForTeamAt,
    })
    .from(lumaRegistrant)
    .leftJoin(user, sql`lower(${user.email}) = ${lumaRegistrant.email}`);

  // Seats are only for confirmed guests: team members whose Luma status is not approved
  // (e.g. moved back to waitlist after a re-import) do not count towards a formed team.
  const approvedEmails = new Set(
    guests.filter((g) => isRegistrantApproved({ email: g.email, lumaStatus: g.lumaStatus })).map((g) => g.email),
  );
  const teamsById = new Map<number, AdmissionTeam>();
  for (const row of memberRows) {
    if (!approvedEmails.has(row.email.trim().toLowerCase())) continue;
    const entry = teamsById.get(row.teamId) ?? { id: row.teamId, name: row.teamName, members: [] };
    entry.members.push({ userId: row.userId, name: row.name, email: row.email });
    teamsById.set(row.teamId, entry);
  }

  const candidates = guests
    // Only confirmed (approved) Luma guests count for seats; waitlist/pending/invited/declined do not.
    .filter((g) => approvedEmails.has(g.email))
    .map((g) => {
      const t = g.teamId ? teamsById.get(g.teamId) : undefined;
      return {
        email: g.email,
        name: g.userName ?? g.guestName,
        userId: g.userId,
        teamId: t?.id ?? null,
        teamName: t?.name ?? null,
        teamSize: t?.members.length ?? 0,
        availableForTeam: Boolean(g.availableForTeamAt),
        lumaRegisteredAt: g.lumaRegisteredAt,
        accountCreatedAt: g.accountCreatedAt,
        importedAt: g.importedAt,
      };
    });

  const result = computeAdmission({
    capacity: EVENT.registration.capacity,
    minMembers: TEAM_LIMITS.minMembers,
    teams: [...teamsById.values()],
    candidates,
  });

  return {
    ...result,
    teamLockAt: TEAM_LOCK_AT.toISOString(),
    teamsLocked: isTeamsLocked(),
    guestListSize: guests.length,
    approvedGuests: candidates.length,
    notApprovedGuests: guests.length - candidates.length,
    orderingRule:
      "Luma registration time (CSV created_at), then portal account creation time, then import time; ties by email.",
  };
}
