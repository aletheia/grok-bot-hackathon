import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./db/schema/auth.ts", "./db/schema/teams.ts", "./db/schema/partners.ts", "./db/schema/screening.ts", "./db/schema/scoring.ts", "./db/schema/projects.ts", "./db/schema/settings.ts", "./db/schema/mentor.ts", "./db/schema/luma.ts", "./db/schema/email-throttle.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/cursor48",
  },
});
