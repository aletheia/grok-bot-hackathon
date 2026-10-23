import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Luma guest list (allowlist for portal sign-in). Imported by super admins from
 * Luma's guest CSV export. `email` is stored lower-cased and trimmed.
 */
export const lumaRegistrant = pgTable(
  "luma_registrant",
  {
    email: text("email").primaryKey(),
    name: text("name"),
    /** Raw Luma `approval_status` (approved, pending_approval, waitlist, invited, declined, …). */
    lumaStatus: text("luma_status"),
    /** Luma registration time (CSV `created_at`), used for first-come-first-served ordering. */
    lumaRegisteredAt: timestamp("luma_registered_at", { withTimezone: true }),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("luma_registrant_status_idx").on(table.lumaStatus)],
);
