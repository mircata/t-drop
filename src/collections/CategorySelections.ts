import type { CollectionConfig } from "payload";
import { adminOrOwnCustomer, isAdmin } from "../lib/access";

/**
 * A customer's pick for one month. Unique per customer and month, so a change
 * updates the same row. `month` is "YYYY-MM" so the admin list filters by it.
 */
export const CategorySelections: CollectionConfig = {
  slug: "category-selections",
  labels: { singular: "Избор за дроп", plural: "Избори за дроп" },
  access: { read: adminOrOwnCustomer, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "month",
    defaultColumns: ["month", "customer", "category", "updatedAt"],
    group: "Дропове",
    listSearchableFields: ["month"],
  },
  indexes: [{ fields: ["customer", "month"], unique: true }],
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", label: "Клиент", required: true, index: true },
    {
      name: "month",
      type: "text",
      label: "Месец (ГГГГ-ММ)",
      required: true,
      index: true,
      validate: (v: unknown) => (typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)) || "Формат ГГГГ-ММ, напр. 2026-03",
    },
    { name: "category", type: "relationship", relationTo: "categories", label: "Тема", required: true },
  ],
};
