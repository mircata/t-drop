import { cookies } from "next/headers";
import { cache } from "react";
import type { Customer } from "@/payload-types";
import { getPayloadClient } from "./payload";

/* Our own cookie, separate from Payload's admin cookie (see cookiePrefix in
   payload.config.ts), so a signed-in customer and a signed-in admin user don't
   overwrite each other's session in the same browser. Read back below by handing
   the token to payload.auth() as an Authorization header instead of a cookie,
   since Payload's cookie strategy only ever looks for its own cookie name. */
export const AUTH_COOKIE = "tdrop-account-token";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** The signed-in customer for this request, or null. Admin users do not count. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) });
  if (!user || user.collection !== "customers") return null;
  return user as Customer;
});

export async function setAuthCookie(token: string, remember: boolean) {
  const store = await cookies();
  store.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: THIRTY_DAYS } : {}),
  });
}
