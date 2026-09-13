import pg from "pg";

/* Direct reads of the test database for things the UI never shows: email tokens. */
const uri = process.env.TEST_DATABASE_URI || "postgres://localhost:5432/tdrop_test";

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: uri });
  await client.connect();
  try {
    const r = await client.query(sql, params);
    return r.rows as T[];
  } finally {
    await client.end();
  }
}
