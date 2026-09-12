import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

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

/** URL of an upload field, or the fallback when the field is empty or unresolved. */
export function mediaUrl(value: number | Media | null | undefined, fallback: string): string {
  if (value && typeof value === "object" && value.url) return value.url;
  return fallback;
}
