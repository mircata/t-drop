"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { JoinUsps } from "@/components/site/join-usps";
import { headline36 } from "@/components/site/shared";

type Theme = { id: number; name: string; image: string | null };

const GENDERS = [
  { value: "male", label: "Мъж" },
  { value: "female", label: "Жена" },
];
const SIZES = ["s", "m", "l", "xl"];

const pillRow = "flex h-[46px] w-full items-center justify-center rounded-[14px] font-headline text-[14px] uppercase tracking-[1.12px] cursor-pointer";
const pillOn = "bg-t-red text-white";
const pillOff = "bg-[#d9d9d9] text-[#686868]";
const fieldLabel = "font-headline text-[18px] leading-[1.12] uppercase tracking-[1.44px] text-[#686868]";

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 9V14M10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19ZM10.0498 6V6.1L9.9502 6.1002V6H10.0498Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Figma "JOIN page" (482:3844, 2026-09-16): full redesign of /join, replacing the old
   single-form product page. Picking gender/size/design here no longer submits straight
   to Stripe — "Избери" goes to /join/delivery to collect shipping first (see the
   design's own annotation on that button), which then hands off to startCheckout. */
export function JoinPicker({ planName, price, themes, dropLabel }: { planName: string; price: string; themes: Theme[]; dropLabel: string }) {
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const canContinue = !!gender && !!size && !!selected;

  /* The button stays greyed out until all three are picked, which said nothing about why
     (backlog #13). List what is left, joined the way Bulgarian reads: "пол, размер и дизайн". */
  const missing = [!gender && "пол", !size && "размер", !selected && "дизайн"].filter(Boolean) as string[];
  const missingText = missing.length
    ? `Избери ${missing.length > 1 ? `${missing.slice(0, -1).join(", ")} и ${missing[missing.length - 1]}` : missing[0]}, за да продължиш.`
    : null;

  function handleContinue() {
    if (!canContinue) return;
    router.push(`/join/delivery?gender=${gender}&size=${size}&theme=${selected}`);
  }

  return (
    <section className="site-container flex flex-col gap-[75px] pt-10 max-md:px-5">
      <div className="flex flex-row items-start gap-[47px] max-lg:flex-col">
        <div className="flex w-[48.83%] flex-col gap-[54px] max-lg:w-full">
          <h1 className={headline36}>{planName}</h1>
          <div className="flex h-[87px] w-full items-center justify-center rounded-[20px] border-3 border-dashed border-black bg-[#fffdea]">
            <p className="font-dot text-[32px] uppercase text-[#212121]">{price}/месец</p>
          </div>

          <div className="flex flex-col gap-[30px]">
            <p className={fieldLabel}>Пол</p>
            <div className="flex flex-col gap-[15px]">
              {GENDERS.map((g) => (
                <button key={g.value} type="button" onClick={() => setGender(g.value)} className={`${pillRow} ${gender === g.value ? pillOn : pillOff}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[30px]">
            <p className={fieldLabel}>Размер</p>
            <div className="flex flex-col gap-[15px]">
            <div className="grid grid-cols-2 gap-[15px]">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} className={`${pillRow} ${size === s ? pillOn : pillOff}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#size-chart" className="flex h-[46px] items-center gap-[12px] font-dot text-[14px] text-[#212121] underline">
              <InfoIcon className="size-[18px] shrink-0" />
              Виж размерите
            </a>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-start max-lg:w-full max-lg:justify-center">
          {/* Figma has the star sitting mostly behind the photo, its bottom-right
              corner poking out past the photo's own bottom-right corner — positioning
              it flush inside the photo's box (as before) left it fully covered. */}
          <div className="relative -mt-[11px] w-full max-w-[547px] max-lg:mt-0">
            <Image src="/figma/join/star.svg" alt="" width={294} height={290} className="absolute left-[71%] top-[72%] -z-10 w-[54%] max-md:left-[55%] max-md:w-[45%]" />
            <Image src="/figma/join/hero.png" alt={planName} width={800} height={1000} className="relative aspect-[4/5] w-full rounded-[25px] object-cover" />
          </div>
        </div>
      </div>

      <JoinUsps />

      <div className="flex w-full flex-col gap-[30px]">
        <div className="flex flex-row items-center gap-10 max-md:gap-5">
          <p className={fieldLabel}>дизайн</p>
          {/* Annotated "new badge showing the month of the current drop of arrival" (500:521) */}
          <div className="flex h-[60px] items-center rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 max-md:h-[52px] max-md:px-4">
            <p className={fieldLabel}>{dropLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-[57px] max-lg:gap-5 max-md:grid-cols-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`flex flex-col items-center gap-[35px] rounded-[29px] pb-[26px] ${t.id === selected ? "border-4 border-t-red bg-t-red text-white" : "text-[#4e4e4e]"}`}
            >
              <span className="relative block aspect-[277/297] w-full overflow-hidden rounded-[29px]">
                {t.image && <Image src={t.image} alt={t.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />}
              </span>
              <span className="font-headline text-[18px] uppercase tracking-[1.44px]">{t.name}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-row flex-wrap items-center gap-x-[30px] gap-y-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            aria-describedby={missingText ? "join-missing" : undefined}
            className="block h-[71px] w-[395px] rounded-[50px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-[#fffef9] max-md:w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Избери
          </button>
          <p id="join-missing" aria-live="polite" className="w-[280px] max-w-full font-dot text-[18px] leading-[1.4] text-[#686868] empty:hidden">
            {missingText}
          </p>
        </div>
      </div>
    </section>
  );
}
