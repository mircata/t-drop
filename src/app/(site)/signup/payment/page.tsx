import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupPaymentForm } from "@/components/forms/signup-payment-form";
import { FunnelImportantInfo, FunnelPage, FunnelPriceBox } from "@/components/site/funnel-page";
import { SignupCart, type CartSlot } from "@/components/site/signup-cart";
import { getCustomer } from "@/lib/auth";
import { euro } from "@/lib/money";
import { getPayloadClient } from "@/lib/payload";
import { planPriceCents } from "@/lib/plan-price";
import { requireDraft } from "@/lib/signup";
import { stepPath } from "@/lib/signup-steps";

export const metadata: Metadata = { title: "Метод на плащане | T-Drop" };

export const dynamic = "force-dynamic";

/* What `/signup/payment/complete` sends back when the payment did not go through. */
const ERRORS: Record<string, string> = {
  declined: "Плащането не мина. Опитай пак или с друга карта.",
  unknown: "Не успяхме да потвърдим плащането. Ако картата е таксувана, пиши ни.",
};

/**
 * Step 3-1 (Figma `525:1000` mobile, `525:6736` desktop).
 *
 * Desktop (revision of 2026-09-27): the "ВАЖНА ИНФОРМАЦИЯ" panel beside the heading; under
 * it the card form and "АБОНИРАЙ СЕ" on the left, and on the right the "ПОРЪЧКА" box level
 * with the form's top, with the price box 62px under it. Mobile: the panel, the card form,
 * the button, and the cart as the sticky bottom sheet.
 *
 * The frames draw the panel 600px and the price box 602px wide, running past the content
 * edge; all three right-hand boxes are 593px and flush with it, on the owner's call of
 * 2026-09-27.
 */
export default async function PaymentStep({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const draft = await requireDraft("payment");
  const { error } = await searchParams;

  const plan = typeof draft.plan === "object" && draft.plan ? draft.plan : null;
  if (!plan) redirect(stepPath("plan"));

  /* The account step signed the new customer in; the payment is theirs to make. */
  const customer = await getCustomer();
  if (!customer) redirect("/login");

  const payload = await getPayloadClient();
  const idOf = (value: number | { id: number } | null | undefined): number | null =>
    value == null ? null : typeof value === "object" ? value.id : value;
  const picks = draft.picks ?? [];
  const categoryIds = picks.map((p) => idOf(p.category)).filter((id): id is number => id != null);
  const [categories, priceCents] = await Promise.all([
    categoryIds.length
      ? payload.find({ collection: "categories", where: { id: { in: categoryIds } }, depth: 1, limit: categoryIds.length })
      : Promise.resolve({ docs: [] as never[] }),
    planPriceCents(plan),
  ]);

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
      step="payment"
      /* Two lines in both frames: "Метод на / плащане". */
      title={
        <>
          Метод на
          <br />
          плащане
        </>
      }
      subtitle="Приемаме само плащане с карта."
      subtitleClass="w-[425px] max-lg:w-[298px] tracking-normal"
      contentGap="mt-[72.4px] max-lg:mt-[27px]"
      /* y=222 in the 1440 frame, level with the other steps' price box. */
      aside={<FunnelImportantInfo className="absolute top-[66px] right-0 w-[593px] max-lg:hidden" />}
    >
      <FunnelImportantInfo className="w-[359px] max-w-full lg:hidden" />

      <div className="flex flex-row items-start justify-between max-lg:mt-[30.27px] max-lg:flex-col">
        <div className="w-[579px] max-w-full max-lg:w-[359px]">
          <SignupPaymentForm amountCents={priceCents} currency={plan.currency || "eur"} initialError={error ? ERRORS[error] : undefined} />
        </div>

        {/* The order level with the form's top (both y=561), and the price 62.4px under it. */}
        <div className="flex w-[593px] shrink-0 flex-col gap-[62.4px] max-lg:contents">
          <SignupCart slots={slots} />
          <FunnelPriceBox price={euro(priceCents)} className="w-full" />
        </div>
      </div>
    </FunnelPage>
  );
}
