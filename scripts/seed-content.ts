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
    {
      blockType: "hero",
      heading: "Всеки месец различни дизайни",
      subheading: "Само за 17.99EU на месец",
      ctaLabel: "ВИЖ ТЕНИСКИТЕ",
      ctaHref: "/join",
      shirt,
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
          ctaHref: "/join",
        },
      ],
    },
    {
      blockType: "cta",
      heading: "Запиши се сега, ако си задаваш следните въпроси:",
      tagline: "искам нещо лежерно за фитнеса",
      buttonLabel: "ЗАпиши се сега",
      buttonHref: "/join",
      shirt,
    },
    { blockType: "social", text: "Последвай ни за новини и оферти", smallOnPhones: false },
  ],
});

await upsertPage(payload, "about", {
  title: "About – T-Drop Monthly T-Shirts",
  layout: [
    {
      blockType: "aboutStory",
      heading: "Какво е \nT-drop?",
      intro:
        "Услугата T-drop е месечен абонамент за тениска по предварително избрана категория от потребителя. Всеки месец подбираме 4-5 различни категории от които можете да си изберете.",
      step1Heading: "Избираш твоята тема",
      step1Sticker: "как?",
      step1Text:
        "От страницата за поръчка си избираш темата, размера, цвета и за удобство можеш да отбележиш за кой е...",
      ctaLabel: "ЗАпиши се сега",
      ctaHref: "/join",
      step2Heading: "След това...",
      step2Sticker: "и ся кво?",
      step2Text:
        "... ще е момента на попълване на информация за доставка и платежен метод. Работим на месечен абонамент, като можете веднъж да се запишете и да получавате случайна тематика или да изберете от индивидуалният мейл, който изпращаме всеки месец чрез който можете да изберете, коя тема си избирате за следващия дроп( можете и през профила също) .",
      step2Note: "Избирането се прави веднъж месеца и нямате право да смяна на избора.",
      shirt,
    },
    {
      blockType: "aboutWhen",
      heading: "а Кога ще получа?",
      sticker: "кога?",
      countdownBefore: "Остават",
      countdownAfter: "до следващия дроп",
      textLeft:
        "На тази дата изпращаме пратките, като самия ден в който пристига пратка зависи от куриерската фирма.",
      textRight:
        "С времето ще работим да подобрим процеса, и да измислим начин в който да получавате в деня в който е маркиран дропа.",
    },
    { blockType: "social", text: "Последвай ни за още", smallOnPhones: true },
  ],
});

await payload.updateGlobal({
  slug: "site",
  context: { disableRevalidate: true },
  data: {
    announcement:
      "Очаквайте новият дроп 16 ФЕВ :: Темите този месец са Аниме, Кино, Фентъзи, Рок :: Регистрирай се сега! ::",
    nav: [
      { label: "About", href: "/about" },
      { label: "Your Profile", href: "/your-profile" },
      { label: "Register", href: "/register" },
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
    newsletterLabel: "Newsletter",
    newsletterPlaceholder: "Email",
    newsletterButton: "Запиши се",
    copyright: "Tdrop © 2026",
    credit: "Designed by Mirko Minkov",
    instagram: "#",
    facebook: "#",
  },
});
payload.logger.info("Site global written.");

// Plan and drop themes so /join and /my-account have something to show.
const plans = await payload.find({ collection: "plans", limit: 1 });
if (plans.totalDocs === 0) {
  await payload.create({
    collection: "plans",
    data: { name: "Месечен абонамент", priceCents: 1799, currency: "eur", active: true, sortOrder: 0 },
  });
  payload.logger.info("Created plan Месечен абонамент (17.99 EUR).");
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
