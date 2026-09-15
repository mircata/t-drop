"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { FULFILLMENT_STATUSES, type FulfillmentStatus } from "@/lib/delivery-status";

const VALID = new Set<string>(FULFILLMENT_STATUSES.map((s) => s.value));

export async function updateFulfillmentStatus(id: number, status: string): Promise<{ ok: boolean }> {
  const admin = await getAdminUser();
  if (!admin || !VALID.has(status)) return { ok: false };

  const payload = await getPayloadClient();
  await payload.update({ collection: "category-selections", id, data: { fulfillmentStatus: status as FulfillmentStatus } });
  revalidatePath("/admin-tools/deliveries");
  return { ok: true };
}
