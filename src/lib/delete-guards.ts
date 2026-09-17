import { APIError } from "payload";
import type { CollectionBeforeDeleteHook, CollectionSlug } from "payload";

/**
 * Blocks deleting a row that other rows still point to, instead of letting Postgres
 * throw a raw NOT NULL error (the relationship fields on the referencing side are
 * `required: true`, but Payload always generates the foreign key as ON DELETE SET
 * NULL — the two are contradictory). Payment/order history is meant to survive a
 * customer, plan, or category being removed, so deletion is refused with a message
 * telling the admin what still points at it, rather than cascading.
 */
export function blockDeleteIfReferenced(
  refs: { collection: CollectionSlug; field: string; label: string }[],
): CollectionBeforeDeleteHook {
  return async ({ req, id }) => {
    for (const ref of refs) {
      const { totalDocs } = await req.payload.find({
        collection: ref.collection,
        where: { [ref.field]: { equals: id } },
        limit: 1,
        depth: 0,
        req,
      });
      if (totalDocs > 0) {
        throw new APIError(
          `Не може да се изтрие — има ${totalDocs} свързан(и) запис(и) в „${ref.label}“. Изтрий или премести първо тях.`,
          400,
        );
      }
    }
  };
}
