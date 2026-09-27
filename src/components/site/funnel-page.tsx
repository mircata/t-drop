import Image from "next/image";
import type { ReactNode } from "react";
import { type FunnelStep, phaseLabel } from "@/lib/signup-steps";

/**
 * Shared shell of the signup funnel — heading, the phase counter with its one-line
 * description, then the step's own controls, with an optional column to the right.
 *
 * Measured from Figma `519:579` / `525:4180` (the verified state of step 1-2) and checked
 * against `519:377` / `525:3441` (the package step), which agree on every chrome value:
 * heading 72px desktop / 32px mobile at x=80/16, counter 32/24px Dela Gothic grey with the
 * frame's tracking, description 24/18px, 53px from the heading to the counter, 12px from
 * the counter to the description on desktop and 13px beside it on mobile.
 *
 * The two widths are not the same layout scaled. On desktop the counter sits **above** the
 * description, both at x=88 — eight pixels inside the x=80 content column, an indent that is
 * in every desktop frame. On mobile the counter sits **beside** it.
 *
 * What the frames do *not* agree on is the description box and how far the step's own
 * controls sit below it: the verify step gets a wide box and a 73px gap, the package step a
 * 286px box (two lines on desktop, one on mobile), no letter-spacing and a 12px gap. Those
 * two are props rather than constants for that reason — and the box is a class rather than
 * a width because `body` sets `letter-spacing: 0.04em` site-wide, which some frames'
 * description text does not have, and it is what decides where the line breaks.
 *
 * It is not a Next.js layout: each step supplies its own title, description and aside, and a
 * layout cannot take props from the page it wraps. The header, announcement strip and footer
 * come from the `(site)` root layout, which is why the funnel lives in that route group —
 * the owner's decision on 2026-09-22 is to use the global `SiteHeader` unchanged, even
 * though the frames draw a reduced logo + hamburger header.
 */

/* Dela Gothic One, grey, with the frame's own tracking. Not the Handjet numerals this
   previously used — the counter is a heading face in every frame. */
const counter = "font-headline uppercase leading-[1.12] text-[#686868] text-[32px] tracking-[2.56px] max-lg:text-[24px] max-lg:tracking-[1.92px]";

