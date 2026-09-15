import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { exchangeCode, isOAuthProvider, oauthEnabled, randomPassword, OAUTH_STATE_COOKIE } from "@/lib/oauth";

const fail = (request: Request, error: string) => NextResponse.redirect(new URL(`/register?error=${error}`, request.url));

/**
 * GET /your-profile/oauth/google/callback or /facebook/callback. Finds or
 * creates the customer by email, then — since Payload's login() needs a
 * password and OAuth never gives us one — sets a fresh random password only
 * we ever see and immediately logs in with it, reusing Payload's own stable
 * Local API instead of hand-signing a JWT. Safe to repeat on every OAuth
 * login; the previous random password, if any, is simply replaced.
 */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isOAuthProvider(provider) || !oauthEnabled(provider)) return fail(request, "oauth-off");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.split(/; */)
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);
  if (!code || !state || !cookieState || state !== cookieState) return fail(request, "oauth-state");

  if (await rateLimited("oauth", 20, 10 * 60 * 1000)) return fail(request, "rate-limit");

  const profile = await exchangeCode(provider, code);
  if (!profile.email) return fail(request, "oauth-noemail");

  const payload = await getPayloadClient();
  const existing = await payload.find({ collection: "customers", where: { email: { equals: profile.email } }, limit: 1 });
  const password = randomPassword();

  let customerId: number;
  if (existing.docs[0]) {
    customerId = existing.docs[0].id;
    await payload.update({ collection: "customers", id: customerId, data: { password } });
  } else {
    const created = await payload.create({
      collection: "customers",
      data: { name: profile.name || profile.email, email: profile.email, password },
    });
    customerId = created.id;
  }

  let token: string | undefined;
  try {
    ({ token } = await payload.login({ collection: "customers", data: { email: profile.email, password } }));
  } catch {
    return fail(request, "oauth-login");
  }
  if (!token) return fail(request, "oauth-login");

  await setAuthCookie(token, true);
  const res = NextResponse.redirect(new URL("/account", request.url));
  res.cookies.set({ name: OAUTH_STATE_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
