import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

/*
 * Payload hooks that clear the Next.js page cache when content changes in /admin,
 * so an edit shows on the site right away. Scripts run outside Next (seed,
 * migrate) pass context.disableRevalidate to skip this.
 */

function pathFor(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

function safeRevalidate(path: string, type?: "layout" | "page") {
  try {
    revalidatePath(path, type);
  } catch {
    // Not inside a Next request (CLI script). Nothing to clear.
  }
}

export const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc, context }) => {
  if (context?.disableRevalidate) return doc;
  safeRevalidate(pathFor(doc.slug));
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) safeRevalidate(pathFor(previousDoc.slug));
  return doc;
};

export const revalidateDeletedPage: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.disableRevalidate) return doc;
  safeRevalidate(pathFor(doc.slug));
  return doc;
};

export const revalidateSite: GlobalAfterChangeHook = ({ doc, context }) => {
  if (context?.disableRevalidate) return doc;
  safeRevalidate("/", "layout");
  return doc;
};
