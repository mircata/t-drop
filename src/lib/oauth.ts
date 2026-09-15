import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/stripe";

export type OAuthProvider = "google" | "facebook";

/** Short-lived cookie holding the CSRF state between the authorize redirect and the callback. */
export const OAUTH_STATE_COOKIE = "oauth-state";

type ProviderConfig = {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  /** Exchanges an access token for {email, name}. Different shape per provider. */
  fetchProfile: (accessToken: string) => Promise<{ email: string | null; name: string | null }>;
};

async function googleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return { email: null, name: null };
  const data = (await res.json()) as { email?: string; name?: string };
  return { email: data.email ?? null, name: data.name ?? null };
}

async function facebookProfile(accessToken: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`);
  if (!res.ok) return { email: null, name: null };
  const data = (await res.json()) as { email?: string; name?: string };
  return { email: data.email ?? null, name: data.name ?? null };
}

const PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    fetchProfile: googleProfile,
  },
  facebook: {
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scope: "email public_profile",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    fetchProfile: facebookProfile,
  },
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "facebook";
}

export function oauthEnabled(provider: OAuthProvider): boolean {
  const p = PROVIDERS[provider];
  return Boolean(p.clientId && p.clientSecret);
}

export function redirectUri(provider: OAuthProvider): string {
  return `${siteUrl()}/your-profile/oauth/${provider}/callback`;
}

/** The provider's consent-screen URL the browser should be sent to. */
export function authorizeUrl(provider: OAuthProvider, state: string): string {
  const p = PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: p.clientId ?? "",
    redirect_uri: redirectUri(provider),
    response_type: "code",
    scope: p.scope,
    state,
  });
  return `${p.authorizeUrl}?${params.toString()}`;
}

/** Exchanges an authorization code for {email, name}. Null email means the provider didn't share one. */
export async function exchangeCode(provider: OAuthProvider, code: string): Promise<{ email: string | null; name: string | null }> {
  const p = PROVIDERS[provider];
  const body = new URLSearchParams({
    client_id: p.clientId ?? "",
    client_secret: p.clientSecret ?? "",
    code,
    redirect_uri: redirectUri(provider),
    grant_type: "authorization_code",
  });
  const res = await fetch(p.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (!res.ok) return { email: null, name: null };
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return { email: null, name: null };
  return p.fetchProfile(data.access_token);
}

/** A password only we ever know, used to mint a real session via payload.login() — see the callback route for why. */
export function randomPassword(): string {
  return randomBytes(32).toString("hex");
}
