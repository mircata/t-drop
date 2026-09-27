import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* `pages_blocks_signup_hero.consent_note` → `field_note`.

   The column was added a few hours earlier on the assumption — taken from prose rather than
   from the frame — that the line under the "ЗАПИШИ СЕ" button was a consent notice. Reading
   Figma `519:3` and `525:3048` directly shows it is instructional copy that sits *above* the
   email field ("Въведи имейла си и започни поръчката само в няколко стъпки."), so the field
   is renamed to match what it actually holds.

   A rename, not a drop and add: the column is `not null` and an editor may already have
   typed into it. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_signup_hero" RENAME COLUMN "consent_note" TO "field_note";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_signup_hero" RENAME COLUMN "field_note" TO "consent_note";`)
}
