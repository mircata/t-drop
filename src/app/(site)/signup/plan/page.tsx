import type { Metadata } from "next";
import { FunnelPage } from "@/components/site/funnel-page";
import { requireDraft } from "@/lib/signup";
import { StepPlaceholder } from "../placeholder";

export const metadata: Metadata = { title: "Избери пакет | T-Drop" };

/* Nothing is cached: every render depends on the draft behind the `tdrop-signup` cookie. */
export const dynamic = "force-dynamic";

export default async function PlanStep() {
  await requireDraft("plan");

  return (
    <FunnelPage step="plan" title="Избери пакет" subtitle="Предлагаме 3 пакета, за нуждите на всеки.">
      <StepPlaceholder>Пакети, предимства и въпроси</StepPlaceholder>
    </FunnelPage>
  );
}
