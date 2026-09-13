import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payments" ADD COLUMN "provider_subscription_id" varchar;
  CREATE INDEX "payments_provider_subscription_id_idx" ON "payments" USING btree ("provider_subscription_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payments_provider_subscription_id_idx";
  ALTER TABLE "payments" DROP COLUMN "provider_subscription_id";`)
}
