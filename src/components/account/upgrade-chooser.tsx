"use client";

import Image from "next/image";
import { useState } from "react";

export type UpgradePlan = { id: number; name: string; shirtCount: number; price: string; image: string | null; recommended: boolean };

/* The package step's neon panel behind a recommended card (plan-cards.tsx), same stops. */
const NEON_FADE =
  "linear-gradient(180deg, rgb(206,255,88) 0%, rgb(206,255,88) 56.25%, rgba(206,255,88,0) 61.058%, rgba(206,255,88,0) 100%)";

const RADIUS = "rounded-[26px] max-lg:rounded-[12px]";
const NAME = "text-center font-headline text-[24px] uppercase leading-[1.12] tracking-[1.92px] max-lg:text-[12px] max-lg:tracking-[0.96px]";
const TAG = "font-headline text-[16px] uppercase leading-[1.12] tracking-[1.28px] max-lg:text-[7.5px] max-lg:tracking-[0.6px]";

function Picture({ src, aspect }: { src: string | null; aspect: string }) {
  return (
    <span className={`relative block w-full overflow-hidden bg-[#f5f5f5] ${RADIUS} ${aspect}`}>
      {src ? <Image src={src} alt="" fill sizes="(min-width: 1024px) 249px, 30vw" className="object-cover" /> : null}
    </span>
  );
}

function Face({ plan, selected }: { plan: UpgradePlan; selected: boolean }) {
  if (selected) {
    return (
      <span className={`flex flex-col items-center gap-[28px] bg-t-red pb-[26px] max-lg:gap-[12px] max-lg:pb-[12px] ${RADIUS}`}>
        <Picture src={plan.image} aspect="aspect-[249/231.74]" />
        <span className="flex flex-col items-center gap-[4px] text-white">
          <span className={TAG}>избрано</span>
          <span className={NAME}>{plan.name}</span>
        </span>
      </span>
    );
  }
  if (plan.recommended) {
    return (
      <span className="flex flex-col">
        <span className={`flex flex-col items-center gap-[17px] pt-[15px] max-lg:gap-[8px] max-lg:pt-[7px] ${RADIUS}`} style={{ backgroundImage: NEON_FADE }}>
          <span className={`${TAG} text-t-red`}>препоръчан</span>
          <Picture src={plan.image} aspect="aspect-[249/264.2]" />
        </span>
        <span className={`mt-[44px] text-t-red max-lg:mt-[20px] ${NAME}`}>{plan.name}</span>
      </span>
    );
  }
  return (
    <span className="flex flex-col">
      <Picture src={plan.image} aspect="aspect-[249.3/267]" />
      <span className={`mt-[42px] text-t-red max-lg:mt-[19px] ${NAME}`}>{plan.name}</span>
    </span>
  );
}

/**
 * Step 1/2 of the package change: the package step's cards and prices (`plan-cards.tsx`)
 * at the popup's 249px, annotated *"this popup is based on the package selector list the
 * only difference is that your current package … is grayed out - 20% opacity and disable
 * for selection"*. Lower packages are greyed out the same way while the month after an
 * upgrade runs.
 *
 * "ИЗБЕРИ" is a GET to /account that opens step 2/2 for the chosen package.
 */
export function UpgradeChooser({
  plans,
  currentPlanId,
  preselectId,
  lowerDisabled,
}: {
  plans: UpgradePlan[];
  currentPlanId: number;
  preselectId: number | null;
  lowerDisabled: boolean;
}) {
  const current = plans.find((p) => p.id === currentPlanId);
  const disabled = (p: UpgradePlan) => p.id === currentPlanId || (lowerDisabled && current != null && p.shirtCount < current.shirtCount);
  const [selected, setSelected] = useState<number | null>(preselectId);

  return (
    <form method="get" action="/account" className="flex flex-col gap-[41px] max-lg:gap-[25px]">
      <input type="hidden" name="upgrade" value="confirm" />
      <fieldset>
        <legend className="sr-only">Пакет</legend>
        <div className="grid grid-cols-3 items-end gap-[15px] max-lg:gap-[7px]">
          {plans.map((p) => {
            const off = disabled(p);
            return (
              <label
                key={p.id}
                className={`relative rounded-[26px] outline-offset-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-t-red max-lg:rounded-[12px] ${off ? "cursor-not-allowed opacity-20" : "cursor-pointer"}`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={selected === p.id}
                  disabled={off}
                  onChange={() => setSelected(p.id)}
                  className="absolute inset-0 z-10 size-full cursor-[inherit] appearance-none opacity-0"
                />
                <Face plan={p} selected={selected === p.id} />
              </label>
            );
          })}
        </div>
        <div className="mt-[20px] grid grid-cols-3 gap-[15px] max-lg:gap-[7px]">
          {plans.map((p) => (
            <div key={p.id} className={`text-center ${disabled(p) ? "opacity-20" : ""}`}>
              <p className={`font-body text-[32px] leading-[normal] tracking-[0.64px] text-t-black max-lg:text-[18px] ${selected === p.id ? "font-bold opacity-80" : ""}`}>
                <span className="block">{p.shirtCount === 1 ? "1 тениска" : `${p.shirtCount} тениски`}</span>
                <span>/месец</span>
              </p>
              <p className="mt-[48px] font-headline text-[32px] uppercase leading-[1.12] text-t-red max-lg:mt-[16px] max-lg:text-[18px]">{p.price}</p>
            </div>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={selected == null}
        className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-50 disabled:hover:bg-t-red disabled:hover:text-t-cream"
      >
        Избери
      </button>
    </form>
  );
}
