import { headers } from "next/headers";
import { cache } from "react";
import type { User } from "@/payload-types";
import { getPayloadClient } from "./payload";

/**
 * The signed-in /admin user for this request, or null. Reads Payload's own
 * admin cookie directly (`tdrop-admin-token`, see cookiePrefix in
 * payload.config.ts) — unlike customers, admin sessions aren't rerouted
 * around Payload's cookie matching, so the standard Cookie auth strategy
 * already finds it. For staff-only pages outside Payload's own /admin UI,
 * like /admin-tools/deliveries.
 */
export const getAdminUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user || user.collection !== "users") return null;
  return user as User;
});
