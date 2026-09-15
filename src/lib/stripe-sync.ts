import { randomBytes } from "crypto";
import type Stripe from "stripe";
import type { Payload } from "payload";
import type { Customer, Subscription } from "@/payload-types";
import { getStripe, siteUrl } from "./stripe";

/*
 * Turns Stripe objects into rows in our collections. Used by the webhook and
 * by the payment confirmation page. Every function is safe to call twice.
 */

type SubStatus = Subscription["status"];

const STATUS: Record<string, SubStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "unpaid",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  paused: "paused",
  canceled: "canceled",
};

const id = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);
const iso = (secs: number | null | undefined) => (secs ? new Date(secs * 1000).toISOString() : null);

const DEFAULT_DELIVERY_DAY = 21;

/*
 * The production cycle is 4 weeks, counted back from the delivery date:
 *   week 1 (days 21-27 out): choosing is open, for the upcoming delivery.
 *   weeks 2-3 (days 7-20 out): locked, production is running.
 *   week 4 (days 0-6 out, delivery day included): delivery happens and the
 *     next drop is announced — choosing reopens, but for the delivery AFTER
 *     the one arriving this week, since that one is already final.
 */
/** Design picks lock this many days before delivery — the start of weeks 2-3. */
export const PICK_LOCK_LEAD_DAYS = 21;
/** Picks reopen this many days before delivery — the start of week 4. */
export const PICK_REOPEN_LEAD_DAYS = 6;

/** The next occurrence of the site's delivery day (this month if it has not passed yet, else next month). */
export function nextDeliveryDate(deliveryDay?: number | null, from: Date = new Date()): Date {
  const day = deliveryDay && deliveryDay >= 1 && deliveryDay <= 28 ? deliveryDay : DEFAULT_DELIVERY_DAY;
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  return from.getUTCDate() <= day ? new Date(Date.UTC(year, month, day)) : new Date(Date.UTC(year, month + 1, day));
}

/** True during weeks 2-3: locked from 3 weeks before delivery until a week before it. Open in week 1 and week 4 (delivery week). */
export function isDropLocked(deliveryDay?: number | null, from: Date = new Date()): boolean {
  const daysUntil = (nextDeliveryDate(deliveryDay, from).getTime() - from.getTime()) / 86400000;
  return daysUntil > PICK_REOPEN_LEAD_DAYS && daysUntil <= PICK_LOCK_LEAD_DAYS;
}

/** The delivery a pick made right now is for: the next one, except in week 4 (its own delivery week) when it is already final and a pick is for the delivery after it. */
function pickTargetDate(deliveryDay: number | null | undefined, from: Date): Date {
  const next = nextDeliveryDate(deliveryDay, from);
  const daysUntil = (next.getTime() - from.getTime()) / 86400000;
  return daysUntil > PICK_REOPEN_LEAD_DAYS ? next : nextDeliveryDate(deliveryDay, new Date(next.getTime() + 86400000));
}

