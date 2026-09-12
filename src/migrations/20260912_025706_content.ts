import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar DEFAULT '/join',
  	"shirt_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_fabric" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sticker_red" varchar NOT NULL,
  	"sticker_neon" varchar NOT NULL,
  	"sticker_dot" varchar NOT NULL,
  	"shirt_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_usps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_usps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_reviews_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"quote" varchar NOT NULL,
  	"photo_id" integer
  );
  
  CREATE TABLE "pages_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"cta_label" varchar,
  	"cta_href" varchar DEFAULT '/join'
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"tagline" varchar NOT NULL,
  	"button_label" varchar NOT NULL,
  	"button_href" varchar DEFAULT '/join',
  	"shirt_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"small_on_phones" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_about_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"step1_heading" varchar NOT NULL,
  	"step1_sticker" varchar NOT NULL,
  	"step1_text" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar DEFAULT '/join',
  	"step2_heading" varchar NOT NULL,
  	"step2_sticker" varchar NOT NULL,
  	"step2_text" varchar NOT NULL,
  	"step2_note" varchar NOT NULL,
  	"shirt_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_about_when" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"sticker" varchar NOT NULL,
  	"countdown_before" varchar NOT NULL,
  	"countdown_after" varchar NOT NULL,
  	"text_left" varchar NOT NULL,
  	"text_right" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_footer_left" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_footer_right" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement" varchar NOT NULL,
  	"next_drop_date" timestamp(3) with time zone,
  	"newsletter_label" varchar NOT NULL,
  	"newsletter_placeholder" varchar NOT NULL,
  	"newsletter_button" varchar NOT NULL,
  	"copyright" varchar NOT NULL,
  	"credit" varchar NOT NULL,
  	"instagram" varchar,
  	"facebook" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_shirt_id_media_id_fk" FOREIGN KEY ("shirt_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_fabric" ADD CONSTRAINT "pages_blocks_fabric_shirt_id_media_id_fk" FOREIGN KEY ("shirt_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_fabric" ADD CONSTRAINT "pages_blocks_fabric_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_usps_items" ADD CONSTRAINT "pages_blocks_usps_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_usps_items" ADD CONSTRAINT "pages_blocks_usps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_usps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_usps" ADD CONSTRAINT "pages_blocks_usps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_reviews_items" ADD CONSTRAINT "pages_blocks_reviews_items_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_reviews_items" ADD CONSTRAINT "pages_blocks_reviews_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_reviews" ADD CONSTRAINT "pages_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_shirt_id_media_id_fk" FOREIGN KEY ("shirt_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_social" ADD CONSTRAINT "pages_blocks_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_story" ADD CONSTRAINT "pages_blocks_about_story_shirt_id_media_id_fk" FOREIGN KEY ("shirt_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_story" ADD CONSTRAINT "pages_blocks_about_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_when" ADD CONSTRAINT "pages_blocks_about_when_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_nav" ADD CONSTRAINT "site_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_footer_left" ADD CONSTRAINT "site_footer_left_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_footer_right" ADD CONSTRAINT "site_footer_right_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_shirt_idx" ON "pages_blocks_hero" USING btree ("shirt_id");
  CREATE INDEX "pages_blocks_fabric_order_idx" ON "pages_blocks_fabric" USING btree ("_order");
  CREATE INDEX "pages_blocks_fabric_parent_id_idx" ON "pages_blocks_fabric" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_fabric_path_idx" ON "pages_blocks_fabric" USING btree ("_path");
  CREATE INDEX "pages_blocks_fabric_shirt_idx" ON "pages_blocks_fabric" USING btree ("shirt_id");
  CREATE INDEX "pages_blocks_usps_items_order_idx" ON "pages_blocks_usps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_usps_items_parent_id_idx" ON "pages_blocks_usps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_usps_items_icon_idx" ON "pages_blocks_usps_items" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_usps_order_idx" ON "pages_blocks_usps" USING btree ("_order");
  CREATE INDEX "pages_blocks_usps_parent_id_idx" ON "pages_blocks_usps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_usps_path_idx" ON "pages_blocks_usps" USING btree ("_path");
  CREATE INDEX "pages_blocks_reviews_items_order_idx" ON "pages_blocks_reviews_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_reviews_items_parent_id_idx" ON "pages_blocks_reviews_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_reviews_items_photo_idx" ON "pages_blocks_reviews_items" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_reviews_order_idx" ON "pages_blocks_reviews" USING btree ("_order");
  CREATE INDEX "pages_blocks_reviews_parent_id_idx" ON "pages_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_reviews_path_idx" ON "pages_blocks_reviews" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_shirt_idx" ON "pages_blocks_cta" USING btree ("shirt_id");
  CREATE INDEX "pages_blocks_social_order_idx" ON "pages_blocks_social" USING btree ("_order");
  CREATE INDEX "pages_blocks_social_parent_id_idx" ON "pages_blocks_social" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_social_path_idx" ON "pages_blocks_social" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_story_order_idx" ON "pages_blocks_about_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_story_parent_id_idx" ON "pages_blocks_about_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_story_path_idx" ON "pages_blocks_about_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_story_shirt_idx" ON "pages_blocks_about_story" USING btree ("shirt_id");
  CREATE INDEX "pages_blocks_about_when_order_idx" ON "pages_blocks_about_when" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_when_parent_id_idx" ON "pages_blocks_about_when" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_when_path_idx" ON "pages_blocks_about_when" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "site_nav_order_idx" ON "site_nav" USING btree ("_order");
  CREATE INDEX "site_nav_parent_id_idx" ON "site_nav" USING btree ("_parent_id");
  CREATE INDEX "site_footer_left_order_idx" ON "site_footer_left" USING btree ("_order");
  CREATE INDEX "site_footer_left_parent_id_idx" ON "site_footer_left" USING btree ("_parent_id");
  CREATE INDEX "site_footer_right_order_idx" ON "site_footer_right" USING btree ("_order");
  CREATE INDEX "site_footer_right_parent_id_idx" ON "site_footer_right" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_fabric" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_usps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_usps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_reviews_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_about_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_about_when" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_nav" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_footer_left" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_footer_right" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_fabric" CASCADE;
  DROP TABLE "pages_blocks_usps_items" CASCADE;
  DROP TABLE "pages_blocks_usps" CASCADE;
  DROP TABLE "pages_blocks_reviews_items" CASCADE;
  DROP TABLE "pages_blocks_reviews" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_social" CASCADE;
  DROP TABLE "pages_blocks_about_story" CASCADE;
  DROP TABLE "pages_blocks_about_when" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "site_nav" CASCADE;
  DROP TABLE "site_footer_left" CASCADE;
  DROP TABLE "site_footer_right" CASCADE;
  DROP TABLE "site" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";`)
}
