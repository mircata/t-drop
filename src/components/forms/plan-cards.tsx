"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { ErrorNotice } from "@/components/forms/notice";
import { choosePlan, type FormState } from "@/lib/actions/signup";

export type PlanCard = {
  id: number;
  name: string;
  shirtCount: number;
  price: string;
  /** Resolved media URL, or null — the frames draw a grey placeholder, so null is a state. */
  image: string | null;
  recommended: boolean;
};

/**
 * Step 1-1, the package selector (Figma `519:377` mobile, `525:3441` desktop), annotated
 * *"this is package selector. Here you will to create 3 types of subscriptions based on
 * this info here. You can translate it to bulgarian"* — which is why the packages carry
 * their Bulgarian names here and not the frames' BASIC / SUPPORTER / FAMILY.
 *
 * Three cards side by side over a row of shirt-count-and-price columns, not the stacked
 * rows this used to draw. Each card has one of three looks, and the frames draw all three
 * at once by putting a different package in each:
 *
 * - **plain** — image, then the name below it in grey;
 * - **selected** — a filled red card with a shorter image and the name *inside* it, under
 *   a small "избрано";
 * - **recommended** — the image sits on a neon panel that fades out halfway down, with the
 *   label above it, and the name below in red.
 *
 * The frames draw no card that is both selected and recommended. Picking the recommended
 * package gives it the red selected card but keeps the neon panel and "препоръчан" above
 * it — the owner asked for the label not to disappear (2026-09-27). The row bottom-aligns (`items-end`), so the cards' differing heights, which are
 * part of those states in the frames, stay as drawn.
 *
 * "НАПРЕД" is at the bottom of the page, below the FAQ on mobile and above it on desktop, so
 * the submit button is rendered by the page rather than here and reaches this form through
 * `form=`. The selected plan rides along in a hidden input.
 */

/* The neon panel behind a recommended card's image: solid to 56.25% of its height, then out
   to nothing by 61%. Copied from the frames, which use the same stops at both widths. */
const NEON_FADE =
  "linear-gradient(180deg, rgb(206,255,88) 0%, rgb(206,255,88) 56.25%, rgba(206,255,88,0) 61.058%, rgba(206,255,88,0) 100%)";

/* Both frames round every card to 12px on mobile and 42px on desktop (12.026/12.027/12 and
   42.124/42.216/42.218 — the same corner, drawn three times). */
const RADIUS = "rounded-[12px] lg:rounded-[42px]";

/* The name under, or inside, a card. 12px/32px Dela Gothic with the frames' tracking. */
const CARD_NAME = "text-center font-headline text-[12px] uppercase leading-[1.12] tracking-[0.96px] lg:text-[32px] lg:tracking-[2.56px]";

/* "избрано" and "препоръчан" — the frames set these at 7.462px on mobile, which is as drawn
   and deliberately tiny, and 21px on desktop. */
const CARD_TAG = "font-headline text-[7.462px] uppercase leading-[1.12] tracking-[0.597px] lg:text-[21px] lg:tracking-[1.68px]";

function CardImage({ src, aspect }: { src: string | null; aspect: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#f5f5f5] ${RADIUS} ${aspect}`}>
      {src ? <Image src={src} alt="" fill sizes="(max-width: 1024px) 33vw, 404px" className="object-cover" /> : null}
    </div>
  );
}

