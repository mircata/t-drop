"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const CARRIERS = new Set(["speedy", "sameday", "boxnow"]);

export type FormState = { error?: string; ok?: boolean };

/** Доставка form on /account/address: recipient name, postcode, carrier, exact address or courier office. */
export async function updateShipping(_prev: FormState, fd: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) redirect("/register");

  const recipientName = str(fd, "recipientName");
  const postcode = str(fd, "postcode");
  const carrier = str(fd, "carrier");
  const addressOrOffice = str(fd, "addressOrOffice");
  if (!recipientName || !postcode || !CARRIERS.has(carrier) || !addressOrOffice) {
    return { error: "Попълни всички полета." };
  }

  const payload = await getPayloadClient();
  await payload.update({
    collection: "customers",
    id: customer.id,
    data: { shipping: { recipientName, postcode, carrier: carrier as "speedy" | "sameday" | "boxnow", addressOrOffice } },
  });
  revalidatePath("/account/address");
  return { ok: true };
}
