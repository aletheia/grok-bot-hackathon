"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Github, Loader2, Lock, Users, Video } from "lucide-react";
import { checkGithubRepoPublic, REPO_NOT_PUBLIC_ERROR, type RepoVisibility } from "@/lib/submissions/github";
import {
  findMemberEmailProblems,
  formatCountdown,
  formatSubmissionDeadlineShort,
  formatSubmissionDeadlineTime,
  GITHUB_URL_ERROR,
  parseGithubRepoUrl,
  parseVideoUrl,
  VIDEO_URL_ERROR,
  type SubmissionStatus,
} from "@/lib/submissions/rules";
import { formatRome } from "@/lib/time/rome";

type Member = { userId: string; name: string; email: string; role: "lead" | "member" };

type SubmissionView = {
  teamId: number;
  teamName: string;
  members: Member[];
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

type Envelope<T> = { success: boolean; data?: T; error?: { code?: string; message?: string; details?: { field?: string } } };

type RepoCheck = { state: "idle" } | { state: "checking" } | { state: "done"; visibility: RepoVisibility };

const PILL: Record<SubmissionStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-amber-400/40 bg-amber-400/10 text-amber-200" },
  submitted: { label: "Submitted", className: "border-[var(--blob-teal)]/60 bg-[var(--blob-teal)]/15 text-teal-100" },
  closed: { label: "Closed", className: "border-white/20 bg-white/10 text-[var(--text-secondary)]" },
};

/** Ticks every second; null until mounted (no hydration mismatch). */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function timeRome(iso: string) {
  return formatRome(iso, { day: undefined, month: undefined, year: undefined });
}

/**
 * "Team data submission" box, at the top of the team page. Any member can save the team's public
 * GitHub repository and an optional demo video link until the submission deadline; then it is read-only.
 * Members are read-only here: they come from the team membership (join code).
 */
