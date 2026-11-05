import { randomUUID } from "crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { team } from "@/db/schema/auth";
import { juryVote } from "@/db/schema/jury-vote";
import { project } from "@/db/schema/projects";
import { AppError } from "@/lib/api/http";
import { ensureMigrations } from "@/lib/vote/migrate";
import { normalizeJurorName, parseJuryScores, type JuryScoreInput } from "@/lib/vote/rules";

export type VoteProject = {
  id: number;
  name: string;
  githubUrl: string;
  videoUrl: string | null;
};

export type JuryScoreRow = {
  teamId: number;
  innovation: number;
  scalability: number;
  marketReadiness: number;
};

const submittedTeam = and(eq(team.status, "active"), sql`length(btrim(${project.githubUrl})) > 0`);

function videoLink(videoUrl: string | null, demoUrl: string | null): string | null {
  const video = videoUrl?.trim();
  if (video) return video;
  const demo = demoUrl?.trim();
  return demo || null;
}

/** Active teams that submitted a non-empty GitHub URL. No emails, codes, or members. */
export async function listVoteProjects(): Promise<VoteProject[]> {
  await ensureMigrations();
  const rows = await db
    .select({
      id: team.id,
      name: team.name,
      githubUrl: project.githubUrl,
      videoUrl: project.videoUrl,
      demoUrl: project.demoUrl,
    })
    .from(team)
    .innerJoin(project, eq(project.teamId, team.id))
    .where(submittedTeam)
    .orderBy(asc(sql`lower(${team.name})`), asc(team.id));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    githubUrl: row.githubUrl,
    videoUrl: videoLink(row.videoUrl, row.demoUrl),
  }));
}

export async function listVotesForJuror(rawName: unknown): Promise<{ jurorName: string; scores: JuryScoreRow[] }> {
  await ensureMigrations();
  const jurorName = normalizeJurorName(rawName);
  if (!jurorName) throw new AppError(400, "INVALID_JUROR", "Enter your name.");

  const scores = await db
    .select({
      teamId: juryVote.teamId,
      innovation: juryVote.innovation,
      scalability: juryVote.scalability,
      marketReadiness: juryVote.marketReadiness,
    })
    .from(juryVote)
    .where(sql`lower(${juryVote.jurorName}) = lower(${jurorName})`)
    .orderBy(asc(juryVote.teamId));

  return { jurorName, scores };
}

/** Insert or update this juror's 1–5 scores. Same name, any casing, is one juror. */
export async function upsertJuryVotes(rawName: unknown, rawScores: unknown): Promise<{ jurorName: string; scores: JuryScoreRow[] }> {
  await ensureMigrations();
  const jurorName = normalizeJurorName(rawName);
  if (!jurorName) throw new AppError(400, "INVALID_JUROR", "Enter your name.");
  const scores = parseJuryScores(rawScores);
  if (!scores) {
    throw new AppError(
      400,
      "INVALID_SCORES",
      "Each score needs a project and a rating from 1 to 5 for innovation, scalability, and market readiness.",
    );
  }

  await assertSubmittedTeams(scores);
  await db.transaction(async (tx) => {
    for (const score of scores) {
      await tx.execute(sql`
        insert into jury_vote (id, juror_name, team_id, innovation, scalability, market_readiness)
        values (${randomUUID()}, ${jurorName}, ${score.teamId}, ${score.innovation}, ${score.scalability}, ${score.marketReadiness})
        on conflict ((lower(juror_name)), team_id)
        do update set
          juror_name = excluded.juror_name,
          innovation = excluded.innovation,
          scalability = excluded.scalability,
          market_readiness = excluded.market_readiness,
          updated_at = now()
      `);
    }
  });

  return listVotesForJuror(jurorName);
}

async function assertSubmittedTeams(scores: JuryScoreInput[]): Promise<void> {
  const ids = scores.map((score) => score.teamId);
  const allowed = await db
    .select({ id: team.id })
    .from(team)
    .innerJoin(project, eq(project.teamId, team.id))
    .where(and(submittedTeam, inArray(team.id, ids)));
  if (allowed.length !== ids.length) {
    throw new AppError(400, "INVALID_TEAM", "One or more projects are not open for scoring.");
  }
}