/** "YYYY-MM" for the drop a customer is currently choosing for (see pickTargetDate). */
export function dropMonth(deliveryDay?: number | null, from: Date = new Date()): string {
  const d = pickTargetDate(deliveryDay, from);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function findCustomerByStripeId(payload: Payload, stripeCustomerId: string) {
  const r = await payload.find({ collection: "customers", where: { stripeCustomerId: { equals: stripeCustomerId } }, limit: 1 });
  return r.docs[0] ?? null;
}

type Identity = {
  stripeCustomerId: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: Customer["address"];
  shipping?: Customer["shipping"];
  payloadCustomerId?: string | null;
};

/**
 * Find the customer for a Stripe identity, or create one. Order of lookups:
 * our id from client_reference_id / metadata, the Stripe customer id, then
 * the email. A guest gets a verified account with a random password and a
 * "choose your password" email. An existing Stripe link is never replaced.
 */
async function resolveCustomer(payload: Payload, who: Identity): Promise<Customer> {
  const email = who.email?.toLowerCase();
  let customer: Customer | null = null;

  if (who.payloadCustomerId) {
    try {
      customer = await payload.findByID({ collection: "customers", id: Number(who.payloadCustomerId) });
    } catch {
      customer = null;
    }
  }
  if (!customer && who.stripeCustomerId) customer = await findCustomerByStripeId(payload, who.stripeCustomerId);
  if (!customer && email) {
    const r = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1 });
    customer = r.docs[0] ?? null;
  }

  if (!customer) {
    if (!email) throw new Error(`Stripe customer ${who.stripeCustomerId} has no email`);
    try {
      customer = await payload.create({
        collection: "customers",
        disableVerificationEmail: true,
        data: {
          name: who.name || email,
          email,
          password: randomBytes(24).toString("base64url"),
          stripeCustomerId: who.stripeCustomerId ?? undefined,
          address: who.address ?? undefined,
          phone: who.phone ?? undefined,
          shipping: who.shipping ?? undefined,
        },
      });
      await sendWelcomeEmail(payload, customer);
      return customer;
    } catch (err) {
      // Two events for a new buyer often land in the same second (subscription.created and
      // invoice.paid). The loser of that race finds the row the winner just made.
      const r = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1 });
      if (!r.docs[0]) throw err;
      customer = r.docs[0];
    }
  }

  const patch: Partial<Customer> = {};
  if (who.stripeCustomerId && !customer.stripeCustomerId) patch.stripeCustomerId = who.stripeCustomerId;
  if (who.address?.line1 && !customer.address?.line1) patch.address = who.address;
  if (who.phone && !customer.phone) patch.phone = who.phone;
  if (who.shipping?.recipientName && !customer.shipping?.recipientName) patch.shipping = who.shipping;
  if (Object.keys(patch).length > 0) {
    customer = await payload.update({ collection: "customers", id: customer.id, data: patch });
  }
  return customer;
}

/** The customer behind a Stripe customer id, created from the Stripe record when we have never seen it. */
async function customerFromStripeId(payload: Payload, stripeCustomerId: string): Promise<Customer> {
  const known = await findCustomerByStripeId(payload, stripeCustomerId);
  if (known) return known;
  const sc = await getStripe().customers.retrieve(stripeCustomerId);
  if (sc.deleted) throw new Error(`Stripe customer ${stripeCustomerId} is deleted`);
  const a = sc.shipping?.address ?? sc.address;
  return resolveCustomer(payload, {
    stripeCustomerId,
    email: sc.email,
    name: sc.name || sc.shipping?.name,
    phone: sc.phone,
    address: a ? { line1: a.line1 ?? "", line2: a.line2 ?? "", city: a.city ?? "", postcode: a.postal_code ?? "", country: a.country ?? "BG" } : undefined,
    payloadCustomerId: sc.metadata?.payloadCustomerId,
  });
}

/** The customer a Checkout Session belongs to. */
export async function customerFromSession(payload: Payload, session: Stripe.Checkout.Session): Promise<Customer> {
  const shippingAddress = session.collected_information?.shipping_details?.address;
  const m = session.metadata ?? {};
  return resolveCustomer(payload, {
    stripeCustomerId: id(session.customer),
    email: session.customer_details?.email,
    name: session.customer_details?.name,
    // Checkout no longer collects phone/address itself — /join/delivery does, ahead of
    // checkout, so this comes from the session metadata startCheckout put there.
    phone: session.customer_details?.phone || m.phone,
    address: shippingAddress
      ? { line1: shippingAddress.line1 ?? "", line2: shippingAddress.line2 ?? "", city: shippingAddress.city ?? "", postcode: shippingAddress.postal_code ?? "", country: shippingAddress.country ?? "BG" }
      : undefined,
    shipping: m.recipientName
      ? { recipientName: m.recipientName, postcode: m.postcode, carrier: m.carrier as "speedy" | "sameday" | "boxnow" | undefined, addressOrOffice: m.addressOrOffice }
      : undefined,
    payloadCustomerId: session.client_reference_id || session.metadata?.payloadCustomerId,
  });
}

