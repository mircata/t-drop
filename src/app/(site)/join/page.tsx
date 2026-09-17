import type { Metadata } from "next";
import { JoinPicker } from "@/components/forms/join-picker";
import { JoinFaq } from "@/components/site/join-faq";
import { headline36 } from "@/components/site/shared";
import { SizeChart } from "@/components/site/size-chart";
import { WashCare } from "@/components/site/wash-care";
import { MONTHS_BG, getPayloadClient, getSite, mediaUrl } from "@/lib/payload";
import { nextDeliveryDate } from "@/lib/stripe-sync";

export const metadata: Metadata = { title: "Месечен абонамент – T-Drop Monthly T-Shirts" };

/* Figma "JOIN page" (482:3844, full redesign 2026-09-16): gender/size/design picker,
   then "ПОВЕЧЕ ИНФОРМАЦИЯ" (size chart) and FAQ. The themes come from the active
   Categories in /admin, the price from the active Plan, same as before. Picking a
   design no longer submits straight to checkout — see join-picker.tsx and
   /join/delivery for the new two-step flow. */
const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(".", ",")}`;

export default async function JoinPage() {
  const payload = await getPayloadClient();
  const [plans, categories, site] = await Promise.all([
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 }),
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", limit: 20, depth: 1 }),
    getSite(),
  ]);
  const plan = plans.docs[0];
  const price = plan ? euro(plan.priceCents) : "€17,99";
  const themes = categories.docs.map((t) => ({ id: t.id, name: t.name, image: mediaUrl(t.image, "") || null }));
  /* The badge annotated on the design as "the month of the current drop of arrival" —
     the same delivery date the announcement strip counts to. */
  const dropLabel = `дроп - ${MONTHS_BG[nextDeliveryDate(site.deliveryDay).getUTCMonth()]}`;

  return (
    <>
      <JoinPicker planName={plan?.name ?? "Месечен абонамент"} price={price} themes={themes} dropLabel={dropLabel} />

      <section className="site-container flex flex-col gap-[53px] pb-20 pt-[139px] max-md:px-5">
        <h2 className={headline36}>Повече информация</h2>
        <SizeChart />
        <WashCare />
        <div className="mt-[69px]">
          <JoinFaq />
        </div>
      </section>
    </>
  );
}
