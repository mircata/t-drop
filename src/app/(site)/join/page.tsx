import type { Metadata } from "next";
import { JoinPicker } from "@/components/forms/join-picker";
import { SizeChart } from "@/components/site/size-chart";
import { JoinFaq } from "@/components/site/join-faq";
import { headline36 } from "@/components/site/shared";
import { getPayloadClient, mediaUrl } from "@/lib/payload";

export const metadata: Metadata = { title: "1 месец – T-Drop Monthly T-Shirts" };

/* Figma "JOIN page" (482:3844, full redesign 2026-09-16): gender/size/design picker,
   then "ПОВЕЧЕ ИНФОРМАЦИЯ" (size chart) and FAQ. The themes come from the active
   Categories in /admin, the price from the active Plan, same as before. Picking a
   design no longer submits straight to checkout — see join-picker.tsx and
   /join/delivery for the new two-step flow. */
const euro = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export default async function JoinPage() {
  const payload = await getPayloadClient();
  const [plans, categories] = await Promise.all([
    payload.find({ collection: "plans", where: { active: { equals: true } }, sort: "sortOrder", limit: 1 }),
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", limit: 20, depth: 1 }),
  ]);
  const plan = plans.docs[0];
  const price = plan ? euro(plan.priceCents) : "17,99 €";
  const themes = categories.docs.map((t) => ({ id: t.id, name: t.name, image: mediaUrl(t.image, "") || null }));

  return (
    <>
      <JoinPicker planName={plan?.name ?? "1 месец"} price={price} themes={themes} />

      <section className="site-container flex flex-col gap-10 pb-20 pt-40 max-md:px-5">
        <h2 className={headline36}>Повече информация</h2>
        <SizeChart />
        <JoinFaq />
      </section>
    </>
  );
}
