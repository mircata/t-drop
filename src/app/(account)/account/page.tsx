import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DropColumns, type DropColumn } from "@/components/account/drop-columns";
import { UpgradeDialog } from "@/components/account/upgrade-dialog";
import type { UpgradePlan } from "@/components/account/upgrade-chooser";
import { DropPicker } from "@/components/forms/drop-picker";
import { AccountTabs } from "@/components/site/account-tabs";
import { CartSheet, type CartSlot } from "@/components/site/signup-cart";
import { SizeChart } from "@/components/site/size-chart";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { downgradeAllowedFrom, planForSlot, shirtCountFor } from "@/lib/account-drop";
import { getCustomer } from "@/lib/auth";
import { FULFILLMENT_STATUS_LABELS } from "@/lib/delivery-status";
import { euro } from "@/lib/money";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { planPriceCents } from "@/lib/plan-price";
import { SHIRT_GENDER_LABELS, SHIRT_SIZE_LABELS } from "@/lib/shirt-options";
import { stripeEnabled } from "@/lib/stripe";
import { dropMonth, isDropLocked, nextDeliveryDate } from "@/lib/stripe-sync";
import type { CategorySelection } from "@/payload-types";

export const metadata: Metadata = { title: "Акаунт – T-Drop Monthly T-Shirts" };

/** Whole days from now until midnight (UTC) of the given date. */
const daysUntil = (date: Date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));

const MONTH_NAMES = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];
/** "2026-09" -> "септември" */
const monthName = (ym: string) => MONTH_NAMES[Number(ym.slice(5, 7)) - 1] ?? ym;

const sectionLabel = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868]";
const bigRed = "font-headline text-[72px] uppercase leading-[1.12] text-t-red max-lg:text-[32px]";
const underlineLink = "w-fit font-dot text-[16px] leading-[normal] text-[#212121] underline";

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/**
 * /account, the "Дроп" tab — Figma "ДРОП page states V2" (2026-09-27): the dashboard for a
 * package of one, two or four shirts.
 *
 * Two states, both chosen in the URL:
 *
 * - **dashboard** (`549:144` Базов, `549:789` Фен): the last delivered order, then
 *   "ПРЕДСТОЯЩ ДРОП" with the package name, the shirt picked in the columns below shown
 *   large with its size and gender, and the four columns — the package's shirts, then an
 *   upgrade offer for each slot past it. `?slot=N` picks the shirt shown.
 * - **picker** (`549:280`, `549:1264`, `549:1513`): "ИЗБЕРИ ДИЗАЙН" and the design picker
 *   for one shirt, with the package's shirts inside the card. `?choose=N` opens it for shirt
 *   N; it is also what a customer with no pick yet this month sees.
 *
 * `?upgrade=1` / `?upgrade=confirm&plan=<id>` lay the package change popup over either.
 */
