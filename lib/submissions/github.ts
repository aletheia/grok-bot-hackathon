/**
 * Is a GitHub repository public? One unauthenticated call to the GitHub REST API
 * (GET https://api.github.com/repos/{owner}/{repo}); usable in the browser (CORS) and on the server.
 *
 * Fails soft: only a definite answer blocks a save. 404 = private or missing ("not_public");
 * a rate limit (403/429), a network error or a timeout = "unknown", and the save goes through.
 */
export type RepoVisibility = "public" | "not_public" | "unknown";

export const REPO_NOT_PUBLIC_ERROR = "This repo isn't public yet. Make it public on GitHub (Settings → Danger Zone → Change visibility), then save again.";

type FetchLike = (input: string, init?: RequestInit) => Promise<Pick<Response, "status" | "ok" | "json">>;

export async function checkGithubRepoPublic(
  owner: string,
  repo: string,
  options: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<RepoVisibility> {
  const fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as FetchLike | undefined);
  if (!fetchImpl) return "unknown";
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs ?? 4000) : null;
  try {
    const res = await fetchImpl(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller?.signal,
        cache: "no-store",
      },
    );
    if (res.status === 404) return "not_public";
    if (!res.ok) return "unknown";
    const body = (await res.json().catch(() => null)) as { private?: unknown; visibility?: unknown } | null;
    if (!body) return "unknown";
    if (body.private === true || (typeof body.visibility === "string" && body.visibility !== "public")) {
      return "not_public";
    }
    return "public";
  } catch {
    return "unknown";
  } finally {
    if (timer) clearTimeout(timer);
  }
}
