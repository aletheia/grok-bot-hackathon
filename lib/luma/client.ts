/**
 * Read-only client for Luma's public API (https://docs.luma.com).
 *
 * - Only GET requests, only for ONE event (EVENT.registration.lumaEventId / LUMA_EVENT_API_ID): the API key's calendar
 *   also holds unrelated events and this code never touches them.
 * - Endpoints: GET /v1/events/guests/list (paginated, `entries` + `has_more` + `next_cursor`, server max 50 per
 *   page) and GET /v1/events/guests/get?id=<email> (404 when the email is not a guest).
 * - Rate limit: 200 requests/minute per calendar key; 429 is retried with backoff (Retry-After / x-ratelimit-reset).
 * - Never log guest data. Errors carry a status and a generic message only.
 */
import { EVENT } from "@/lib/event";
import { normalizeLumaStatus } from "@/lib/luma/allowlist";
import { normalizeEmail } from "@/lib/luma/email";
import type { LumaGuest } from "@/lib/luma/csv";

const LUMA_API_BASE = "https://public-api.luma.com";

export class LumaApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "LumaApiError";
    this.status = status;
  }
}

export type LumaConfig = { apiKey: string; eventId: string };

/** Null when the integration is not configured (no API key): callers then use the local guest list only. */
export function getLumaConfig(env: Record<string, string | undefined> = process.env): LumaConfig | null {
  const apiKey = env.LUMA_API_KEY?.trim();
  if (!apiKey) return null;
  const eventId = env.LUMA_EVENT_API_ID?.trim() || EVENT.registration.lumaEventId;
  if (!eventId) return null;
  return { apiKey, eventId };
}

export type LumaClientOptions = {
  config?: LumaConfig | null;
  fetchImpl?: typeof fetch;
  /** Per-request timeout. */
  timeoutMs?: number;
  /** Retries after a 429 (listing only; sign-in lookups never wait). */
  maxRetries?: number;
  sleep?: (ms: number) => Promise<void>;
};

type RawGuest = {
  user_email?: unknown;
  user_name?: unknown;
  user_first_name?: unknown;
  user_last_name?: unknown;
  approval_status?: unknown;
  registered_at?: unknown;
  created_at?: unknown;
};

/** Maps a Luma guest object to our row shape. Returns null when it has no usable email. */
export function mapLumaGuest(raw: RawGuest): LumaGuest | null {
  const email = typeof raw.user_email === "string" ? normalizeEmail(raw.user_email) : "";
  if (!email || !email.includes("@")) return null;
  const direct = typeof raw.user_name === "string" ? raw.user_name.trim() : "";
  const joined = [raw.user_first_name, raw.user_last_name]
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .join(" ")
    .trim();
  const status = typeof raw.approval_status === "string" ? normalizeLumaStatus(raw.approval_status) : "";
  const when = typeof raw.registered_at === "string" ? raw.registered_at : typeof raw.created_at === "string" ? raw.created_at : "";
  const date = when ? new Date(when) : null;
  return {
    email,
    name: direct || joined || null,
    lumaStatus: status || null,
    lumaRegisteredAt: date && !Number.isNaN(date.getTime()) ? date : null,
  };
}

