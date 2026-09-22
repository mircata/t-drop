import type { CollectionConfig } from "payload";
import { adminOrOwnCustomer, isAdmin } from "../lib/access";
import { FULFILLMENT_STATUSES } from "../lib/delivery-status";
import { genderOptions, sizeOptions } from "../lib/shirt-options";

/**
 * A customer's pick for one shirt in one month. `month` is "YYYY-MM" so the admin list
 * filters by it.
 *
 * One row per shirt, not per customer: a plan carries a `shirtCount` (1, 2 or 4) and the
 * customer picks each shirt separately, so `slot` numbers them 1..shirtCount. The unique
 * key is customer + month + slot, which keeps a re-pick of the same shirt an update rather
 * than a second row. Before 2026-09-22 the key was customer + month, i.e. one shirt per
 * month — anything that still assumes a single pick per customer is a bug.
 */
export const CategorySelections: CollectionConfig = {
  slug: "category-selections",
  labels: { singular: "Избор за дроп", plural: "Избори за дроп" },
  access: { read: adminOrOwnCustomer, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "month",
    defaultColumns: ["month", "customer", "slot", "category", "fulfillmentStatus", "updatedAt"],
    group: "Дропове",
    listSearchableFields: ["month"],
  },
  indexes: [{ fields: ["customer", "month", "slot"], unique: true }],
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", label: "Клиент", required: true, index: true },
    {
      name: "slot",
      type: "number",
      label: "Тениска №",
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { description: "1 за първата тениска от пакета, 2 за втората и т.н." },
    },
    {
      name: "month",
      type: "text",
      label: "Месец (ГГГГ-ММ)",
      required: true,
      index: true,
      validate: (v: unknown) => (typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)) || "Формат ГГГГ-ММ, напр. 2026-03",
    },
    { name: "category", type: "relationship", relationTo: "categories", label: "Тема", required: true },
    { name: "size", type: "select", label: "Размер", options: sizeOptions() },
    { name: "gender", type: "select", label: "Пол", options: genderOptions() },
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
