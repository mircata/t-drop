import type { Payload } from "payload";
import type { Customer } from "@/payload-types";
import { getStripe } from "./stripe";

/**
 * The customer's Stripe Customer id, creating the Stripe record (and saving its id on our
 * row) the first time. Not a server action on purpose: it takes a customer, so it must only
 * ever be called with the signed-in one, from code that has already checked that.
 */
export async function ensureStripeCustomer(payload: Payload, customer: Customer): Promise<string> {
  if (customer.stripeCustomerId) return customer.stripeCustomerId;
  const created = await getStripe().customers.create({
    email: customer.email,
    name: customer.name,
    metadata: { payloadCustomerId: String(customer.id) },
  });
  await payload.update({ collection: "customers", id: customer.id, data: { stripeCustomerId: created.id } });
  return created.id;
}
