import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Tables behind the `signupHero` page block — step 0 of the signup funnel, which is a
   section of the landing page rather than a page of its own (Figma `519:3`, see
   docs/new-user-flow.md).

   Two tables, the shape Payload gives any block with an array field inside it: the block's
   own row, and a child table for the three photos whose `_parent_id` is a varchar because a
   block's id is a varchar, not a serial.

   Hand-written like the rest here — `payload migrate:create` cannot generate these
   non-interactively in this repo, its Drizzle snapshot having drifted from the hand-written
   columns (see 20260917_000500_shipping_city.ts). */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "pages_blocks_signup_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading_top" varchar NOT NULL,
  	"heading_bottom" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"email_placeholder" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"consent_note" varchar NOT NULL,
  	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_signup_hero_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL
  );

  ALTER TABLE "pages_blocks_signup_hero" ADD CONSTRAINT "pages_blocks_signup_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_signup_hero_photos" ADD CONSTRAINT "pages_blocks_signup_hero_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_signup_hero_photos" ADD CONSTRAINT "pages_blocks_signup_hero_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_signup_hero"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "pages_blocks_signup_hero_order_idx" ON "pages_blocks_signup_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_signup_hero_parent_id_idx" ON "pages_blocks_signup_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_signup_hero_path_idx" ON "pages_blocks_signup_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_signup_hero_photos_order_idx" ON "pages_blocks_signup_hero_photos" USING btree ("_order");
  CREATE INDEX "pages_blocks_signup_hero_photos_parent_id_idx" ON "pages_blocks_signup_hero_photos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_signup_hero_photos_photo_idx" ON "pages_blocks_signup_hero_photos" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "pages_blocks_signup_hero_photos" CASCADE;
  DROP TABLE "pages_blocks_signup_hero" CASCADE;`)
}
