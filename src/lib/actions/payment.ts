"use server";

import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { ensureStripeCustomer } from "@/lib/stripe-customer";

/**
 * Creates a SetupIntent for the signed-in customer so Stripe Elements can
 * collect a new card directly on /account/payment (no Portal redirect).
 */
export async function createSetupIntent(): Promise<{ clientSecret: string } | { error: string }> {
  if (!stripeEnabled()) return { error: "payments-off" };
  const customer = await getCustomer();
  if (!customer) return { error: "not-signed-in" };

  const stripe = getStripe();
  const stripeCustomerId = await ensureStripeCustomer(await getPayloadClient(), customer);

  const intent = await stripe.setupIntents.create({ customer: stripeCustomerId, payment_method_types: ["card"] });
  if (!intent.client_secret) return { error: "stripe" };
  return { clientSecret: intent.client_secret };
}

/** Makes a newly-confirmed payment method the default for future invoices. */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<{ ok: boolean }> {
  const customer = await getCustomer();
  if (!customer?.stripeCustomerId || !stripeEnabled()) return { ok: false };
  const stripe = getStripe();
  await stripe.customers.update(customer.stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } });
  return { ok: true };
}

/** The current default card's brand/last4, for display. Null if none set or Stripe is off. */
export async function getDefaultPaymentMethod(): Promise<{ brand: string; last4: string } | null> {
  const customer = await getCustomer();
  if (!customer?.stripeCustomerId || !stripeEnabled()) return null;

  const stripe = getStripe();
  const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
  if (stripeCustomer.deleted) return null;

  const defaultPm = stripeCustomer.invoice_settings?.default_payment_method;
  const pmId = typeof defaultPm === "string" ? defaultPm : defaultPm?.id;
  if (!pmId) return null;

  const pm = await stripe.paymentMethods.retrieve(pmId);
  if (!pm.card) return null;
  return { brand: pm.card.brand, last4: pm.card.last4 };
}
