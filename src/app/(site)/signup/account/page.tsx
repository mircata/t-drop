import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupAccountForm } from "@/components/forms/signup-account-form";
import { FunnelImportantInfo, FunnelPage, FunnelPriceBox } from "@/components/site/funnel-page";
import { SignupCart, type CartSlot } from "@/components/site/signup-cart";
import { VerifyStar } from "@/components/site/verify-art";
import { euro } from "@/lib/money";
import { planPriceCents } from "@/lib/plan-price";
import { getPayloadClient } from "@/lib/payload";
import { requireDraft } from "@/lib/signup";
import { stepPath } from "@/lib/signup-steps";

export const metadata: Metadata = { title: "Създаване на акаунт | T-Drop" };

export const dynamic = "force-dynamic";

/**
 * Step 2-2 (Figma `524:479` mobile, `525:6298` desktop).
 *
 * Desktop (revision of 2026-09-27): the "ВАЖНА ИНФОРМАЦИЯ" panel beside the heading, as on
 * the payment step, the neon star behind the end of "СЪЗДАВАНЕ", and under them the form in
 * the 579px left column with the "ПОРЪЧКА" box on the right — its top 16px below the form's
 * (y=539 against 523) — and the price box 50.6px under that. Mobile: the heading and the
 * form, with the cart as the same sticky bottom sheet the design step has; the phone frame
 * has no information panel.
 */
export default async function AccountStep() {
  const draft = await requireDraft("account");

  const plan = typeof draft.plan === "object" && draft.plan ? draft.plan : null;
  if (!plan) redirect(stepPath("plan"));

  const payload = await getPayloadClient();
  const idOf = (value: number | { id: number } | null | undefined): number | null =>
    value == null ? null : typeof value === "object" ? value.id : value;
  const picks = draft.picks ?? [];
  const categoryIds = picks.map((p) => idOf(p.category)).filter((id): id is number => id != null);
  const categories = categoryIds.length
    ? await payload.find({ collection: "categories", where: { id: { in: categoryIds } }, depth: 1, limit: categoryIds.length })
    : { docs: [] };

  const priceCents = await planPriceCents(plan);

  const slots: CartSlot[] = Array.from({ length: plan.shirtCount }, (_, i) => {
    const pick = picks.find((p) => p.slot === i + 1);
    const category = categories.docs.find((c) => c.id === idOf(pick?.category));
    return {
      slot: i + 1,
      categoryName: category?.name ?? null,
      image: typeof category?.image === "object" && category.image?.url ? category.image.url : null,
      size: pick?.size ?? null,
      gender: pick?.gender ?? null,
    };
  });

  return (
    <FunnelPage
      wide
      step="account"
      /* Two lines in both frames: "Създаване / на акаунт". */
      title={
        <>
          Създаване
          <br />
          на акаунт
        </>
      }
      /* The frames' "Попълнете данните", in the "ти" the funnel uses throughout. */
      subtitle="Попълни данните"
      subtitleClass="w-[425px] max-lg:w-[298px] tracking-normal"
      contentGap="mt-[34.4px] max-lg:mt-[41px]"
      /* `525:6299`: unrotated origin x=663.8, i.e. 584px into the x=80 column. */
      decor={<VerifyStar left={583.8} />}
      aside={<FunnelImportantInfo className="absolute top-[66px] right-0 w-[593px] max-lg:hidden" />}
    >
      <div className="flex flex-row items-start justify-between max-lg:flex-col">
        <SignupAccountForm />
        <div className="mt-[16px] flex w-[593px] shrink-0 flex-col gap-[50.6px] max-lg:contents">
          <SignupCart slots={slots} />
          <FunnelPriceBox price={euro(priceCents)} className="w-full" />
        </div>
      </div>
    </FunnelPage>
  );
}
