"use client";

import { useState } from "react";
import { ErrorNotice } from "@/components/forms/notice";
import { CarrierRadios, Field, fieldLabel, sectionLabel } from "@/components/forms/field";
import { startCheckout } from "@/lib/actions/checkout";

/* Figma "DELIVERY page states" (501:525, redesign 2026-09-17). The redesign moved this
   page onto the same fields as the auth pages — labelled, 50.5px, rounded-[6px], red
   border on grey — so it uses the shared `Field` (forms/field.tsx) rather than its old centred pills.
   Two annotations on the frame: the Спедитор row is marked "checkboxes" and the
   "Поръчай" button "leads to stripe payment screen" (it already calls startCheckout).
   The carrier controls are drawn as circles with a filled inner dot, i.e. radios, and
   the owner confirmed one courier per order — so they are real radio inputs.
   There is only a "Logged OUT State" frame; for a signed-in customer the whole
   "информация за логин" section is dropped, as it was before. */

export function DeliveryForm({
  gender,
  size,
  theme,
  errorMessage,
  loggedInEmail,
}: {
  gender: string;
  size: string;
  theme: string;
  errorMessage?: string;
  loggedInEmail?: string;
}) {
  const [carrier, setCarrier] = useState("");

  return (
    <form action={startCheckout} className="flex w-[563px] max-w-full flex-col gap-[28px]">
      <input type="hidden" name="gender" value={gender} />
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="theme" value={theme} />

      <ErrorNotice message={errorMessage} />

      {loggedInEmail ? (
        <p className={fieldLabel}>
          Ще използваме имейла на профила ти: <span className="font-bold">{loggedInEmail}</span>
        </p>
      ) : (
        <>
          <p className={sectionLabel}>информация за логин</p>
          <Field name="email" label="Имейл" type="email" autoComplete="email" />
          <div className="flex w-full flex-row gap-[41px] max-md:flex-col max-md:gap-[28px]">
            <Field name="password" label="Парола" type="password" autoComplete="new-password" minLength={8} />
            <Field name="password2" label="Повтори Парола" type="password" autoComplete="new-password" minLength={8} />
          </div>
        </>
      )}

      <p className={sectionLabel}>информация за доставка</p>
      <Field name="recipientName" label="Две имена" autoComplete="name" />
      <Field name="phone" label="Тел Номер" type="tel" autoComplete="tel" />
      <Field name="city" label="Град" autoComplete="address-level2" />
      {/* Not in the design, kept on the owner's call: the courier labels and the factory
          CSV both use the postcode, so it stays on its own row under Град. */}
      <Field name="postcode" label="Пощенски код" autoComplete="postal-code" />

      <CarrierRadios value={carrier} onChange={setCarrier} />

      <Field name="addressOrOffice" label="Адрес на доставка/офис/автомат" autoComplete="street-address" />

      <button
        type="submit"
        className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black"
      >
        Поръчай
      </button>
    </form>
  );
}
