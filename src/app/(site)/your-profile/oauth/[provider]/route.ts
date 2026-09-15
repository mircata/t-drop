import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { authorizeUrl, isOAuthProvider, oauthEnabled, OAUTH_STATE_COOKIE } from "@/lib/oauth";

/** GET /your-profile/oauth/google or /facebook — sends the browser to the provider's consent screen. */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isOAuthProvider(provider) || !oauthEnabled(provider)) {
    return NextResponse.redirect(new URL("/register?error=oauth-off", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(provider, state));
  res.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
