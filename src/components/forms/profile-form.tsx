"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/lib/actions/auth";
import type { Customer } from "@/payload-types";
import { ErrorNotice, InfoNotice } from "./notice";
import { wooButton, wooInput, wooLabel, wooRequired } from "./woo";

const row = "mt-3";

export function ProfileForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const a = customer.address ?? {};
  const e = customer.emailPreferences ?? {};
  return (
    <form className="rounded-[3px] border border-[#d5d8dc] bg-white px-[30px] py-4" action={action}>
      <InfoNotice message={state.ok ? "Промените са записани." : undefined} />
      <ErrorNotice message={state.error} />

      <p className="pt-1"><label className={wooLabel} htmlFor="name">Име и фамилия {wooRequired}</label>
        <input id="name" name="name" defaultValue={customer.name} required className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="email">Имейл адрес {wooRequired}</label>
        <input id="email" name="email" type="email" defaultValue={customer.email} required className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="phone">Телефон</label>
        <input id="phone" name="phone" type="tel" defaultValue={customer.phone ?? ""} className={wooInput} /></p>

      <h3 className="mt-6 font-roboto text-[18px] text-black">Адрес за доставка</h3>
      <p className={row}><label className={wooLabel} htmlFor="line1">Улица и номер</label>
        <input id="line1" name="line1" defaultValue={a.line1 ?? ""} className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="line2">Допълнение (вход, етаж, апартамент)</label>
        <input id="line2" name="line2" defaultValue={a.line2 ?? ""} className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="city">Град</label>
        <input id="city" name="city" defaultValue={a.city ?? ""} className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="postcode">Пощенски код</label>
        <input id="postcode" name="postcode" defaultValue={a.postcode ?? ""} className={wooInput} /></p>
      <input type="hidden" name="country" value={a.country ?? "BG"} />

      <h3 className="mt-6 font-roboto text-[18px] text-black">Имейли</h3>
      <p className={row}><label className="flex items-center gap-1.5 font-roboto text-[14px] text-[#69727d]">
        <input type="checkbox" name="newsletter" defaultChecked={e.newsletter ?? true} className="size-[13px]" /> Новини и оферти</label></p>
      <p className={row}><label className="flex items-center gap-1.5 font-roboto text-[14px] text-[#69727d]">
        <input type="checkbox" name="dropReminder" defaultChecked={e.dropReminder ?? true} className="size-[13px]" /> Напомняне за избор на дроп</label></p>

      <h3 className="mt-6 font-roboto text-[18px] text-black">Смяна на парола</h3>
      <p className={row}><label className={wooLabel} htmlFor="password">Нова парола (остави празно, за да не я сменяш)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className={wooInput} /></p>
      <p className={row}><label className={wooLabel} htmlFor="password2">Повтори новата парола</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" className={wooInput} /></p>

      <p className="mt-[25px] flex items-center gap-4 pb-[9px]">
        <button type="submit" disabled={pending} className={wooButton}>Запази промените</button>
      </p>
    </form>
  );
}
