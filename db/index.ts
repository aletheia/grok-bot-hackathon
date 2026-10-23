import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schema/auth";
import * as relationsSchema from "./schema/relations";
import * as teamsSchema from "./schema/teams";
import * as partnersSchema from "./schema/partners";
import * as screeningSchema from "./schema/screening";
import * as scoringSchema from "./schema/scoring";
import * as projectsSchema from "./schema/projects";
import * as settingsSchema from "./schema/settings";
import * as mentorSchema from "./schema/mentor";
import * as lumaSchema from "./schema/luma";

/**
 * postgres-js connects lazily, so a placeholder is fine at build time. On Vercel,
 * `vercel pull` replaces sensitive values with a "[SENSITIVE]" placeholder for
 * CLI builds; the real DATABASE_URL is injected at runtime.
 */
const rawUrl = process.env.DATABASE_URL?.trim();
const connectionString =
  rawUrl && /^postgres(ql)?:\/\//.test(rawUrl) ? rawUrl : "postgresql://localhost:5432/cursor48";
// Serverless functions: keep the per-instance pool small (Neon's pooler does the pooling).
const client = postgres(connectionString, { max: process.env.VERCEL ? 1 : 10 });
export const db = drizzle(client, {
  schema: {
    ...authSchema,
    ...teamsSchema,
    ...partnersSchema,
    ...screeningSchema,
    ...scoringSchema,
    ...projectsSchema,
    ...settingsSchema,
    ...mentorSchema,
    ...lumaSchema,
    ...relationsSchema,
  },
});

export type Database = typeof db;