export function TeamSubmissionBox({ reloadKey }: { reloadKey?: string | number }) {
  const now = useNow();
  const [view, setView] = useState<SubmissionView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubError, setGithubError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [repoCheck, setRepoCheck] = useState<RepoCheck>({ state: "idle" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/teams/submission", { credentials: "include", cache: "no-store" });
      const json = (await res.json().catch(() => null)) as Envelope<SubmissionView> | null;
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.error?.message ?? "Could not load the team data submission.");
      setView(json.data);
      setGithubUrl(json.data.submission?.githubUrl ?? "");
      setVideoUrl(json.data.submission?.videoUrl ?? "");
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load the team data submission.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const deadline = view ? new Date(view.deadline) : null;
  const closed = Boolean(view?.closed) || (now !== null && deadline !== null && now > deadline.getTime());
  const status: SubmissionStatus = closed ? "closed" : view?.submission ? "submitted" : "draft";
  const deadlineTime = deadline ? formatSubmissionDeadlineTime(deadline) : formatSubmissionDeadlineTime();

  async function validateRepo(value: string): Promise<boolean> {
    const ref = parseGithubRepoUrl(value);
    if (!ref) {
      setGithubError(value.trim() ? GITHUB_URL_ERROR : "The GitHub repository is required.");
      setRepoCheck({ state: "idle" });
      return false;
    }
    setGithubError(null);
    setRepoCheck({ state: "checking" });
    const visibility = await checkGithubRepoPublic(ref.owner, ref.repo);
    setRepoCheck({ state: "done", visibility });
    if (visibility === "not_public") {
      setGithubError(REPO_NOT_PUBLIC_ERROR);
      return false;
    }
    return true;
  }

  function validateVideo(value: string): boolean {
    const ok = parseVideoUrl(value) !== null;
    setVideoError(ok ? null : VIDEO_URL_ERROR);
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (closed) return;
    setSaveError(null);
    setJustSaved(false);
    const videoOk = validateVideo(videoUrl);
    const formatOk = parseGithubRepoUrl(githubUrl) !== null;
    if (!formatOk) {
      setGithubError(githubUrl.trim() ? GITHUB_URL_ERROR : "The GitHub repository is required.");
      return;
    }
    if (!videoOk) return;
    setSaving(true);
    try {
      const res = await fetch("/api/teams/submission", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, videoUrl }),
      });
      const json = (await res.json().catch(() => null)) as Envelope<SubmissionView & { repoVisibility: RepoVisibility }> | null;
      if (!res.ok || !json?.success || !json.data) {
        const field = json?.error?.details?.field;
        const message = json?.error?.message ?? "Could not save. Try again.";
        if (field === "githubUrl") setGithubError(message);
        else if (field === "videoUrl") setVideoError(message);
        else setSaveError(message);
        if (json?.error?.code === "SUBMISSIONS_CLOSED") void load();
        return;
      }
      setView(json.data);
      setGithubUrl(json.data.submission?.githubUrl ?? githubUrl);
      setVideoUrl(json.data.submission?.videoUrl ?? "");
      setRepoCheck({ state: "done", visibility: json.data.repoVisibility });
      setGithubError(null);
      setJustSaved(true);
    } catch {
      setSaveError("Could not save: check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const emailProblems = view ? findMemberEmailProblems(view.members.map((m) => m.email)) : null;
  const submission = view?.submission ?? null;

  return (
    <section
      id="submission"
      aria-labelledby="submission-title"
      data-testid="team-submission-box"
      className="mt-6 scroll-mt-28 rounded-2xl border-2 border-[var(--blob-teal)] bg-[var(--bg-secondary)]/80 p-5 shadow-[0_0_0_4px_rgba(23,184,166,0.08)] sm:p-6"
    >
      {/* Header: title, status pill, live countdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="submission-title" className="text-xl font-semibold text-white sm:text-2xl">
            Team data submission
          </h2>
          <span
            data-testid="submission-status"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${PILL[status].className}`}
          >
            {PILL[status].label}
          </span>
        </div>
        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]" aria-live="off">
          <Clock size={16} className="shrink-0 text-[var(--blob-teal)]" />
          <span>
            <span className="font-medium text-white">Final Deadline for submission: {deadline ? formatSubmissionDeadlineShort(deadline) : formatSubmissionDeadlineShort()}</span>{" "}
            (Rome time)
            {!closed && now !== null && deadline ? (
              <span className="ml-1 font-mono tabular-nums text-teal-100" data-testid="submission-countdown">
                · {formatCountdown(deadline.getTime() - now)} left
              </span>
            ) : null}
          </span>
        </p>
      </div>

      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {closed
          ? "Submissions closed. This is what the jury will see."
          : `Add the link to your team's public GitHub repository by ${deadlineTime} (Rome time). Any team member can submit and edit it until then.`}
      </p>

      {loadError ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {loadError}{" "}
          <button type="button" className="underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : !view ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-full animate-pulse rounded bg-white/5" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          {/* Team name */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Team name</p>
            <p className="mt-1 text-lg font-semibold text-white" data-testid="submission-team-name">
              {view.teamName}
            </p>
          </div>

          {/* Members (read-only) */}
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              <Users size={13} /> Members ({view.members.length})
            </p>
            <ul className="mt-2 divide-y divide-[var(--border-color)] rounded-lg border border-[var(--border-color)]" data-testid="submission-members">
              {view.members.map((m) => (
                <li key={m.userId} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="truncate text-sm font-medium text-white">{m.name}</span>
                  <span className="truncate text-sm text-[var(--text-secondary)]">{m.email}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Members come from your team: teammates join with your team code (below), using the email they registered with on Luma.
            </p>
            {emailProblems && (emailProblems.malformed.length > 0 || emailProblems.duplicates.length > 0) ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-200">
                <AlertTriangle size={13} /> Check the member emails: {[...emailProblems.malformed, ...emailProblems.duplicates].join(", ")}. Tell the organisers if one is wrong.
              </p>
            ) : null}
          </div>

          {/* GitHub repository */}
          <div>
            <label htmlFor="submission-github" className="flex items-center gap-1.5 text-sm font-medium text-white">
              <Github size={15} /> GitHub repository (public) <span className="text-[var(--blob-teal)]">*</span>
            </label>
            {closed ? (
              <p className="mt-1.5 text-sm">
                {submission?.githubUrl ? (
                  <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-teal-200 underline">
                    {submission.githubUrl} <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-[var(--text-muted)]">Not submitted</span>
                )}
              </p>
            ) : (
              <>
                <input
                  id="submission-github"
                  name="githubUrl"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  required
                  value={githubUrl}
                  placeholder="https://github.com/your-team/your-project"
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setGithubError(null);
                    setRepoCheck({ state: "idle" });
                  }}
                  onBlur={(e) => void validateRepo(e.target.value)}
                  aria-invalid={githubError ? true : undefined}
                  aria-describedby="submission-github-msg"
                  className={`mt-1.5 w-full rounded-lg border bg-[var(--bg-primary)] px-4 py-3 text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--blob-teal)] ${
                    githubError ? "border-red-400" : "border-[var(--border-input)]"
                  }`}
                />
                <p id="submission-github-msg" className="mt-1.5 min-h-[1.25rem] text-xs" aria-live="polite">
                  {githubError ? (
                    <span className="text-red-300">{githubError}</span>
                  ) : repoCheck.state === "checking" ? (
                    <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                      <Loader2 size={12} className="animate-spin" /> Checking the repository is public…
                    </span>
                  ) : repoCheck.state === "done" && repoCheck.visibility === "public" ? (
                    <span className="inline-flex items-center gap-1 text-teal-200">
                      <CheckCircle2 size={12} /> Public repository found.
                    </span>
                  ) : repoCheck.state === "done" && repoCheck.visibility === "unknown" ? (
                    <span className="text-amber-200">We couldn&apos;t confirm it&apos;s public right now (GitHub didn&apos;t answer). You can still submit; make sure it is public.</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">The repository must be public so the jury can open it.</span>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Demo video */}
          <div>
            <label htmlFor="submission-video" className="flex items-center gap-1.5 text-sm font-medium text-white">
              <Video size={15} /> Demo video link
            </label>
            {closed ? (
              <p className="mt-1.5 text-sm">
                {submission?.videoUrl ? (
                  <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-teal-200 underline">
                    {submission.videoUrl} <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-[var(--text-muted)]">None (video in the repo, or not provided)</span>
                )}
              </p>
            ) : (
              <>
                <input
                  id="submission-video"
                  name="videoUrl"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  value={videoUrl}
                  placeholder="https://youtu.be/…"
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoError(null);
                  }}
                  onBlur={(e) => validateVideo(e.target.value)}
                  aria-invalid={videoError ? true : undefined}
                  aria-describedby="submission-video-msg"
                  className={`mt-1.5 w-full rounded-lg border bg-[var(--bg-primary)] px-4 py-3 text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--blob-teal)] ${
                    videoError ? "border-red-400" : "border-[var(--border-input)]"
                  }`}
                />
                <p id="submission-video-msg" className="mt-1.5 text-xs" aria-live="polite">
                  {videoError ? <span className="text-red-300">{videoError}</span> : <span className="text-[var(--text-muted)]">Optional if the video is in the repo</span>}
                </p>
              </>
            )}
          </div>

          {/* Action + status line */}
          <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm" aria-live="polite" data-testid="submission-status-line">
              {closed ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                  <Lock size={14} /> Submissions closed
                </span>
              ) : submission ? (
                <span className="inline-flex items-center gap-1.5 text-teal-100">
                  <CheckCircle2 size={14} /> Submitted at {timeRome(submission.updatedAt)}, you can edit until {deadlineTime}.
                </span>
              ) : (
                <span className="text-[var(--text-muted)]">Not submitted yet.</span>
              )}
              {submission ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Last updated {formatRome(submission.updatedAt)} (Rome time){submission.updatedBy?.name ? ` by ${submission.updatedBy.name}` : ""}.
                </p>
              ) : null}
              {saveError ? <p className="mt-1 text-xs text-red-300">{saveError}</p> : null}
              {justSaved && !saveError ? <p className="sr-only">Saved.</p> : null}
            </div>
            {closed ? null : (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--blob-teal)] px-6 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