function CardFace({ plan, selected }: { plan: PlanCard; selected: boolean }) {
  if (selected) {
    const card = (
      <div className={`flex w-full flex-col items-center bg-t-red pb-[12px] lg:pb-[42px] ${RADIUS}`}>
        <CardImage src={plan.image} aspect="aspect-[115/107] lg:aspect-[404/376]" />
        <div className="mt-[13px] flex flex-col items-center gap-[2px] text-t-white lg:mt-[46px] lg:gap-[14px]">
          <span className={CARD_TAG}>избрано</span>
          <span className={CARD_NAME}>{plan.name}</span>
        </div>
      </div>
    );
    if (!plan.recommended) return card;
    /* Selected and recommended at once is not drawn in the frames. The owner asked for the
       "препоръчан" label to stay (2026-09-27), so it keeps its neon panel and place above
       the card, with the red selected card where the image was. */
    return (
      <div
        className={`flex flex-col items-center gap-[8px] pt-[7px] lg:gap-[28px] lg:pt-[25px] ${RADIUS}`}
        style={{ backgroundImage: NEON_FADE }}
      >
        <span className={`${CARD_TAG} text-t-red`}>препоръчан</span>
        {card}
      </div>
    );
  }

  if (plan.recommended) {
    return (
      <div className="flex flex-col">
        <div
          className={`flex flex-col items-center gap-[8px] pt-[7px] lg:gap-[28px] lg:pt-[25px] ${RADIUS}`}
          style={{ backgroundImage: NEON_FADE }}
        >
          <span className={`${CARD_TAG} text-t-red`}>препоръчан</span>
          <CardImage src={plan.image} aspect="aspect-[115/122] lg:aspect-[404/428]" />
        </div>
        <span className={`mt-[20px] text-t-red lg:mt-[75px] ${CARD_NAME}`}>{plan.name}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <CardImage src={plan.image} aspect="aspect-[115/123] lg:aspect-[406/431]" />
      <span className={`mt-[19px] text-[#4e4e4e] lg:mt-[71px] ${CARD_NAME}`}>{plan.name}</span>
    </div>
  );
}

/** The page's "НАПРЕД" button, which a desktop click on a package scrolls to. */
export const PLAN_CONTINUE_ID = "plan-continue";

export function PlanCards({ plans, selectedId }: { plans: PlanCard[]; selectedId?: number | null }) {
  const [state, action] = useActionState<FormState, FormData>(choosePlan, {});
  const [selected, setSelected] = useState<number | null>(selectedId ?? null);

  return (
    <form id="plan-form" action={action} className="w-full">
      <ErrorNotice message={state.error} />
      <input type="hidden" name="plan" value={selected ?? ""} />

      {/* Radios rather than buttons: one package per subscription, and a radio group is
          what a keyboard and a screen reader already know how to drive. The visual state
          is on the label, so the input itself is invisible without leaving the tab order —
          and the label carries the focus ring the invisible input cannot show.

          The input covers its whole card rather than being `sr-only`. A visually hidden
          input sits at the card's top edge, and selecting it made the browser scroll that
          edge into view: scrolled down to the prices, a click jumped the page ~550px up. */}
      <fieldset className="w-full">
        <legend className="sr-only">Пакет</legend>

        <div className="grid grid-cols-3 items-end gap-[7px] lg:gap-[33px]">
          {plans.map((plan) => {
            const on = selected === plan.id;
            return (
              <label
                key={plan.id}
                className="relative cursor-pointer rounded-[12px] outline-offset-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-t-red lg:rounded-[42px]"
              >
                <input
                  type="radio"
                  name="plan-choice"
                  value={plan.id}
                  checked={on}
                  onChange={() => setSelected(plan.id)}
                  onClick={(e) => {
                    /* A pointer click (`detail` is 0 for keyboard selection) on desktop
                       brings "НАПРЕД" to the middle of the screen — the owner's request on
                       2026-09-27. On phones the button is already stuck to the bottom. */
                    if (e.detail > 0 && window.matchMedia("(min-width: 1024px)").matches) {
                      document.getElementById(PLAN_CONTINUE_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="absolute inset-0 z-10 size-full cursor-pointer appearance-none opacity-0"
                />
                <CardFace plan={plan} selected={on} />
              </label>
            );
          })}
        </div>

        {/* Shirt count and price, one column per card and aligned to the same grid. The
            selected package's count is the only one in bold, as both frames have it. */}
        <div className="mt-[19px] grid grid-cols-3 gap-[7px] lg:mt-[38px] lg:gap-[33px]">
          {plans.map((plan) => (
            <div key={plan.id} className="text-center">
              <p
                className={`font-body text-[18px] leading-[normal] tracking-[0.36px] text-t-black opacity-80 lg:text-[32px] lg:tracking-[0.64px] ${
                  selected === plan.id ? "font-bold" : ""
                }`}
              >
                {/* One line on desktop, two on mobile — the frames break it before the
                    slash at the narrow width and run it together at the wide one. */}
                <span className="max-lg:block">
                  {plan.shirtCount === 1 ? "1 тениска" : `${plan.shirtCount} тениски`}
                </span>
                <span>/месец</span>
              </p>
              <p className="mt-[16px] font-headline text-[18px] uppercase leading-[1.12] text-t-red lg:mt-[40px] lg:text-[57.166px]">
                {plan.price}
              </p>
            </div>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
