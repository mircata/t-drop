import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_category_selections_fulfillment_status" AS ENUM('pending_payment', 'preparing', 'on_hold', 'delivered', 'cancelled');
  ALTER TABLE "category_selections" ADD COLUMN "fulfillment_status" "enum_category_selections_fulfillment_status" DEFAULT 'preparing';
  CREATE INDEX "category_selections_fulfillment_status_idx" ON "category_selections" USING btree ("fulfillment_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "category_selections_fulfillment_status_idx";
  ALTER TABLE "category_selections" DROP COLUMN "fulfillment_status";
  DROP TYPE "public"."enum_category_selections_fulfillment_status";`)
}
