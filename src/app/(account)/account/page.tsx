import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DropPicker } from "@/components/forms/drop-picker";
import { AccountTabs } from "@/components/site/account-tabs";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getCustomer } from "@/lib/auth";
import { FULFILLMENT_STATUS_LABELS } from "@/lib/delivery-status";
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
  // The picker starts on the customer's own previous choice (this month's pick, then
  // last delivered pick, then the checkout defaults), per the design's annotation.
  const defaultSize = pick?.size ?? previousPick?.size ?? lastSub?.size ?? null;
  const defaultGender = pick?.gender ?? previousPick?.gender ?? lastSub?.gender ?? null;
  const sectionLabel = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868]";
  const bigName = "font-headline text-[72px] uppercase leading-[1.12] text-t-red max-md:text-[40px]";
  const pickName = "font-headline text-[48px] uppercase leading-[1.12] text-t-red whitespace-nowrap max-md:whitespace-normal max-md:text-[36px]";

  return (
    <section className="site-container pt-[45px] pb-[60px] max-md:px-5">
      <SubscriptionStatusBar hasActive={hasActive} hasStripeCustomer={stripeEnabled() && !!customer.stripeCustomerId} />
      <div className="mt-[30px]">
        <AccountTabs />
      </div>

      {hasActive && previousCategory && (
        <div className="mt-[30px]">
          <p className={`mb-[15px] ${sectionLabel}`}>Преден дроп</p>
          <div className="flex min-h-[115px] items-center justify-between gap-[20px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-[16px] max-md:flex-col max-md:items-start">
            <div className="relative h-[84px] w-[87px] shrink-0 overflow-hidden rounded-[10px] bg-t-grey">
              {typeof previousCategory.image === "object" && previousCategory.image?.url && (
                <Image src={previousCategory.image.url} alt={previousCategory.name} fill sizes="87px" className="object-cover" />
              )}
            </div>
            <div className="flex w-[212px] flex-col gap-[5px] font-headline uppercase leading-[1.12] max-md:w-auto">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Избрана категория</p>
              <p className="text-[18px] tracking-[1.44px] text-black">{previousCategory.name}</p>
            </div>
            <div className="flex w-[182px] flex-col gap-[5px] font-headline uppercase leading-[1.12] max-md:w-auto">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Месец</p>
              <p className="text-[18px] tracking-[1.44px] text-black">{monthName(previousPick.month)}</p>
            </div>
            <div className="flex w-[182px] flex-col gap-[5px] font-headline uppercase leading-[1.12] max-md:w-auto">
              <p className="text-[12px] tracking-[0.96px] text-black opacity-40">Статус</p>
              <p className="text-[18px] tracking-[1.44px] text-black">{FULFILLMENT_STATUS_LABELS[previousPick.fulfillmentStatus ?? ""] ?? "Доставено"}</p>
            </div>
            {/* Empty slot the design keeps at the right end, so the three columns sit left of centre. */}
            <div className="w-[268px] max-lg:hidden" aria-hidden="true" />
          </div>
        </div>
      )}

      {!hasActive && (
        <div className="mt-[41px] flex min-h-[400px] flex-col items-center justify-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center max-md:min-h-0">
          <p className="font-body text-[32px] uppercase text-t-black">Абонамента ви е неактивен</p>
          <p className="max-w-[1008px] text-[16px] text-t-black">
            Моля проверете метода на плащане или се свържете с нас директно за повече информация:{" "}
            <a href="mailto:office@t-drop.net" className="underline">office@t-drop.net</a>
          </p>
        </div>
      )}

      {hasActive && !showPicker && pickedCategory && (
        <div className={previousCategory ? "mt-[56px] max-md:mt-10" : "mt-[30px]"}>
          <p className={`mb-[23px] ${sectionLabel}`}>Предстоящ дроп</p>
          {/* Two layouts from the design: while the pick can still change, a larger image
              and a narrow column with a "Промени" link under size and under gender; once
              locked, a smaller image and a wider column with size and gender on one row. */}
          <div className={`flex max-md:flex-col ${locked ? "gap-[71px] max-lg:gap-10" : "gap-[42px]"}`}>
            <div
              className={`relative shrink-0 overflow-hidden rounded-[29px] bg-t-grey max-md:w-full ${
                locked ? "aspect-[499/477] w-[39%]" : "aspect-[593/566] w-[46%]"
              }`}
            >
              {typeof pickedCategory.image === "object" && pickedCategory.image?.url && (
                <Image src={pickedCategory.image.url} alt={pickedCategory.name} fill sizes="(max-width: 768px) 100vw, 46vw" className="object-cover" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[30px]">
              <div>
                <p className={sectionLabel}>Избрана категория</p>
                <p className={pickName}>{pickedCategory.name}</p>
                {!locked && (
                  <Link href="/account?choose=1" className="font-body text-[16px] text-t-black underline">Избери друг дизайн</Link>
                )}
              </div>
              {locked ? (
                <div className="flex gap-5">
                  {pick?.size && <p className={`flex-1 ${sectionLabel}`}>Размер: {SIZE_LABELS[pick.size]}</p>}
                  {pick?.gender && <p className={`flex-1 ${sectionLabel}`}>Пол: {GENDER_LABELS[pick.gender]}</p>}
                </div>
              ) : (
                <>
                  {pick?.size && (
                    <div className="flex flex-col items-start gap-[15px]">
                      <p className={sectionLabel}>Размер: {SIZE_LABELS[pick.size]}</p>
                      <Link href="/account?choose=1" className="font-body text-[16px] text-t-black underline">Промени</Link>
                    </div>
                  )}
                  {pick?.gender && (
                    <div className="flex flex-col items-start gap-[15px]">
                      <p className={sectionLabel}>Пол: {GENDER_LABELS[pick.gender]}</p>
                      <Link href="/account?choose=1" className="font-body text-[16px] text-t-black underline">Промени</Link>
                    </div>
                  )}
                </>
              )}
              <div className="text-[16px] text-t-black">
                <p>1 t-shirt</p>
                <p>free delivery</p>
                <p>100% cotton</p>
                <p>Monthly Tee Picker</p>
                <p>Designed, printed and delivered in Bulgaria</p>
              </div>
              <div className={`flex flex-col items-center justify-center gap-[10px] rounded-[20px] border-3 border-dashed border-black p-5 text-center ${locked ? "min-h-[152px]" : "min-h-[91px] max-w-[494px]"}`}>
                <p className="text-[16px] text-t-black">Оставащи дни до пратка</p>
                <p className="font-body text-[32px] uppercase text-t-black">{daysLeft} дни</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasActive && showPicker && (
        <div className={`flex flex-col gap-[40px] ${previousCategory ? "mt-[56px] max-md:mt-10" : "mt-[30px]"}`}>
          <div>
            {picked === "missing" && <p className="mb-[15px] text-t-red">Избери една от темите.</p>}
            {picked === "locked" && <p className="mb-[15px] text-t-red">Остават по-малко от 3 седмици до доставката — изборът за този дроп е затворен.</p>}
            {picked === "ok" && <p className="mb-[15px] text-[#1faa3d]">Изборът ти е записан.</p>}
            <p className={sectionLabel}>Избери предстоящ дроп</p>
            <p className={`mt-[10px] ${bigName}`}>Изберете от тук</p>
            <div className="mt-[33px]">
              <DropPicker
                categories={categories.docs.map((c) => ({ id: c.id, name: c.name, image: mediaUrl(c.image, "") }))}
                pickedId={pickedCategory?.id ?? null}
                locked={locked}
                defaultSize={defaultSize}
                defaultGender={defaultGender}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center">
            <p className="font-body text-[32px] uppercase text-t-black">Срок за избор на дизайн</p>
            <p className="max-w-[1008px] text-[16px] text-t-black">Можете да изберете дизайн най-късно 3 седмици преди датата на доставка. В случай че не изберете модел ще ви доставим дизайн по наш избор.</p>
          </div>
        </div>
      )}
    </section>
  );
}
