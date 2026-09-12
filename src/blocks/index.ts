import type { Block, Field } from "payload";

/*
 * One block per section of the landing and about pages. Blocks hold copy and
 * images only. Positions, sizes and breakpoints stay in the React components
 * under src/components/blocks so the render matches the WordPress reference.
 */

const link = (name: string, label: string, defaultValue = "/join"): Field => ({
  name,
  type: "text",
  label,
  defaultValue,
  admin: { description: "Вътрешен път като /join или пълен адрес" },
});

const image = (name: string, label: string, required = false): Field => ({
  name,
  type: "upload",
  relationTo: "media",
  label,
  required,
});

export const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "heading", type: "textarea", label: "Заглавие", required: true },
    { name: "subheading", type: "text", label: "Подзаглавие", required: true },
    { name: "ctaLabel", type: "text", label: "Бутон", required: true },
    link("ctaHref", "Бутон води към"),
    image("shirt", "Тениска (снимка)"),
  ],
};

export const Fabric: Block = {
  slug: "fabric",
  labels: { singular: "Материя (стикери)", plural: "Материя (стикери)" },
  fields: [
    { name: "stickerRed", type: "text", label: "Червен стикер", required: true },
    { name: "stickerNeon", type: "text", label: "Неонов стикер", required: true },
    { name: "stickerDot", type: "text", label: "Пикселен стикер", required: true },
    image("shirt", "Тениска (снимка)"),
  ],
};

export const Usps: Block = {
  slug: "usps",
  labels: { singular: "Предимства", plural: "Предимства" },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Предимства",
      minRows: 1,
      fields: [
        image("icon", "Икона", true),
        { name: "title", type: "textarea", label: "Заглавие", required: true },
        { name: "text", type: "text", label: "Текст", required: true },
      ],
    },
  ],
};

export const Reviews: Block = {
  slug: "reviews",
  labels: { singular: "Отзиви", plural: "Отзиви" },
  fields: [
    { name: "heading", type: "text", label: "Заглавие", required: true },
    {
      name: "items",
      type: "array",
      label: "Отзиви",
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: "name", type: "text", label: "Име", required: true },
        { name: "quote", type: "text", label: "Цитат", required: true },
        image("photo", "Снимка"),
      ],
    },
  ],
};

export const Faq: Block = {
  slug: "faq",
  labels: { singular: "Често задавани въпроси", plural: "Често задавани въпроси" },
  fields: [
    { name: "heading", type: "text", label: "Заглавие", required: true },
    {
      name: "items",
      type: "array",
      label: "Въпроси",
      minRows: 1,
      fields: [
        { name: "question", type: "text", label: "Въпрос", required: true },
        { name: "answer", type: "textarea", label: "Отговор", required: true },
        { name: "ctaLabel", type: "text", label: "Бутон (по избор)" },
        link("ctaHref", "Бутон води към"),
      ],
    },
  ],
};

export const Cta: Block = {
  slug: "cta",
  labels: { singular: "Призив (запиши се)", plural: "Призив (запиши се)" },
  fields: [
    { name: "heading", type: "text", label: "Заглавие", required: true },
    { name: "tagline", type: "text", label: "Пикселен ред", required: true },
    { name: "buttonLabel", type: "text", label: "Бутон", required: true },
    link("buttonHref", "Бутон води към"),
    image("shirt", "Тениска (снимка)"),
  ],
};

export const Social: Block = {
  slug: "social",
  labels: { singular: "Последвай ни", plural: "Последвай ни" },
  fields: [
    { name: "text", type: "text", label: "Текст под иконите", required: true },
    { name: "smallOnPhones", type: "checkbox", label: "По-малки икони на телефон", defaultValue: false },
  ],
};

export const AboutStory: Block = {
  slug: "aboutStory",
  labels: { singular: "За нас: история", plural: "За нас: история" },
  fields: [
    { name: "heading", type: "textarea", label: "Заглавие", required: true },
    { name: "intro", type: "textarea", label: "Въведение", required: true },
    { name: "step1Heading", type: "text", label: "Стъпка 1: заглавие", required: true },
    { name: "step1Sticker", type: "text", label: "Стъпка 1: стикер", required: true },
    { name: "step1Text", type: "textarea", label: "Стъпка 1: текст", required: true },
    { name: "ctaLabel", type: "text", label: "Бутон", required: true },
    link("ctaHref", "Бутон води към"),
    { name: "step2Heading", type: "text", label: "Стъпка 2: заглавие", required: true },
    { name: "step2Sticker", type: "text", label: "Стъпка 2: стикер", required: true },
    { name: "step2Text", type: "textarea", label: "Стъпка 2: текст", required: true },
    { name: "step2Note", type: "textarea", label: "Стъпка 2: бележка", required: true },
    image("shirt", "Тениска (снимка)"),
  ],
};

export const AboutWhen: Block = {
  slug: "aboutWhen",
  labels: { singular: "За нас: кога", plural: "За нас: кога" },
  fields: [
    { name: "heading", type: "text", label: "Заглавие", required: true },
    { name: "sticker", type: "text", label: "Стикер", required: true },
    { name: "countdownBefore", type: "text", label: "Текст преди брояча", required: true },
    { name: "countdownAfter", type: "text", label: "Текст след брояча", required: true },
    { name: "textLeft", type: "textarea", label: "Ляв абзац", required: true },
    { name: "textRight", type: "textarea", label: "Десен абзац", required: true },
  ],
};

export const pageBlocks: Block[] = [Hero, Fabric, Usps, Reviews, Faq, Cta, Social, AboutStory, AboutWhen];
