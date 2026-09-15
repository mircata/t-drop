import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";
import type Stripe from "stripe";
import { resetDatabase, testPayload } from "./helpers";
import lifecycle from "./fixtures/sandbox/lifecycle-events.json";

/*
 * Real events recorded from the Stripe sandbox on 2026-09-13 with test clocks:
 * a first invoice, a renewal a month later, a card that fails, and a cancel.
 * Customers are not in the payload, so the stub answers with one email per id.
 */
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    customers: { retrieve: async (id: string) => ({ id, object: "customer", deleted: false, email: `${id.toLowerCase()}@example.com`, name: id, metadata: {} }) },
    subscriptions: { retrieve: async () => { throw new Error("not expected"); } },
  }),
  stripeEnabled: () => true,
  siteUrl: () => "http://localhost:3111",
  verifyStripeEvent: async () => { throw new Error("not used"); },
}));

import { handleStripeEvent } from "@/lib/stripe-sync";

const events = lifecycle as unknown as Stripe.Event[];
let payload: Payload;

beforeAll(async () => {
  payload = await testPayload();
});

beforeEach(async () => {
  await resetDatabase(payload);
  await payload.create({ collection: "plans", data: { name: "Месечен абонамент", priceCents: 1799, currency: "eur", stripePriceId: "price_1UEyODCxAYTvDqO27crKlqa2", active: true } });
});

describe("recorded sandbox lifecycle", () => {
  it("replays every event in order without errors and ends in the right states", async () => {
    for (const e of events) await handleStripeEvent(payload, e);

    const subs = (await payload.find({ collection: "subscriptions", limit: 20, depth: 0 })).docs;
    const byId = Object.fromEntries(subs.map((s) => [s.providerSubscriptionId, s]));
    // Renewal customer: two paid invoices, then cancelled.
    const renew = byId["sub_1UF5q1CxAYTvDqO2Zhi2BuJK"];
    expect(renew.status).toBe("canceled");
    expect(renew.canceledAt).toBeTruthy();
    const renewPays = (await payload.find({ collection: "payments", where: { subscription: { equals: renew.id } }, depth: 0 })).docs;
    expect(renewPays.map((p) => p.status).sort()).toEqual(["paid", "paid"]);
    expect(renewPays.every((p) => p.amountCents === 1799)).toBe(true);
    // Declined card: subscription expired, one failed payment.
    const decline = byId["sub_1UF5qSCxAYTvDqO2gAtfcCVN"];
    expect(decline.status).toBe("canceled");
    const declinePays = (await payload.find({ collection: "payments", where: { subscription: { equals: decline.id } }, depth: 0 })).docs;
    expect(declinePays.map((p) => p.status)).toEqual(["failed"]);
    // One customer per Stripe customer.
    const customers = (await payload.find({ collection: "customers", limit: 20 })).docs;
    expect(new Set(customers.map((c) => c.stripeCustomerId)).size).toBe(customers.length);
  });

  it("survives subscription.created and invoice.paid arriving at the same moment", async () => {
    const created = events.find((e) => e.type === "customer.subscription.created" && (e.data.object as Stripe.Subscription).status === "active")!;
    const paid = events.find((e) => e.type === "invoice.paid")!;
    const results = await Promise.allSettled([handleStripeEvent(payload, created), handleStripeEvent(payload, paid)]);
    expect(results.map((r) => r.status)).toEqual(["fulfilled", "fulfilled"]);
    expect((await payload.find({ collection: "customers" })).totalDocs).toBe(1);
    expect((await payload.find({ collection: "subscriptions" })).totalDocs).toBe(1);
    expect((await payload.find({ collection: "payments" })).totalDocs).toBe(1);
  });
});
