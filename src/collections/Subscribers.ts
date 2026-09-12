import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/access";

/**
 * Newsletter signups from the footer form. Double opt-in: a row starts as
 * "pending" and becomes "confirmed" when the emailed link is opened.
 */
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Абонат за бюлетина", plural: "Абонати за бюлетина" },
  access: { read: isAdmin, create: () => false, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "confirmedAt", "createdAt"],
    group: "Клиенти",
    listSearchableFields: ["email"],
  },
  fields: [
    { name: "email", type: "email", label: "Имейл", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Чака потвърждение", value: "pending" },
        { label: "Потвърден", value: "confirmed" },
        { label: "Отписан", value: "unsubscribed" },
      ],
    },
    { name: "confirmedAt", type: "date", label: "Потвърден на" },
    { name: "token", type: "text", required: true, index: true, admin: { hidden: true } },
    { name: "source", type: "text", label: "Откъде", defaultValue: "footer", admin: { readOnly: true } },
  ],
};
