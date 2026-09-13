import type Stripe from "stripe";

/* Hand-built Stripe objects in the shape of API version 2026-08-26. Only the
   fields our sync reads are present; the casts keep TypeScript quiet. */

const now = Math.floor(Date.now() / 1000);
const MONTH = 30 * 86400;

export function subscription(over: Partial<Record<string, unknown>> = {}): Stripe.Subscription {
  return {
    id: "sub_test_001",
    object: "subscription",
    customer: "cus_test_001",
    status: "active",
    cancel_at_period_end: false,
    canceled_at: null,
    start_date: now,
    items: { object: "list", data: [{ id: "si_1", object: "subscription_item", price: { id: "price_test_001", object: "price" }, current_period_end: now + MONTH }] },
    metadata: { size: "m", gender: "female", categoryId: "1", orderName: "за мен" },
    ...over,
  } as unknown as Stripe.Subscription;
}

export function checkoutSession(over: Partial<Record<string, unknown>> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_001",
    object: "checkout.session",
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
    customer: "cus_test_001",
    client_reference_id: null,
    subscription: subscription(),
    invoice: "in_test_001",
    customer_details: { email: "guest@example.com", name: "Гост Клиент", phone: "+359888000000" },
    collected_information: { shipping_details: { name: "Гост Клиент", address: { line1: "ул. Тест 1", line2: null, city: "София", postal_code: "1000", country: "BG" } } },
    metadata: { size: "m", gender: "female", categoryId: "1", orderName: "за мен", payloadCustomerId: "" },
    ...over,
  } as unknown as Stripe.Checkout.Session;
}

export function invoice(over: Partial<Record<string, unknown>> = {}): Stripe.Invoice {
  return {
    id: "in_test_001",
    object: "invoice",
    customer: "cus_test_001",
    status: "paid",
    amount_due: 1799,
    amount_paid: 1799,
    currency: "eur",
    number: "T-0001",
    hosted_invoice_url: "https://invoice.stripe.com/i/test",
    period_start: now,
    period_end: now + MONTH,
    attempt_count: 1,
    status_transitions: { paid_at: now },
    parent: { type: "subscription_details", subscription_details: { subscription: "sub_test_001" } },
    ...over,
  } as unknown as Stripe.Invoice;
}

export function event(type: string, object: unknown, id = `evt_${type}_${Math.random().toString(36).slice(2, 8)}`): Stripe.Event {
  return { id, object: "event", type, api_version: "2026-08-26.dahlia", created: now, livemode: false, data: { object } } as unknown as Stripe.Event;
}
