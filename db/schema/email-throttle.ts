import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Fixed-window counters that cap how many informational emails the unauthenticated sign-in endpoint may send.
 * `key` is a namespaced SHA-256 digest (e.g. `invite:email:<hash>`, `invite:ip:<hash>`), never a raw address or IP.
 */
export const emailThrottle = pgTable("email_throttle", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: integer("count").notNull().default(0),
});
