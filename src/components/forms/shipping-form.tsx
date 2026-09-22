"use client";

import { useActionState } from "react";
import { updateShipping, type FormState } from "@/lib/actions/shipping";
import { CarrierRadios, Field } from "@/components/forms/field";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import type { Customer } from "@/payload-types";

/* Same labelled fields as /join/delivery (see forms/field.tsx), so the address a customer
   entered at checkout looks identical when they come back to edit it here. */
export function ShippingForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateShipping, {});
  const s = customer.shipping ?? {};

  return (
    <form action={action} className="flex w-full flex-col gap-[28px] lg:w-[563px]">
      <ErrorNotice message={state.error} />
      <InfoNotice message={state.ok ? "Данните за доставка са записани." : undefined} />

      <Field name="recipientName" label="Две имена" autoComplete="name" defaultValue={s.recipientName ?? customer.name} />
      <Field name="phone" label="Тел Номер" type="tel" autoComplete="tel" defaultValue={customer.phone ?? ""} />
      <Field name="city" label="Град" autoComplete="address-level2" defaultValue={s.city ?? ""} />
      <Field name="postcode" label="Пощенски код" autoComplete="postal-code" defaultValue={s.postcode ?? ""} />
      <CarrierRadios defaultValue={s.carrier ?? ""} />
      <Field name="addressOrOffice" label="Адрес на доставка/офис/автомат" autoComplete="street-address" defaultValue={s.addressOrOffice ?? ""} />

      <button type="submit" disabled={pending} className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-50">
        Запази
      </button>
    </form>
  );
}
