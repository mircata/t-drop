"use client";

import { useActionState } from "react";
import { updateShipping, type FormState } from "@/lib/actions/shipping";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import type { Customer } from "@/payload-types";

const field = "h-[50.5px] w-full rounded-[29px] border border-t-red bg-[#eaeaea] px-6 text-center font-dot text-[16px] text-[#212121] outline-none appearance-none";

export function ShippingForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateShipping, {});
  const s = customer.shipping ?? {};

  return (
    <form action={action} className="flex w-full flex-col gap-[24px] lg:w-[719px]">
      <ErrorNotice message={state.error} />
      <InfoNotice message={state.ok ? "Данните за доставка са записани." : undefined} />

      <div className="flex flex-col gap-[14px]">
        <input name="recipientName" defaultValue={s.recipientName ?? customer.name} required placeholder="Име" className={field} />
        {/* Град added 2026-09-17 alongside the /join/delivery redesign — updateShipping
            requires it now, so this form has to collect it too. Kept in this page's own
            pill style; the account area follows its own 2026-09-15 design, not /join's. */}
        <input name="city" defaultValue={s.city ?? ""} required placeholder="Град" className={field} />
        <div className="flex flex-col gap-[14px] sm:flex-row">
          <input name="phone" defaultValue={customer.phone ?? ""} required placeholder="Тел. номер" className={field} />
          <input name="postcode" defaultValue={s.postcode ?? ""} required placeholder="ПК" className={field} />
        </div>
        <select name="carrier" defaultValue={s.carrier ?? ""} required className={field}>
          <option value="" disabled>Спедитор</option>
          <option value="speedy">Speedy</option>
          <option value="sameday">Sameday</option>
          <option value="boxnow">BoxNow</option>
        </select>
        <input
          name="addressOrOffice"
          defaultValue={s.addressOrOffice ?? ""}
          required
          placeholder="Точен адрес за доставка / офис на куриер"
          className={field}
        />
      </div>

      <button type="submit" disabled={pending} className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream disabled:opacity-50">
        Запази
      </button>
    </form>
  );
}
