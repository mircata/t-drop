import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import type { Customer } from "@/payload-types";
import { resetDatabase, seedPlanAndCategory, testPayload } from "./helpers";

/*
 * Access rules, exercised through the Local API with overrideAccess off so the
 * collection rules apply exactly as they do for the REST API. Every write to
 * admin data must fail for an anonymous caller and for a site customer.
 */

let payload: Payload;
let alice: Customer;
let bob: Customer;
const asUser = (u?: Customer) => ({ overrideAccess: false as const, user: u ? { ...u, collection: "customers" as const } : undefined });

beforeAll(async () => {
  payload = await testPayload();
});

beforeEach(async () => {
  await resetDatabase(payload);
  const { plan } = await seedPlanAndCategory(payload);
  alice = await payload.create({ collection: "customers", data: { name: "Alice", email: "alice@example.com", password: "password-1234", stripeCustomerId: "cus_alice" } });
  bob = await payload.create({ collection: "customers", data: { name: "Bob", email: "bob@example.com", password: "password-1234" } });
  await payload.create({ collection: "subscriptions", data: { customer: alice.id, plan: plan.id, status: "active", provider: "stripe", providerSubscriptionId: "sub_alice" } });
  await payload.create({ collection: "subscriptions", data: { customer: bob.id, plan: plan.id, status: "active", provider: "stripe", providerSubscriptionId: "sub_bob" } });
  await payload.create({ collection: "payments", data: { customer: alice.id, provider: "stripe", providerPaymentId: "in_alice", amountCents: 1799, currency: "eur", status: "paid" } });
  await payload.create({ collection: "pages", data: { title: "Home", slug: "home", layout: [] } });
  await payload.create({ collection: "users", data: { email: "admin@example.com", password: "admin-pass-1234" } });
});

describe("media", () => {
  it("anyone reads, only an admin writes", async () => {
    await expect(payload.create({ collection: "media", data: { alt: "x" }, ...asUser() })).rejects.toThrow();
    await expect(payload.create({ collection: "media", data: { alt: "x" }, ...asUser(alice) })).rejects.toThrow();
  });
});

describe("category-selections", () => {
  it("a customer sees only their own pick; another customer and anonymous see nothing", async () => {
    const { category } = await seedPlanAndCategory(payload);
    const pick = await payload.create({ collection: "category-selections", data: { customer: alice.id, month: "2026-03", category: category.id } });

    const mine = await payload.find({ collection: "category-selections", ...asUser(alice) });
    expect(mine.docs.map((d) => d.id)).toEqual([pick.id]);
    await expect(payload.find({ collection: "category-selections", ...asUser(bob) })).resolves.toMatchObject({ totalDocs: 0 });
    await expect(payload.find({ collection: "category-selections", ...asUser() })).rejects.toThrow();
  });

  it("a customer cannot write their own pick directly", async () => {
    const { category } = await seedPlanAndCategory(payload);
    await expect(
      payload.create({ collection: "category-selections", data: { customer: alice.id, month: "2026-03", category: category.id }, ...asUser(alice) }),
    ).rejects.toThrow();
  });
});

describe("anonymous", () => {
  it("reads public content only", async () => {
    await expect(payload.find({ collection: "pages", ...asUser() })).resolves.toMatchObject({ totalDocs: 1 });
    await expect(payload.find({ collection: "plans", ...asUser() })).resolves.toMatchObject({ totalDocs: 1 });
    await expect(payload.find({ collection: "categories", ...asUser() })).resolves.toMatchObject({ totalDocs: 1 });
    await expect(payload.findGlobal({ slug: "site", ...asUser() })).resolves.toBeTruthy();
    for (const collection of ["customers", "users", "subscriptions", "payments", "category-selections", "subscribers", "webhook-events"] as const) {
      await expect(payload.find({ collection, ...asUser() }), collection).rejects.toThrow();
    }
  });

  it("cannot create customers, admins or subscribers", async () => {
    await expect(payload.create({ collection: "customers", data: { name: "x", email: "x@example.com", password: "password-1234" }, ...asUser() })).rejects.toThrow();
    await expect(payload.create({ collection: "users", data: { email: "y@example.com", password: "password-1234" }, ...asUser() })).rejects.toThrow();
    await expect(payload.create({ collection: "subscribers", data: { email: "z@example.com", token: "t", status: "confirmed" }, ...asUser() })).rejects.toThrow();
  });
});

describe("a signed-in customer", () => {
  it("sees only their own rows", async () => {
    const subs = await payload.find({ collection: "subscriptions", ...asUser(alice) });
    expect(subs.docs.map((s) => s.providerSubscriptionId)).toEqual(["sub_alice"]);
    const pays = await payload.find({ collection: "payments", ...asUser(bob) });
    expect(pays.totalDocs).toBe(0);
    const customers = await payload.find({ collection: "customers", ...asUser(alice) });
    expect(customers.docs.map((c) => c.email)).toEqual(["alice@example.com"]);
  });

  it("cannot touch admin data", async () => {
    const site = await payload.findGlobal({ slug: "site" });
    const [page] = (await payload.find({ collection: "pages" })).docs;
    await expect(payload.create({ collection: "users", data: { email: "evil@example.com", password: "password-1234" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.find({ collection: "users", ...asUser(alice) })).rejects.toThrow();
    await expect(payload.update({ collection: "pages", id: page.id, data: { title: "pwned" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.updateGlobal({ slug: "site", data: { ...site, announcement: "pwned" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.create({ collection: "plans", data: { name: "free", priceCents: 0, currency: "eur" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.create({ collection: "categories", data: { name: "x" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.delete({ collection: "subscriptions", id: (await payload.find({ collection: "subscriptions" })).docs[0].id, ...asUser(alice) })).rejects.toThrow();
  });

  it("cannot change another customer or their own Stripe link", async () => {
    await expect(payload.update({ collection: "customers", id: bob.id, data: { name: "hijacked" }, ...asUser(alice) })).rejects.toThrow();
    await expect(payload.findByID({ collection: "customers", id: bob.id, ...asUser(alice) })).rejects.toThrow();
    // Payload drops fields the caller may not edit and applies the rest.
    await payload.update({ collection: "customers", id: alice.id, data: { name: "Alice B", stripeCustomerId: "cus_other" }, ...asUser(alice) });
    const fresh = await payload.findByID({ collection: "customers", id: alice.id });
    expect(fresh.name).toBe("Alice B");
    expect(fresh.stripeCustomerId).toBe("cus_alice");
  });

  it("can update their own profile fields", async () => {
    await payload.update({ collection: "customers", id: alice.id, data: { name: "Alice B", phone: "+359000" }, ...asUser(alice) });
    const fresh = await payload.findByID({ collection: "customers", id: alice.id });
    expect(fresh.name).toBe("Alice B");
    expect(fresh.phone).toBe("+359000");
  });
});
