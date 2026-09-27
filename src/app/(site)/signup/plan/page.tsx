import type { Metadata } from "next";
import { PLAN_CONTINUE_ID, PlanCards, type PlanCard } from "@/components/forms/plan-cards";
import { FunnelFaq } from "@/components/site/funnel-faq";
import { FunnelPage } from "@/components/site/funnel-page";
import { FunnelUsps } from "@/components/site/funnel-usps";
import { euro } from "@/lib/money";
import { planPriceCents } from "@/lib/plan-price";
import { getPayloadClient, getSite } from "@/lib/payload";
import { requireDraft } from "@/lib/signup";

export const metadata: Metadata = { title: "Избери пакет | T-Drop" };

/* Nothing is cached: every render depends on the draft behind the `tdrop-signup` cookie. */
export const dynamic = "force-dynamic";

/**
 * Step 1-1 (Figma `519:377` mobile, `525:3441` desktop).
 *
 * A scrolling page that sells the subscription rather than a compact chooser: the three
 * package cards with their prices, the four claims, ten questions answered in full, and
 * "НАПРЕД". The two widths order those differently and the frames are explicit about it —
 *
 * - **desktop** puts the claims top right, beside the heading, and the button straight under
 *   the prices with the FAQ below it;
 * - **mobile** runs everything down one column, claims after the cards, button last, and the
 *   button's annotation adds *"this button is sticked to the bottom on scroll"* — so it
 *   rides the bottom of the screen for the whole 1700px of FAQ rather than waiting at the end.
 *
 * Both are one set of nodes: the claims block is absolutely placed at the wide width, which
 * takes it out of the flow that mobile needs it in, and the button and FAQ swap with `order`.
 */
export default async function PlanStep() {
  const draft = await requireDraft("plan");

  const [payload, site] = await Promise.all([getPayloadClient(), getSite()]);
  const plans = await payload.find({
    collection: "plans",
    where: { active: { equals: true } },
    sort: "sortOrder",
    depth: 1,
    limit: 10,
  });

  const cards: PlanCard[] = await Promise.all(plans.docs.map(async (plan) => ({
    id: plan.id,
    name: plan.name,
    shirtCount: plan.shirtCount,
    price: euro(await planPriceCents(plan)),
    image: typeof plan.image === "object" && plan.image?.url ? plan.image.url : null,
    recommended: plan.badge === "recommended",
  })));

  const selectedId = typeof draft.plan === "object" && draft.plan ? draft.plan.id : draft.plan;

  return (
    <FunnelPage
      wide
      step="plan"
      /* Two lines in both frames — 72px over a 575px box wraps on its own at the wide
         width, 32px over 370px does not, so the break is explicit. */
      title={
        <>
          Избери
          <br />
          пакет
        </>
      }
      subtitle="Предлагаме 3 пакета, за нуждите на всеки."
      /* 286px in both frames, and neither gives this line the 0.04em `body` adds: with it
         the phone breaks a line the design keeps whole. */
      subtitleClass="w-[286px] tracking-normal"
      contentGap="mt-[12px] max-lg:mt-[32px]"
    >
      <div className="flex flex-col">
        <PlanCards plans={cards} selectedId={typeof selectedId === "number" ? selectedId : null} />

        {/* x=609 y=233.5 in the 1440 frame, i.e. 57px in from the content column's right
            edge and 77px down from the top of this section — level with the heading, which
            is why it cannot simply follow the cards at this width. */}
        <FunnelUsps className="max-lg:mt-[39px] lg:absolute lg:top-[77px] lg:right-[57px] lg:w-[694px]" />

        <FunnelFaq
          heading={site.funnelFaqHeading ?? "Често задавани въпроси"}
          items={(site.funnelFaq ?? []).map((item) => ({ question: item.question, answer: item.answer }))}
          className="max-lg:mt-[44px] lg:order-2 lg:mt-[285px]"
        />

        {/* Sticky on phones only. The wrapper fades the page out under the pill so the FAQ
            does not run through its rounded corners as it passes behind. */}
        <div className="flex justify-center max-lg:sticky max-lg:bottom-0 max-lg:z-20 max-lg:-mx-4 max-lg:mt-[40px] max-lg:bg-gradient-to-t max-lg:from-t-cream max-lg:from-60% max-lg:to-transparent max-lg:px-4 max-lg:pt-[30px] max-lg:pb-[20px] lg:order-1 lg:mt-[50px]">
          <button
            id={PLAN_CONTINUE_ID}
            type="submit"
            form="plan-form"
            className="flex h-[71px] w-[353px] max-w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black lg:w-full"
          >
            Напред
          </button>
        </div>
      </div>
    </FunnelPage>
  );
}
