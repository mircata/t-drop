import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";
import { nextDeliveryDate } from "./stripe-sync";

/** One Payload instance per process; getPayload caches it internally. */
export const getPayloadClient = () => getPayload({ config });

/** A page by slug with its media resolved one level deep. Memoised per request. */
export const getPage = cache(async (slug: string) => {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
});

/** The Site global: announcement, nav, footer, socials. Memoised per request. */
export const getSite = cache(async () => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site", depth: 0 });
});

const MONTHS_BG = ["ЯНУ", "ФЕВ", "МАР", "АПР", "МАЙ", "ЮНИ", "ЮЛИ", "АВГ", "СЕП", "ОКТ", "НОВ", "ДЕК"];

/**
 * The announcement strip text with its `{date}` and `{themes}` placeholders filled
 * in from real data: the next physical delivery date (same calculation as the
 * account dashboard, see nextDeliveryDate in stripe-sync.ts) and the names of the
 * categories currently ticked "active". The surrounding copy stays admin-editable
 * in Site.announcement; only these two facts are computed so the strip can't go
 * stale like the old hardcoded "16 ФЕВ" seed text did.
 */
export const getAnnouncementText = cache(async (): Promise<string> => {
  const [site, payload] = await Promise.all([getSite(), getPayloadClient()]);
  const categories = await payload.find({
    collection: "categories",
    where: { active: { equals: true } },
    sort: "sortOrder",
    depth: 0,
    limit: 50,
  });

  const date = nextDeliveryDate(site.deliveryDay);
  const dateText = `${date.getUTCDate()} ${MONTHS_BG[date.getUTCMonth()]}`;
  const themesText = categories.docs.map((c) => c.name).join(", ") || "предстои обявяване";

  return site.announcement.replace("{date}", dateText).replace("{themes}", themesText);
});

/** URL of an upload field, or the fallback when the field is empty or unresolved. */
export function mediaUrl(value: number | Media | null | undefined, fallback: string): string {
  if (value && typeof value === "object" && value.url) return value.url;
  return fallback;
}