async function sendWelcomeEmail(payload: Payload, customer: Customer) {
  const token = await payload.forgotPassword({ collection: "customers", data: { email: customer.email }, disableEmail: true });
  const link = `${siteUrl()}/your-profile/reset-password?token=${token}`;
  await payload.sendEmail({
    to: customer.email,
    subject: "Добре дошъл в T-Drop: избери парола",
    html: `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;color:#212121;background:#fffef9;padding:32px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
<h1 style="font-size:22px;margin:0 0 16px">Абонаментът ти е активен</h1>
<p style="font-size:16px;line-height:1.6">Направихме ти профил с този имейл. Избери парола, за да сменяш темата всеки месец и да управляваш абонамента си.</p>
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#cc0e45;color:#fffef9;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:bold">Избери парола</a></p>
<p style="font-size:13px;color:#666">Линкът е валиден един час. Ако изтече, поискай нов от „Изгубена парола“.<br>${link}</p>
<p style="font-size:13px;color:#666;margin-top:32px">T-Drop Monthly T-Shirts</p>
</div></body></html>`,
  });
}

async function planForPrice(payload: Payload, priceId: string | null) {
  if (priceId) {
    const r = await payload.find({ collection: "plans", where: { stripePriceId: { equals: priceId } }, limit: 1 });
    if (r.docs[0]) return r.docs[0];
  }
  const any = await payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 });
  if (!any.docs[0]) throw new Error("No plan configured");
  return any.docs[0];
}

/** Create or update our row for a Stripe subscription. */
export async function upsertSubscription(
  payload: Payload,
  sub: Stripe.Subscription,
  customerId?: number,
  extra: Partial<Pick<Subscription, "size" | "gender" | "orderName">> = {},
) {
  const item = sub.items.data[0];
  const plan = await planForPrice(payload, item?.price?.id ?? null);
  const stripeCustomerId = id(sub.customer);

  let customer = customerId ?? null;
  if (!customer) {
    const existing = await payload.find({ collection: "subscriptions", where: { providerSubscriptionId: { equals: sub.id } }, limit: 1 });
    const row = existing.docs[0];
    customer = row ? (typeof row.customer === "number" ? row.customer : row.customer.id) : null;
  }
  if (!customer && stripeCustomerId) customer = (await customerFromStripeId(payload, stripeCustomerId)).id;
  if (!customer) throw new Error(`No customer for Stripe subscription ${sub.id}`);

  const m = sub.metadata ?? {};
  const fromMeta = {
    size: (m.size as Subscription["size"]) || undefined,
    gender: (m.gender as Subscription["gender"]) || undefined,
    orderName: m.orderName || undefined,
  };

  const data = {
    customer,
    plan: plan.id,
    status: STATUS[sub.status] ?? "incomplete",
    provider: "stripe" as const,
    providerSubscriptionId: sub.id,
    providerCustomerId: stripeCustomerId ?? undefined,
    currentPeriodEnd: iso(item?.current_period_end),
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    canceledAt: iso(sub.canceled_at),
    startedAt: iso(sub.start_date),
    ...fromMeta,
    ...extra,
  };

  const existing = await payload.find({ collection: "subscriptions", where: { providerSubscriptionId: { equals: sub.id } }, limit: 1 });
  if (existing.docs[0]) {
    return payload.update({ collection: "subscriptions", id: existing.docs[0].id, data });
  }
  const row = await payload.create({ collection: "subscriptions", data });
  // Invoices that arrived before this row know the Stripe id but have no link yet.
  await payload.update({
    collection: "payments",
    where: { and: [{ providerSubscriptionId: { equals: sub.id } }, { subscription: { exists: false } }] },
    data: { subscription: row.id },
  });
  return row;
}

