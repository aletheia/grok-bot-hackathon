import { isRegistrantApproved, normalizeLumaStatus } from "@/lib/luma/allowlist";
import type { LumaGuest } from "@/lib/luma/csv";

export type SyncCounts = {
  /** Guests returned by Luma. */
  fetched: number;
  /** Guests that were not in the local table. */
  inserted: number;
  /** Guests already in the local table. */
  existing: number;
  /** Existing guests whose Luma status changed. */
  statusChanged: number;
  /** Changed from an approved status to a non-approved one (they lose portal access). */
  downgraded: number;
  /** Changed from non-approved to approved (they gain portal access). */
  upgraded: number;
  /** Fetched guests per Luma status after the sync. */
  byStatus: Record<string, number>;
  /** Local rows Luma did not return (kept as they are, never deleted). */
  missingFromLuma: number;
};

export type SyncRunInfo = SyncCounts & { at: string; pages: number };

/** Pure comparison of the local table with Luma's list. Counts only: no guest data leaves this function. */
export function diffLumaSync(
  local: { email: string; lumaStatus: string | null }[],
  remote: LumaGuest[],
): SyncCounts {
  const localByEmail = new Map(local.map((row) => [row.email, row.lumaStatus]));
  const remoteEmails = new Set(remote.map((g) => g.email));
  const counts: SyncCounts = {
    fetched: remote.length,
    inserted: 0,
    existing: 0,
    statusChanged: 0,
    downgraded: 0,
    upgraded: 0,
    byStatus: {},
    missingFromLuma: local.filter((row) => !remoteEmails.has(row.email)).length,
  };
  for (const guest of remote) {
    const status = normalizeLumaStatus(guest.lumaStatus) || "unknown";
    counts.byStatus[status] = (counts.byStatus[status] ?? 0) + 1;
    if (!localByEmail.has(guest.email)) {
      counts.inserted += 1;
      continue;
    }
    counts.existing += 1;
    const before = localByEmail.get(guest.email) ?? null;
    if (normalizeLumaStatus(before) === normalizeLumaStatus(guest.lumaStatus)) continue;
    counts.statusChanged += 1;
    const wasApproved = isRegistrantApproved({ email: guest.email, lumaStatus: before });
    const isApproved = isRegistrantApproved(guest);
    if (wasApproved && !isApproved) counts.downgraded += 1;
    if (!wasApproved && isApproved) counts.upgraded += 1;
  }
  return counts;
}
