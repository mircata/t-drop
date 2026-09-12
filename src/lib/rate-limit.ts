import { headers } from "next/headers";

/*
 * Small in-memory rate limiter for the public forms (login, registration,
 * password reset, newsletter). It is per server instance, so on Vercel each
 * function instance keeps its own counter; it still stops a single client from
 * hammering one instance. Account lock-out after failed logins is separate and
 * lives in Payload (maxLoginAttempts on the customers collection).
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

/** Client IP from the proxy headers Vercel sets, falling back to "local". */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** True when `key` has been used more than `limit` times in the last `windowMs`. */
export async function rateLimited(scope: string, limit: number, windowMs: number): Promise<boolean> {
  const key = `${scope}:${await clientIp()}`;
  const now = Date.now();
  prune(now);
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}
