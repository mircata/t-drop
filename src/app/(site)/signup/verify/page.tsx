import type { Metadata } from "next";
import { FunnelPage } from "@/components/site/funnel-page";
import { requireDraft } from "@/lib/signup";
import { StepPlaceholder } from "../placeholder";

export const metadata: Metadata = { title: "Потвърди мейл | T-Drop" };

export const dynamic = "force-dynamic";

/**
 * Figma `519:486` (waiting) and `519:579` (verified) are one screen in two states, so they
 * are one route. The dashed panel reads "В ИЗЧАКВАНЕ" until the address is confirmed and
 * "ВЕРИФИЦИРАН" after, and the button changes from "ИЗПРАТИ ОТНОВО" to "НАПРЕД".
 *
 * The typo in the Figma subtitle ("изпратехния") is corrected here — the owner approved
 * fixing typos on 2026-09-22.
 */
export default async function VerifyStep() {
  const draft = await requireDraft("verify");

  return (
    <FunnelPage
      step="verify"
      title="Потвърди мейл"
      subtitle={
        <>
          Верифицирай мейла си чрез изпратения линк към <strong className="font-bold">{draft.email}</strong>.
        </>
      }
    >
      <StepPlaceholder>{draft.emailVerified ? "Верифициран" : "В изчакване"}</StepPlaceholder>
    </FunnelPage>
  );
}
