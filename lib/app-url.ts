/**
 * Public origin of the app, used by Better Auth (baseURL / trusted origins) and for
 * absolute links (staff invites, credit redemption links).
 *
 * 1. BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL when set (production, Docker, local).
 * 2. On Vercel without them (Preview deployments): the branch alias
 *    (VERCEL_BRANCH_URL), else the unique deployment URL (VERCEL_URL).
 *    In Production it falls back to VERCEL_PROJECT_PRODUCTION_URL.
 * 3. http://localhost:3000.
 */
function https(host: string | undefined): string | undefined {
  const value = host?.trim();
  if (!value) return undefined;
  return value.startsWith("http") ? value : `https://${value}`;
}

function vercelUrl(): string | undefined {
  if (process.env.VERCEL_ENV === "production") {
    return https(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? https(process.env.VERCEL_URL);
  }
  return https(process.env.VERCEL_BRANCH_URL) ?? https(process.env.VERCEL_URL);
}

export function getAppUrl(): string {
  const explicit = process.env.BETTER_AUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  return (explicit || vercelUrl() || "http://localhost:3000").replace(/\/+$/, "");
}

/** Every origin this deployment can be reached on (all Vercel URLs of the current deployment). */
export function getVercelOrigins(): string[] {
  return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .map(https)
    .filter((value): value is string => Boolean(value));
}
