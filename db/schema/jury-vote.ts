import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { team } from "./auth";

/**
 * Standalone jury ballot for the public /vote page.
 * A juror is a free-text name (no login). Names match case-insensitively.
 * This is not `judge_score`: that table is the logged-in weighted rubric.
 */
export const juryVote = pgTable(
  "jury_vote",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    jurorName: text("juror_name").notNull(),
    teamId: integer("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    innovation: integer("innovation").notNull(),
    scalability: integer("scalability").notNull(),
    marketReadiness: integer("market_readiness").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("jury_vote_juror_team_unique").on(sql`lower(${table.jurorName})`, table.teamId),
    check(
      "jury_vote_juror_name_trimmed",
      sql`char_length(btrim(${table.jurorName})) > 0 and char_length(${table.jurorName}) <= 200 and ${table.jurorName} = btrim(${table.jurorName})`,
    ),
    check("jury_vote_innovation_range", sql`${table.innovation} >= 1 and ${table.innovation} <= 5`),
    check("jury_vote_scalability_range", sql`${table.scalability} >= 1 and ${table.scalability} <= 5`),
    check(
      "jury_vote_market_readiness_range",
      sql`${table.marketReadiness} >= 1 and ${table.marketReadiness} <= 5`,
    ),
  ],
);
