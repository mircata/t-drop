"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
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
const fieldLabel = "font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]";

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
export function JoinPicker({ planName, price, themes }: { planName: string; price: string; themes: Theme[] }) {
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const canContinue = !!gender && !!size && !!selected;

  function handleContinue() {
    if (!canContinue) return;
    router.push(`/join/delivery?gender=${gender}&size=${size}&theme=${selected}`);
  }

  return (
    <section className="site-container flex flex-col gap-[60px] pt-10 max-md:px-5">
      <div className="flex flex-row gap-[85px] max-lg:flex-col">
        <div className="flex w-[42%] flex-col gap-[30px] max-lg:w-full">
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
            <div className="grid grid-cols-2 gap-[15px]">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} className={`${pillRow} ${size === s ? pillOn : pillOff}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#size-chart" className="flex items-center gap-[12px] font-dot text-[14px] text-[#212121] underline">
              <InfoIcon className="size-[18px] shrink-0" />
              Виж размерите
            </a>
          </div>
        </div>

        <div className="flex w-[58%] items-center justify-center max-lg:w-full">
          {/* Figma has the star sitting mostly behind the photo, its bottom-right
              corner poking out past the photo's own bottom-right corner — positioning
              it flush inside the photo's box (as before) left it fully covered. */}
          <div className="relative w-full max-w-[547px]">
            <Image src="/figma/join/star.svg" alt="" width={445} height={439} className="absolute left-[52%] top-[63%] -z-10 w-[81%]" />
            <Image src="/figma/join/hero.png" alt={planName} width={800} height={1000} className="relative aspect-[4/5] w-full rounded-[25px] object-cover" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[30px]">
        <p className={fieldLabel}>дизайн</p>
        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`flex flex-col items-center gap-[35px] rounded-[29px] pb-[26px] ${t.id === selected ? "border-4 border-t-red bg-t-red text-white" : "text-[#4e4e4e]"}`}
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-[29px]">
                {t.image && <Image src={t.image} alt={t.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />}
              </span>
              <span className="font-headline text-[18px] uppercase tracking-[1.44px]">{t.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="mx-auto block rounded-[50px] bg-t-red px-10 py-[21px] font-headline text-[21px] uppercase tracking-[0.84px] text-[#fffef9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Избери
        </button>
      </div>
    </section>
  );
}
