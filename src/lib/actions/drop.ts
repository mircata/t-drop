"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { shirtCountFor } from "@/lib/account-drop";
import { dropMonth, isDropLocked } from "@/lib/stripe-sync";

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);
type Size = "s" | "m" | "l" | "xl";
type Gender = "male" | "female";

/**
 * The "Следващ дроп" form on /account. Stores one pick per customer per
 * month — design, size and gender together — a new pick before the drop date
 * replaces the old one. After the drop date the pick is locked until the
 * owner sets the next date in /admin.
 *
 * One shirt at a time: the form carries the slot being picked, and it must be one the
 * customer's package has for that month (`shirtCountFor`, which honours a package change
 * that only applies from the next drop).
 */
export async function pickCategory(formData: FormData) {
  const customer = await getCustomer();
  if (!customer) redirect("/login");

  const categoryId = Number(formData.get("drop") ?? 0);
  const size = String(formData.get("size") ?? "");
  const gender = String(formData.get("gender") ?? "");
  const slot = Number(formData.get("slot") ?? 1);
  const back = (q: string) => `/account?choose=${slot}&picked=${q}#drop`;
  if (!categoryId || !SIZES.has(size) || !GENDERS.has(gender)) redirect(back("missing"));

  const payload = await getPayloadClient();
  const [site, category] = await Promise.all([
    payload.findGlobal({ slug: "site", depth: 0 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
  ]);
  if (!category?.active) redirect(back("missing"));
  if (isDropLocked(site.deliveryDay)) redirect(back("locked"));

  const month = dropMonth(site.deliveryDay);
  const subs = await payload.find({
    collection: "subscriptions",
    where: { and: [{ customer: { equals: customer.id } }, { status: { in: ["active", "trialing"] } }] },
    sort: "-createdAt",
    depth: 1,
    limit: 1,
  });
  const sub = subs.docs[0];
  if (!sub || !Number.isInteger(slot) || slot < 1 || slot > shirtCountFor(sub, month)) redirect(back("missing"));
  const existing = await payload.find({
    collection: "category-selections",
    where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }, { slot: { equals: slot } }] },
    limit: 1,
  });
  const sizeGender = { size: size as Size, gender: gender as Gender };
  if (existing.docs[0]) {
    await payload.update({ collection: "category-selections", id: existing.docs[0].id, data: { category: category.id, ...sizeGender } });
  } else {
    await payload.create({ collection: "category-selections", data: { customer: customer.id, month, slot, category: category.id, ...sizeGender } });
  }
  revalidatePath("/account");
  redirect(`/account?slot=${slot}&picked=ok`);
}