async function lumaGet(
  path: string,
  params: Record<string, string | undefined>,
  config: LumaConfig,
  opts: LumaClientOptions,
): Promise<{ status: number; json: unknown; retryAfterMs: number | null }> {
  const url = new URL(path, LUMA_API_BASE);
  for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, value);
  const doFetch = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
  try {
    const response = await doFetch(url.toString(), {
      method: "GET",
      headers: { "x-luma-api-key": config.apiKey, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const retryHeader = Number(response.headers.get("retry-after"));
    const json = await response.json().catch(() => null);
    return {
      status: response.status,
      json,
      retryAfterMs: Number.isFinite(retryHeader) && retryHeader > 0 ? Math.min(retryHeader * 1000, 30_000) : null,
    };
  } catch {
    throw new LumaApiError("Could not reach Luma.");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Live lookup of one guest by email. Returns null when Luma says the email is not a guest of the event (404).
 * Throws LumaApiError on anything else (auth, rate limit, network, unexpected body): callers must treat that as
 * "unknown" and never open access.
 */
export async function fetchLumaGuestByEmail(rawEmail: string, opts: LumaClientOptions = {}): Promise<LumaGuest | null> {
  const config = opts.config === undefined ? getLumaConfig() : opts.config;
  if (!config) throw new LumaApiError("Luma is not configured.");
  const email = normalizeEmail(rawEmail);
  const { status, json } = await lumaGet(
    "/v1/events/guests/get",
    { event_id: config.eventId, id: email },
    config,
    { ...opts, timeoutMs: opts.timeoutMs ?? 4000 },
  );
  if (status === 404) return null;
  if (status !== 200 || !json || typeof json !== "object") {
    throw new LumaApiError(`Luma returned HTTP ${status}.`, status);
  }
  // Tolerate the legacy nested shape ({ guest: {...} }) as well as the flat one.
  const body = json as RawGuest & { guest?: RawGuest };
  const guest = mapLumaGuest(body.user_email !== undefined ? body : (body.guest ?? {}));
  // Defence in depth: only accept the answer if Luma returned the guest we asked for.
  if (!guest || guest.email !== email) throw new LumaApiError("Luma returned an unexpected guest.", status);
  return guest;
}

export type LumaListResult = { guests: LumaGuest[]; pages: number; skipped: number };

/** Pages through every guest of the event. Throws LumaApiError if any page fails (no partial results). */
export async function listAllLumaGuests(opts: LumaClientOptions = {}): Promise<LumaListResult> {
  const config = opts.config === undefined ? getLumaConfig() : opts.config;
  if (!config) throw new LumaApiError("Luma is not configured.");
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const maxRetries = opts.maxRetries ?? 4;
  const MAX_PAGES = 400; // 20k guests at 50/page: far beyond this event, protects against a cursor loop.
  const byEmail = new Map<string, LumaGuest>();
  let cursor: string | undefined;
  let pages = 0;
  let skipped = 0;
  const seenCursors = new Set<string>();

  for (;;) {
    let attempt = 0;
    let page: { status: number; json: unknown; retryAfterMs: number | null };
    for (;;) {
      page = await lumaGet(
        "/v1/events/guests/list",
        { event_id: config.eventId, pagination_limit: "50", pagination_cursor: cursor },
        config,
        opts,
      );
      if (page.status !== 429 || attempt >= maxRetries) break;
      attempt += 1;
      await sleep(page.retryAfterMs ?? Math.min(2000 * 2 ** (attempt - 1), 20_000));
    }
    if (page.status !== 200 || !page.json || typeof page.json !== "object") {
      throw new LumaApiError(`Luma returned HTTP ${page.status} while listing guests.`, page.status);
    }
    const body = page.json as { entries?: unknown; has_more?: unknown; next_cursor?: unknown };
    if (!Array.isArray(body.entries)) throw new LumaApiError("Luma returned an unexpected guest list.", page.status);
    pages += 1;
    for (const entry of body.entries as (RawGuest & { guest?: RawGuest })[]) {
      const guest = mapLumaGuest(entry.user_email !== undefined ? entry : (entry.guest ?? {}));
      if (!guest) skipped += 1;
      else byEmail.set(guest.email, guest);
    }
    // `next_cursor` can be present on the last page too: has_more is the authority.
    if (body.has_more !== true) break;
    if (typeof body.next_cursor !== "string" || !body.next_cursor || seenCursors.has(body.next_cursor)) {
      throw new LumaApiError("Luma pagination did not advance.", page.status);
    }
    if (pages >= MAX_PAGES) throw new LumaApiError("Luma returned too many pages.", page.status);
    seenCursors.add(body.next_cursor);
    cursor = body.next_cursor;
  }
  return { guests: [...byEmail.values()], pages, skipped };
}
