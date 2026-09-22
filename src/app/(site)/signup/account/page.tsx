import type { Metadata } from "next";
import { FunnelPage } from "@/components/site/funnel-page";
import { requireDraft } from "@/lib/signup";
import { StepPlaceholder } from "../placeholder";

export const metadata: Metadata = { title: "Създаване на акаунт | T-Drop" };

/* Nothing is cached: every render depends on the draft behind the `tdrop-signup` cookie. */
export const dynamic = "force-dynamic";

export default async function AccountStep() {
  await requireDraft("account");

  return (
    <FunnelPage step="account" title="Създаване на акаунт" subtitle="Попълнете данните">
      <StepPlaceholder>Парола, доставка и съгласия</StepPlaceholder>
    </FunnelPage>
  );
}
