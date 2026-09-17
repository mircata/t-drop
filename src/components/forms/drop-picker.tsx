"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { pickCategory } from "@/lib/actions/drop";

type PickerCategory = { id: number; name: string; image: string };

const GENDERS = [
  { value: "male", label: "Мъж" },
  { value: "female", label: "Жена" },
];
const SIZES = ["s", "m", "l", "xl"];

const pill = "flex h-[46px] flex-1 items-center justify-center rounded-[14px] font-headline text-[14px] uppercase tracking-[1.12px]";
const pillOn = "bg-t-red text-white";
const pillOff = "bg-[#d9d9d9] text-[#686868]";
const fieldLabel = "mb-[30px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]";

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

export function DropPicker({
  categories,
  pickedId,
  locked,
  defaultSize,
  defaultGender,
}: {
  categories: PickerCategory[];
  pickedId: number | null;
  locked: boolean;
  defaultSize: string | null;
  defaultGender: string | null;
}) {
  const [selected, setSelected] = useState<number | null>(pickedId);
  const [size, setSize] = useState<string | null>(defaultSize);
  const [gender, setGender] = useState<string | null>(defaultGender);

  return (
    <form id="drop" action={pickCategory} className="flex flex-col gap-[30px] rounded-[20px] border-3 border-dashed border-black px-5 py-10">
      {locked && (
        <p className="text-[16px] text-t-red">
          Остават по-малко от 3 седмици до доставката — изборът за следващия дроп е затворен до отваряне на новия прозорец.
        </p>
      )}

      <div>
        <p className={fieldLabel}>Пол</p>
        <div className={`flex gap-[15px] ${locked ? "opacity-40" : ""}`}>
          {GENDERS.map((g) => (
            <label key={g.value} className={`${pill} ${locked ? "cursor-not-allowed" : "cursor-pointer"} ${gender === g.value ? pillOn : pillOff}`}>
              <input
                type="radio"
                name="gender"
                value={g.value}
                checked={gender === g.value}
                onChange={() => setGender(g.value)}
                disabled={locked}
                className="sr-only"
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className={fieldLabel}>Размер</p>
        <div className={`flex items-center gap-[15px] max-md:flex-wrap ${locked ? "opacity-40" : ""}`}>
          {SIZES.map((s) => (
            <label key={s} className={`${pill} min-w-[80px] ${locked ? "cursor-not-allowed" : "cursor-pointer"} ${size === s ? pillOn : pillOff}`}>
              <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} disabled={locked} className="sr-only" />
              {s.toUpperCase()}
            </label>
          ))}
          <Link href="/join" className="flex shrink-0 items-center gap-[12px] font-body text-[14px] text-t-black underline">
            <InfoIcon className="size-[18px] shrink-0 text-t-black" />
            Виж размерите
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[40px] max-lg:gap-5 max-md:grid-cols-2">
        {categories.map((c) => (
          <label
            key={c.id}
            className={`flex flex-col items-center gap-[35px] rounded-[29px] pb-[26px] max-md:gap-[15px] max-md:pb-[15px] ${locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${
              c.id === selected ? "border-4 border-t-red bg-t-red text-white" : "text-[#4e4e4e]"
            }`}
          >
            <input
              type="radio"
              name="drop"
              value={c.id}
              checked={c.id === selected}
              onChange={() => setSelected(c.id)}
              disabled={locked}
              className="sr-only"
            />
            <span className="relative block aspect-[277/297] w-full overflow-hidden rounded-[29px]">
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </span>
            <span className="font-headline text-[18px] uppercase tracking-[1.44px]">{c.name}</span>
          </label>
        ))}
      </div>

      <button type="submit" disabled={locked} className="block h-[71px] w-full rounded-[50px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream disabled:cursor-not-allowed disabled:opacity-50">
        Избери
      </button>
    </form>
  );
}
