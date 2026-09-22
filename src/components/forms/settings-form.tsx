"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/lib/actions/auth";
import { circleInput, Field, fieldLabel, sectionLabel } from "@/components/forms/field";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import type { Customer } from "@/payload-types";

function CircleCheckbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-[7px]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className={circleInput} />
      <span className={fieldLabel}>{label}</span>
    </label>
  );
}

/* Labelled fields shared with /join/delivery (forms/field.tsx). */
export function SettingsForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const e = customer.emailPreferences ?? {};

  return (
    <form action={action} className="flex w-full flex-col gap-[28px] lg:w-[563px]">
      <ErrorNotice message={state.error} />
      <InfoNotice message={state.ok ? "Промените са записани." : undefined} />

      <Field name="name" label="Име" autoComplete="name" defaultValue={customer.name} />
      <Field name="email" label="Имейл" type="email" autoComplete="email" defaultValue={customer.email} />

      <div className="flex flex-col gap-[20px]">
        <p className={sectionLabel}>Имейли</p>
        <CircleCheckbox name="newsletter" label="Новини и оферти" defaultChecked={e.newsletter ?? true} />
        <CircleCheckbox name="dropReminder" label="Напомняне за избора на дроп" defaultChecked={e.dropReminder ?? true} />
      </div>

      <p className={sectionLabel}>Смяна на парола</p>
      <div className="-mt-[8px] flex w-full flex-row gap-[41px] max-md:flex-col max-md:gap-[28px]">
        <Field name="password" label="Нова парола" type="password" autoComplete="new-password" required={false} />
        <Field name="password2" label="Повтори новата парола" type="password" autoComplete="new-password" required={false} />
      </div>

      <button type="submit" disabled={pending} className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-50">
        Запази
      </button>
    </form>
  );
}
