import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Stable, non-reversible key so the throttle table never stores a raw email address or IP. */
export function throttleKey(namespace: string, value: string): string {
  const pepper = process.env.BETTER_AUTH_SECRET ?? "";
  const digest = createHash("sha256").update(`${pepper}:${value}`).digest("hex");
  return `${namespace}:${digest}`;
}

/**
 * Atomically counts one event for `key` in a fixed window and reports whether it is still within `max`.
 * One INSERT .. ON CONFLICT statement, so concurrent requests cannot both take the last slot.
 * The window restarts when the previous one is older than `windowSeconds`.
 */
export async function consumeThrottle(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const rows = await db.execute<{ count: number }>(sql`
    INSERT INTO email_throttle AS t (key, window_start, count)
    VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN t.window_start < now() - make_interval(secs => ${windowSeconds}::double precision) THEN 1 ELSE t.count + 1 END,
      window_start = CASE WHEN t.window_start < now() - make_interval(secs => ${windowSeconds}::double precision) THEN now() ELSE t.window_start END
    RETURNING count
  `);
  const count = Number((rows as unknown as { count: number }[])[0]?.count ?? Number.MAX_SAFE_INTEGER);
  // Opportunistic clean-up of long-expired windows (about 1 request in 20) keeps the table tiny.
  if (Math.random() < 0.05) {
    await db.execute(sql`DELETE FROM email_throttle WHERE window_start < now() - interval '2 days'`);
  }
  return count <= max;
}
