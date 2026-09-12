import type { CollectionConfig } from "payload";
import { pageBlocks } from "../blocks";
import { revalidateDeletedPage, revalidatePage } from "../lib/revalidate";
import { anyone, isAdmin } from "../lib/access";

/**
 * Editable pages. Each page is a list of section blocks; the React component
 * for each block lives in src/components/blocks. The home page has slug "home".
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDeletedPage],
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  fields: [
    { name: "title", type: "text", label: "Заглавие (в браузъра)", required: true },
    {
      name: "slug",
      type: "text",
      label: "Адрес",
      required: true,
      unique: true,
      index: true,
      admin: { description: "home за началната страница, иначе частта след / в адреса" },
    },
    {
      name: "layout",
      type: "blocks",
      label: "Секции",
      blocks: pageBlocks,
    },
  ],
};
