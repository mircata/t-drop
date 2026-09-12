import { cookies, headers } from "next/headers";
import { cache } from "react";
import type { Customer } from "@/payload-types";
import { getPayloadClient } from "./payload";

/* Payload's cookie name: `${cookiePrefix}-token`, prefix defaults to "payload". */
export const AUTH_COOKIE = "payload-token";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** The signed-in customer for this request, or null. Admin users do not count. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
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

export async function clearAuthCookie() {
  const store = await cookies();
  store.set({ name: AUTH_COOKIE, value: "", path: "/", maxAge: 0 });
}
