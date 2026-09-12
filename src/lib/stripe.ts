import Stripe from "stripe";

let client: Stripe | null = null;

/** True when a Stripe secret key is configured. Pages degrade gracefully without one. */
export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** One Stripe client per process. Throws when no key is set; check stripeEnabled() first. */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { appInfo: { name: "t-drop", url: "https://t-drop.net" } });
  }
  return client;
}

/**
 * Verifies webhook signatures. Needs only STRIPE_WEBHOOK_SECRET, so it works
 * before the API key is configured (and in tests).
 */
export function verifyStripeEvent(body: string, signature: string, secret: string): Promise<Stripe.Event> {
  const s = client ?? new Stripe(process.env.STRIPE_SECRET_KEY || "sk_signature_check_only");
  return s.webhooks.constructEventAsync(body, signature, secret);
}

export const siteUrl = () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
