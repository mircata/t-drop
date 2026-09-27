import type { Plan } from "@/payload-types";
import { getStripe, stripeEnabled } from "./stripe";

/**
 * What a package costs, read from its Stripe price — the amount the customer is actually
 * charged. The owner's call on 2026-09-27: the site shows Stripe's price live rather than a
 * second copy kept by hand in /admin, so the two can never disagree.
 *
 * `Plans.priceCents` stays as the fallback for when Stripe is not configured or does not
 * answer, and for a plan with no price id yet. Cached per server instance for five minutes:
 * every funnel page shows a price, and a price change in the Stripe dashboard does not need
 * to be instant.
 */

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { cents: number; at: number }>();

async function stripeAmount(priceId: string): Promise<number | null> {
  const hit = cache.get(priceId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.cents;
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (price.unit_amount == null) return null;
    cache.set(priceId, { cents: price.unit_amount, at: Date.now() });
    return price.unit_amount;
  } catch {
    /* A stale amount is better than none, and none is better than a crashed page. */
    return hit?.cents ?? null;
  }
}

/** The plan's monthly price in cents. */
export async function planPriceCents(plan: Pick<Plan, "priceCents" | "stripePriceId">): Promise<number> {
  if (plan.stripePriceId && stripeEnabled()) {
    const cents = await stripeAmount(plan.stripePriceId);
    if (cents != null) return cents;
  }
  return plan.priceCents;
}
