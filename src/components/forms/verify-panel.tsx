import { continueFromVerify } from "@/lib/actions/signup";

/**
 * Step 1-2, the email verification screen — Figma `519:579` (mobile) and `525:4180`
 * (desktop).
 *
 * **It renders the verified state and nothing else, and nothing is verified.** The owner's
 * decision on 2026-09-22 was to build the screens now and defer everything to do with
 * actually sending email (docs/new-user-flow.md, "Email sending — deferred"), so the step
 * stays in the funnel — the customer sees it and presses НАПРЕД — but no message goes out
 * and no token is checked.
 *
 * The waiting state (`519:486`), "ИЗПРАТИ ОТНОВО" and the "Друг мейл?" popup (`525:1340`)
 * are therefore **not built**. They are designed and they are listed in
 * docs/pre-launch.md; build them together with real sending, not before, so there is no
 * half-wired verification flow for someone to mistake for a working one.
 *
 * Panel geometry from the frames: cream fill, a 3px black dashed border — the border stays
 * black in the verified state, only the text turns green — 20px radius, 20px/15px padding,
 * and the label in Dela Gothic 32px at the design's own green. Desktop centres the label in
 * a fixed 116px box; mobile is left-aligned and sized by its content.
 */
const VERIFIED_GREEN = "#1faa3d";

export function VerifyPanel() {
  return (
    <div className="flex w-full flex-col gap-[24px] max-lg:gap-[29px]">
      <div className="flex w-[579px] max-w-full items-center justify-center rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-[15px] lg:h-[116px] max-lg:justify-start">
        <p
          className="font-headline text-[32px] uppercase leading-[1.12] whitespace-nowrap"
          style={{ color: VERIFIED_GREEN }}
        >
          Верифициран
        </p>
      </div>

      <form action={continueFromVerify} className="w-[579px] max-w-full max-lg:flex max-lg:justify-center">
        <button
          type="submit"
          className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black max-lg:w-[362px]"
        >
          Напред
        </button>
      </form>
    </div>
  );
}
