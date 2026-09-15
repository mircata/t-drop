import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { dropMonth } from "@/lib/stripe-sync";
import { FULFILLMENT_STATUSES } from "@/lib/delivery-status";
import { DeliveryStatusSelect } from "@/components/admin-tools/delivery-status-select";

export const metadata: Metadata = { title: "Доставки – T-Drop staff" };

const th = "px-3 py-2 text-left font-headline text-[13px] uppercase tracking-wide text-[#666]";
const td = "px-3 py-2 font-dot text-[15px] text-[#212121] align-top";

export default async function DeliveriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin");

  const { month: monthParam } = await searchParams;
  const payload = await getPayloadClient();
  const site = await payload.findGlobal({ slug: "site", depth: 0 });

  const allMonths = await payload.find({ collection: "category-selections", sort: "-month", depth: 0, limit: 2000, select: { month: true } });
  const months = Array.from(new Set(allMonths.docs.map((d) => d.month))).sort().reverse();
  const currentTarget = dropMonth(site.deliveryDay);
  if (!months.includes(currentTarget)) months.unshift(currentTarget);
  const month = typeof monthParam === "string" && months.includes(monthParam) ? monthParam : currentTarget;

  const picks = await payload.find({
    collection: "category-selections",
    where: { month: { equals: month } },
    sort: "customer",
    depth: 2,
    limit: 1000,
  });

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 font-roboto text-[14px] text-[#666] hover:text-t-red">
        <svg viewBox="0 0 16 16" className="size-[14px]" aria-hidden="true"><path d="M10 2 4 8l6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Назад към Admin
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-[26px] uppercase tracking-[0.5px]">Доставки</h1>
          <p className="font-roboto text-[14px] text-[#666]">Кой какво получава, за печат/спедиция. {picks.docs.length} поръчки за {month}.</p>
        </div>
        <div className="flex items-end gap-3">
          <form className="flex items-end gap-2">
            <div>
              <label className="mb-1 block font-roboto text-[12px] text-[#666]">Месец</label>
              <select name="month" defaultValue={month} className="rounded border border-[#ccc] bg-white px-3 py-2 font-roboto text-[14px]">
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded border border-[#ccc] bg-white px-3 py-2 font-roboto text-[14px] hover:bg-[#f0f0f0]">
              Приложи
            </button>
          </form>
          <a
            href={`/admin-tools/deliveries/export?month=${month}`}
            className="rounded bg-[#cc0e45] px-4 py-2 font-roboto text-[14px] font-semibold text-white hover:bg-[#a80b39]"
          >
            Export CSV
          </a>
        </div>
      </div>

      {picks.docs.length === 0 ? (
        <p className="text-[14px] text-[#666]">Няма поръчки за {month}.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-[#ddd] bg-white">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead>
              <tr className="border-b border-[#ddd] bg-[#fafafa]">
                <th className={th}>Клиент</th>
                <th className={th}>Телефон</th>
                <th className={th}>Получател</th>
                <th className={th}>ПК</th>
                <th className={th}>Спедитор</th>
                <th className={th}>Адрес / офис</th>
                <th className={th}>Категория</th>
                <th className={th}>Размер</th>
                <th className={th}>Пол</th>
                <th className={th}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {picks.docs.map((p) => {
                const customer = typeof p.customer === "object" ? p.customer : null;
                const category = typeof p.category === "object" ? p.category : null;
                const shipping = customer?.shipping ?? {};
                return (
                  <tr key={p.id} className="border-b border-[#eee] last:border-0">
                    <td className={td}>{customer?.name ?? "—"}</td>
                    <td className={td}>{customer?.phone ?? "—"}</td>
                    <td className={td}>{shipping.recipientName ?? "—"}</td>
                    <td className={td}>{shipping.postcode ?? "—"}</td>
                    <td className={td}>{shipping.carrier ?? "—"}</td>
                    <td className={td}>{shipping.addressOrOffice ?? "—"}</td>
                    <td className={td}>{category?.name ?? "—"}</td>
                    <td className={td}>{p.size?.toUpperCase() ?? "—"}</td>
                    <td className={td}>{p.gender === "male" ? "Мъж" : p.gender === "female" ? "Жена" : "—"}</td>
                    <td className={td}>
                      <DeliveryStatusSelect id={p.id} status={p.fulfillmentStatus ?? "preparing"} options={FULFILLMENT_STATUSES} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
