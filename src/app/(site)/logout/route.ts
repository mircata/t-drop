import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/* "Излизане" in the account menu. Clears the session cookie and returns to the login page. */
export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/your-profile", request.url));
  res.cookies.set({ name: AUTH_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
