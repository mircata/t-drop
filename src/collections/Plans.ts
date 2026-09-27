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
    defaultColumns: ["name", "shirtCount", "priceCents", "active", "stripePriceId"],
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
    /* The picture on the package card in the signup funnel. The Figma frames draw a plain
       grey rounded rectangle there — a placeholder, not artwork — so there is nothing to
       ship as a default; a plan with no image renders that same grey box. */
    { name: "image", type: "upload", relationTo: "media", label: "Картинка на картата" },
    /* How many shirts one subscription delivers each month, i.e. how many picks the
       customer makes per drop. The funnel repeats the design picker this many times and
       writes one `category-selections` row per shirt (slot 1..shirtCount). */
    {
      name: "shirtCount",
      type: "number",
      label: "Брой тениски на месец",
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { description: "Колко избора прави клиентът за един дроп." },
    },
    /* The ribbon on the package card in the funnel. "Избрано" is not here — that is the
       runtime selected state, not a property of the plan. */
    {
      name: "badge",
      type: "select",
      label: "Етикет на картата",
      defaultValue: "none",
      options: [
        { label: "Без", value: "none" },
        { label: "Препоръчан", value: "recommended" },
      ],
    },
    {
      name: "priceCents",
      type: "number",
      label: "Цена на месец (в евроцентове, 1799 = 17.99 EUR)",
      required: true,
      min: 0,
      /* The site shows the Stripe price's own amount (src/lib/plan-price.ts); this is only
         the fallback, so it cannot quietly disagree with what the customer is charged. */
      admin: {
        description:
          "Сайтът показва цената от Stripe (по Stripe price ID). Това поле се използва само ако Stripe не е достъпен или няма price ID.",
      },
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
