CREATE TABLE "luma_registrant" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text,
	"luma_status" text,
	"luma_registered_at" timestamp with time zone,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_max_members_limit_check";--> statement-breakpoint
ALTER TABLE "team" ALTER COLUMN "max_members" SET DEFAULT 6;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "verified" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "failed_verification_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "available_for_team_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "available_note" text;--> statement-breakpoint
CREATE INDEX "luma_registrant_status_idx" ON "luma_registrant" USING btree ("luma_status");--> statement-breakpoint
CREATE INDEX "user_available_for_team_idx" ON "user" USING btree ("available_for_team_at");--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_max_members_limit_check" CHECK ("team"."max_members" > 0 and "team"."max_members" <= 6);--> statement-breakpoint
-- Team size is now 4-6: lift the cap on existing active teams (no rows are removed).
UPDATE "team" SET "max_members" = 6 WHERE "status" = 'active';
