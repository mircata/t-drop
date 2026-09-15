import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_category_selections_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_category_selections_gender" AS ENUM('male', 'female');
  ALTER TABLE "category_selections" ADD COLUMN "size" "enum_category_selections_size";
  ALTER TABLE "category_selections" ADD COLUMN "gender" "enum_category_selections_gender";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "category_selections" DROP COLUMN "size";
  ALTER TABLE "category_selections" DROP COLUMN "gender";
  DROP TYPE "public"."enum_category_selections_size";
  DROP TYPE "public"."enum_category_selections_gender";`)
}
