import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { resendAdapter } from "@payloadcms/email-resend";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import { Users } from "./collections/Users";
import { Customers } from "./collections/Customers";
import { Plans } from "./collections/Plans";
import { Subscriptions } from "./collections/Subscriptions";
import { Payments } from "./collections/Payments";
import { Categories } from "./collections/Categories";
import { CategorySelections } from "./collections/CategorySelections";
import { WebhookEvents } from "./collections/WebhookEvents";
import { Subscribers } from "./collections/Subscribers";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Site } from "./globals/Site";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/* Real emails go through Resend when a key is set; otherwise Payload prints them to the console. */
const email = process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || "no-reply@t-drop.net",
      defaultFromName: process.env.EMAIL_FROM_NAME || "T-Drop",
    })
  : undefined;

/*
 * Uploads go to an S3-compatible bucket (Supabase Storage) when S3_BUCKET is set.
 * Vercel has no persistent disk, so production must set it. Locally, files stay
 * in public/media.
 */
const plugins = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION || "eu-central-1",
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
          },
        },
      }),
    ]
  : [];

export default buildConfig({
  plugins,
  email,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ["@/components/admin-tools/deliveries-nav-link#DeliveriesNavLink"],
    },
  },
  // Payload's own login (used only by /admin, for the `users` collection) sets a
  // cookie named `${cookiePrefix}-token`. Customers never touch this cookie — see
  // AUTH_COOKIE in src/lib/auth.ts — so an admin and a customer can be signed in
  // in the same browser at once instead of overwriting each other's session.
  cookiePrefix: "tdrop-admin",
  graphQL: { disable: true },
  collections: [Users, Customers, Media, Pages, Plans, Subscriptions, Payments, Categories, CategorySelections, WebhookEvents, Subscribers],
  globals: [Site],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      // Migrations need a session-mode connection; on Supabase that is the session pooler.
      // Runtime on Vercel uses DATABASE_URI, the transaction pooler (port 6543), which shares
      // a few server connections across many serverless instances. Locally both can be the same.
      connectionString:
        (process.argv.some((a) => a.startsWith("migrate")) && process.env.DATABASE_URI_SESSION) || process.env.DATABASE_URI || "",
      // Each serverless instance keeps at most this many connections and drops idle ones fast.
      max: Number(process.env.DATABASE_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
    },
    // Schema changes go through committed migrations in src/migrations,
    // never through Drizzle push, so local dev and Supabase stay in step.
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  sharp,
});
