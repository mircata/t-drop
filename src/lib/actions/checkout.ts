"use server";

import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);

/**
 * The "Поръчай" button on /join. Builds a Stripe Checkout Session in
 * subscription mode and sends the visitor to Stripe. Errors go back to /join
 * with a code in the query string.
 */
export async function startCheckout(formData: FormData) {
  const size = String(formData.get("size") ?? "");
  const gender = String(formData.get("gender") ?? "");
  const categoryId = Number(formData.get("theme") ?? 0);
  const orderName = String(formData.get("order-name") ?? "").trim().slice(0, 120);

  if (!SIZES.has(size) || !GENDERS.has(gender) || !categoryId) redirect("/join?error=fields");
  if (!stripeEnabled()) redirect("/join?error=payments-off");

  const payload = await getPayloadClient();
  const [plans, category, customer] = await Promise.all([
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
    getCustomer(),
  ]);
  const plan = plans.docs[0];
  if (!plan?.stripePriceId) redirect("/join?error=payments-off");
  if (!category?.active) redirect("/join?error=fields");

  const stripe = getStripe();
  let stripeCustomerId = customer?.stripeCustomerId ?? undefined;
  if (customer && !stripeCustomerId) {
    const created = await stripe.customers.create({
      email: customer.email,
      name: customer.name,
      metadata: { payloadCustomerId: String(customer.id) },
    });
    stripeCustomerId = created.id;
    await payload.update({ collection: "customers", id: customer.id, data: { stripeCustomerId } });
  }

  const metadata = { size, gender, categoryId: String(categoryId), orderName, payloadCustomerId: customer ? String(customer.id) : "" };
  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${siteUrl()}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/payment-failed`,
      locale: "bg",
      customer: stripeCustomerId,
      client_reference_id: customer ? String(customer.id) : undefined,
      shipping_address_collection: { allowed_countries: ["BG"] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata,
      subscription_data: { metadata },
    });
    url = session.url;
  } catch (err) {
    payload.logger.error({ err }, "Stripe checkout session failed");
  }
  if (!url) redirect("/join?error=stripe");
  redirect(url);
}
