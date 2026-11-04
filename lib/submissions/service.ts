/**
 * Team data submission (public GitHub repo + optional video link), stored in the existing `project`
 * table (one row per team, unique on team_id). Who saved last is kept in `app_setting`
 * (key "team_submission_saved_by:<teamId>"), so this feature needs NO schema migration.
 */
import { and, asc, eq, inArray, isNull, like } from "drizzle-orm";
import { db } from "@/db";
import { team, user } from "@/db/schema/auth";
import { appSetting, project } from "@/db/schema/projects";
import { teamMember } from "@/db/schema/teams";
import { AppError } from "@/lib/api/http";
import type { AppSessionUser } from "@/lib/auth/session";
import { checkGithubRepoPublic, REPO_NOT_PUBLIC_ERROR, type RepoVisibility } from "@/lib/submissions/github";
import {
  GITHUB_URL_ERROR,
  isSubmissionClosed,
  parseGithubRepoUrl,
  parseVideoUrl,
  SUBMISSION_DEADLINE_AT,
  VIDEO_URL_ERROR,
} from "@/lib/submissions/rules";

const SAVED_BY_PREFIX = "team_submission_saved_by:";

export type SubmissionMember = { userId: string; name: string; email: string; role: "lead" | "member" };

export type TeamSubmissionView = {
  teamId: number;
  teamName: string;
  members: SubmissionMember[];
  submission: {
    githubUrl: string;
    videoUrl: string | null;
    createdAt: string;
    updatedAt: string;
    updatedBy: { userId: string; name: string } | null;
  } | null;
  deadline: string;
  closed: boolean;
};

export type SaveSubmissionInput = { githubUrl?: unknown; videoUrl?: unknown };

type SavedBy = { userId: string; name: string };

function parseSavedBy(value: string | null | undefined): SavedBy | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SavedBy>;
    return typeof parsed.userId === "string" ? { userId: parsed.userId, name: String(parsed.name ?? "") } : null;
  } catch {
    return null;
  }
}

async function getActiveTeamForUser(userId: string) {
  const [row] = await db
    .select({ teamId: team.id, teamName: team.name, status: team.status })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(and(eq(teamMember.userId, userId), isNull(teamMember.leftAt)))
    .limit(1);
  if (!row || row.status !== "active") {
    throw new AppError(404, "NO_TEAM", "You are not part of a team. Register or join a team first.");
  }
  return row;
}

async function listMembers(teamIds: number[]): Promise<Map<number, SubmissionMember[]>> {
  const out = new Map<number, SubmissionMember[]>();
  if (teamIds.length === 0) return out;
  const rows = await db
    .select({ teamId: teamMember.teamId, userId: user.id, name: user.name, email: user.email, role: teamMember.role })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(and(inArray(teamMember.teamId, teamIds), isNull(teamMember.leftAt)))
    .orderBy(asc(teamMember.joinedAt), asc(teamMember.id));
  for (const r of rows) {
    const list = out.get(r.teamId) ?? [];
    list.push({ userId: r.userId, name: r.name, email: r.email, role: r.role });
    out.set(r.teamId, list);
  }
  for (const list of out.values()) list.sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1));
  return out;
}

async function buildView(teamId: number, teamName: string): Promise<TeamSubmissionView> {
  const [members, [row], [saved]] = await Promise.all([
    listMembers([teamId]),
    db.select().from(project).where(eq(project.teamId, teamId)).limit(1),
    db.select({ value: appSetting.value }).from(appSetting).where(eq(appSetting.key, `${SAVED_BY_PREFIX}${teamId}`)).limit(1),
  ]);
  return {
    teamId,
    teamName,
    members: members.get(teamId) ?? [],
    submission: row
      ? {
          githubUrl: row.githubUrl,
          videoUrl: row.videoUrl,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          updatedBy: parseSavedBy(saved?.value),
        }
      : null,
    deadline: SUBMISSION_DEADLINE_AT.toISOString(),
    closed: isSubmissionClosed(),
  };
}

export async function getMyTeamSubmission(actor: AppSessionUser): Promise<TeamSubmissionView> {
  const t = await getActiveTeamForUser(actor.id);
  return buildView(t.teamId, t.teamName);
}

