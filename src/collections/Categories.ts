import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../lib/access";
import { blockDeleteIfReferenced } from "../lib/delete-guards";

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
    description: "Всеки месец качи новите 4 дизайна тук и тикни \"Предлага се този месец\" на точно тях — /join и /account ги показват веднага. Изключи миналомесечните, не ги трий (старите избори сочат към тях).",
  },
  hooks: {
    beforeDelete: [
      blockDeleteIfReferenced([{ collection: "category-selections", field: "category", label: "Избори за дроп" }]),
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "image", type: "upload", relationTo: "media", label: "Картинка" },
    { name: "active", type: "checkbox", label: "Предлага се този месец", defaultValue: true },
    { name: "sortOrder", type: "number", label: "Подредба", defaultValue: 0 },
  ],
};
