import type { Metadata } from "next";
import { FunnelPage } from "@/components/site/funnel-page";
import { requireDraft } from "@/lib/signup";
import { StepPlaceholder } from "../placeholder";

export const metadata: Metadata = { title: "Избери дизайн | T-Drop" };

/* Nothing is cached: every render depends on the draft behind the `tdrop-signup` cookie. */
export const dynamic = "force-dynamic";

export default async function DesignStep() {
  await requireDraft("design");

  return (
    <FunnelPage step="design" title="Избери дизайн">
      <StepPlaceholder>Пол, размер и дизайн за всяка тениска</StepPlaceholder>
    </FunnelPage>
  );
}
