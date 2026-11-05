import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { team } from "@/db/schema/auth";
import { project } from "@/db/schema/projects";

/** Public card. Project name and team name stay separate so they can diverge later. */
export type ShowcaseProject = {
  teamId: number;
  projectName: string;
  teamName: string;
  githubUrl: string;
  videoUrl: string | null;
  demoUrl: string | null;
};

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/** Visible URL text: drop the scheme and a leading www, keep the rest. */
export function visibleUrl(url: string): string {
  return url.trim().replace(SCHEME, "").replace(/^www\./i, "");
}

/** Blank project names use the team name so the card still has a title. */
export function showcaseProjectName(projectName: string | null | undefined, teamName: string): string {
  const name = projectName?.trim() ?? "";
  return name || teamName.trim();
}

export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function presentUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

/**
 * Active teams that submitted a non-empty GitHub repository.
 * Same population as `listVoteProjects`: status active and btrim(github_url) length > 0.
 * Video and demo stay on their own columns. No emails, join codes, or members.
 */
export async function listShowcaseProjects(): Promise<ShowcaseProject[]> {
  const rows = await db
    .select({
      teamId: team.id,
      teamName: team.name,
      projectName: project.name,
      githubUrl: project.githubUrl,
      videoUrl: project.videoUrl,
      demoUrl: project.demoUrl,
    })
    .from(team)
    .innerJoin(project, eq(project.teamId, team.id))
    .where(and(eq(team.status, "active"), sql`length(btrim(${project.githubUrl})) > 0`))
    .orderBy(asc(sql`lower(${team.name})`), asc(team.id));

  return rows.map((row) => ({
    teamId: row.teamId,
    projectName: showcaseProjectName(row.projectName, row.teamName),
    teamName: row.teamName,
    githubUrl: row.githubUrl.trim(),
    videoUrl: presentUrl(row.videoUrl),
    demoUrl: presentUrl(row.demoUrl),
  }));
}
