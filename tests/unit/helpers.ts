import type { Payload } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";

let instance: Payload | null = null;

/** One Payload bound to the test database for the whole run. */
export async function testPayload(): Promise<Payload> {
  if (!instance) instance = await getPayload({ config });
  return instance;
}

const TABLES = [
  "webhook_events",
  "category_selections",
  "payments",
  "subscriptions",
  "subscribers",
  "customers_sessions",
  "customers",
  "users_sessions",
  "users",
  "categories",
  "plans",
  "pages",
  "media",
];

/** Empty every business table and restart ids, so each test starts from nothing. */
export async function resetDatabase(payload: Payload) {
  const pool = (payload.db as unknown as { pool: { query: (sql: string) => Promise<unknown> } }).pool;
  await pool.query(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`);
}

export async function seedPlanAndCategory(payload: Payload) {
  const plan = await payload.create({
    collection: "plans",
    data: { name: "Месечен абонамент", priceCents: 1799, currency: "eur", stripePriceId: "price_test_001", active: true, sortOrder: 0 },
  });
  const category = await payload.create({ collection: "categories", data: { name: "Арт", active: true, sortOrder: 0 } });
  return { plan, category };
}