export default async function AccountPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [customer, params] = await Promise.all([getCustomer(), searchParams]);
  if (!customer) redirect("/login");

  const payload = await getPayloadClient();
  const site = await payload.findGlobal({ slug: "site", depth: 0 });
  const month = dropMonth(site.deliveryDay);
  // The next PHYSICAL delivery's own month — unlike `month` above, this does not skip ahead
  // during week 4, so it only counts a pick as delivered once its own delivery has happened.
  const nextDelivery = nextDeliveryDate(site.deliveryDay);
  const deliveredThroughMonth = `${nextDelivery.getUTCFullYear()}-${String(nextDelivery.getUTCMonth() + 1).padStart(2, "0")}`;

  const [subs, categories, picks, earlier, plans] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, sort: "-createdAt", depth: 1, limit: 10 }),
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", depth: 1, limit: 20 }),
    payload.find({ collection: "category-selections", where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }] }, sort: "slot", depth: 2, limit: 10 }),
    payload.find({ collection: "category-selections", where: { and: [{ customer: { equals: customer.id } }, { month: { less_than: deliveredThroughMonth } }] }, sort: ["-month", "slot"], depth: 2, limit: 10 }),
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", depth: 1, limit: 10 }),
  ]);

  /* Same rule as before the redesign: anything but a lapsed or unpaid subscription. */
  const activeSub = subs.docs.find((s) => !["canceled", "unpaid", "past_due", "incomplete"].includes(s.status)) ?? null;
  const hasActive = Boolean(activeSub);
  const plan = activeSub && typeof activeSub.plan === "object" ? activeSub.plan : null;
  const shirtCount = activeSub ? shirtCountFor(activeSub, month) : 1;
  const locked = isDropLocked(site.deliveryDay);
  const daysLeft = daysUntil(nextDelivery);

  /* The last delivered order: every shirt of the latest month before the next delivery. */
  const previousMonth = earlier.docs[0]?.month ?? null;
  const previous = earlier.docs.filter((p) => p.month === previousMonth);

  const categoryOf = (p: CategorySelection | undefined) => (p && typeof p.category === "object" ? p.category : null);
  const imageOf = (p: CategorySelection | undefined) => {
    const c = categoryOf(p);
    return c && typeof c.image === "object" && c.image?.url ? c.image.url : null;
  };
  const pickFor = (slot: number) => picks.docs.find((p) => p.slot === slot);
  const slots: CartSlot[] = Array.from({ length: shirtCount }, (_, i) => {
    const p = pickFor(i + 1);
    return { slot: i + 1, categoryName: categoryOf(p)?.name ?? null, image: imageOf(p), size: p?.size ?? null, gender: p?.gender ?? null };
  });
  const pickedSlots = slots.filter((s) => s.categoryName);

  const inRange = (v: string | undefined) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= shirtCount ? n : null;
  };
  const chooseSlot = inRange(one(params.choose));
  const picking = hasActive && (chooseSlot != null || pickedSlots.length === 0);
  const activeSlot = picking
    ? (chooseSlot ?? slots.find((s) => !s.categoryName)?.slot ?? 1)
    : (inRange(one(params.slot)) && pickFor(inRange(one(params.slot))!) ? inRange(one(params.slot))! : (pickedSlots[0]?.slot ?? 1));
  const shown = pickFor(activeSlot);
  const shownCategory = categoryOf(shown);

  /* The picker opens on this shirt's own pick, else the customer's previous choice. */
  const lastSub = subs.docs[0];
  const defaultSize = shown?.size ?? pickedSlots[0]?.size ?? previous[0]?.size ?? lastSub?.size ?? null;
  const defaultGender = shown?.gender ?? pickedSlots[0]?.gender ?? previous[0]?.gender ?? lastSub?.gender ?? null;

  /* Four columns: the package's shirts, then the smallest package that covers each slot
     past it (an upgrade offer), and nothing where no package does. */
  const columns: DropColumn[] = [1, 2, 3, 4].flatMap((n): DropColumn[] => {
    if (n <= shirtCount) return [{ kind: "shirt", shirt: slots[n - 1] }];
    const offer = planForSlot(plans.docs, n);
    return offer && plan && offer.shirtCount > plan.shirtCount ? [{ kind: "upgrade", slot: n, planName: offer.name }] : [];
  });

  /* The package change popup. */
  const upgradeStep = one(params.upgrade);
  const showUpgrade = hasActive && plan && (upgradeStep === "1" || upgradeStep === "confirm");
  const upgradePlans: UpgradePlan[] = showUpgrade
    ? await Promise.all(
        plans.docs.map(async (p) => ({
          id: p.id,
          name: p.name,
          shirtCount: p.shirtCount,
          price: euro(await planPriceCents(p)),
          image: typeof p.image === "object" && p.image?.url ? p.image.url : null,
          recommended: p.badge === "recommended",
        })),
      )
    : [];
  const lockedUntil = downgradeAllowedFrom(activeSub?.lastUpgradeAt);
  const downgradeLockedUntil =
    lockedUntil && lockedUntil > new Date() ? lockedUntil.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : null;
  const confirmPlan = upgradePlans.find((p) => p.id === Number(one(params.plan))) ?? null;
  const offeredFromTile = plan ? planForSlot(plans.docs.filter((p) => p.shirtCount > plan.shirtCount), plan.shirtCount + 1) : null;

  const picked = one(params.picked);
  const changed = one(params.changed);

  return (
    <section className="site-container pt-[45px] pb-[60px] max-md:px-5">
      <SubscriptionStatusBar hasActive={hasActive} hasStripeCustomer={stripeEnabled() && !!customer.stripeCustomerId} />
      <div className="mt-[30px]">
        <AccountTabs />
      </div>

      {changed && plan ? (
        <p role="status" className="mt-[20px] font-dot text-[18px] text-[#1faa3d]">
          Пакетът ти е сменен на {plan.name}.
        </p>
      ) : null}

      {hasActive && previous.length > 0 && previousMonth ? <PreviousDrop picks={previous} month={previousMonth} imageOf={imageOf} /> : null}

      {!hasActive && (
        <div className="mt-[41px] flex min-h-[400px] flex-col items-center justify-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center max-md:min-h-0">
          <p className="font-body text-[32px] uppercase text-t-black">Абонамента ви е неактивен</p>
          <p className="max-w-[1008px] text-[16px] text-t-black">
            Моля проверете метода на плащане или се свържете с нас директно за повече информация:{" "}
            <a href="mailto:office@t-drop.net" className="underline">office@t-drop.net</a>
          </p>
        </div>
      )}

      {hasActive && !picking && shown && shownCategory && plan ? (
        <div className="mt-[65px] max-lg:mt-[40px]">
          <p className={sectionLabel}>Предстоящ дроп</p>
          {/* 72px on desktop, 15.7px under the label — `549:964`. */}
          <h2 className={`mt-[15.7px] ${bigRed}`}>{plan.name}</h2>

          {picked === "ok" ? (
            <p role="status" className="mt-[15px] font-dot text-[18px] text-[#1faa3d]">
              Изборът ти е записан.
            </p>
          ) : null}

          {/* The shirt picked below, large: 592.5×566px picture, then a 494px column 42px
              to its right with a 30px rhythm — `549:902`. */}
          <div className="mt-[37px] flex flex-row items-start gap-[42px] max-lg:mt-[25px] max-lg:flex-col max-lg:gap-[25px]">
            <div className="relative aspect-[592.5/566.2] w-[46.3%] shrink-0 overflow-hidden rounded-[12.49px] bg-[#f5f5f5] max-lg:w-full">
              {imageOf(shown) ? <Image src={imageOf(shown)!} alt={shownCategory.name} fill sizes="(max-width: 1024px) 100vw, 593px" className="object-cover" /> : null}
            </div>
            <div className="flex w-[494px] max-w-full flex-col gap-[30px]">
              <div className="flex flex-col">
                <p className={sectionLabel}>Избрана категория</p>
                <p className={`${bigRed} max-lg:text-[40px]`}>{shownCategory.name}</p>
                {/* The three links are annotated *"this leads to the design select page"*. */}
                {!locked ? (
                  <Link href={`/account?choose=${activeSlot}#drop`} className={underlineLink}>
                    Избери друг дизайн
                  </Link>
                ) : null}
              </div>
              <div className="flex flex-col gap-[15px]">
                <p className={sectionLabel}>Размер: {shown.size ? SHIRT_SIZE_LABELS[shown.size] : "—"}</p>
                {!locked ? (
                  <Link href={`/account?choose=${activeSlot}#drop`} className={underlineLink}>
                    Промени
                  </Link>
                ) : null}
              </div>
              <div className="flex flex-col gap-[15px]">
                <p className={sectionLabel}>Пол: {shown.gender ? SHIRT_GENDER_LABELS[shown.gender] : "—"}</p>
                {!locked ? (
                  <Link href={`/account?choose=${activeSlot}#drop`} className={underlineLink}>
                    Промени
                  </Link>
                ) : null}
              </div>
              {/* The frames' English placeholder list, in Bulgarian (owner, 2026-09-27), with
                  the package's own shirt count. */}
              <div className="font-dot text-[16px] leading-[normal] text-[#212121]">
                <p>{plan.shirtCount === 1 ? "1 тениска" : `${plan.shirtCount} тениски`}</p>
                <p>безплатна доставка</p>
                <p>100% памук</p>
                <p>Нов дизайн всеки месец</p>
                <p>Проектирани, отпечатани и доставени в България</p>
              </div>
              <div className="flex h-[91px] flex-col items-center justify-center gap-[10px] rounded-[20px] border-3 border-dashed border-black p-5 text-center">
                <p className="font-dot text-[16px] leading-[normal] text-t-black">Оставащи дни до пратка</p>
                <p className="font-dot text-[32px] uppercase leading-[normal] text-t-black">{daysLeft} дни</p>
              </div>
            </div>
          </div>

          <div className="mt-[76px] max-lg:mt-[40px]">
            <DropColumns columns={columns} activeSlot={activeSlot} locked={locked} selectHref="/account?slot=" />
          </div>
        </div>
      ) : null}

      {picking ? (
        <div id="drop" className="mt-[83px] max-lg:mt-[40px]">
          <p className={sectionLabel}>Избери предстоящ дроп</p>
          <h2 className={`mt-[10px] ${bigRed}`}>Избери дизайн</h2>
          {picked === "missing" && <p className="mt-[15px] font-dot text-[18px] text-t-red">Избери една от темите.</p>}
          {picked === "locked" && <p className="mt-[15px] font-dot text-[18px] text-t-red">Остават по-малко от 3 седмици до доставката — изборът за този дроп е затворен.</p>}
          <div className="mt-[33px]">
            <DropPicker
              key={activeSlot}
              categories={categories.docs.map((c) => ({ id: c.id, name: c.name, image: mediaUrl(c.image, "") }))}
              slot={activeSlot}
              pickedId={shownCategory?.id ?? null}
              locked={locked}
              defaultSize={defaultSize}
              defaultGender={defaultGender}
              sizeChart={<SizeChart id={null} />}
              strip={
                shirtCount > 1 ? (
                  <DropColumns columns={slots.map((s) => ({ kind: "shirt" as const, shirt: s }))} activeSlot={activeSlot} locked={locked} selectHref="/account?choose=" />
                ) : undefined
              }
            />
          </div>
          <div className="mt-[40px] flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center">
            <p className="font-body text-[32px] uppercase text-t-black">Срок за избор на дизайн</p>
            <p className="max-w-[1008px] text-[16px] text-t-black">
              Можете да изберете дизайн най-късно 3 седмици преди датата на доставка. В случай че не изберете модел ще ви доставим дизайн по наш избор.
            </p>
          </div>
          {shirtCount > 1 ? <CartSheet slots={slots} activeSlot={activeSlot} editHref="/account?choose=" /> : null}
        </div>
      ) : null}

      {showUpgrade && plan ? (
        <UpgradeDialog
          step={upgradeStep === "confirm" && confirmPlan ? "confirm" : "choose"}
          plans={upgradePlans}
          currentPlanId={plan.id}
          preselectId={offeredFromTile?.id ?? null}
          confirmPlan={confirmPlan}
          error={one(params.error)}
          downgradeLockedUntil={downgradeLockedUntil}
        />
      ) : null}
    </section>
  );
}

