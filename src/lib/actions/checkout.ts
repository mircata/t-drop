"use server";

import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);
const CARRIERS = new Set(["speedy", "sameday", "boxnow"]);

/**
 * The "Поръчай" button on /join/delivery (the second step, after the gender/size/design
 * picker on /join). Builds a Stripe Checkout Session in subscription mode and sends the
 * visitor to Stripe. Errors go back to /join/delivery, with the picks preserved in the
 * query string, or to /join itself if the picks were missing entirely (a tampered URL,
 * since the normal flow never lets you reach /join/delivery without them).
 */
export async function startCheckout(formData: FormData) {
  const size = String(formData.get("size") ?? "");
  const gender = String(formData.get("gender") ?? "");
  const categoryId = Number(formData.get("theme") ?? 0);
  const orderName = String(formData.get("order-name") ?? "").trim().slice(0, 120);
  if (!SIZES.has(size) || !GENDERS.has(gender) || !categoryId) redirect("/join?error=fields");

  const deliveryParams = `gender=${gender}&size=${size}&theme=${categoryId}`;
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const carrier = String(formData.get("carrier") ?? "");
  const addressOrOffice = String(formData.get("addressOrOffice") ?? "").trim();
  if (!recipientName || !phone || !postcode || !CARRIERS.has(carrier) || !addressOrOffice) {
    redirect(`/join/delivery?${deliveryParams}&error=delivery-fields`);
  }

  if (!stripeEnabled()) redirect(`/join/delivery?${deliveryParams}&error=payments-off`);
  if (await rateLimited("checkout", 10, 10 * 60 * 1000)) redirect(`/join/delivery?${deliveryParams}&error=rate-limit`);

  const payload = await getPayloadClient();
  const [plans, category, customer] = await Promise.all([
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
    getCustomer(),
  ]);
  const plan = plans.docs[0];
  if (!plan?.stripePriceId) redirect(`/join/delivery?${deliveryParams}&error=payments-off`);
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

  const metadata = {
    size,
    gender,
    categoryId: String(categoryId),
    orderName,
    payloadCustomerId: customer ? String(customer.id) : "",
    recipientName,
    phone,
    postcode,
    carrier,
    addressOrOffice,
  };
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
      allow_promotion_codes: true,
      metadata,
      subscription_data: { metadata },
    });
    url = session.url;
  } catch (err) {
    payload.logger.error({ err }, "Stripe checkout session failed");
  }
  if (!url) redirect(`/join/delivery?${deliveryParams}&error=stripe`);
  redirect(url);
}
