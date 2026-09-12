/**
 * Creates the first /admin user for local development.
 * Run: npm run seed:admin
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment, with local defaults.
 * Safe to re-run: it does nothing when a user with that email exists.
 */
import { getPayload } from "payload";
import config from "@payload-config";

const email = process.env.ADMIN_EMAIL || "admin@t-drop.local";
const password = process.env.ADMIN_PASSWORD || "tdrop-local-admin";

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
});

if (existing.totalDocs > 0) {
  payload.logger.info(`Admin user ${email} already exists, nothing to do.`);
} else {
  await payload.create({
    collection: "users",
    data: { email, password, name: "Local admin" },
  });
  payload.logger.info(`Created admin user ${email}.`);
}

process.exit(0);