export function FunnelPage({
  step,
  title,
  subtitle,
  subtitleClass = "w-[460px] max-lg:w-[298px]",
  contentGap = "mt-[73px] max-lg:mt-[47px]",
  decor,
  aside,
  wide = false,
  children,
}: {
  step: FunnelStep;
  title: ReactNode;
  /** The line beside (mobile) or under (desktop) the counter: what this step is asking for. */
  subtitle?: ReactNode;
  /** That line's box and tracking, which is what sets where it wraps. Per-step; see above. */
  subtitleClass?: string;
  /** Top margin on the step's own controls. Per-step; see the note above. */
  contentGap?: string;
  /** Decoration behind the heading — the frames put a neon shape there on several steps.
      Absolutely positioned by the caller inside the left column, which is why the column is
      `relative`; it never takes pointer events. */
  decor?: ReactNode;
  /** Right-hand column on desktop — illustration, or the order summary on later steps. */
  aside?: ReactNode;
  /** Let the step's controls span the full 1280px column instead of sitting in the 579px
      one beside `aside`. The package step's cards, button and FAQ are all full width, and
      its one right-hand block is placed against this section rather than stacked beside the
      controls — so in this mode the section is the positioning context and `aside` is left
      to the caller to place. */
  wide?: boolean;
  children: ReactNode;
}) {
  const head = (
    <>
      {decor ? <div className="pointer-events-none absolute inset-0 -z-10">{decor}</div> : null}
      <h1 className="font-headline text-[72px] uppercase leading-[1.12] text-t-red max-lg:text-[32px]">{title}</h1>

      {/* aria-hidden on the "1/3" itself: it is decorative once the same information is
          in the label, and a screen reader announcing "one slash three" before the
          sentence explaining the step is noise. */}
      <div className="mt-[54px] flex flex-col gap-[12px] pl-2 max-lg:mt-[39px] max-lg:flex-row max-lg:items-start max-lg:gap-[13px] max-lg:pl-0">
        <p aria-hidden="true" className={counter}>
          {phaseLabel(step)}
        </p>
        <span className="sr-only">{`Стъпка ${phaseLabel(step)}`}</span>
        {subtitle ? (
          <p className={`${subtitleClass} max-w-full font-dot text-[24px] leading-[normal] text-t-black max-lg:text-[18px]`}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  if (wide) {
    return (
      <section className="site-container relative pb-[84px] pt-[39px] max-md:px-4">
        <div className="relative w-[579px] max-w-full">{head}</div>
        {aside}
        <div className={contentGap}>{children}</div>
      </section>
    );
  }

  return (
    <section className="site-container pb-[84px] pt-[39px] max-md:px-4">
      <div className="flex gap-[109px] max-xl:gap-10 max-lg:flex-col max-lg:gap-0">
        <div className="relative w-[579px] max-w-full shrink-0">
          {head}
          <div className={contentGap}>{children}</div>
        </div>

        {aside ? <div className="w-[595px] max-w-full min-w-0 max-lg:mt-10">{aside}</div> : null}
      </div>
    </section>
  );
}

/**
 * The package's price in a dashed box, desktop only — `Frame 125`, 125px tall. On the design
 * and account steps it sits beside the heading, 593px wide at x=767 y=222.5 and flush with
 * the content column's right edge: that is the default, placed against the `wide` section,
 * so pass it as that mode's `aside`. The payment step puts it under the order instead and
 * passes its own `className`.
 */
export function FunnelPriceBox({ price, className = "absolute top-[66.5px] right-0 w-[593px]" }: { price: string; className?: string }) {
  return (
    <div className={`${className} flex h-[125px] items-center justify-center rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] max-lg:hidden`}>
      <p className="font-dot text-[32px] uppercase leading-[normal] tracking-normal text-[#212121]">{price}/месец</p>
    </div>
  );
}

/**
 * "ВАЖНА ИНФОРМАЦИЯ" — `Group 192`. Copy as drawn, the frames' grammar included; copy is
 * the owner's. Its "всяка първа седмица от месеца" contradicts the four-week cycle counted
 * back from `Site.deliveryDay`; the owner's call on 2026-09-22 was to leave it, since the
 * schedule is likely to change. Do not re-derive the cycle from this paragraph.
 *
 * Beside the heading on desktop on the account and payment steps (Figma revision of
 * 2026-09-27; the account step had the price box there before), and above the card form on
 * the phone on the payment step only — the account step's phone frame does not have it.
 *
 * Padding is the frames' 21.5px inset minus the 3px border (Figma strokes inside). The
 * phone frame sets the paragraph in a 257px box inside the 359px panel, which is what
 * breaks it into five lines there.
 */
export function FunnelImportantInfo({ className }: { className: string }) {
  return (
    <div className={`flex flex-col gap-[15px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] p-[18.5px] ${className}`}>
      <p className="flex items-center gap-[15px] font-dot text-[18px] font-bold uppercase leading-[normal] tracking-normal text-t-red">
        <span className="relative block size-[18px] shrink-0">
          <Image src="/figma/signup/payment/info.svg" alt="" width={20} height={20} className="absolute -top-px -left-px size-[20px] max-w-none" />
        </span>
        Важна информация
      </p>
      <p className="font-dot text-[18px] leading-[normal] tracking-normal text-[#212121] max-lg:w-[257px]">
        Всеки месец автоматично се таксува абонаментната такса. Като ще получите известие в момента, в който имаме нов
        дроп по мейл или всяка първа седмица от месеца в вашият профил.
      </p>
    </div>
  );
}
