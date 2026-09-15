import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_customers_shipping_carrier" AS ENUM('speedy', 'sameday', 'boxnow');
  ALTER TABLE "customers" ADD COLUMN "shipping_recipient_name" varchar;
  ALTER TABLE "customers" ADD COLUMN "shipping_postcode" varchar;
  ALTER TABLE "customers" ADD COLUMN "shipping_carrier" "enum_customers_shipping_carrier";
  ALTER TABLE "customers" ADD COLUMN "shipping_address_or_office" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" DROP COLUMN "shipping_recipient_name";
  ALTER TABLE "customers" DROP COLUMN "shipping_postcode";
  ALTER TABLE "customers" DROP COLUMN "shipping_carrier";
  ALTER TABLE "customers" DROP COLUMN "shipping_address_or_office";
  DROP TYPE "public"."enum_customers_shipping_carrier";`)
}
