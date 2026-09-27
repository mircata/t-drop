import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Adds plans.image_id — the picture on the package card in the signup funnel's step 1-1.
   Hand-written for the reason CLAUDE.md records: `payload migrate:create` cannot run
   non-interactively in this repo. Mirrors categories.image_id (20260912_031702): nullable,
   FK to media with ON DELETE set null, plus the index Payload's query builder expects. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "plans" ADD COLUMN "image_id" integer;
  ALTER TABLE "plans" ADD CONSTRAINT "plans_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "plans_image_idx" ON "plans" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "plans_image_idx";
  ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_image_id_media_id_fk";
  ALTER TABLE "plans" DROP COLUMN "image_id";`)
}
