import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/access";

/**
 * Every Stripe event we have already handled, by Stripe's event id. The
 * webhook checks this table first so a retried delivery does nothing twice.
 */
export const WebhookEvents: CollectionConfig = {
  slug: "webhook-events",
  labels: { singular: "Webhook събитие", plural: "Webhook събития" },
  access: { read: isAdmin, create: () => false, update: () => false, delete: isAdmin },
  admin: {
    useAsTitle: "eventId",
    defaultColumns: ["eventId", "type", "createdAt"],
    group: "Абонаменти",
    description: "Записва се автоматично. Само за проверка при проблеми.",
  },
  fields: [
    { name: "eventId", type: "text", required: true, unique: true, index: true },
    { name: "type", type: "text", required: true, index: true },
    { name: "provider", type: "text", required: true, defaultValue: "stripe" },
  ],
};
