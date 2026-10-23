/**
 * Live Luma check used at sign-in, on top of the local luma_registrant table.
 *
 * Rules (access is only ever opened by a successful Luma answer, never by an error):
 *  - local row approved            -> allowed, no Luma call.
 *  - local row missing/not approved -> ask Luma for that email. If Luma knows the guest, the local row is
 *    upserted (so the messages for waitlist/pending/declined stay accurate) and the decision uses Luma's status.
 *  - Luma error / not configured / budget exhausted -> keep the local decision untouched.
 * A short cache and a per-minute budget keep random emails from burning Luma's 200 requests/minute limit.
 */
import { isRegistrantApproved, type RegistrantLike } from "@/lib/luma/allowlist";
import { LumaApiError } from "@/lib/luma/client";
import type { LumaGuest } from "@/lib/luma/csv";

export type LiveLookupGuard = {
  /** Cached answer for this email, or undefined when a Luma call is needed. Throws when the budget is spent. */
  run(email: string, lookup: () => Promise<LumaGuest | null>): Promise<LumaGuest | null>;
};

export function createLiveLookupGuard(options: {
  ttlMs?: number;
  maxPerMinute?: number;
  maxEntries?: number;
  now?: () => number;
} = {}): LiveLookupGuard {
  const ttlMs = options.ttlMs ?? 20_000;
  const maxPerMinute = options.maxPerMinute ?? 90;
  const maxEntries = options.maxEntries ?? 500;
  const now = options.now ?? Date.now;
  const cache = new Map<string, { at: number; guest: LumaGuest | null }>();
  const calls: number[] = [];

  return {
    async run(email, lookup) {
      const t = now();
      const hit = cache.get(email);
      if (hit && t - hit.at < ttlMs) return hit.guest;
      while (calls.length > 0 && t - calls[0] >= 60_000) calls.shift();
      if (calls.length >= maxPerMinute) throw new LumaApiError("Live Luma lookups are throttled.");
      calls.push(t);
      const guest = await lookup();
      if (cache.size >= maxEntries) cache.delete(cache.keys().next().value as string);
      cache.set(email, { at: t, guest });
      return guest;
    },
  };
}

export type LiveDeps = {
  enabled: boolean;
  lookup: (email: string) => Promise<LumaGuest | null>;
  save: (guest: LumaGuest) => Promise<void>;
};

export type LiveResult = {
  registrant: RegistrantLike;
  source: "local" | "luma";
};

export async function resolveRegistrantWithLuma(
  email: string,
  local: RegistrantLike,
  deps: LiveDeps,
  approvedStatuses?: readonly string[],
): Promise<LiveResult> {
  if (isRegistrantApproved(local, approvedStatuses) || !deps.enabled) return { registrant: local, source: "local" };
  let guest: LumaGuest | null;
  try {
    guest = await deps.lookup(email);
  } catch {
    return { registrant: local, source: "local" };
  }
  if (!guest) return { registrant: local, source: "local" };
  try {
    await deps.save(guest);
  } catch {
    // The decision below is still Luma's; the row will be written by the next successful lookup or sync.
  }
  return { registrant: { email: guest.email, lumaStatus: guest.lumaStatus }, source: "luma" };
}
