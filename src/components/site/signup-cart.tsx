"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SHIRT_GENDER_LABELS, SHIRT_SIZE_LABELS } from "@/lib/shirt-options";

export type CartSlot = {
  slot: number;
  categoryName: string | null;
  image: string | null;
  size: string | null;
  gender: string | null;
};

/**
 * The order cart — Figma revision of 2026-09-27. Three shapes, one per place it is drawn:
 *
 * - `CartSheet` — mobile, every order step: a cream dashed sheet stuck to the bottom of the
 *   viewport (annotated *"this bottom sheet appears as a cart and its stuck at the bottom.
 *   It shows your selected tees and how much picks remain"*). Collapsed it is "ВИЖ ПОРЪЧКА"
 *   over one bare tile per shirt; opened (`524:720`) it is one row per shirt.
 * - `CartStrip` — desktop, design step: one column per shirt *inside* the picker card, 80px
 *   under the picker (`525:5775`, `Frame 177`).
 * - `CartList` — desktop, account and payment steps: a 593px "ПОРЪЧКА" box of rows beside
 *   the form (`525:6298` / `525:6736`, `Group 135`).
 *
 * Every slot is one of three states:
 *
 * - **picked** — the design's picture, its details and "РЕДАКТИРАЙ";
 * - **active** — the shirt being picked now, annotated *"current editing"*: a red wash over
 *   its tile, a solid red row in the opened sheet, a red number bar on desktop; never
 *   "РЕДАКТИРАЙ";
 * - **empty** — the grey T-shirt placeholder tile (`public/figma/account/shirt-placeholder.svg`,
 *   from "ДРОП page states V2"; the owner's call of 2026-09-27 for every shirt not picked
 *   yet). "How many picks remain" is these tiles; there is no counter text.
 *
 * The number lives on a bar above the picture in the desktop strip and on a badge in the
 * picture's corner in the rows; the collapsed sheet shows none. Details show only once a
 * slot has a design.
 *
 * Exactly `shirtCount` slots render (owner decision 15), each at the size the frames give
 * one of four — a Фен order is two tiles of that size, not two stretched across the row.
 */

type SlotState = "picked" | "active" | "empty";

/** A shirt not picked yet: a `#f5f5f5` tile with a faint T-shirt, drawn as one SVG. */
export const SHIRT_PLACEHOLDER = "/figma/account/shirt-placeholder.svg";

const SIGNUP_EDIT = "/signup/design?slot=";

const stateOf = (s: CartSlot, activeSlot: number): SlotState => (s.slot === activeSlot ? "active" : s.categoryName ? "picked" : "empty");

function CartStar() {
  return <Image src="/figma/signup/design/cart-star.svg" alt="" width={40} height={39} className="h-[39.26px] w-[40.15px] rotate-180" />;
}

/* ------------------------------------------------------------------ mobile sheet */

/** `editHref` is where a row's "РЕДАКТИРАЙ" goes, with the slot number appended: the signup
    design step by default, `/account?choose=` on the account page. */
