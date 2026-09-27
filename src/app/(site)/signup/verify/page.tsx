import type { Metadata } from "next";
import { VerifyPanel } from "@/components/forms/verify-panel";
import { FunnelPage } from "@/components/site/funnel-page";
import { VerifyArt, VerifyStar } from "@/components/site/verify-art";
import { requireDraft } from "@/lib/signup";

export const metadata: Metadata = { title: "Потвърди мейл | T-Drop" };

export const dynamic = "force-dynamic";

/**
 * Step 1-2 (Figma `519:579` mobile, `525:4180` desktop) — the verified state, which is the
 * only state this step has for now. Nothing is verified; see `VerifyPanel`.
 *
 * The frame's copy is "вие" ("Вашият мейл … можете да продължите"). It is reworded to "ти",
 * the form chosen for the whole funnel on 2026-09-22 and the one the rest of the site uses.
 */
export default async function VerifyStep() {
  const draft = await requireDraft("verify");

  return (
    <FunnelPage
      step="verify"
      title="Потвърди мейл"
      decor={<VerifyStar />}
      aside={<VerifyArt />}
      subtitle={
        <>
          Мейлът ти <strong className="font-bold">{draft.email}</strong> е верифициран успешно, можеш да продължиш.
        </>
      }
    >
      <VerifyPanel />
    </FunnelPage>
  );
}
