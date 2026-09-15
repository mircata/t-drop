"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/lib/actions/auth";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import type { Customer } from "@/payload-types";

const field = "h-[50.5px] w-full rounded-[29px] border border-t-red bg-[#eaeaea] px-6 text-center font-dot text-[16px] text-[#212121] outline-none";
const sectionLabel = "font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]";

function CircleCheckbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px]">
      <span className="relative inline-flex size-[24px] shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full border border-t-red bg-[#eaeaea]" />
        <span className="absolute inset-[4px] rounded-full bg-t-red opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="font-dot text-[16px] text-[#212121]">{label}</span>
    </label>
  );
}

export function SettingsForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const e = customer.emailPreferences ?? {};

  return (
    <form action={action} className="flex w-full flex-col gap-[24px] lg:w-[719px]">
      <ErrorNotice message={state.error} />
      <InfoNotice message={state.ok ? "Промените са записани." : undefined} />

      <div className="flex flex-col gap-[14px]">
        <div className="flex flex-col gap-[14px] sm:flex-row">
          <input name="name" defaultValue={customer.name} required placeholder="Име" className={field} />
          <input name="email" type="email" defaultValue={customer.email} required placeholder="Имейл" className={field} />
        </div>
      </div>

      <div className="flex flex-col gap-[25px]">
        <p className={sectionLabel}>Имейли</p>
        <div className="flex flex-col gap-[16px]">
          <CircleCheckbox name="newsletter" label="Новини и оферти" defaultChecked={e.newsletter ?? true} />
          <CircleCheckbox name="dropReminder" label="Напомняне за избора на дроп" defaultChecked={e.dropReminder ?? true} />
        </div>
      </div>

      <div className="flex flex-col gap-[25px]">
        <p className={sectionLabel}>Смяна на парола</p>
        <div className="flex flex-col gap-[14px]">
          <input name="password" type="password" autoComplete="new-password" placeholder="Нова парола" className={field} />
          <input name="password2" type="password" autoComplete="new-password" placeholder="Повтори новата парола" className={field} />
        </div>
      </div>

      <button type="submit" disabled={pending} className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream disabled:opacity-50">
        Запази
      </button>
    </form>
  );
}
