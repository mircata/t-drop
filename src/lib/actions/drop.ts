"use server";

import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
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
 */
export async function pickCategory(formData: FormData) {
  const customer = await getCustomer();
  if (!customer) redirect("/register");

  const categoryId = Number(formData.get("drop") ?? 0);
  const size = String(formData.get("size") ?? "");
  const gender = String(formData.get("gender") ?? "");
  if (!categoryId || !SIZES.has(size) || !GENDERS.has(gender)) redirect("/account?picked=missing#drop");

  const payload = await getPayloadClient();
  const [site, category] = await Promise.all([
    payload.findGlobal({ slug: "site", depth: 0 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
  ]);
  if (!category?.active) redirect("/account?picked=missing#drop");
  if (isDropLocked(site.deliveryDay)) redirect("/account?picked=locked#drop");

  const month = dropMonth(site.deliveryDay);
  const existing = await payload.find({
    collection: "category-selections",
    where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }] },
    limit: 1,
  });
  const sizeGender = { size: size as Size, gender: gender as Gender };
  if (existing.docs[0]) {
    await payload.update({ collection: "category-selections", id: existing.docs[0].id, data: { category: category.id, ...sizeGender } });
  } else {
    await payload.create({ collection: "category-selections", data: { customer: customer.id, month, category: category.id, ...sizeGender } });
  }
  redirect("/account?picked=ok#drop");
}
