import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";
import { resetDatabase, seedPlanAndCategory, testPayload } from "./helpers";
import { checkoutSession, event, invoice, subscription } from "./fixtures/stripe";

/* No real Stripe here: the client is replaced by a stub that answers the two
   lookups the sync makes when an event arrives before its checkout session. */
const stripeStub = {
  customers: {
    retrieve: vi.fn(async (id: string) => ({ id, object: "customer", deleted: false, email: "early@example.com", name: "Ранен Клиент", phone: null, address: null, shipping: null, metadata: {} })),
  },
  subscriptions: { retrieve: vi.fn(async () => subscription()) },
};
vi.mock("@/lib/stripe", () => ({
  getStripe: () => stripeStub,
  stripeEnabled: () => true,
  siteUrl: () => "http://localhost:3111",
  verifyStripeEvent: async () => { throw new Error("not used in unit tests"); },
}));

import { dropMonth, handleStripeEvent, isDropLocked } from "@/lib/stripe-sync";

let payload: Payload;
let categoryId: number;

beforeAll(async () => {
  payload = await testPayload();
});

beforeEach(async () => {
  await resetDatabase(payload);
  ({ category: { id: categoryId } } = await seedPlanAndCategory(payload));
  stripeStub.customers.retrieve.mockClear();
});

async function rows<T extends "customers" | "subscriptions" | "payments" | "category-selections">(collection: T) {
  return (await payload.find({ collection, limit: 100, depth: 0 })).docs;
}

describe("dropMonth and isDropLocked", () => {
  it("formats the drop month and falls back to now", () => {
    expect(dropMonth("2026-03-15T00:00:00.000Z")).toBe("2026-03");
    expect(dropMonth(null)).toMatch(/^\d{4}-\d{2}$/);
  });
  it("locks once the date has passed", () => {
    expect(isDropLocked("2000-01-01T00:00:00.000Z")).toBe(true);
    expect(isDropLocked("2999-01-01T00:00:00.000Z")).toBe(false);
    expect(isDropLocked(null)).toBe(false);
  });
});

describe("checkout.session.completed", () => {
  it("creates a verified guest customer, the subscription with its metadata, and the month's pick", async () => {
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession({ metadata: { size: "m", gender: "female", categoryId: String(categoryId), orderName: "за мен" } })));

    const [customer] = await rows("customers");
    expect(customer.email).toBe("guest@example.com");
    expect(customer.stripeCustomerId).toBe("cus_test_001");
    expect(customer.address?.city).toBe("София");
    expect(customer.phone).toBe("+359888000000");

    const [sub] = await rows("subscriptions");
    expect(sub.providerSubscriptionId).toBe("sub_test_001");
    expect(sub.status).toBe("active");
    expect(sub.size).toBe("m");
    expect(sub.gender).toBe("female");
    expect(sub.orderName).toBe("за мен");
    expect(sub.customer).toBe(customer.id);

    const [pick] = await rows("category-selections");
    expect(pick.category).toBe(categoryId);
    expect(pick.month).toBe(dropMonth(null));
  });

  it("attaches to the signed-in customer named in client_reference_id", async () => {
    const me = await payload.create({ collection: "customers", data: { name: "Аз", email: "me@example.com", password: "password-1234", _verified: true } });
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession({ client_reference_id: String(me.id), customer_details: { email: "typo@example.com", name: "x" } })));
    const customers = await rows("customers");
    expect(customers).toHaveLength(1);
    expect(customers[0].stripeCustomerId).toBe("cus_test_001");
  });

  it("never replaces an existing Stripe link when only the email matches", async () => {
    await payload.create({ collection: "customers", data: { name: "Жертва", email: "guest@example.com", password: "password-1234", _verified: true, stripeCustomerId: "cus_victim" } });
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession({ customer: "cus_attacker", subscription: subscription({ customer: "cus_attacker" }) })));
    const [victim] = await rows("customers");
    expect(victim.stripeCustomerId).toBe("cus_victim");
  });

  it("is safe to replay", async () => {
    const e = event("checkout.session.completed", checkoutSession());
    await handleStripeEvent(payload, e);
    await handleStripeEvent(payload, e);
    expect(await rows("customers")).toHaveLength(1);
    expect(await rows("subscriptions")).toHaveLength(1);
    expect(await rows("category-selections")).toHaveLength(1);
  });
});

