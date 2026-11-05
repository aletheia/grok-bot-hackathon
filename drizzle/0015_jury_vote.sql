CREATE TABLE "jury_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"juror_name" text NOT NULL,
	"team_id" integer NOT NULL,
	"innovation" integer NOT NULL,
	"scalability" integer NOT NULL,
	"market_readiness" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jury_vote_juror_name_trimmed" CHECK (char_length(btrim("jury_vote"."juror_name")) > 0 and char_length("jury_vote"."juror_name") <= 200 and "jury_vote"."juror_name" = btrim("jury_vote"."juror_name")),
	CONSTRAINT "jury_vote_innovation_range" CHECK ("jury_vote"."innovation" >= 1 and "jury_vote"."innovation" <= 5),
	CONSTRAINT "jury_vote_scalability_range" CHECK ("jury_vote"."scalability" >= 1 and "jury_vote"."scalability" <= 5),
	CONSTRAINT "jury_vote_market_readiness_range" CHECK ("jury_vote"."market_readiness" >= 1 and "jury_vote"."market_readiness" <= 5)
);
--> statement-breakpoint
ALTER TABLE "jury_vote" ADD CONSTRAINT "jury_vote_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "jury_vote_juror_team_unique" ON "jury_vote" USING btree (lower("juror_name"),"team_id");