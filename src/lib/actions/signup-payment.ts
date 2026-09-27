"use server";

import type Stripe from "stripe";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { requireDraft } from "@/lib/signup";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { ensureStripeCustomer } from "@/lib/stripe-customer";

export type StartSubscriptionResult = { clientSecret: string; subscriptionId: string } | { error: string };

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/**
 * Step 3-1 — "АБОНИРАЙ СЕ" (Figma `525:1000` / `525:6736`), the first half of it.
 *
 * Creates the Stripe subscription for the draft's package as `default_incomplete` — Stripe
 * opens its first invoice and a PaymentIntent for it, and nothing is charged until the
 * browser confirms that PaymentIntent with the card the Payment Element collected. Returns
 * the PaymentIntent's client secret for that.
 *
 * Only called once the customer has pressed the button, never on page load, so an abandoned
 * payment page does not leave a subscription behind. A second press — after a declined
 * card, say — reuses the same incomplete subscription instead of opening another; Stripe
 * expires an unpaid one on its own after 23 hours.
 *
 * The draft's picks are already `category-selections` rows marked "Чака плащане"
 * (`createSignupAccount`); the paid invoice is what releases them (`releasePaidPicks`).
 */
export async function startSubscription(): Promise<StartSubscriptionResult> {
  const draft = await requireDraft("payment");
  if (!stripeEnabled()) return { error: "Плащанията още не са включени. Опитай по-късно." };

  /* The account step signs the new customer in. Only that customer may pay for this draft. */
  const customer = await getCustomer();
  const draftCustomer = typeof draft.customer === "object" && draft.customer ? draft.customer.id : draft.customer;
  if (!customer || customer.id !== draftCustomer) return { error: "Влез в профила си, за да завършиш поръчката." };

  if (await rateLimited("signup-payment", 10, 10 * 60 * 1000)) return { error: "Твърде много опити. Опитай пак след малко." };

  const payload = await getPayloadClient();
  const plan = typeof draft.plan === "object" && draft.plan ? draft.plan : null;
  if (!plan?.stripePriceId) return { error: "Този пакет още не може да се плати. Пиши ни." };

  const live = await payload.find({
    collection: "subscriptions",
    where: { and: [{ customer: { equals: customer.id } }, { status: { in: ["active", "trialing", "past_due"] } }] },
    limit: 1,
  });
  if (live.docs[0]) return { error: "Вече имаш активен абонамент." };

  const stripe = getStripe();
  const stripeCustomerId = await ensureStripeCustomer(payload, customer);
  const secretOf = (sub: Stripe.Subscription) => {
    const invoice = typeof sub.latest_invoice === "object" ? sub.latest_invoice : null;
    return invoice?.confirmation_secret?.client_secret ?? null;
  };

  try {
    const pending = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "incomplete",
      price: plan.stripePriceId,
      expand: ["data.latest_invoice.confirmation_secret"],
      limit: 10,
    });
    const reuse = pending.data.find((s) => s.metadata?.signupDraftId === String(draft.id) && secretOf(s));
    if (reuse) return { clientSecret: secretOf(reuse)!, subscriptionId: reuse.id };

    const sub = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: "default_incomplete",
      /* The card paying the first invoice becomes the one every renewal is charged to. Card
         only, as the frame's subtitle says: "Приемаме само плащане с карта." */
      payment_settings: { save_default_payment_method: "on_subscription", payment_method_types: ["card"] },
      metadata: { payloadCustomerId: String(customer.id), signupDraftId: String(draft.id) },
      expand: ["latest_invoice.confirmation_secret"],
    });
    const clientSecret = secretOf(sub);
    if (!clientSecret) {
      payload.logger.error({ subscription: sub.id, invoice: idOf(sub.latest_invoice) }, "Signup subscription has no confirmation secret");
      return { error: "Плащането не можа да започне. Опитай пак." };
    }
    return { clientSecret, subscriptionId: sub.id };
  } catch (err) {
    payload.logger.error({ err }, "Signup subscription failed");
    return { error: "Плащането не можа да започне. Опитай пак." };
  }
}
