import type { InputHTMLAttributes } from "react";
import { authField } from "@/components/site/auth-page";

/* The labelled field style from Figma "DELIVERY page states" (501:525, 2026-09-17): label
   above, 50.5px field with rounded-[6px], red border on grey. Shared by /join/delivery and
   the account forms (/account/address, /account/details) so every form outside the auth
   pages looks the same — do not bring back the old centred placeholder-only pills. */

export const sectionLabel = "font-headline text-[18px] leading-[1.12] uppercase tracking-[1.44px] text-[#686868]";
/* 23px line box, not the body's 1.2: Figma's "normal" leading for these 16px labels is
   23px, which is what makes each label+field group exactly 83.5px tall. */
export const fieldLabel = "font-dot text-[16px] leading-[23px] text-[#212121]";

/* Circle with a filled inner dot, as drawn for the courier choice. Works on radios and
   checkboxes alike. */
export const circleInput =
  "size-[23.571px] shrink-0 cursor-pointer appearance-none rounded-full border border-t-red bg-t-grey checked:border-t-red checked:bg-[radial-gradient(circle,#cc0e45_0_7.76px,transparent_7.76px)]";

export const CARRIERS = [
  { value: "speedy", label: "Speedy" },
  { value: "boxnow", label: "Boxnow" },
  { value: "sameday", label: "Sameday" },
];

export function Field({ name, label, type = "text", required = true, ...rest }: { name: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      <label className={fieldLabel} htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className={authField} {...rest} />
    </div>
  );
}

/** One courier per order, so radios. Controlled when `value`/`onChange` are passed, otherwise uncontrolled with `defaultValue`. */
export function CarrierRadios({ value, onChange, defaultValue }: { value?: string; onChange?: (v: string) => void; defaultValue?: string }) {
  return (
    <fieldset className="flex w-full flex-col gap-[10px]">
      <legend className={`${fieldLabel} mb-[10px]`}>Спедитор</legend>
      <div className="flex w-full flex-row items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
        {CARRIERS.map((c) => (
          <label key={c.value} className="flex cursor-pointer flex-row items-center gap-[7px]">
            <input
              type="radio"
              name="carrier"
              value={c.value}
              required
              {...(onChange ? { checked: value === c.value, onChange: () => onChange(c.value) } : { defaultChecked: defaultValue === c.value })}
              className={circleInput}
            />
            <span className={fieldLabel}>{c.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
