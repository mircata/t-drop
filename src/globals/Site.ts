import type { GlobalConfig } from "payload";
import { revalidateSite } from "../lib/revalidate";
import { anyone, isAdmin } from "../lib/access";

const linkFields = [
  { name: "label", type: "text" as const, label: "Текст", required: true },
  { name: "href", type: "text" as const, label: "Води към", required: true },
];

/**
 * Site-wide settings: the announcement strip, navigation, footer and socials.
 */
export const Site: GlobalConfig = {
  slug: "site",
  label: "Сайт",
  access: { read: anyone, update: isAdmin },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Горе",
          fields: [
            {
              name: "announcement",
              type: "text",
              label: "Лента най-горе (бягащ текст)",
              required: true,
            },
            {
              name: "nextDropDate",
              type: "date",
              label: "Дата на следващия дроп",
              admin: { date: { pickerAppearance: "dayOnly" } },
            },
            { name: "nav", type: "array", label: "Меню", fields: linkFields },
          ],
        },
        {
          label: "Долу",
          fields: [
            { name: "footerLeft", type: "array", label: "Връзки вляво", fields: linkFields },
            { name: "footerRight", type: "array", label: "Връзки вдясно", fields: linkFields },
            { name: "newsletterLabel", type: "text", label: "Надпис над бюлетина", required: true },
            { name: "newsletterPlaceholder", type: "text", label: "Полето за имейл", required: true },
            { name: "newsletterButton", type: "text", label: "Бутон за бюлетина", required: true },
            { name: "copyright", type: "text", label: "Ред за авторски права", required: true },
            { name: "credit", type: "text", label: "Ред за дизайнера", required: true },
          ],
        },
        {
          label: "Социални",
          fields: [
            { name: "instagram", type: "text", label: "Instagram адрес" },
            { name: "facebook", type: "text", label: "Facebook адрес" },
          ],
        },
      ],
    },
  ],
};
