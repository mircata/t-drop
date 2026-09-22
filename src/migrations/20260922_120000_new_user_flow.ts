import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The data model behind the new signup funnel (docs/new-user-flow.md), in four parts:

   1. plans.shirt_count / plans.badge — a package now delivers 1, 2 or 4 shirts a month.
   2. category_selections.slot, and the unique key moving from (customer, month) to
      (customer, month, slot). The old key allowed exactly one pick per customer per month,
      which is what a multi-shirt package breaks. Existing rows backfill to slot 1, so the
      new key holds for them unchanged.
   3. customers.shipping_delivery_type / _office_id / _office_name — structured delivery
      for the courier APIs (docs/courier-integration.md). Additive: shipping_address_or_office
      keeps the street line and existing rows keep working.
   4. signup_drafts (+ its picks array) — funnel state for people who have not got an
      account yet.

   Hand-written, like the other shipping_* migrations: `payload migrate:create` cannot
   generate these non-interactively here, because its Drizzle snapshot does not know about
   the hand-written columns and offers renames instead of adds. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_plans_badge" AS ENUM('none', 'recommended');
  CREATE TYPE "public"."enum_customers_shipping_delivery_type" AS ENUM('address', 'office', 'locker');
  CREATE TYPE "public"."enum_signup_drafts_step" AS ENUM('plan', 'verify', 'design', 'account', 'payment');
  CREATE TYPE "public"."enum_signup_drafts_picks_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_signup_drafts_picks_gender" AS ENUM('male', 'female');

  ALTER TABLE "plans" ADD COLUMN "shirt_count" numeric DEFAULT 1 NOT NULL;
  ALTER TABLE "plans" ADD COLUMN "badge" "enum_plans_badge" DEFAULT 'none';

  ALTER TABLE "category_selections" ADD COLUMN "slot" numeric DEFAULT 1 NOT NULL;
  DROP INDEX "customer_month_idx";
  CREATE UNIQUE INDEX "customer_month_slot_idx" ON "category_selections" USING btree ("customer_id","month","slot");

  ALTER TABLE "customers" ADD COLUMN "shipping_delivery_type" "enum_customers_shipping_delivery_type";
  ALTER TABLE "customers" ADD COLUMN "shipping_office_id" varchar;
  ALTER TABLE "customers" ADD COLUMN "shipping_office_name" varchar;

  CREATE TABLE "signup_drafts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"step" "enum_signup_drafts_step" DEFAULT 'plan',
  	"plan_id" integer,
  	"email_verified" boolean DEFAULT false,
  	"verify_token" varchar,
  	"verify_token_expires_at" timestamp(3) with time zone,
  	"verified_without_email" boolean DEFAULT false,
  	"privacy_accepted" boolean DEFAULT false,
  	"marketing_opt_in" boolean DEFAULT false,
  	"customer_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "signup_drafts_picks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" numeric NOT NULL,
  	"category_id" integer,
  	"size" "enum_signup_drafts_picks_size",
  	"gender" "enum_signup_drafts_picks_gender"
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "signup_drafts_id" integer;

  ALTER TABLE "signup_drafts" ADD CONSTRAINT "signup_drafts_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "signup_drafts" ADD CONSTRAINT "signup_drafts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "signup_drafts_picks" ADD CONSTRAINT "signup_drafts_picks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "signup_drafts_picks" ADD CONSTRAINT "signup_drafts_picks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."signup_drafts"("id") ON DELETE cascade ON UPDATE no action;

  CREATE UNIQUE INDEX "signup_drafts_email_idx" ON "signup_drafts" USING btree ("email");
  CREATE INDEX "signup_drafts_step_idx" ON "signup_drafts" USING btree ("step");
  CREATE INDEX "signup_drafts_plan_idx" ON "signup_drafts" USING btree ("plan_id");
  CREATE INDEX "signup_drafts_email_verified_idx" ON "signup_drafts" USING btree ("email_verified");
  CREATE INDEX "signup_drafts_verify_token_idx" ON "signup_drafts" USING btree ("verify_token");
  CREATE INDEX "signup_drafts_customer_idx" ON "signup_drafts" USING btree ("customer_id");
  CREATE INDEX "signup_drafts_updated_at_idx" ON "signup_drafts" USING btree ("updated_at");
  CREATE INDEX "signup_drafts_created_at_idx" ON "signup_drafts" USING btree ("created_at");
  CREATE INDEX "signup_drafts_picks_order_idx" ON "signup_drafts_picks" USING btree ("_order");
  CREATE INDEX "signup_drafts_picks_parent_id_idx" ON "signup_drafts_picks" USING btree ("_parent_id");
  CREATE INDEX "signup_drafts_picks_category_idx" ON "signup_drafts_picks" USING btree ("category_id");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_signup_drafts_fk" FOREIGN KEY ("signup_drafts_id") REFERENCES "public"."signup_drafts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_signup_drafts_id_idx" ON "payload_locked_documents_rels" USING btree ("signup_drafts_id");`)
}

/* Reversing part 2 is only safe while every customer has at most one pick per month, which
   is true until the new funnel writes a second one. Dropping to the old key after that
   would fail on the duplicate rows — by design; that is the migration telling you the data
   no longer fits the old shape, not a bug to work around. */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "signup_drafts_picks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "signup_drafts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "signup_drafts_picks" CASCADE;
  DROP TABLE "signup_drafts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_signup_drafts_fk";
  DROP INDEX "payload_locked_documents_rels_signup_drafts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "signup_drafts_id";

  ALTER TABLE "customers" DROP COLUMN "shipping_delivery_type";
  ALTER TABLE "customers" DROP COLUMN "shipping_office_id";
  ALTER TABLE "customers" DROP COLUMN "shipping_office_name";

  DROP INDEX "customer_month_slot_idx";
  CREATE UNIQUE INDEX "customer_month_idx" ON "category_selections" USING btree ("customer_id","month");
  ALTER TABLE "category_selections" DROP COLUMN "slot";

  ALTER TABLE "plans" DROP COLUMN "shirt_count";
  ALTER TABLE "plans" DROP COLUMN "badge";

  DROP TYPE "public"."enum_signup_drafts_picks_gender";
  DROP TYPE "public"."enum_signup_drafts_picks_size";
  DROP TYPE "public"."enum_signup_drafts_step";
  DROP TYPE "public"."enum_customers_shipping_delivery_type";
  DROP TYPE "public"."enum_plans_badge";`)
}
