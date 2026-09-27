"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Glyph } from "@/components/site/funnel-glyph";
import { pickCategory } from "@/lib/actions/drop";
import { SHIRT_GENDERS, SHIRT_SIZES } from "@/lib/shirt-options";

type PickerCategory = { id: number; name: string; image: string };

const pill = "flex h-[46px] w-full items-center justify-center rounded-[14px] font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px]";
const pillOn = "bg-t-red text-white";
const pillOff = "bg-[#d9d9d9] text-[#686868]";
const label = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868]";

/**
 * The /account design picker — Figma "ДРОП page states V2" (`549:280` Базов, `549:1264`
 * Фен, `549:1513` Семеен), annotated *"this container is the design picker"* and *"we will
 * use placeholder based on the users previous choice"* — so it opens on the shirt's own pick,
 * or on the customer's previous size and gender.
 *
 * One dashed card, 30px rhythm: ПОЛ as two wide pills, РАЗМЕР as four pills with "Виж
 * размерите" closing the row, the four categories, a full-width "ИЗБЕРИ", and — for Фен and
 * up — the package's shirts under it (`strip`, rendered by the page). On the phone it takes
 * the signup design step's shape: categories two by two, the chart opening in place.
 *
 * It picks one shirt: `slot` rides along to `pickCategory`, which checks it against the
 * package.
 */
export function DropPicker({
  categories,
  slot,
  pickedId,
  locked,
  defaultSize,
  defaultGender,
  sizeChart,
  strip,
}: {
  categories: PickerCategory[];
  slot: number;
  pickedId: number | null;
  locked: boolean;
  defaultSize: string | null;
  defaultGender: string | null;
  sizeChart: ReactNode;
  strip?: ReactNode;
}) {
  const [selected, setSelected] = useState<number | null>(pickedId);
  const [size, setSize] = useState<string | null>(defaultSize);
  const [gender, setGender] = useState<string | null>(defaultGender);
  const off = locked ? "cursor-not-allowed opacity-40" : "cursor-pointer";

  return (
    <form
      id="drop"
      action={pickCategory}
      /* Padding is the frame's 20/40px inset minus the 3px border (Figma strokes inside). */
      className="flex w-full flex-col gap-[30px] rounded-[20px] border-3 border-dashed border-black px-[17px] py-[37px] max-lg:py-[18.5px]"
    >
      <input type="hidden" name="slot" value={slot} />

      {locked && (
        <p className="font-dot text-[18px] leading-[normal] text-t-red">
          Остават по-малко от 3 седмици до доставката — изборът за следващия дроп е затворен до отваряне на новия прозорец.
        </p>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-[30px]">
        <legend className="sr-only">Пол и размер</legend>
        <div role="radiogroup" aria-labelledby="drop-gender" className="flex flex-col gap-[30px]">
          <p id="drop-gender" className={label}>Пол</p>
          <div className="grid grid-cols-2 gap-[15px]">
            {SHIRT_GENDERS.map((g) => (
              <label key={g.value} className={`${pill} ${off} ${gender === g.value ? pillOn : pillOff}`}>
                <input type="radio" name="gender" value={g.value} checked={gender === g.value} onChange={() => setGender(g.value)} className="sr-only" />
                {g.label}
              </label>
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="drop-size" className="flex flex-col gap-[30px]">
          <p id="drop-size" className={label}>Размер</p>
          <div className="flex flex-row items-center gap-[15px] max-lg:flex-col max-lg:items-start">
            <div className="grid flex-1 grid-cols-4 gap-[15px] max-lg:w-full">
              {SHIRT_SIZES.map((s) => (
                <label key={s.value} className={`${pill} ${off} ${size === s.value ? pillOn : pillOff}`}>
                  <input type="radio" name="size" value={s.value} checked={size === s.value} onChange={() => setSize(s.value)} className="sr-only" />
                  {s.label}
                </label>
              ))}
            </div>
            {/* The frame ends the size row with "Виж размерите". It opens the chart in place:
                /account has no chart of its own to jump to. */}
            <details className="group w-[205px] shrink-0 max-lg:w-full">
              <summary className="flex h-[46px] cursor-pointer list-none items-center gap-[12px] [&::-webkit-details-marker]:hidden">
                <Glyph src="/figma/signup/design/info.svg" />
                <span className="font-dot text-[18px] leading-[normal] tracking-normal text-[#212121] underline">Виж размерите</span>
              </summary>
            </details>
          </div>
        </div>
      </fieldset>

      {/* The chart itself, full width under the size row, shown while "Виж размерите" is open. */}
      <SizeChartToggle>{sizeChart}</SizeChartToggle>

      <div role="radiogroup" aria-label="Дизайн" className="grid grid-cols-4 gap-[40px] max-lg:grid-cols-2 max-lg:gap-[25px]">
        {categories.map((c) => {
          const on = c.id === selected;
          return (
            <label
              key={c.id}
              className={`relative flex h-[387px] flex-col items-center gap-[35px] rounded-[29px] pb-[26px] max-lg:h-[212.8px] max-lg:gap-[19.25px] max-lg:rounded-[15.95px] max-lg:pb-[14.3px] ${off} ${
                on
                  ? "bg-t-red text-white after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border-4 after:border-t-red max-lg:after:border-[2.2px]"
                  : "text-[#4e4e4e]"
              }`}
            >
              <input type="radio" name="drop" value={c.id} checked={on} onChange={() => setSelected(c.id)} disabled={locked} className="sr-only" />
              <span className="relative block h-[297.4px] w-full shrink-0 overflow-hidden rounded-[29px] max-lg:h-[163.5px] max-lg:rounded-[15.95px]">
                {c.image ? <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 277px, 152px" className="object-cover" /> : null}
              </span>
              <span className="font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] max-lg:text-[14px] max-lg:tracking-[1.12px]">{c.name}</span>
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={locked}
        className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-t-red disabled:hover:text-t-cream"
      >
        Избери
      </button>

      {strip ? <div className="max-lg:hidden">{strip}</div> : null}
    </form>
  );
}

/* Shows the chart while the size row's "Виж размерите" <details> is open. A sibling rather
   than the <details> body, so the chart spans the card instead of the 205px link column. */
function SizeChartToggle({ children }: { children: ReactNode }) {
  return <div className="hidden [form:has(details[open])_&]:block">{children}</div>;
}
