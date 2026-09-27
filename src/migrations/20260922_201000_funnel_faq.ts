import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The signup funnel's FAQ, on the `site` global (Figma `525:3824`).

   It hangs off the global rather than off a page because the funnel's steps are hard-coded
   routes, not Payload pages, and the same list appears on more than one of them — shared
   chrome rather than per-page content (owner decision 17, docs/new-user-flow.md). The
   existing `faq` page block is untouched and still serves the marketing pages.

   `site_funnel_faq` mirrors `site_nav`: an ordered child table keyed to the single global
   row. The heading is a plain column with a default, so an existing row gets one without a
   backfill. Hand-written for the same reason as the rest here. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "site_funnel_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );

  ALTER TABLE "site" ADD COLUMN "funnel_faq_heading" varchar DEFAULT 'Често задавани въпроси';

  ALTER TABLE "site_funnel_faq" ADD CONSTRAINT "site_funnel_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "site_funnel_faq_order_idx" ON "site_funnel_faq" USING btree ("_order");
  CREATE INDEX "site_funnel_faq_parent_id_idx" ON "site_funnel_faq" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "site_funnel_faq" CASCADE;
  ALTER TABLE "site" DROP COLUMN "funnel_faq_heading";`)
}
