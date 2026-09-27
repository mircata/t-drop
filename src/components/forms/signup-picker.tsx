"use client";

import Image from "next/image";
import { useActionState, useState, type ReactNode } from "react";
import { FunnelError, Glyph } from "@/components/site/funnel-glyph";
import { CartSheet, CartStrip, type CartSlot } from "@/components/site/signup-cart";
import { savePick, type FormState } from "@/lib/actions/signup";
import { SHIRT_GENDERS, SHIRT_SIZES } from "@/lib/shirt-options";

export type Theme = { id: number; name: string; image: string | null };

const pill = "flex h-[46px] w-full items-center justify-center rounded-[14px] font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px] cursor-pointer";
const pillOn = "bg-t-red text-white";
const pillOff = "bg-[#d9d9d9] text-[#686868]";
const label = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868]";

/**
 * Step 2-1, the design picker — Figma `519:628` (mobile) and `525:5130` (desktop) for Базов,
 * `524:179` / `525:5775` for Фен and up.
 *
 * One dashed card holding, in this order: ДИЗАЙН with the drop badge and the four category
 * cards, ПОЛ, РАЗМЕР with "Виж размерите", then "ИЗБЕРИ" and the error line — the button is
 * inside the card in every frame — and, on desktop for Фен and up, the cart strip 80px
 * under all of it. The package name sits above the card, rendered by the page (Figma
 * revision of 2026-09-27; it used to be the card's first line, in grey). The two widths are arranged
 * differently and the frames are explicit about both:
 *
 * - **mobile** runs one column at a flat 30px rhythm, categories two by two, gender as two
 *   pills side by side, sizes as four in a row, error line under the button;
 * - **desktop** puts the four categories in one row, then drops ПОЛ / РАЗМЕР / the button
 *   into a 615px left column beside a photo, with gender *stacked* full width, sizes two by
 *   two, and the error line beside the button instead of under it.
 *
 * "Виж размерите" is a link down to the size chart on desktop, where the frame lays the
 * chart out on the page, and opens it in place on mobile, where the frame has no chart.
 *
 * The screen repeats once per shirt in the package (owner decision 8) and each pick carries
 * its own gender and size. Which shirt is being picked is the cart's job.
 *
 * Editing a slot from the cart is a navigation, not local state — the draft is the source
 * of truth and the URL says which shirt is being edited, so a reload or a back button lands
 * in the same place. The page keys this component by slot, so the choices reset to that
 * shirt's own when the URL changes.
 */
