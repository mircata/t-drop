import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/site/account-tabs";
import { OrderHistoryTable, type OrderRow } from "@/components/site/order-history-table";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";
import type { CategorySelection } from "@/payload-types";

export const metadata: Metadata = { title: "История поръчки – T-Drop Monthly T-Shirts" };

/* Same labels as the "Статус" select in src/collections/Payments.ts, so /admin and /account agree. */
const STATUS_LABELS: Record<string, string> = {
  paid: "Платено",
  pending: "Чака",
  failed: "Неуспешно",
  refunded: "Възстановено",
};

const formatDate = (value: string) => {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};
/** "2026-09-16T..." -> "2026-09", to match a payment to the month's design pick. */
const ymOf = (iso: string) => iso.slice(0, 7);

export default async function OrdersPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/login");

  const payload = await getPayloadClient();
  const [subs, payments, picks] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, depth: 0, limit: 10 }),
    payload.find({ collection: "payments", where: { customer: { equals: customer.id } }, sort: "-paidAt", depth: 0, limit: 50 }),
    payload.find({ collection: "category-selections", where: { customer: { equals: customer.id } }, sort: ["month", "slot"], depth: 2, limit: 200 }),
  ]);
  const hasActive = subs.docs.some((s) => !["canceled", "unpaid", "past_due", "incomplete"].includes(s.status));

  /* One category per month for the Категория column. A month can now hold up to four
     picks, so this keeps the first by slot rather than the last one the map happened to
     see; showing every shirt of a multi-shirt order is stage 2 of the redesign
     (docs/new-user-flow.md). The query above sorts by month then slot, so the first entry
     for a month is slot 1. */
  type PickedCategory = Exclude<CategorySelection["category"], number>;
  const pickByMonth = new Map<string, PickedCategory>();
  for (const pick of picks.docs) {
    if (typeof pick.category !== "object" || pickByMonth.has(pick.month)) continue;
    pickByMonth.set(pick.month, pick.category);
  }

  const rows: OrderRow[] = payments.docs.map((p) => {
    const category = pickByMonth.get(ymOf(p.paidAt ?? p.createdAt));
    return {
      id: p.id,
      date: formatDate(p.paidAt ?? p.createdAt),
      status: STATUS_LABELS[p.status] ?? p.status,
      categoryName: category?.name ?? null,
      categoryImage: category ? mediaUrl(category.image, "") || null : null,
    };
  });

  return (
    <section className="site-container pt-[45px] pb-[60px] max-md:px-5">
      <SubscriptionStatusBar hasActive={hasActive} hasStripeCustomer={stripeEnabled() && !!customer.stripeCustomerId} />
      <div className="mt-[30px]">
        <AccountTabs />
      </div>

      <p className="mt-[30px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">История</p>

      {rows.length === 0 ? <p className="mt-[15px] text-[16px] text-t-black">Все още нямаш поръчки.</p> : <OrderHistoryTable rows={rows} />}
    </section>
  );
}
