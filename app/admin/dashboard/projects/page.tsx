"use client";

import { formatRome } from "@/lib/time/rome";
import { SUBMISSION_DEADLINE_AT } from "@/lib/submissions/rules";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  FolderGit2,
  Search,
  Trash2,
} from "lucide-react";

type ProjectItem = {
  id: string;
  teamId: number;
  teamName: string;
  name: string;
  description: string | null;
  githubUrl: string;
  demoUrl: string | null;
  techStack: string | null;
  slidesUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  total: number;
  limit: number;
  offset: number;
  projects: ProjectItem[];
};

export default function AdminProjectsPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/projects?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json?.error?.message ?? "Failed to load");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(projectId: string, name: string) {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "Delete failed");
      if (data) {
        setData({
          ...data,
          projects: data.projects.filter((p) => p.id !== projectId),
          total: Math.max(0, data.total - 1),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          View the project submissions of each team (repository and video links).
        </p>
      </div>

      {/* Team data submission: fixed deadline + export */}
      <div className="rounded-xl border border-[var(--blob-teal)]/60 bg-[var(--card-bg)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--blob-teal)]" />
          <h2 className="text-lg font-semibold text-white">Team data submission</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Any team member saves the public GitHub repository and an optional video link from their team page until{" "}
          <span className="font-medium text-white">{formatRome(SUBMISSION_DEADLINE_AT)} (Rome time)</span>; after that the
          box is read-only. The deadline is fixed in code (PORTAL_DEADLINE in lib/event.ts), the same instant as the team lock.
        </p>
        <a
          href="/api/admin/submissions?format=csv"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--blob-teal)]/15 px-4 text-sm font-medium text-white hover:bg-[var(--blob-teal)]/25"
        >
          <Download className="h-4 w-4" />
          Download CSV: all teams, members, repo and video links
        </a>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search by project or team name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchProjects()}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2 pl-10 pr-4 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void fetchProjects()}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--accent-blue)]/20 px-4 py-2 text-sm font-medium text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/30"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 text-center text-[var(--text-muted)]">
          Loading…
        </div>
      ) : data ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                      Project
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                      Team
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                      Tech Stack
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                      Links
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)] min-w-[140px]">
                      Submitted
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--text-secondary)] w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[var(--text-muted)]"
                      >
                        <FolderGit2 className="mx-auto h-8 w-8 mb-2 opacity-40" />
                        No projects submitted yet.
                      </td>
                    </tr>
                  ) : (
                    data.projects.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-[var(--border-color)]/50 transition-colors hover:bg-[var(--bg-secondary)]/30"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{p.name}</p>
                          {p.description && (
                            <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {p.teamName}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                          {p.techStack || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <a
                              href={p.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-xs text-white hover:bg-white/5"
                            >
                              GitHub
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {p.demoUrl && (
                              <a
                                href={p.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-xs text-white hover:bg-white/5"
                              >
                                Demo
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {p.slidesUrl && (
                              <a
                                href={p.slidesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-xs text-white hover:bg-white/5"
                              >
                                Slides
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {p.videoUrl && (
                              <a
                                href={p.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-xs text-white hover:bg-white/5"
                              >
                                Video
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          <div>
                            {formatRome(p.createdAt)}
                          </div>
                          {p.updatedAt !== p.createdAt && (
                            <div className="mt-0.5 text-[var(--text-muted)]">
                              upd: {formatRome(p.updatedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            title="Delete project"
                            disabled={deletingId === p.id}
                            onClick={() => void handleDelete(p.id, p.name)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-500/40 p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      ) : null}
    </div>
  );
}
