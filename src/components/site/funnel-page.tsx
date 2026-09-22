import type { ReactNode } from "react";
import { headlineBase } from "@/components/site/shared";
import { type FunnelStep, phaseLabel } from "@/lib/signup-steps";

/**
 * Shared shell of the signup funnel, from the Figma sections "NEW USER FLOW" (515:2, mobile
 * at 402px) and "NEW USER FLOW - DESKTOP" (525:1426, 1440px). Every step renders inside
 * this: heading, the phase counter with its one-line description, then the step's own
 * controls, with an optional column to the right.
 *
 * It is not a Next.js layout. Each step supplies its own title, subtitle and aside, and a
 * layout cannot take props from the page it wraps.
 *
 * The header, announcement strip and footer are not here either — they come from the
 * `(site)` root layout, which is the whole reason the funnel lives in that route group.
 * The owner's decision on 2026-09-22 is to use the global `SiteHeader` unchanged, even
 * though the Figma frames draw a reduced logo + hamburger header on desktop.
 *
 * Desktop geometry is taken from the frames: content column at x=80 (579px wide), right
 * column at x≈768 (~595px), both inside the 1280px container. The counter sits at x=88,
 * eight pixels inside the heading — that indent is in every desktop frame, so it is
 * reproduced rather than tidied away.
 */
export function FunnelPage({
  step,
  title,
  subtitle,
  aside,
  children,
}: {
  step: FunnelStep;
  title: ReactNode;
  /** The line under the counter: what this step is asking for. */
  subtitle?: ReactNode;
  /** Right-hand column on desktop — illustration, or the order summary on later steps. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="site-container pb-[84px] pt-[55px] max-md:px-5 max-md:pt-10">
      <div className="flex gap-[109px] max-xl:gap-10 max-lg:flex-col">
        <div className="w-[579px] max-w-full shrink-0">
          <h1 className={`${headlineBase} max-md:text-[40px]`}>{title}</h1>

          {/* Counter and its description. aria-hidden on the "1/3" itself: it is decorative
              once the same information is in the label, and a screen reader announcing
              "one slash three" before the sentence explaining the step is noise. */}
          <div className="mt-[57px] pl-2 max-md:mt-8 max-md:pl-0">
            <p
              aria-hidden="true"
              className="font-dot text-[36px] font-extrabold leading-none text-t-black max-md:text-[27px]"
            >
              {phaseLabel(step)}
            </p>
            <span className="sr-only">{`Стъпка ${phaseLabel(step)}`}</span>
            {subtitle ? (
              <p className="mt-3 font-dot text-[18px] leading-[1.5] text-t-black max-md:text-[16px]">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-[45px] max-md:mt-8">{children}</div>
        </div>

        {aside ? <div className="w-[595px] max-w-full min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
