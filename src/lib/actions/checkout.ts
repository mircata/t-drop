"use server";

import { redirect } from "next/navigation";
import { getCustomer, setAuthCookie } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);
const CARRIERS = new Set(["speedy", "sameday", "boxnow"]);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/**
 * The "Поръчай" button on /join/delivery (the second step, after the gender/size/design
 * picker on /join). For a signed-out visitor this also creates their account and logs
 * them in, right here, before Stripe — email/password/password2 fields, same rules as
 * /your-profile/register — instead of relying on the webhook's guest-checkout fallback (resolveCustomer
 * in stripe-sync.ts), which emails a "choose your password" link that only works if
 * RESEND_API_KEY is configured. Builds a Stripe Checkout Session in subscription mode and
 * sends the visitor to Stripe, with the new account's email attached to the Stripe Customer
 * so Checkout shows it pre-filled. Errors go back to /join/delivery, with the picks
 * preserved in the query string, or to /join itself if the picks were missing entirely (a
 * tampered URL, since the normal flow never lets you reach /join/delivery without them).
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
  const city = String(formData.get("city") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const carrier = String(formData.get("carrier") ?? "");
  const addressOrOffice = String(formData.get("addressOrOffice") ?? "").trim();
  if (!recipientName || !phone || !city || !postcode || !CARRIERS.has(carrier) || !addressOrOffice) {
    redirect(`/join/delivery?${deliveryParams}&error=delivery-fields`);
  }

  if (!stripeEnabled()) redirect(`/join/delivery?${deliveryParams}&error=payments-off`);
  if (await rateLimited("checkout", 10, 10 * 60 * 1000)) redirect(`/join/delivery?${deliveryParams}&error=rate-limit`);

  const payload = await getPayloadClient();
  let customer = await getCustomer();

  if (!customer) {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const password2 = String(formData.get("password2") ?? "");
    if (!isEmail(email)) redirect(`/join/delivery?${deliveryParams}&error=email-invalid`);
    if (password.length < 8) redirect(`/join/delivery?${deliveryParams}&error=password-short`);
    if (password !== password2) redirect(`/join/delivery?${deliveryParams}&error=password-mismatch`);

    const existing = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1 });
    if (existing.totalDocs > 0) redirect(`/join/delivery?${deliveryParams}&error=email-taken`);

    customer = await payload.create({ collection: "customers", data: { name: recipientName, email, password } });
    const { token } = await payload.login({ collection: "customers", data: { email, password } });
    if (token) await setAuthCookie(token, false);
  }

  const [plans, category] = await Promise.all([
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
  ]);
  const plan = plans.docs[0];
  if (!plan?.stripePriceId) redirect(`/join/delivery?${deliveryParams}&error=payments-off`);
  if (!category?.active) redirect("/join?error=fields");

  const stripe = getStripe();
  let stripeCustomerId = customer.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
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
    payloadCustomerId: String(customer.id),
    recipientName,
    phone,
    city,
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
      client_reference_id: String(customer.id),
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