export function CartSheet({ slots, activeSlot = 0, editHref = SIGNUP_EDIT }: { slots: CartSlot[]; activeSlot?: number; editHref?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Keeps the end of the page scrollable clear of the collapsed sheet, which would
          otherwise sit over the step's last button. */}
      <div aria-hidden="true" className="h-[200px] lg:hidden" />
      <div className="fixed inset-x-[14.5px] bottom-0 z-40 lg:hidden">
        <div
          className={`flex max-h-[80dvh] flex-col overflow-y-auto rounded-t-[20px] border-3 border-b-0 border-dashed border-black bg-[#fffdea] px-[18.5px] pb-[20px] pt-[18.5px] ${
            open ? "gap-[25px]" : "gap-[10px]"
          }`}
        >
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex h-[39.26px] w-full shrink-0 items-center justify-between">
            <span className="flex items-center gap-[15px]">
              <CartStar />
              <span className="font-dot text-[18px] font-bold uppercase leading-[normal] tracking-normal text-[#212121] underline">
                {open ? "Скрий" : "Виж поръчка"}
              </span>
            </span>
            <span className="relative block h-[14px] w-[8px]">
              <Image
                src={open ? "/figma/signup/design/chevron-close.svg" : "/figma/signup/design/chevron-open.svg"}
                alt=""
                width={10}
                height={16}
                className="absolute -top-px -left-px h-[16px] w-[10px] max-w-none"
              />
            </span>
          </button>

          {open ? (
            <ul className="flex flex-col gap-[25px]">
              {slots.map((s) => (
                <SlotRow key={s.slot} slot={s} state={stateOf(s, activeSlot)} onEdit={close} editHref={editHref} />
              ))}
            </ul>
          ) : (
            /* Bare tiles — the revision drops the numbers from the collapsed sheet. */
            <ul className="flex flex-row items-end gap-[20px]">
              {slots.map((s) => (
                <li key={s.slot} className="w-[67.5px] shrink-0">
                  <span className="sr-only">Тениска {s.slot}</span>
                  <SlotPicture slot={s} state={stateOf(s, activeSlot)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- desktop, design step */

/** Rendered inside the picker card by `SignupPicker`, which supplies the 80px above it. */
export function CartStrip({ slots, activeSlot }: { slots: CartSlot[]; activeSlot: number }) {
  return (
    <ul className="flex flex-row items-start gap-[20px]">
      {slots.map((s) => {
        const state = stateOf(s, activeSlot);
        return (
          <li key={s.slot} className="flex w-[295px] shrink-0 flex-col gap-[10px]">
            <SlotBar slot={s.slot} state={state} />
            <SlotPicture slot={s} state={state} />
            {!s.categoryName ? null : (
              <div className="flex flex-col gap-[10px]">
                <SlotDetails slot={s} />
                {state === "picked" ? <EditLink slot={s.slot} /> : null}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* The 47px bar over each column of the desktop strip. An empty slot keeps the height with
   no bar behind its number, so the pictures in the row stay level. */
function SlotBar({ slot, state }: { slot: number; state: SlotState }) {
  const look = state === "active" ? "bg-t-red text-t-neon" : state === "picked" ? "bg-[#686868] text-white" : "text-[#4e4e4e]";
  return (
    <span className={`flex h-[47px] w-full items-center justify-center rounded-[23px] font-headline text-[24px] uppercase leading-[1.12] tracking-[1.92px] ${look}`}>
      <span className="sr-only">Тениска </span>
      {slot}
    </span>
  );
}

/* ------------------------------------------------- desktop, account and payment */

/**
 * "ПОРЪЧКА": a 593px box, header then one row per shirt, 40px apart. Padding is the
 * frames' 21.5px inset minus the 3px border (Figma strokes inside).
 */
export function CartList({ slots, className = "" }: { slots: CartSlot[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-[40px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] p-[18.5px] max-lg:hidden ${className}`}>
      <p className="flex h-[39.26px] items-center gap-[15px]">
        <CartStar />
        <span className="font-dot text-[32px] font-bold uppercase leading-[normal] tracking-normal text-[#212121]">Поръчка</span>
      </p>
      <ul className="flex flex-col gap-[40px]">
        {slots.map((s) => (
          <SlotRow key={s.slot} slot={s} state={stateOf(s, 0)} />
        ))}
      </ul>
    </div>
  );
}

/**
 * The account and payment steps' cart: the sheet on mobile, the "ПОРЪЧКА" box on desktop.
 * Every shirt is picked by then and none is active. It renders for Базов too — there it is
 * the order summary, not a count of picks remaining.
 */
export function SignupCart({ slots, listClassName }: { slots: CartSlot[]; listClassName?: string }) {
  if (!slots.length) return null;
  return (
    <>
      <CartSheet slots={slots} />
      <CartList slots={slots} className={listClassName} />
    </>
  );
}

/**
 * The same rows, read-only and 40px apart — the История tab's "ПРЕГЛЕД НА ПОКУПКА" popup
 * (Figma `554:3352`, annotated *"depending on the subscription package it has to shown
 * 1,2,3,4 elements of order"*).
 */
export function ShirtRows({ slots }: { slots: CartSlot[] }) {
  return (
    <ul className="flex flex-col gap-[40px]">
      {slots.map((s) => (
        <SlotRow key={s.slot} slot={s} state={stateOf(s, 0)} readOnly />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ shared parts */

/**
 * One shirt as a row — the opened sheet's and the "ПОРЪЧКА" box's: the numbered picture,
 * then the details and "РЕДАКТИРАЙ". The shirt being picked is a solid red panel with neon
 * labels and white values, 9px round and inset 9/10px.
 */
function SlotRow({ slot: s, state, onEdit, editHref = SIGNUP_EDIT, readOnly = false }: { slot: CartSlot; state: SlotState; onEdit?: () => void; editHref?: string; readOnly?: boolean }) {
  const active = state === "active";
  return (
    <li className={active ? "rounded-[9px] bg-t-red px-[9px] py-[10px]" : ""}>
      <div className="flex flex-row items-center">
        <div className="w-[96px] shrink-0">
          <SlotPicture slot={s} state={state} badge />
        </div>
        {!s.categoryName ? null : (
          <div className="flex min-w-0 flex-1 flex-col gap-[10px] px-5">
            <SlotDetails slot={s} spread tone={active ? "active" : "default"} />
            {state === "picked" && !readOnly ? <EditLink slot={s.slot} onClick={onEdit} href={editHref} /> : null}
          </div>
        )}
      </div>
    </li>
  );
}

function SlotPicture({ slot, state, badge = false }: { slot: CartSlot; state: SlotState; badge?: boolean }) {
  /* Picked tiles are 15.95px round; the active and empty ones 12.49px — as drawn. In a
     row the active shirt sits on its red panel instead, so only a bare tile gets the wash. */
  const radius = state === "picked" || (badge && state === "active") ? "rounded-[15.95px]" : "rounded-[12.49px]";
  return (
    <span className={`relative block aspect-[277.68/297.36] w-full overflow-hidden bg-[#f5f5f5] ${radius}`}>
      {slot.image ? (
        <Image src={slot.image} alt="" fill sizes="(min-width: 1024px) 295px, 96px" className="object-cover" />
      ) : (
        <Image src={SHIRT_PLACEHOLDER} alt="" fill className="object-cover" />
      )}
      {state === "active" && slot.image && !badge ? <span className="absolute inset-0 bg-t-red/30" /> : null}
      {badge ? <SlotBadge slot={slot.slot} state={state} /> : null}
    </span>
  );
}

/* The number in the picture's bottom-left corner: 30×29 on the 96px picture (7.81% in,
   67.24px down, 31.25% wide), grey — red with a neon number for the shirt being picked. */
function SlotBadge({ slot, state }: { slot: number; state: SlotState }) {
  return (
    <span
      className={`absolute left-[7.81%] top-[67.24px] flex h-[29px] w-[31.25%] items-center justify-center rounded-[11.064px] font-headline text-[13.469px] uppercase leading-[1.12] ${
        state === "active" ? "bg-t-red text-t-neon" : "bg-[#686868] text-white"
      }`}
    >
      <span className="sr-only">Тениска </span>
      {slot}
    </span>
  );
}

/* КАТЕГОРИЯ on its own line, then ПОЛ and РАЗМЕР side by side: spread across a row, a fixed
   53px apart under a desktop column. On the red panel the labels are neon and the values
   white. */
export function SlotDetails({ slot, spread = false, tone = "default" }: { slot: CartSlot; spread?: boolean; tone?: "default" | "active" }) {
  const colors = tone === "active" ? { label: "text-t-neon", value: "text-white" } : { label: "text-[#686868]", value: "text-t-red" };
  return (
    <dl className="flex flex-col gap-[10px] font-headline uppercase leading-[1.12]">
      <Detail label="Категория" value={slot.categoryName ?? "—"} className="w-[165px] max-w-full" colors={colors} />
      <div className={`flex flex-row items-center ${spread ? "justify-between" : "gap-[53px]"}`}>
        <Detail label="Пол" value={slot.gender ? SHIRT_GENDER_LABELS[slot.gender] : "—"} className="w-[56px]" colors={colors} />
        <Detail label="Размер" value={slot.size ? SHIRT_SIZE_LABELS[slot.size] : "—"} className="w-[78px]" colors={colors} />
      </div>
    </dl>
  );
}

function Detail({ label, value, className, colors }: { label: string; value: string; className: string; colors: { label: string; value: string } }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <dt className={`text-[12px] tracking-[0.96px] ${colors.label}`}>{label}</dt>
      <dd className={`text-[16px] tracking-normal ${colors.value}`}>{value}</dd>
    </div>
  );
}

/* Annotated *"this on click opens the category picker container page to edit this pick"*. */
function EditLink({ slot, onClick, href = SIGNUP_EDIT }: { slot: number; onClick?: () => void; href?: string }) {
  return (
    <Link href={`${href}${slot}`} onClick={onClick} className="flex w-fit items-center gap-[12px]">
      <Image src="/figma/signup/design/pencil.svg" alt="" width={21} height={21} className="h-[20.75px] w-[21.36px]" />
      <span className="font-headline text-[12px] uppercase leading-[1.12] tracking-[0.96px] text-black">
        Редактирай<span className="sr-only"> тениска {slot}</span>
      </span>
    </Link>
  );
}
