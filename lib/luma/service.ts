import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { staffInvite, user } from "@/db/schema/auth";
import { lumaRegistrant } from "@/db/schema/luma";
import { decideSignIn, type SignInDecision } from "@/lib/luma/allowlist";
import type { LumaGuest } from "@/lib/luma/csv";
import { normalizeEmail } from "@/lib/luma/email";
import { fetchLumaGuestByEmail, getLumaConfig, listAllLumaGuests } from "@/lib/luma/client";
import { createLiveLookupGuard, resolveRegistrantWithLuma } from "@/lib/luma/live";
import { diffLumaSync, type SyncRunInfo } from "@/lib/luma/sync-diff";
import { appSetting } from "@/db/schema/projects";

export function getSuperAdminEmails(): Set<string> {
  return new Set(
    (process.env.SUPER_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => normalizeEmail(value))
      .filter(Boolean),
  );
}

/** Staff = existing non-participant user, or a pending (unexpired, unaccepted) staff invite. */
async function isStaffEmail(email: string): Promise<boolean> {
  const [existing] = await db
    .select({ role: user.role })
    .from(user)
    .where(sql`lower(${user.email}) = ${email}`)
    .limit(1);
  if (existing && existing.role !== "participant") return true;

  const [invite] = await db
    .select({ id: staffInvite.id })
    .from(staffInvite)
    .where(
      and(
        sql`lower(${staffInvite.email}) = ${email}`,
        isNull(staffInvite.acceptedAt),
        gt(staffInvite.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return Boolean(invite);
}

export async function checkPortalSignIn(rawEmail: string): Promise<SignInDecision> {
  const email = normalizeEmail(rawEmail);
  const superAdminEmails = getSuperAdminEmails();
  if (superAdminEmails.has(email)) return { allowed: true, reason: "super_admin" };
  const [registrant] = await db.select().from(lumaRegistrant).where(eq(lumaRegistrant.email, email)).limit(1);
  // Live Luma check (read-only) when the local table does not say "approved": picks up approvals made after the
  // last sync. On any Luma error the local row decides, so an error can never open access.
  const live = await resolveRegistrantWithLuma(email, registrant, {
    enabled: getLumaConfig() !== null,
    lookup: (value) => liveGuard.run(value, () => fetchLumaGuestByEmail(value)),
    save: async (guest) => {
      await importLumaGuests([guest]);
    },
  });
  const isStaff = live.registrant ? false : await isStaffEmail(email);
  return decideSignIn({ email, superAdminEmails, isStaff, registrant: live.registrant });
}

const liveGuard = createLiveLookupGuard();

const LAST_SYNC_KEY = "luma_last_sync";

export async function getLastLumaSync(): Promise<SyncRunInfo | null> {
  const [row] = await db.select({ value: appSetting.value }).from(appSetting).where(eq(appSetting.key, LAST_SYNC_KEY)).limit(1);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as SyncRunInfo;
  } catch {
    return null;
  }
}

/**
 * Pages through every guest of the Luma event (read-only) and upserts their status, including downgrades
 * (approved -> declined). Rows missing from Luma are reported but kept. Returns counts only.
 */
export async function syncLumaGuestsFromApi(): Promise<SyncRunInfo> {
  const { guests, pages } = await listAllLumaGuests();
  const local = await db.select({ email: lumaRegistrant.email, lumaStatus: lumaRegistrant.lumaStatus }).from(lumaRegistrant);
  const counts = diffLumaSync(local, guests);
  await importLumaGuests(guests);
  const info: SyncRunInfo = { ...counts, pages, at: new Date().toISOString() };
  const value = JSON.stringify(info);
  await db
    .insert(appSetting)
    .values({ key: LAST_SYNC_KEY, value })
    .onConflictDoUpdate({ target: appSetting.key, set: { value, updatedAt: new Date() } });
  return info;
}

/** Upsert guests by email. Never deletes rows that are missing from the file. */
export async function importLumaGuests(guests: LumaGuest[]) {
  if (guests.length === 0) return { inserted: 0, updated: 0 };
  const existing = new Set(
    (await db.select({ email: lumaRegistrant.email }).from(lumaRegistrant)).map((r) => r.email),
  );
  const now = new Date();
  const CHUNK = 500;
  for (let i = 0; i < guests.length; i += CHUNK) {
    const chunk = guests.slice(i, i + CHUNK);
    await db
      .insert(lumaRegistrant)
      .values(chunk.map((g) => ({ ...g, importedAt: now, updatedAt: now })))
      .onConflictDoUpdate({
        target: lumaRegistrant.email,
        set: {
          name: sql`coalesce(excluded.name, ${lumaRegistrant.name})`,
          lumaStatus: sql`excluded.luma_status`,
          lumaRegisteredAt: sql`coalesce(excluded.luma_registered_at, ${lumaRegistrant.lumaRegisteredAt})`,
          importedAt: now,
          updatedAt: now,
        },
      });
  }
  const inserted = guests.filter((g) => !existing.has(g.email)).length;
  return { inserted, updated: guests.length - inserted };
}

export async function listLumaRegistrants() {
  return db
    .select({
      email: lumaRegistrant.email,
      name: lumaRegistrant.name,
      lumaStatus: lumaRegistrant.lumaStatus,
      lumaRegisteredAt: lumaRegistrant.lumaRegisteredAt,
      importedAt: lumaRegistrant.importedAt,
      hasAccount: sql<boolean>`exists (select 1 from "user" u where lower(u.email) = ${lumaRegistrant.email})`,
    })
    .from(lumaRegistrant)
    .orderBy(sql`${lumaRegistrant.lumaRegisteredAt} asc nulls last`, lumaRegistrant.email);
}
