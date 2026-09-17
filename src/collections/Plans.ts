import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../lib/access";
import { blockDeleteIfReferenced } from "../lib/delete-guards";

/**
 * What a customer can subscribe to. One row per Stripe price. The price here
 * is for display; Stripe charges what its price object says.
 */
export const Plans: CollectionConfig = {
  slug: "plans",
  labels: { singular: "План", plural: "Планове" },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "priceCents", "active", "stripePriceId"],
    group: "Абонаменти",
  },
  hooks: {
    beforeDelete: [
      blockDeleteIfReferenced([{ collection: "subscriptions", field: "plan", label: "Абонаменти" }]),
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "description", type: "textarea", label: "Описание" },
    {
      name: "priceCents",
      type: "number",
      label: "Цена на месец (в евроцентове, 1799 = 17.99 EUR)",
      required: true,
      min: 0,
    },
    { name: "currency", type: "text", label: "Валута", defaultValue: "eur", required: true },
    {
      name: "stripePriceId",
      type: "text",
      label: "Stripe price id (price_...)",
      admin: { description: "От Stripe Dashboard > Product catalog. Сменя се при нова цена." },
    },
    { name: "active", type: "checkbox", label: "Активен (може да се избира)", defaultValue: true },
    { name: "sortOrder", type: "number", label: "Подредба", defaultValue: 0 },
  ],
};
