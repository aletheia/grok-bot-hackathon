import { existsSync } from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "@/db";

let pending: Promise<void> | null = null;

/**
 * Vercel injects DATABASE_URL at runtime, and the Docker image is what normally
 * runs `drizzle-kit migrate` on boot. The public vote routes apply pending
 * migrations themselves so a Vercel deploy still creates `jury_vote`.
 * Already-applied migrations are a no-op.
 */
export function ensureMigrations(): Promise<void> {
  if (!pending) {
    pending = migrate(db, { migrationsFolder: findMigrationsFolder() }).catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

export function findMigrationsFolder(): string {
  const candidates = [
    path.join(process.cwd(), "drizzle"),
    path.join(process.cwd(), ".next/server/chunks/drizzle"),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "meta/_journal.json"))) return candidate;
  }
  return candidates[0];
}
