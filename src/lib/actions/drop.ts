"use server";

import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { dropMonth, isDropLocked } from "@/lib/stripe-sync";

/**
 * The "Следващ дроп" form on /my-account. Stores one pick per customer per
 * month; a new pick before the drop date replaces the old one. After the drop
 * date the pick is locked until the owner sets the next date in /admin.
 */
export async function pickCategory(formData: FormData) {
  const customer = await getCustomer();
  if (!customer) redirect("/your-profile");

  const categoryId = Number(formData.get("drop") ?? 0);
  if (!categoryId) redirect("/my-account?picked=missing#drop");

  const payload = await getPayloadClient();
  const [site, category] = await Promise.all([
    payload.findGlobal({ slug: "site", depth: 0 }),
    payload.findByID({ collection: "categories", id: categoryId }).catch(() => null),
  ]);
  if (!category?.active) redirect("/my-account?picked=missing#drop");
  if (isDropLocked(site.nextDropDate)) redirect("/my-account?picked=locked#drop");

  const month = dropMonth(site.nextDropDate);
  const existing = await payload.find({
    collection: "category-selections",
    where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }] },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({ collection: "category-selections", id: existing.docs[0].id, data: { category: category.id } });
  } else {
    await payload.create({ collection: "category-selections", data: { customer: customer.id, month, category: category.id } });
  }
  redirect("/my-account?picked=ok#drop");
}
