/**
 * Team data submission: pure rules (no DB, no network), shared by the API and the team page.
 * Unit-tested in lib/submissions/rules.test.ts.
 */
import { EVENT } from "@/lib/event";
import { formatRome } from "@/lib/time/rome";

/** Repo/video can be saved and edited by any team member until this instant (Europe/Rome). */
export const SUBMISSION_DEADLINE_AT = new Date(EVENT.portal.submissionDeadline);

export function isSubmissionClosed(now: Date | number = Date.now(), deadline: Date = SUBMISSION_DEADLINE_AT): boolean {
  const t = typeof now === "number" ? now : now.getTime();
  return t > deadline.getTime();
}

/** "17:00" (Rome time). */
export function formatSubmissionDeadlineTime(deadline: Date = SUBMISSION_DEADLINE_AT): string {
  return formatRome(deadline, { day: undefined, month: undefined, year: undefined });
}

/** "17:00, 5 Nov" (Rome time), as in the box header. */
export function formatSubmissionDeadlineShort(deadline: Date = SUBMISSION_DEADLINE_AT): string {
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: EVENT.timezone }).format(deadline);
  return `${formatSubmissionDeadlineTime(deadline)}, ${day}`;
}

export type SubmissionStatus = "draft" | "submitted" | "closed";

export function getSubmissionStatus(hasSubmission: boolean, now: Date | number = Date.now(), deadline: Date = SUBMISSION_DEADLINE_AT): SubmissionStatus {
  if (isSubmissionClosed(now, deadline)) return "closed";
  return hasSubmission ? "submitted" : "draft";
}

/** "3h 12m 05s" until the deadline (never negative). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0 ? `${days}d ${hours}h ${pad(minutes)}m` : `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
}

// ---------------------------------------------------------------------------
// GitHub repository URL
// ---------------------------------------------------------------------------

export type GithubRepoRef = { owner: string; repo: string; url: string };

/** GitHub user/org names: 1–39 alphanumerics or single hyphens, not starting/ending with a hyphen. */
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
/** Repository names: 1–100 of letters, digits, ".", "-", "_" (not "." or ".."). */
const REPO_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
/** First path segments that are GitHub pages, not users or organisations. */
const RESERVED_OWNERS = new Set([
  "orgs", "settings", "marketplace", "explore", "topics", "trending", "collections", "features", "pricing",
  "login", "logout", "join", "signup", "sponsors", "notifications", "new", "organizations", "search", "about",
  "apps", "issues", "pulls", "codespaces", "enterprise", "security", "site", "contact",
]);

export const GITHUB_URL_ERROR =
  "Enter the URL of a GitHub repository, like https://github.com/your-team/your-project.";

/**
 * Parses what a participant typed into a canonical repo URL (https://github.com/owner/repo).
 * Accepts http/https, an optional "www.", a missing scheme, a trailing slash, ".git", and deeper
 * links into the repo (/tree/main, /blob/…), which are trimmed to the repo root. Returns null when
 * it is not a github.com repository URL.
 */
export function parseGithubRepoUrl(raw: string): GithubRepoRef | null {
  const input = raw.trim();
  if (!input || /\s/.test(input)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase();
  if (host !== "github.com" && host !== "www.github.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[0]!;
  const repo = segments[1]!.replace(/\.git$/i, "");
  if (!OWNER_PATTERN.test(owner) || RESERVED_OWNERS.has(owner.toLowerCase())) return null;
  if (!REPO_PATTERN.test(repo) || repo === "." || repo === "..") return null;

  return { owner, repo, url: `https://github.com/${owner}/${repo}` };
}

// ---------------------------------------------------------------------------
// Video link (optional)
// ---------------------------------------------------------------------------

export const VIDEO_URL_ERROR = "Enter a full link to the video, starting with https:// (or leave it empty).";

/** Optional http(s) link. Returns "" for empty input, the trimmed URL when valid, null when invalid. */
export function parseVideoUrl(raw: string | null | undefined): string | null {
  const input = (raw ?? "").trim();
  if (!input) return "";
  if (input.length > 2000 || /\s/.test(input)) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Members (read-only in the box; flagged when an address looks wrong or repeats)
// ---------------------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isWellFormedEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Emails (lower-cased) that are malformed or appear more than once in the member list. */
export function findMemberEmailProblems(emails: readonly string[]): { malformed: string[]; duplicates: string[] } {
  const seen = new Map<string, number>();
  const malformed: string[] = [];
  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!isWellFormedEmail(email)) malformed.push(raw);
    seen.set(email, (seen.get(email) ?? 0) + 1);
  }
  const duplicates = [...seen.entries()].filter(([, n]) => n > 1).map(([e]) => e);
  return { malformed, duplicates };
}
