import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupPicker, type Theme } from "@/components/forms/signup-picker";
import { FunnelPage, FunnelPriceBox } from "@/components/site/funnel-page";
import { FunnelUsps } from "@/components/site/funnel-usps";
import { SizeChart } from "@/components/site/size-chart";
import { WashCare } from "@/components/site/wash-care";
import type { CartSlot } from "@/components/site/signup-cart";
import { euro } from "@/lib/money";
import { planPriceCents } from "@/lib/plan-price";
import { MONTHS_BG, getPayloadClient, getSite } from "@/lib/payload";
import { requireDraft } from "@/lib/signup";
import { nextEmptySlot, stepPath } from "@/lib/signup-steps";
import { nextDeliveryDate } from "@/lib/stripe-sync";

export const metadata: Metadata = { title: "Избери дизайн | T-Drop" };

export const dynamic = "force-dynamic";

/**
 * Step 2-1 (Figma `519:628` / `524:179` mobile, `525:5130` / `525:5775` desktop).
 *
 * The desktop frames wrap the picker in more page than the phone ones: the package's price
 * in a dashed box beside the heading, the four claims in one row above the card, and under
 * it "ПОВЕЧЕ ИНФОРМАЦИЯ" with the size chart and the washing instructions. The phone frames
 * draw none of those — heading, card, and (for Фен and up) the cart — so they are desktop
 * only here too.
 *
 * The picker repeats once per shirt in the package, and `?slot=` is what says which shirt
 * is being edited. Keeping it in the URL rather than in component state is what makes the
 * cart's "РЕДАКТИРАЙ" link, the back button and a reload all agree — and what lets
 * `savePick` send the customer straight to the next empty slot.
 *
 * With no `?slot=`, the screen opens on the first shirt that has not been picked yet, or on
 * the last one when the order is already full (which is how someone arrives here from the
 * account step's back button).
 */
export default async function DesignStep({ searchParams }: { searchParams: Promise<{ slot?: string }> }) {
  const draft = await requireDraft("design");
  const { slot: slotParam } = await searchParams;

  const payload = await getPayloadClient();
  const plan = typeof draft.plan === "object" && draft.plan ? draft.plan : null;
  /* No package means the draft skipped or lost step 1-1; there is nothing to pick for. */
  if (!plan) redirect(stepPath("plan"));

  const [categories, site] = await Promise.all([
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", depth: 1, limit: 12 }),
    getSite(),
  ]);

  /* Relationship fields come back as an id or as the resolved document depending on depth,
     and `typeof null === "object"` means the obvious ternary does not narrow. */
  const idOf = (value: number | { id: number } | null | undefined): number | null =>
    value == null ? null : typeof value === "object" ? value.id : value;

  const picks = draft.picks ?? [];
  const requested = Number(slotParam ?? 0);
  const inRange = requested >= 1 && requested <= plan.shirtCount;
  const slot = inRange ? requested : (nextEmptySlot(picks, plan.shirtCount) ?? plan.shirtCount);

  const themes: Theme[] = categories.docs.map((c) => ({
    id: c.id,
    name: c.name,
    image: typeof c.image === "object" && c.image?.url ? c.image.url : null,
  }));
  const imageOf = (categoryId: number | null) => themes.find((t) => t.id === categoryId)?.image ?? null;
  const nameOf = (categoryId: number | null) => themes.find((t) => t.id === categoryId)?.name ?? null;

  const slots: CartSlot[] = Array.from({ length: plan.shirtCount }, (_, i) => {
    const pick = picks.find((p) => p.slot === i + 1);
    const categoryId = idOf(pick?.category);
    return {
      slot: i + 1,
      categoryName: nameOf(categoryId),
      image: imageOf(categoryId),
      size: pick?.size ?? null,
      gender: pick?.gender ?? null,
    };
  });

  const current = picks.find((p) => p.slot === slot);
  const currentCategory = idOf(current?.category);

  const drop = nextDeliveryDate(site.deliveryDay);
  const dropLabel = `дроп - ${MONTHS_BG[drop.getUTCMonth()]}`;

  return (
    <FunnelPage
      wide
      step="design"
      /* Two lines in both frames. 72px over 575px wraps on its own; 32px over 370px does
         not, so the break is explicit. */
      title={
        <>
          Избери
          <br />
          дизайн
        </>
      }
      /* The frames' "Изберете …", in the "ти" the funnel uses throughout. One line at both
         widths, and neither frame gives it the 0.04em `body` adds — with it, the phone
         wraps. */
      subtitle="Избери дизайн, размер и пол за поръчката."
      subtitleClass="w-[460px] max-lg:w-[298px] tracking-normal"
      contentGap="mt-[78px] max-lg:mt-[22.8px]"
      aside={<FunnelPriceBox price={euro(await planPriceCents(plan))} />}
    >
      <FunnelUsps className="max-lg:hidden lg:w-full" />

      {/* The package name, red, above the card — Figma revision of 2026-09-27 (`549:1262` /
          `549:1258` desktop, `549:1715` mobile): 72px on desktop, 72px under the claims and
          42px over the card; 32px on mobile, 26px between it and the card. Bulgarian names
          rather than the frames' BASIC / SUPPORTER, as on the package step. */}
      <h2 className="font-headline text-[72px] uppercase leading-[1.12] text-t-red max-lg:text-[32px] lg:mt-[71.8px]">{plan.name}</h2>

      <div className="mt-[26.1px] lg:mt-[42.1px]">
        <SignupPicker
        key={slot}
        slot={slot}
        themes={themes}
        dropLabel={dropLabel}
        slots={slots}
        sizeChart={<SizeChart id={null} />}
        initial={{ category: currentCategory, size: current?.size ?? null, gender: current?.gender ?? null }}
      />
      </div>

      <div className="max-lg:hidden">
        {/* 153px under the card in the Базов frame, 106px in the Фен one, where the card holds the cart. */}
        <h2 className={`${plan.shirtCount > 1 ? "mt-[106.2px]" : "mt-[152.8px]"} font-headline text-[72px] uppercase leading-[1.12] text-t-red`}>Повече информация</h2>
        <div className="mt-[53px]">
          <SizeChart />
        </div>
        <div className="mt-[53px]">
          <WashCare />
        </div>
      </div>
    </FunnelPage>
  );
}
