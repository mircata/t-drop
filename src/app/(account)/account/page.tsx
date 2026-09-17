import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DropPicker } from "@/components/forms/drop-picker";
import { AccountTabs } from "@/components/site/account-tabs";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";
import { dropMonth, isDropLocked, nextDeliveryDate } from "@/lib/stripe-sync";

export const metadata: Metadata = { title: "Акаунт – T-Drop Monthly T-Shirts" };

/** Whole days from now until midnight (UTC) of the given date. */
const daysUntil = (date: Date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));

const MONTH_NAMES = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];
/** "2026-09" -> "септември" */
const monthName = (ym: string) => MONTH_NAMES[Number(ym.slice(5, 7)) - 1] ?? ym;

const SIZE_LABELS: Record<string, string> = { s: "S", m: "M", l: "L", xl: "XL" };
const GENDER_LABELS: Record<string, string> = { male: "Мъж", female: "Жена" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [customer, { picked, choose }] = await Promise.all([getCustomer(), searchParams]);
  if (!customer) redirect("/login");

  const payload = await getPayloadClient();
  const site = await payload.findGlobal({ slug: "site", depth: 0 });
  const month = dropMonth(site.deliveryDay);
  // The next PHYSICAL delivery's own month — unlike `month` above, this does not
  // skip ahead during week 4, so it only counts a pick as "previous" (delivered)
  // once its own delivery has actually happened. Otherwise a first-time
  // subscriber's still-upcoming pick could wrongly show as an already-delivered
  // "Преден дроп" during week 4.
  const nextDelivery = nextDeliveryDate(site.deliveryDay);
  const deliveredThroughMonth = `${nextDelivery.getUTCFullYear()}-${String(nextDelivery.getUTCMonth() + 1).padStart(2, "0")}`;
  const [subs, categories, picks, previousPicks] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, sort: "-createdAt", depth: 1, limit: 10 }),
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", depth: 1, limit: 20 }),
    payload.find({ collection: "category-selections", where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }] }, depth: 2, limit: 1 }),
    payload.find({ collection: "category-selections", where: { and: [{ customer: { equals: customer.id } }, { month: { less_than: deliveredThroughMonth } }] }, sort: "-month", depth: 2, limit: 1 }),
  ]);
  const active = subs.docs.filter((s) => s.status !== "canceled" && s.status !== "unpaid" && s.status !== "past_due" && s.status !== "incomplete");
  const hasActive = active.length > 0;
  const pick = picks.docs[0];
  const pickedCategory = pick && typeof pick.category === "object" ? pick.category : null;
  const previousPick = previousPicks.docs[0];
  const previousCategory = previousPick && typeof previousPick.category === "object" ? previousPick.category : null;
  const locked = isDropLocked(site.deliveryDay);
  const showPicker = choose === "1" || !pickedCategory;
  const daysLeft = daysUntil(nextDeliveryDate(site.deliveryDay));
  const lastSub = subs.docs[0];
  const defaultSize = pick?.size ?? lastSub?.size ?? null;
  const defaultGender = pick?.gender ?? lastSub?.gender ?? null;

  return (
    <section className="site-container pt-[45px] pb-[60px] max-md:px-5">
      <SubscriptionStatusBar hasActive={hasActive} hasStripeCustomer={stripeEnabled() && !!customer.stripeCustomerId} />
      <div className="mt-[30px]">
        <AccountTabs />
      </div>

      {hasActive && previousCategory && (
        <div className="mt-[30px]">
          <p className="mb-[15px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Преден дроп</p>
          <div className="flex flex-wrap items-center gap-[20px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-[20px] max-md:flex-col max-md:items-start">
            <div className="relative h-[84px] w-[87px] shrink-0 overflow-hidden rounded-[10px] bg-t-grey">
              {typeof previousCategory.image === "object" && previousCategory.image?.url && (
                <Image src={previousCategory.image.url} alt={previousCategory.name} fill sizes="87px" className="object-cover" />
              )}
            </div>
            <div className="font-headline uppercase">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Избрана категория</p>
              <p className="text-[18px] tracking-[1.44px] text-black">{previousCategory.name}</p>
            </div>
            <div className="font-headline uppercase">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Месец</p>
              <p className="text-[18px] tracking-[1.44px] text-black">{monthName(previousPick.month)}</p>
            </div>
            <div className="font-headline uppercase">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Статус</p>
              <p className="text-[18px] tracking-[1.44px] text-black">Доставено</p>
            </div>
          </div>
        </div>
      )}

      {!hasActive && (
        <div className="mt-[30px] flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center">
          <p className="font-body text-[32px] uppercase text-t-black">Абонамента ви е неактивен</p>
          <p className="text-[16px] text-t-black">
            Моля проверете метода на плащане или се свържете с нас директно за повече информация:{" "}
            <a href="mailto:office@t-drop.net" className="underline">office@t-drop.net</a>. Или{" "}
            <Link href="/join" className="underline">запиши се</Link> за нов абонамент.
          </p>
        </div>
      )}

      {hasActive && !showPicker && pickedCategory && (
        <div className="mt-[30px]">
          <p className="mb-[15px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Предстоящ дроп</p>
          <div className="flex gap-10 max-md:flex-col">
            <div className="relative aspect-[593/566] w-[45%] shrink-0 overflow-hidden rounded-[29px] bg-t-grey max-md:w-full">
              {typeof pickedCategory.image === "object" && pickedCategory.image?.url && (
                <Image src={pickedCategory.image.url} alt={pickedCategory.name} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-[20px]">
              <div>
                <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Избрана категория</p>
                <p className="font-headline text-[48px] uppercase leading-[1.12] text-t-red max-md:text-[36px]">{pickedCategory.name}</p>
                {!locked && (
                  <Link href="/account?choose=1" className="underline">Избери друг дизайн</Link>
                )}
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-[15px]">
                {pick?.size && (
                  <div>
                    <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Размер: {SIZE_LABELS[pick.size]}</p>
                    {!locked && <Link href="/account?choose=1" className="underline">Промени</Link>}
                  </div>
                )}
                {pick?.gender && (
                  <div>
                    <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Пол: {GENDER_LABELS[pick.gender]}</p>
                    {!locked && <Link href="/account?choose=1" className="underline">Промени</Link>}
                  </div>
                )}
              </div>
              <div className="text-[16px] text-t-black">
                <p>1 t-shirt</p>
                <p>free delivery</p>
                <p>100% cotton</p>
                <p>Monthly Tee Picker</p>
                <p>Designed, printed and delivered in Bulgaria</p>
              </div>
              <div className="flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black p-5 text-center">
                <p className="text-[16px] text-t-black">Оставащи дни до пратка</p>
                <p className="font-body text-[32px] uppercase text-t-black">{daysLeft} дни</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasActive && showPicker && (
        <div className="mt-[30px] flex flex-col gap-[30px]">
          {picked === "missing" && <p className="text-t-red">Избери една от темите.</p>}
          {picked === "locked" && <p className="text-t-red">Остават по-малко от 3 седмици до доставката — изборът за този дроп е затворен.</p>}
          {picked === "ok" && <p className="text-[#1faa3d]">Изборът ти е записан.</p>}
          <div>
            <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">
              {pickedCategory ? "Избери следващ дроп" : "Не сте избрали дизайн за следващия дроп"}
            </p>
            <p className="font-headline text-[48px] uppercase leading-[1.12] text-t-red max-md:text-[32px]">Изберете от тук</p>
          </div>
          <DropPicker
            categories={categories.docs.map((c) => ({ id: c.id, name: c.name, image: mediaUrl(c.image, "") }))}
            pickedId={pickedCategory?.id ?? null}
            locked={locked}
            defaultSize={defaultSize}
            defaultGender={defaultGender}
          />
          <div className="flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] p-5 text-center">
            <p className="font-body text-[32px] uppercase text-t-black">Срок за избор на дизайн</p>
            <p className="text-[16px] text-t-black">Можете да изберете дизайн най-късно 3 седмици преди датата на доставка. В случай че не изберете модел ще ви доставим дизайн по наш избор.</p>
          </div>
        </div>
      )}
    </section>
  );
}
