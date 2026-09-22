import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* `signup_drafts.resume_token` — what the funnel's `tdrop-signup` cookie holds and what the
   verification link carries, so a signup resumes in whichever browser opens that link
   (src/lib/signup.ts).

   Nullable, because a draft exists for a moment before its first token is issued and
   because a finished draft has no reason to keep one. Not unique: a token is random enough
   that a collision is not a real risk, and a unique index would turn one into a 500 on
   someone else's signup rather than a retry. Indexed because every request in the funnel
   looks a draft up by it.

   Hand-written for the same reason as the other migrations here — `payload migrate:create`
   cannot generate them non-interactively in this repo. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "signup_drafts" ADD COLUMN "resume_token" varchar;
  CREATE INDEX "signup_drafts_resume_token_idx" ON "signup_drafts" USING btree ("resume_token");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX "signup_drafts_resume_token_idx";
  ALTER TABLE "signup_drafts" DROP COLUMN "resume_token";`)
}
