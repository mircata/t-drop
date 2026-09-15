import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" DROP COLUMN "next_drop_date";
  ALTER TABLE "site" ADD COLUMN "delivery_day" numeric DEFAULT 21;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" DROP COLUMN "delivery_day";
  ALTER TABLE "site" ADD COLUMN "next_drop_date" timestamp(3) with time zone;`)
}
