import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/access";

/**
 * Admin users. Customers get their own collection in v0.2 task oaz.4;
 * this one is only for people who log in to /admin.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  // Only admins touch admin accounts. Without this Payload lets any logged-in user, customers included.
  access: { create: isAdmin, read: isAdmin, update: isAdmin, delete: isAdmin, unlock: isAdmin, admin: ({ req: { user } }) => user?.collection === "users" },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
