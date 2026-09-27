import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/site/account-tabs";
import { OrderHistoryTable, type OrderRow } from "@/components/site/order-history-table";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";
import type { CartSlot } from "@/components/site/signup-cart";

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

  /* Every shirt picked for a payment's month — the popup lists them all, and the table's
     Категория column names them in slot order (the query sorts by month, then slot). */
  const shirtsByMonth = new Map<string, CartSlot[]>();
  for (const pick of picks.docs) {
    const category = typeof pick.category === "object" ? pick.category : null;
    const list = shirtsByMonth.get(pick.month) ?? [];
    list.push({
      slot: pick.slot ?? list.length + 1,
      categoryName: category?.name ?? null,
      image: category ? mediaUrl(category.image, "") || null : null,
      size: pick.size ?? null,
      gender: pick.gender ?? null,
    });
    shirtsByMonth.set(pick.month, list);
  }

  const rows: OrderRow[] = payments.docs.map((p) => ({
    id: p.id,
    date: formatDate(p.paidAt ?? p.createdAt),
    status: STATUS_LABELS[p.status] ?? p.status,
    shirts: shirtsByMonth.get(ymOf(p.paidAt ?? p.createdAt)) ?? [],
  }));

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
