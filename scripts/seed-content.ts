/**
 * Loads the copy and images from the v0.1 port into Payload so /admin starts
 * populated. Run: npm run seed:content
 * Re-running replaces the home and about pages and the Site global with these
 * values, and reuses media files that were already uploaded.
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const wp = (rel: string) => path.resolve(dirname, "../public/wp", rel);

const payload = await getPayload({ config });

async function media(p: Payload, rel: string, alt = ""): Promise<number> {
  const filename = path.basename(rel);
  const found = await p.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1 });
  if (found.docs[0]) return found.docs[0].id;
  /* Payload renames an upload whose name is already taken in storage (`shirt-icon-1.svg`),
     which is how the Vercel test site's bucket has them. Match those too, so a re-seed
     reuses the file instead of uploading another copy. */
  const ext = path.extname(filename);
  const stem = filename.slice(0, -ext.length);
  const similar = await p.find({ collection: "media", where: { filename: { like: stem } }, limit: 20 });
  const renamed = similar.docs.find((d) => new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+${ext.replace(".", "\\.")}$`).test(d.filename ?? ""));
  if (renamed) return renamed.id;
  /* Seeding a remote database without its storage keys would store the file on this
     machine and point the row at it — a broken image on the site. Refuse instead. */
  if (process.env.SEED_NO_UPLOAD === "1") throw new Error(`Missing media ${filename} and SEED_NO_UPLOAD=1 — not uploading.`);
  const doc = await p.create({ collection: "media", filePath: wp(rel), data: { alt } });
  p.logger.info(`Uploaded ${filename}`);
  return doc.id;
}

async function upsertPage(p: Payload, slug: string, data: { title: string; layout: unknown }) {
  const found = await p.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1 });
  const body = { slug, title: data.title, layout: data.layout as never };
  if (found.docs[0]) {
    await p.update({ collection: "pages", id: found.docs[0].id, data: body, context: { disableRevalidate: true } });
    p.logger.info(`Updated page ${slug}`);
  } else {
    await p.create({ collection: "pages", data: body, context: { disableRevalidate: true } });
    p.logger.info(`Created page ${slug}`);
  }
}

const shirt = await media(
  payload,
  "2025/12/u2385526421_backround_blurry_style_design_-sref_httpss.mj_.ru_9b6359ca-3836-4215-b6da-d0520d3b4da6_1.png",
);
const iconShirt = await media(payload, "2025/12/shirt-icon.svg");
const icon3ts = await media(payload, "2025/12/3ts-icon.svg");
const iconNonAi = await media(payload, "2025/12/nonai-icon.svg");
const iconBg = await media(payload, "2025/12/bulgarian-brand-icon.svg");

await upsertPage(payload, "home", {
  title: "T-Drop Monthly T-Shirts",
  layout: [
    /* Step 0 of the signup funnel — Figma `519:3` (mobile) and `525:3048` (desktop),
       annotated *"this is a the new redesigned hero section of the landing page"*. It
       replaces the old `hero` block, whose "ЗАПИШИ СЕ" merely linked to /join; this one
       starts the funnel from the email field itself.

       Copy is read off the frames. `headingTop` carries the editor's own line break, which
       is what splits "Всеки / месец" across the two lines the design tucks together. */
    {
      blockType: "signupHero",
      headingTop: "Всеки\nмесец",
      headingBottom: "Нови тениски",
      body: "Абонирай се за месечната си доза свежа тениска.",
      emailPlaceholder: "Имейл",
      ctaLabel: "ЗАПИШИ СЕ",
      fieldNote: "Въведи имейла си и започни поръчката само в няколко стъпки.",
      /* Left empty so the block falls back to the frame's own artwork in
         public/figma/signup/. An editor swaps these in /admin without touching code. */
      photos: [],
    },
    {
      blockType: "fabric",
      stickerRed: "Удобна за всеки повод",
      stickerNeon: "100% Памук",
      stickerDot: "ЕКО Материя",
      shirt,
    },
    {
      blockType: "usps",
      items: [
        { icon: iconShirt, title: "Дълготрайни\n щампи", text: "Използваме доказана технология за отпечатването." },
        { icon: icon3ts, title: "Високо-качествени тениски", text: "Всичките ни тениски са от 100% памук." },
        { icon: iconNonAi, title: "Не използва AI", text: "Всеки месец наемаме артисти, които рисуват дизайните." },
        { icon: iconBg, title: "Работим изцяло в бг", text: "Цялото производство е позиционирано в България." },
      ],
    },
    {
      blockType: "reviews",
      heading: "Доволни клиенти",
      items: [
        { name: "Георги", quote: "“Перфектна тениска за ежедневието”", photo: shirt },
        { name: "Георги", quote: "“Перфектна тениска за ежедневието”", photo: shirt },
        { name: "Георги", quote: "“Перфектна тениска за ежедневието”", photo: shirt },
      ],
    },
    {
      blockType: "faq",
      heading: "Често задавани въпроси",
      items: [
        { question: "Какво получаваш?", answer: "Оригинална тениска за всеки повод по твой избор." },
        {
          question: "Кога ще получа пратката?",
          answer:
            "Всеки месец обявяваме датата за получаване в най-горната лента на сайта ни поне седмица преди пристигане и пускаме таймер в социалните ни мрежи. В рамките на 5 работни дни след тази дата пратката трябва да е при Вас.",
        },
        {
          question: "Как да се запишеш?",
          answer:
            "Регистрацията е проста, ще ни трябва само имена, имейл, и адрес, на които да доставяме всеки месец пратката.",
          ctaLabel: "От тук",
          ctaHref: "/#signup",
        },
      ],
    },
    {
      blockType: "cta",
      heading: "Запиши се сега, ако си задаваш следните въпроси:",
      tagline: "искам нещо лежерно за фитнеса",
      buttonLabel: "ЗАпиши се сега",
      buttonHref: "/#signup",
      shirt,
    },
    { blockType: "social", text: "Последвай ни за новини и оферти", smallOnPhones: false },
  ],
});

await upsertPage(payload, "about", {
  title: "За нас – T-Drop Monthly T-Shirts",
  layout: [
    {
      blockType: "aboutStory",
      heading: "Какво е \nT-drop?",
      intro:
        "Услугата T-drop е месечен абонамент за тениска по предварително избрана категория от потребителя. Всеки месец подбираме 4-5 различни категории, от които можете да си изберете.",
      step1Heading: "Избираш твоята тема",
      step1Sticker: "как?",
      step1Text:
        "От страницата за поръчка си избираш темата, размера, цвета и за удобство можеш да отбележиш за кой е...",
      ctaLabel: "ЗАпиши се сега",
      ctaHref: "/#signup",
      step2Heading: "След това...",
      step2Sticker: "и ся кво?",
      step2Text:
        "... ще е моментът на попълване на информация за доставка и платежен метод. Работим на месечен абонамент, като можете веднъж да се запишете и да получавате случайна тематика или да изберете от индивидуалния мейл, който изпращаме всеки месец и чрез който можете да изберете, коя тема си избирате за следващия дроп (можете и през профила също).",
      step2Note: "Избирането се прави веднъж месечно.",
      shirt,
    },
    {
      blockType: "aboutWhen",
      heading: "а Кога ще получа?",
      sticker: "кога?",
      countdownBefore: "Остават",
      countdownAfter: "до следващия дроп",
      textLeft:
        "На тази дата изпращаме пратките, като самият ден, в който пристига пратка, зависи от куриерската фирма.",
      textRight:
        "С времето ще работим, за да подобрим процеса и да измислим начин, в който да получавате в деня, в който е маркиран дропът.",
    },
    { blockType: "social", text: "Последвай ни за още", smallOnPhones: true },
  ],
});

await payload.updateGlobal({
  slug: "site",
  context: { disableRevalidate: true },
  data: {
    announcement:
      "Очаквайте новия дроп {date} :: Темите този месец са {themes} :: Регистрирай се сега! ::",
    nav: [
      { label: "About", href: "/about" },
      { label: "Your Profile", href: "/your-profile" },
      { label: "Register", href: "/login" },
    ],
    footerLeft: [
      { label: "За нас", href: "/about" },
      { label: "Актуален дроп", href: "/" },
    ],
    footerRight: [
      { label: "Правила за ползване", href: "#" },
      { label: "Политика за поверителност", href: "#" },
      { label: "Условия за връщане", href: "#" },
    ],
    newsletterLabel: "Бюлетин",
    newsletterPlaceholder: "Имейл",
    newsletterButton: "Абонирай се",
    copyright: "Tdrop © 2026",
    credit: "Designed by Mirko Minkov",
    instagram: "#",
    facebook: "#",
    /* The funnel's FAQ, read off Figma `525:3824` (mobile) and `525:3658` (desktop) — ten
       questions in the order the phone frame lists them, transcribed verbatim. Two answers
       carry the frames' own slips (a missing space in "си -без обвързване", a mixed em
       dash and hyphen in the България one); they are left as drawn rather than tidied,
       since copy is the owner's. Two more are on the pre-launch list: the price answer
       names one price while the selector above it offers three, and the courier answer
       names three carriers we do not have contracts with yet. */
    funnelFaqHeading: "Често задавани въпроси",
    funnelFaq: [
      {
        question: "Какво е T-Drop?",
        answer:
          "T-Drop е месечен абонамент за дизайнерски тениски в България - всеки месец получаваш нова, оригинална тениска с уникален дизайн, избран от теб, директно на адрес.",
      },
      {
        question: "Как да се запиша за T-Drop?",
        answer:
          "Регистрацията отнема по-малко от минута - трябват ни само име, имейл и адрес за доставка. От там избираш дизайн, размер и пол на тениската за първия си дроп.",
      },
      {
        question: "Колко струва абонаментът?",
        answer:
          "Само 17.99 € на месец - цената включва тениската, доставката и достъп до нов дизайн всеки месец. Без скрити такси, спираш когато поискаш.",
      },
      {
        question: "Кога ще получа тениската си?",
        answer:
          "Обявяваме точната дата за доставка в лентата най-горе на сайта и в социалните мрежи поне седмица предварително. Пратката пристига до 5 работни дни след тази дата, всеки месец.",
      },
      {
        question: "От какъв материал са тениските?",
        answer:
          "100% памук с дълготрайна щампа, отпечатана с доказана технология - тениските са изработени да издържат на носене и пране, без щампата да се напуква или бледнее.",
      },
      {
        question: "Мога ли да сменя размера или дизайна на тениската?",
        answer:
          "Да - преди всеки нов дроп имаш прозорец, в който да избереш нов дизайн, размер (S, M, L, XL) и пол за месеца. След старта на производството изборът се заключва до следващия цикъл.",
      },
      {
        question: "Кой рисува дизайните — ИИ(AI) ли ги генерира?",
        answer:
          "Не. Всеки месец наемаме артисти, които рисуват дизайните на ръка - нито един принт не е генериран с изкуствен интелект.",
      },
      {
        question: "Произвеждат ли се тениските в България?",
        answer:
          "Да, цялото производство — от дизайн до печат - е изцяло в България, което ни позволява по-бърза доставка и контрол на качеството.",
      },
      {
        question: "Мога ли да спра абонамента по всяко време?",
        answer:
          "Да, спираш с един клик през профила си -без обвързване, такси за отказ или нужда да се обаждаш някъде.",
      },
      {
        question: "С кой куриер доставяте?",
        answer:
          "Работим със Speedy, Sameday и BoxNow - избираш предпочитания спедитор и посочваш точен адрес или офис на куриер при регистрация.",
      },
    ],
  },
});
payload.logger.info("Site global written.");

// Plan and drop themes so /join and /my-account have something to show.
/* The three packages of the new funnel (Figma `519:377`). The selector there is annotated
   *"this is package selector. Here you will to create 3 types of subscriptions based on
   this info here. You can translate it to bulgarian"*, so the frames' BASIC / SUPPORTER /
   FAMILY are names to translate rather than copy to keep; "Фен" carries the Supporter
   sense — backing the artists — in one short word that fits the card. **The prices are placeholders** (decision 7) and none of these has a
   Stripe price id yet, so both are on the pre-launch list; nothing may depend on their
   ratios. Seeded by name so re-running the seed does not duplicate them. */
const packages: { name: string; shirtCount: number; priceCents: number; badge: "none" | "recommended" }[] = [
  { name: "Базов", shirtCount: 1, priceCents: 1799, badge: "none" },
  { name: "Фен", shirtCount: 2, priceCents: 2299, badge: "none" },
  { name: "Семеен", shirtCount: 4, priceCents: 2499, badge: "recommended" },
];
for (const [i, pack] of packages.entries()) {
  const found = await payload.find({ collection: "plans", where: { name: { equals: pack.name } }, limit: 1 });
  if (found.totalDocs > 0) continue;
  await payload.create({
    collection: "plans",
    data: { ...pack, currency: "eur", active: true, sortOrder: i },
  });
  payload.logger.info(`Created plan ${pack.name} (${(pack.priceCents / 100).toFixed(2)} EUR, ${pack.shirtCount} shirts).`);
}

/* The single plan this site launched with, superseded by "Базов" (same price, same one
   shirt). Deactivated rather than deleted: existing subscriptions point at it and payment
   history is meant to survive, but leaving it active would draw a fourth package card on
   the funnel's selector. */
const legacy = await payload.find({ collection: "plans", where: { name: { equals: "Месечен абонамент" } }, limit: 1 });
if (legacy.docs[0]?.active) {
  await payload.update({ collection: "plans", id: legacy.docs[0].id, data: { active: false } });
  payload.logger.info("Deactivated the legacy single plan in favour of Базов.");
}

// Names as on the /join product page. /my-account showed "Култура/Изкуство" for the same themes; one list now.
const themes: [string, string][] = [
  ["Поп култура", "2026/01/cult001.png"],
  ["Спорт", "2026/01/sport001.png"],
  ["Арт", "2026/01/art001.png"],
  ["Фитнес", "2026/01/fit001.png"],
];
for (const [i, [name, img]] of themes.entries()) {
  const found = await payload.find({ collection: "categories", where: { name: { equals: name } }, limit: 1 });
  if (found.totalDocs > 0) continue;
  await payload.create({
    collection: "categories",
    data: { name, image: await media(payload, img, name), active: true, sortOrder: i },
  });
  payload.logger.info(`Created category ${name}`);
}

process.exit(0);
