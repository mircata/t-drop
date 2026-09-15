import type { CollectionConfig } from "payload";
import { adminOrOwnCustomer, isAdmin } from "../lib/access";
import { FULFILLMENT_STATUSES } from "../lib/delivery-status";

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
    defaultColumns: ["month", "customer", "category", "fulfillmentStatus", "updatedAt"],
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
    {
      name: "size",
      type: "select",
      label: "Размер",
      options: ["s", "m", "l", "xl"].map((v) => ({ label: v.toUpperCase(), value: v })),
    },
    {
      name: "gender",
      type: "select",
      label: "Пол",
      options: [
        { label: "Мъж", value: "male" },
        { label: "Жена", value: "female" },
      ],
    },
    {
      name: "fulfillmentStatus",
      type: "select",
      label: "Статус на доставка",
      defaultValue: "preparing",
      index: true,
      options: FULFILLMENT_STATUSES.map((s) => ({ label: s.label, value: s.value })),
    },
  ],
};