export function SignupPicker({
  slot,
  themes,
  dropLabel,
  slots,
  initial,
  sizeChart,
}: {
  slot: number;
  themes: Theme[];
  dropLabel: string;
  slots: CartSlot[];
  initial: { category: number | null; size: string | null; gender: string | null };
  /** The chart "Виж размерите" opens on mobile. Rendered by the page and passed in. */
  sizeChart: ReactNode;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePick, {});
  const [gender, setGender] = useState<string | null>(initial.gender);
  const [size, setSize] = useState<string | null>(initial.size);
  const [category, setCategory] = useState<number | null>(initial.category);

  return (
    <>
      <form action={action} className="w-full">
        <input type="hidden" name="slot" value={slot} />
        <input type="hidden" name="gender" value={gender ?? ""} />
        <input type="hidden" name="size" value={size ?? ""} />
        <input type="hidden" name="category" value={category ?? ""} />

        {/* Padding is the frames' inset minus the 3px border: Figma draws the stroke inside
            the padding, CSS outside it. The phone frame's 21.5px side inset is not used — that
            card is drawn 373px wide on a 402px screen, 3px more than the 16px gutters leave,
            and 17 + 3 keeps the frame's 330px of content inside the 370 that is there. */}
        <div className="flex w-full flex-col gap-[30px] rounded-[20px] border-3 border-dashed border-black px-[17px] py-[37px] max-lg:py-[18.5px]">
          <div role="group" aria-labelledby="pick-design" className="flex flex-col gap-[30px]">
            {/* The phone frame's badge ends flush with the card's content edge, but its 181px
                box cannot hold its own 146px label plus the 20px insets, and "ДРОП - ОКТ" is
                wider still. So on the phone the badge keeps its label on one line and sits
                against that edge, and the 40px gap gives way instead. */}
            <div className="flex h-[60px] flex-row items-center gap-[40px] max-lg:justify-between max-lg:gap-2">
              <p id="pick-design" className={label}>Дизайн</p>
              {/* The same dashed drop badge /join renders, computed from nextDeliveryDate. */}
              <span className="flex h-[60px] items-center rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-[17px] whitespace-nowrap">
                <span className={label}>{dropLabel}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-[25px] lg:grid-cols-4 lg:gap-[44px]">
              {themes.map((t) => {
                const on = category === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCategory(t.id)}
                    aria-pressed={on}
                    /* The selected outline is an overlay, not a border: Figma strokes inside,
                       over the image, so the image keeps its full size in both states. */
                    className={`relative flex h-[212.8px] flex-col items-center gap-[19.25px] rounded-[15.95px] pb-[14.3px] lg:h-[387px] lg:gap-[35px] lg:rounded-[29px] lg:pb-[26px] ${
                      on
                        ? "bg-t-red text-white after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border-[2.2px] after:border-t-red lg:after:border-4"
                        : "text-[#4e4e4e]"
                    }`}
                  >
                    <span className="relative block h-[163.5px] w-full shrink-0 overflow-hidden rounded-[15.95px] lg:h-[297.4px] lg:rounded-[29px]">
                      {t.image ? <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 277px, 152px" className="object-cover" /> : null}
                    </span>
                    <span className="font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px] lg:text-[18px] lg:tracking-[1.44px]">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: a 615px column beside the photo, 79px under the categories and 19px
              lower than the photo's top edge. Mobile: the same 30px rhythm as above. */}
          <div className="flex flex-col gap-[30px] lg:mt-[49px] lg:flex-row lg:items-start lg:justify-between lg:pr-[59.5px]">
            <div className="flex flex-col gap-[30px] lg:mt-[19.27px] lg:w-[615px] lg:gap-[40px]">
              <div role="group" aria-labelledby="pick-gender" className="flex flex-col gap-[30px]">
                <p id="pick-gender" className={label}>Пол</p>
                <div className="grid grid-cols-2 gap-[15px] lg:grid-cols-1">
                  {SHIRT_GENDERS.map((g) => (
                    <button key={g.value} type="button" onClick={() => setGender(g.value)} aria-pressed={gender === g.value} className={`${pill} ${gender === g.value ? pillOn : pillOff}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div role="group" aria-labelledby="pick-size" className="flex flex-col">
                <p id="pick-size" className={`${label} mb-[30px]`}>Размер</p>
                <div className="grid grid-cols-4 gap-[15px] lg:grid-cols-2">
                  {SHIRT_SIZES.map((s) => (
                    <button key={s.value} type="button" onClick={() => setSize(s.value)} aria-pressed={size === s.value} className={`${pill} ${size === s.value ? pillOn : pillOff}`}>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Desktop: jump to the chart the frame lays out further down the page. */}
                <a href="#size-chart" className="mt-[15px] flex h-[46px] w-fit items-center gap-[12px] max-lg:hidden">
                  <Glyph src="/figma/signup/design/info.svg" />
                  <span className="font-dot text-[24px] leading-[normal] tracking-normal text-[#212121] underline">Виж размерите</span>
                </a>

                {/* Mobile: open it in place. `<details>` works before hydration and lets
                    find-in-page reach the numbers. */}
                <details className="mt-[30px] w-full lg:hidden">
                  <summary className="flex h-[46px] w-fit cursor-pointer list-none items-center gap-[12px] [&::-webkit-details-marker]:hidden">
                    <Glyph src="/figma/signup/design/info.svg" />
                    <span className="font-dot text-[18px] leading-[normal] tracking-[0.36px] text-[#212121] opacity-80">Виж размерите</span>
                  </summary>
                  <div className="mt-[20px]">{sizeChart}</div>
                </details>
              </div>

              <div className="flex flex-col gap-[15px] lg:flex-row lg:items-center">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex h-[71px] w-full shrink-0 items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-70 lg:w-[330px]"
                >
                  Избери
                </button>

                {/* The frame's error bar. The action names what is missing. */}
                <FunnelError message={state.error} className="lg:w-[265px]" />
              </div>
            </div>

            <Image
              src="/figma/signup/design/models.png"
              alt=""
              width={469}
              height={587}
              sizes="436px"
              className="h-[545.3px] w-[435.7px] shrink-0 max-lg:hidden"
            />
          </div>

          {/* Desktop, Фен and up: the cart inside the card, 80px under the picker — the
              card's 30px gap plus 50. On mobile the cart is the sheet below instead. */}
          {slots.length > 1 ? (
            <div className="mt-[50px] max-lg:hidden">
              <CartStrip slots={slots} activeSlot={slot} />
            </div>
          ) : null}
        </div>
      </form>

      {slots.length > 1 ? <CartSheet slots={slots} activeSlot={slot} /> : null}
    </>
  );
}