/** Create or update our payment row for a Stripe invoice. */
export async function upsertPayment(payload: Payload, invoice: Stripe.Invoice, opts: { failed?: boolean } = {}) {
  const subId = id(invoice.parent?.subscription_details?.subscription);
  const stripeCustomerId = id(invoice.customer);

  let subscription: Subscription | null = null;
  if (subId) {
    const r = await payload.find({ collection: "subscriptions", where: { providerSubscriptionId: { equals: subId } }, limit: 1 });
    subscription = r.docs[0] ?? null;
  }
  let customerId: number | null = subscription ? (typeof subscription.customer === "number" ? subscription.customer : subscription.customer.id) : null;
  if (!customerId && stripeCustomerId) customerId = (await customerFromStripeId(payload, stripeCustomerId)).id;
  if (!customerId) throw new Error(`No customer for invoice ${invoice.id}`);

  const paid = invoice.status === "paid";
  // A payment_failed event says the attempt failed even though Stripe keeps the invoice "open" for retries.
  const status = paid ? "paid" : opts.failed ? "failed" : invoice.status === "open" || invoice.status === "draft" ? "pending" : "failed";
  const data = {
    customer: customerId,
    subscription: subscription?.id ?? null,
    providerSubscriptionId: subId ?? undefined,
    provider: "stripe" as const,
    providerPaymentId: invoice.id!,
    amountCents: paid ? invoice.amount_paid : invoice.amount_due,
    currency: invoice.currency,
    status: status as "paid" | "pending" | "failed",
    paidAt: iso(invoice.status_transitions?.paid_at),
    raw: {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      hosted_invoice_url: invoice.hosted_invoice_url,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      attempt_count: invoice.attempt_count,
    },
  };

  const existing = await payload.find({ collection: "payments", where: { providerPaymentId: { equals: invoice.id } }, limit: 1 });
  if (existing.docs[0]) return payload.update({ collection: "payments", id: existing.docs[0].id, data });
  return payload.create({ collection: "payments", data });
}

/**
 * Mark the payment behind a refunded charge as refunded. This API version has no direct
 * charge -> invoice link; go through invoicePayments via the charge's payment_intent.
 * No-op if the charge is not attached to an invoice we recorded (e.g. a one-off charge).
 */
export async function markPaymentRefunded(payload: Payload, charge: Stripe.Charge) {
  const paymentIntentId = id(charge.payment_intent);
  if (!paymentIntentId) return;
  const invoicePayments = await getStripe().invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    limit: 1,
  });
  const invoiceId = id(invoicePayments.data[0]?.invoice);
  if (!invoiceId) return;

  const existing = await payload.find({ collection: "payments", where: { providerPaymentId: { equals: invoiceId } }, limit: 1 });
  const row = existing.docs[0];
  if (!row) return;
  await payload.update({ collection: "payments", id: row.id, data: { status: "refunded" } });
}

/** Record the theme a new subscriber picked at checkout for the coming drop. Does not overwrite a pick made later. */
export async function recordCheckoutPick(payload: Payload, customerId: number, categoryId: number | null, month: string) {
  if (!categoryId) return;
  const existing = await payload.find({
    collection: "category-selections",
    where: { and: [{ customer: { equals: customerId } }, { month: { equals: month } }] },
    limit: 1,
  });
  if (existing.docs[0]) return;
  await payload.create({ collection: "category-selections", data: { customer: customerId, month, category: categoryId } });
}

/** Everything that should happen after a paid checkout. Idempotent. */
export async function syncCheckoutSession(payload: Payload, session: Stripe.Checkout.Session) {
  const customer = await customerFromSession(payload, session);
  const subId = id(session.subscription);
  if (!subId) return customer;

  const sub = typeof session.subscription === "object" && session.subscription ? session.subscription : await getStripe().subscriptions.retrieve(subId);
  const m = session.metadata ?? {};
  await upsertSubscription(payload, sub, customer.id, {
    size: (m.size as Subscription["size"]) || undefined,
    gender: (m.gender as Subscription["gender"]) || undefined,
    orderName: m.orderName || undefined,
  });

  const site = await payload.findGlobal({ slug: "site", depth: 0 });
  await recordCheckoutPick(payload, customer.id, m.categoryId ? Number(m.categoryId) : null, dropMonth(site.deliveryDay));
  return customer;
}

/** Dispatch one verified Stripe event. */
export async function handleStripeEvent(payload: Payload, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription") await syncCheckoutSession(payload, session);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertSubscription(payload, event.data.object);
      return;
    case "invoice.paid":
    case "invoice.payment_succeeded":
      await upsertPayment(payload, event.data.object);
      return;
    case "invoice.payment_failed":
      await upsertPayment(payload, event.data.object, { failed: true });
      return;
    case "charge.refunded":
      await markPaymentRefunded(payload, event.data.object);
      return;
    default:
      return;
  }
}
