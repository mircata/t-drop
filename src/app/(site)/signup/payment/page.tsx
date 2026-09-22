import type { Metadata } from "next";
import { FunnelPage } from "@/components/site/funnel-page";
import { requireDraft } from "@/lib/signup";
import { StepPlaceholder } from "../placeholder";

export const metadata: Metadata = { title: "Метод на плащане | T-Drop" };

/* Nothing is cached: every render depends on the draft behind the `tdrop-signup` cookie. */
export const dynamic = "force-dynamic";

export default async function PaymentStep() {
  await requireDraft("payment");

  return (
    <FunnelPage step="payment" title="Метод на плащане">
      <StepPlaceholder>Stripe Payment Element</StepPlaceholder>
    </FunnelPage>
  );
}
