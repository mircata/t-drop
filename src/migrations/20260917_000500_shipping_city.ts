import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Adds shipping.city for the /join/delivery redesign, which asks for "Град".
   Hand-written: `payload migrate:create` cannot generate this one non-interactively —
   its Drizzle snapshot does not know about the shipping_* columns (20260915_151500 was
   hand-written too), so it offers to rename existing columns instead of adding one. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "customers" ADD COLUMN "shipping_city" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "customers" DROP COLUMN "shipping_city";`)
}
