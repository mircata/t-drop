import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The package change from /account (Figma "ДРОП page states V2", 2026-09-27): the plan a
   subscription had before its last change, the first drop month the current plan applies
   to (earlier months keep the previous plan's shirt count), and when it was last upgraded
   (a lower package is only allowed a month after that). Hand-written for the reason
   CLAUDE.md records: `payload migrate:create` cannot run non-interactively in this repo. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "subscriptions" ADD COLUMN "previous_plan_id" integer;
  ALTER TABLE "subscriptions" ADD COLUMN "plan_effective_month" varchar;
  ALTER TABLE "subscriptions" ADD COLUMN "last_upgrade_at" timestamp(3) with time zone;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_previous_plan_id_plans_id_fk" FOREIGN KEY ("previous_plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "subscriptions_previous_plan_idx" ON "subscriptions" USING btree ("previous_plan_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "subscriptions_previous_plan_idx";
  ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_previous_plan_id_plans_id_fk";
  ALTER TABLE "subscriptions" DROP COLUMN "last_upgrade_at";
  ALTER TABLE "subscriptions" DROP COLUMN "plan_effective_month";
  ALTER TABLE "subscriptions" DROP COLUMN "previous_plan_id";`)
}