/**
 * The last delivered order — `554:3337`: a 115px dashed cream strip with one thumbnail per
 * shirt (annotated *"depending on the subscription package it has to shown 1,2,3,4
 * thumbnails of previous order"*), the month and the delivery status, and the frame's empty
 * 268px at the right end.
 */
function PreviousDrop({ picks, month, imageOf }: { picks: CategorySelection[]; month: string; imageOf: (p: CategorySelection) => string | null }) {
  const cell = "flex w-[182px] flex-col gap-[5px] font-headline uppercase leading-[1.12] text-black max-lg:w-auto";
  const status = picks[0]?.fulfillmentStatus ?? "delivered";
  return (
    <div className="mt-[46px] flex min-h-[115px] items-center justify-between gap-[20px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-[17px] py-[13px] max-lg:mt-[30px] max-lg:flex-wrap">
      <div className="flex items-center gap-[20px] max-lg:w-full max-lg:gap-[10px]">
        {picks.map((p) => (
          <div key={p.id} className="relative h-[83.57px] w-[87.45px] shrink-0 overflow-hidden rounded-[10px] bg-[#f5f5f5] max-lg:h-[60px] max-lg:w-[63px]">
            {imageOf(p) ? <Image src={imageOf(p)!} alt="" fill sizes="88px" className="object-cover" /> : null}
          </div>
        ))}
      </div>
      <div className={cell}>
        <p className="text-[12px] tracking-[0.96px] opacity-40">Месец</p>
        <p className="text-[18px] tracking-[1.44px]">{monthName(month)}</p>
      </div>
      <div className={cell}>
        <p className="text-[12px] tracking-[0.96px] opacity-40">Статус</p>
        <p className="text-[18px] tracking-[1.44px]">{FULFILLMENT_STATUS_LABELS[status] ?? "Доставено"}</p>
      </div>
      <div className="w-[268px] max-lg:hidden" aria-hidden="true" />
    </div>
  );
}
