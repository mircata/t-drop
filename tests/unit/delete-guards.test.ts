import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { resetDatabase, seedPlanAndCategory, testPayload } from "./helpers";

/*
 * Deleting a customer, plan, or category with related subscriptions/payments/
 * category-selections must be refused with a friendly message, not the raw
 * Postgres NOT NULL error the mismatched required/ON DELETE SET NULL config
 * would otherwise throw (see src/lib/delete-guards.ts).
 */

let payload: Payload;

beforeAll(async () => {
  payload = await testPayload();
});

beforeEach(async () => {
  await resetDatabase(payload);
});

describe("customers", () => {
  it("refuses to delete a customer with a subscription, payment, or pick", async () => {
    const { plan, category } = await seedPlanAndCategory(payload);
    const alice = await payload.create({ collection: "customers", data: { name: "Alice", email: "alice@example.com", password: "password-1234" } });
    await payload.create({ collection: "subscriptions", data: { customer: alice.id, plan: plan.id, status: "active", provider: "stripe", providerSubscriptionId: "sub_alice" } });
    await expect(payload.delete({ collection: "customers", id: alice.id })).rejects.toThrow(/свързан/);
    await expect(payload.findByID({ collection: "customers", id: alice.id })).resolves.toBeTruthy();

    const bob = await payload.create({ collection: "customers", data: { name: "Bob", email: "bob@example.com", password: "password-1234" } });
    await payload.create({ collection: "payments", data: { customer: bob.id, provider: "stripe", providerPaymentId: "in_bob", amountCents: 1799, currency: "eur", status: "paid" } });
    await expect(payload.delete({ collection: "customers", id: bob.id })).rejects.toThrow(/свързан/);

    const carol = await payload.create({ collection: "customers", data: { name: "Carol", email: "carol@example.com", password: "password-1234" } });
    await payload.create({ collection: "category-selections", data: { customer: carol.id, month: "2026-03", category: category.id } });
    await expect(payload.delete({ collection: "customers", id: carol.id })).rejects.toThrow(/свързан/);
  });

  it("deletes a customer with no history", async () => {
    const dave = await payload.create({ collection: "customers", data: { name: "Dave", email: "dave@example.com", password: "password-1234" } });
    await expect(payload.delete({ collection: "customers", id: dave.id })).resolves.toBeTruthy();
    await expect(payload.findByID({ collection: "customers", id: dave.id })).rejects.toThrow();
  });
});

describe("plans", () => {
  it("refuses to delete a plan with a subscription, but allows an unused one", async () => {
    const { plan } = await seedPlanAndCategory(payload);
    const alice = await payload.create({ collection: "customers", data: { name: "Alice", email: "alice@example.com", password: "password-1234" } });
    await payload.create({ collection: "subscriptions", data: { customer: alice.id, plan: plan.id, status: "active", provider: "stripe", providerSubscriptionId: "sub_alice" } });
    await expect(payload.delete({ collection: "plans", id: plan.id })).rejects.toThrow(/свързан/);

    const unused = await payload.create({ collection: "plans", data: { name: "Unused", priceCents: 999, currency: "eur" } });
    await expect(payload.delete({ collection: "plans", id: unused.id })).resolves.toBeTruthy();
  });
});

describe("categories", () => {
  it("refuses to delete a category with a pick, but allows an unused one", async () => {
    const { category } = await seedPlanAndCategory(payload);
    const alice = await payload.create({ collection: "customers", data: { name: "Alice", email: "alice@example.com", password: "password-1234" } });
    await payload.create({ collection: "category-selections", data: { customer: alice.id, month: "2026-03", category: category.id } });
    await expect(payload.delete({ collection: "categories", id: category.id })).rejects.toThrow(/свързан/);

    const unused = await payload.create({ collection: "categories", data: { name: "Unused" } });
    await expect(payload.delete({ collection: "categories", id: unused.id })).resolves.toBeTruthy();
  });
});
