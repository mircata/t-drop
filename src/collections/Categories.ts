import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../lib/access";

/**
 * The themes a customer can pick for a drop (Култура, Изкуство, ...). The
 * owner ticks "active" on the ones offered this month.
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Тема", plural: "Теми" },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "active", "sortOrder"],
    group: "Дропове",
  },
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "image", type: "upload", relationTo: "media", label: "Картинка" },
    { name: "active", type: "checkbox", label: "Предлага се този месец", defaultValue: true },
    { name: "sortOrder", type: "number", label: "Подредба", defaultValue: 0 },
  ],
};