describe("invoices", () => {
  it("records a paid invoice against the subscription and updates on replay", async () => {
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession()));
    await handleStripeEvent(payload, event("invoice.paid", invoice()));
    await handleStripeEvent(payload, event("invoice.paid", invoice({ number: "T-0001-again" })));

    const payments = await rows("payments");
    expect(payments).toHaveLength(1);
    expect(payments[0].status).toBe("paid");
    expect(payments[0].amountCents).toBe(1799);
    expect(payments[0].providerPaymentId).toBe("in_test_001");
    expect(payments[0].subscription).toBe((await rows("subscriptions"))[0].id);
  });

  it("records a failed invoice as failed with the amount due", async () => {
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession()));
    await handleStripeEvent(payload, event("invoice.payment_failed", invoice({ id: "in_test_002", status: "open", amount_paid: 0, status_transitions: { paid_at: null } })));
    const failed = (await rows("payments")).find((p) => p.providerPaymentId === "in_test_002");
    expect(failed?.status).toBe("failed");
    expect(failed?.amountCents).toBe(1799);
  });

  it("handles an invoice that arrives before the checkout session by reading the Stripe customer", async () => {
    await handleStripeEvent(payload, event("customer.subscription.created", subscription({ customer: "cus_early" })));
    await handleStripeEvent(payload, event("invoice.paid", invoice({ customer: "cus_early" })));
    expect(stripeStub.customers.retrieve).toHaveBeenCalledWith("cus_early");

    const customers = await rows("customers");
    expect(customers).toHaveLength(1);
    expect(customers[0].email).toBe("early@example.com");
    expect(customers[0].stripeCustomerId).toBe("cus_early");
    expect(await rows("subscriptions")).toHaveLength(1);
    expect(await rows("payments")).toHaveLength(1);

    // The session then lands: no second customer, metadata filled in.
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession({ customer: "cus_early", customer_details: { email: "early@example.com", name: "Ранен Клиент" }, subscription: subscription({ customer: "cus_early" }) })));
    expect(await rows("customers")).toHaveLength(1);
    expect((await rows("subscriptions"))[0].size).toBe("m");
  });
});

describe("subscription lifecycle", () => {
  it("tracks cancel-at-period-end, then cancellation", async () => {
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession()));
    await handleStripeEvent(payload, event("customer.subscription.updated", subscription({ cancel_at_period_end: true })));
    expect((await rows("subscriptions"))[0].cancelAtPeriodEnd).toBe(true);

    await handleStripeEvent(payload, event("customer.subscription.deleted", subscription({ status: "canceled", canceled_at: Math.floor(Date.now() / 1000) })));
    const [sub] = await rows("subscriptions");
    expect(sub.status).toBe("canceled");
    expect(sub.canceledAt).toBeTruthy();
  });

  it("maps incomplete_expired to canceled and past_due to past_due", async () => {
    await handleStripeEvent(payload, event("checkout.session.completed", checkoutSession()));
    await handleStripeEvent(payload, event("customer.subscription.updated", subscription({ status: "past_due" })));
    expect((await rows("subscriptions"))[0].status).toBe("past_due");
    await handleStripeEvent(payload, event("customer.subscription.updated", subscription({ status: "incomplete_expired" })));
    expect((await rows("subscriptions"))[0].status).toBe("canceled");
  });

  it("ignores event types it does not handle", async () => {
    await handleStripeEvent(payload, event("charge.succeeded", { id: "ch_1" }));
    expect(await rows("customers")).toHaveLength(0);
  });
});