/** Validates the input (format + public repo, fail-soft) and upserts the team's row. Any active member may save. */
export async function saveMyTeamSubmission(
  actor: AppSessionUser,
  input: SaveSubmissionInput,
  deps: { now?: Date; checkPublic?: (owner: string, repo: string) => Promise<RepoVisibility> } = {},
): Promise<TeamSubmissionView & { repoVisibility: RepoVisibility }> {
  const now = deps.now ?? new Date();
  if (isSubmissionClosed(now)) {
    throw new AppError(403, "SUBMISSIONS_CLOSED", "Submissions closed: the team data can no longer be changed.");
  }

  const repo = typeof input.githubUrl === "string" ? parseGithubRepoUrl(input.githubUrl) : null;
  if (!repo) {
    throw new AppError(400, "INVALID_GITHUB_URL", GITHUB_URL_ERROR, { field: "githubUrl" });
  }
  const video = parseVideoUrl(typeof input.videoUrl === "string" ? input.videoUrl : "");
  if (video === null) {
    throw new AppError(400, "INVALID_VIDEO_URL", VIDEO_URL_ERROR, { field: "videoUrl" });
  }

  const t = await getActiveTeamForUser(actor.id);

  const visibility = await (deps.checkPublic ?? ((o, r) => checkGithubRepoPublic(o, r)))(repo.owner, repo.repo);
  if (visibility === "not_public") {
    throw new AppError(422, "REPO_NOT_PUBLIC", REPO_NOT_PUBLIC_ERROR, { field: "githubUrl" });
  }

  const savedBy: SavedBy = { userId: actor.id, name: actor.name ?? actor.email };
  await db.transaction(async (tx) => {
    await tx
      .insert(project)
      .values({ teamId: t.teamId, name: t.teamName, githubUrl: repo.url, videoUrl: video || null, updatedAt: now })
      .onConflictDoUpdate({
        target: project.teamId,
        set: { name: t.teamName, githubUrl: repo.url, videoUrl: video || null, updatedAt: now },
      });
    await tx
      .insert(appSetting)
      .values({ key: `${SAVED_BY_PREFIX}${t.teamId}`, value: JSON.stringify(savedBy) })
      .onConflictDoUpdate({ target: appSetting.key, set: { value: JSON.stringify(savedBy), updatedAt: now } });
  });

  return { ...(await buildView(t.teamId, t.teamName)), repoVisibility: visibility };
}

export type SubmissionExportRow = {
  teamId: number;
  teamName: string;
  members: SubmissionMember[];
  githubUrl: string | null;
  videoUrl: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
};

/** Every active team, with or without a submission (organiser export). */
export async function listSubmissionsForAdmin(): Promise<SubmissionExportRow[]> {
  const teams = await db
    .select({ id: team.id, name: team.name })
    .from(team)
    .where(eq(team.status, "active"))
    .orderBy(asc(team.name));
  const ids = teams.map((t) => t.id);
  const [members, projects, saved] = await Promise.all([
    listMembers(ids),
    ids.length ? db.select().from(project).where(inArray(project.teamId, ids)) : Promise.resolve([]),
    db.select().from(appSetting).where(like(appSetting.key, `${SAVED_BY_PREFIX}%`)),
  ]);
  const byTeam = new Map(projects.map((p) => [p.teamId, p]));
  const savedByTeam = new Map(saved.map((s) => [Number(s.key.slice(SAVED_BY_PREFIX.length)), parseSavedBy(s.value)]));
  return teams.map((t) => {
    const p = byTeam.get(t.id);
    return {
      teamId: t.id,
      teamName: t.name,
      members: members.get(t.id) ?? [],
      githubUrl: p?.githubUrl ?? null,
      videoUrl: p?.videoUrl ?? null,
      updatedAt: p ? p.updatedAt.toISOString() : null,
      updatedByName: p ? savedByTeam.get(t.id)?.name ?? null : null,
    };
  });
}

/** CSV (RFC 4180, with a BOM so Excel opens UTF-8 names correctly). Times in Europe/Rome. */
export function submissionsToCsv(rows: SubmissionExportRow[], formatTime: (iso: string) => string): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Neutralise spreadsheet formulas in user-provided text.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const header = ["Team ID", "Team name", "Members", "Member emails", "GitHub repository", "Video link", "Last updated (Rome time)", "Saved by"];
  const lines = rows.map((r) =>
    [
      r.teamId,
      r.teamName,
      r.members.map((m) => m.name).join("; "),
      r.members.map((m) => m.email).join("; "),
      r.githubUrl,
      r.videoUrl,
      r.updatedAt ? formatTime(r.updatedAt) : "",
      r.updatedByName,
    ]
      .map(esc)
      .join(","),
  );
  return `\uFEFF${[header.join(","), ...lines].join("\r\n")}\r\n`;
}
