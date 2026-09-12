import type { CollectionConfig } from "payload";
import { adminOrOwnCustomer, isAdmin } from "../lib/access";

/**
 * One row per subscription at the payment provider. Written by the Stripe
 * webhook, read by /my-account. Admins may edit for manual fixes.
 */
export const Subscriptions: CollectionConfig = {
  slug: "subscriptions",
  labels: { singular: "Абонамент", plural: "Абонаменти" },
  access: { read: adminOrOwnCustomer, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "providerSubscriptionId",
    defaultColumns: ["customer", "plan", "status", "currentPeriodEnd"],
    group: "Абонаменти",
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", label: "Клиент", required: true, index: true },
    { name: "plan", type: "relationship", relationTo: "plans", label: "План", required: true },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      index: true,
      options: [
        { label: "Активен", value: "active" },
        { label: "Пробен период", value: "trialing" },
        { label: "Просрочено плащане", value: "past_due" },
        { label: "Неплатен", value: "unpaid" },
        { label: "Незавършен", value: "incomplete" },
        { label: "Паузиран", value: "paused" },
        { label: "Отказан", value: "canceled" },
      ],
    },
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
    {
      name: "providerSubscriptionId",
      type: "text",
      label: "Id при доставчика (sub_...)",
      required: true,
      unique: true,
      index: true,
    },
    { name: "providerCustomerId", type: "text", label: "Клиент при доставчика (cus_...)", index: true },
    { name: "currentPeriodEnd", type: "date", label: "Платено до", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "cancelAtPeriodEnd", type: "checkbox", label: "Спира в края на периода", defaultValue: false },
    { name: "canceledAt", type: "date", label: "Отказан на" },
    { name: "startedAt", type: "date", label: "Започнал на" },
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
    { name: "orderName", type: "text", label: "Име на поръчка (за кого е)" },
  ],
};
