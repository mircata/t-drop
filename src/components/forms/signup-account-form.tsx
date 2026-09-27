"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useActionState } from "react";
import { CARRIERS, circleInput, sectionLabel } from "@/components/forms/field";
import { authField } from "@/components/site/auth-page";
import { FunnelError } from "@/components/site/funnel-glyph";
import { createSignupAccount, type FormState } from "@/lib/actions/signup";

/* 18px Handjet. The shared `fieldLabel` is the 16px of the older "DELIVERY page states"
   frame, which /account still follows. */
const label = "font-dot text-[18px] leading-[normal] tracking-normal text-[#212121]";

/* A label over its field, 80.5px. The two password groups are drawn with a fixed 84.256px
   height (`Frame 175`) and the others hug their content, so those two carry `tall` and keep
   the frames' 3.7px of air under the field. */
function Field({
  name,
  label: text,
  type = "text",
  tall = false,
  ...rest
}: { name: string; label: string; tall?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-[10px] max-lg:w-full max-lg:flex-none ${tall ? "h-[84.256px]" : ""}`}>
      <label className={label} htmlFor={name}>
        {text}
      </label>
      <input id={name} name={name} type={type} required className={authField} {...rest} />
    </div>
  );
}

/* Two fields side by side, 20px apart, on desktop (`Frame 200`); stacked on the phone,
   where every field is full width. */
function Pair({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-row gap-[20px] max-lg:flex-col max-lg:gap-[28px]">{children}</div>;
}

/**
 * Step 2-2, "Създаване на акаунт" (Figma `524:479` mobile, `525:6298` desktop).
 *
 * One 28px-rhythm column, as drawn: the password and its repeat, "информация за доставка",
 * "информация за спедитор" with the three couriers and the address, then "нотификации и
 * политики" with the two consent boxes. On desktop the fields pair up — password with its
 * repeat, name with phone, city with postcode — and the address runs full width; on the
 * phone all of them are stacked. There is no email field: the address was taken at step 0.
 *
 * "СЪЗДАЙ АКАУНТ" is annotated *"after this click you can create the profile"*. It is 28px
 * under the last checkbox on the phone and 53.6px on desktop, full width of the 579px column
 * there and 359px on the phone.
 */
export function SignupAccountForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createSignupAccount, {});

  return (
    <form action={action} className="flex w-[579px] max-w-full flex-col max-lg:w-[362px]">
      <div className="flex flex-col gap-[28px]">
        <Pair>
          <Field name="password" label="Парола" type="password" tall autoComplete="new-password" minLength={8} />
          <Field name="password2" label="Повторете парола" type="password" tall autoComplete="new-password" minLength={8} />
        </Pair>

        <p className={sectionLabel}>информация за доставка</p>
        <Pair>
          <Field name="recipientName" label="Имена за доставка" autoComplete="name" />
          <Field name="phone" label="Тел. номер" type="tel" autoComplete="tel" />
        </Pair>

        <p id="carrier-label" className={sectionLabel}>
          информация за спедитор
        </p>
        {/* One courier per order, so radios, drawn as the frames' circles with a filled dot.
            Spread across the full width at both sizes, labels in capitals as drawn. */}
        <div role="radiogroup" aria-labelledby="carrier-label" className="flex w-full flex-row items-center justify-between">
          {CARRIERS.map((c) => (
            <label key={c.value} className="flex cursor-pointer flex-row items-center gap-[12px]">
              <input type="radio" name="carrier" value={c.value} required className={circleInput} />
              <span className={`${label} uppercase`}>{c.label}</span>
            </label>
          ))}
        </div>
        <Pair>
          <Field name="city" label="Град" autoComplete="address-level2" />
          <Field name="postcode" label="Пощенски код" autoComplete="postal-code" />
        </Pair>
        {/* "footlocker" is what BOX NOW call their parcel machines, so the label is correct
            as drawn — confirmed by the owner on 2026-09-22, do not "fix" it to "офис". */}
        <Field name="addressOrOffice" label="Адрес на доставка/footlocker/автомат" autoComplete="street-address" />

        <p className={sectionLabel}>нотификации и политики</p>
        {/* Required, and kept separate from the marketing box below it: consent that is
            bundled with a condition of service is not consent. */}
        <label className="flex cursor-pointer flex-row items-center gap-[12px]">
          <input type="checkbox" name="privacyAccepted" required className={circleInput} />
          <span className={label}>
            Съгласявам се с{" "}
            {/* TODO: point at the policy once the lawyer's text lands — a required consent
                box on a dead link is worse than no box (docs/pre-launch.md). */}
            <a href="#" className="underline">
              Политиката за поверителност
            </a>
            .
          </span>
        </label>
        <label className="flex cursor-pointer flex-row items-center gap-[12px]">
          <input type="checkbox" name="marketingOptIn" className={circleInput} />
          <span className={label}>Искам да получавам нотификации за нов дроп и новини по мейл.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-[53.6px] flex h-[71px] w-full shrink-0 items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-70 max-lg:mt-[27.6px] max-lg:w-[359px] max-lg:max-w-full"
      >
        Създай акаунт
      </button>

      <FunnelError message={state.error} className="mt-[15px]" />
    </form>
  );
}
