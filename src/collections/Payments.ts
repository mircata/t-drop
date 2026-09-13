import type { CollectionConfig } from "payload";
import { adminOrOwnCustomer, isAdmin } from "../lib/access";

/**
 * One row per charge attempt at the provider (a Stripe invoice). Written by the
 * webhook. `raw` keeps the provider payload for later questions.
 */
export const Payments: CollectionConfig = {
  slug: "payments",
  labels: { singular: "Плащане", plural: "Плащания" },
  access: { read: adminOrOwnCustomer, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "providerPaymentId",
    defaultColumns: ["customer", "amountCents", "status", "paidAt"],
    group: "Абонаменти",
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", label: "Клиент", required: true, index: true },
    { name: "subscription", type: "relationship", relationTo: "subscriptions", label: "Абонамент", index: true },
    { name: "providerSubscriptionId", type: "text", label: "Абонамент при доставчика (sub_...)", index: true, admin: { readOnly: true } },
    {
      name: "provider",
      type: "select",
      label: "Доставчик",
      required: true,
      defaultValue: "stripe",
      options: [
        { label: "Stripe", value: "stripe" },
        { label: "Друг", value: "other" },
      ],
    },
    { name: "providerPaymentId", type: "text", label: "Id при доставчика (in_... / pi_...)", required: true, unique: true, index: true },
    { name: "amountCents", type: "number", label: "Сума (центове)", required: true },
    { name: "currency", type: "text", label: "Валута", required: true, defaultValue: "eur" },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      index: true,
      options: [
        { label: "Платено", value: "paid" },
        { label: "Неуспешно", value: "failed" },
        { label: "Чака", value: "pending" },
        { label: "Възстановено", value: "refunded" },
      ],
    },
    { name: "paidAt", type: "date", label: "Платено на", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "raw", type: "json", label: "Данни от доставчика", admin: { readOnly: true } },
  ],
};
