"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";
import { wooBox, wooButton, wooInput, wooLabel, wooLink, wooRequired } from "./woo";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  if (state.ok) {
    return (
      <div className={wooBox}>
        <p className="py-2 font-roboto text-[14px] leading-[1.8] text-[#515151]">
          Готово. Изпратихме ти имейл с линк за потвърждение. Отвори го и после влез от{" "}
          <Link href="/your-profile" className={wooLink}>тук</Link>.
        </p>
      </div>
    );
  }
  return (
    <form className={wooBox} action={action}>
      <ErrorNotice message={state.error} />
      <p className="pt-1">
        <label className={wooLabel} htmlFor="name">Име и фамилия {wooRequired}</label>
        <input id="name" name="name" autoComplete="name" required className={wooInput} />
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="email">Имейл адрес {wooRequired}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={wooInput} />
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="password">Парола (поне 8 знака) {wooRequired}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={wooInput} />
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="password2">Повтори паролата {wooRequired}</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" required minLength={8} className={wooInput} />
      </p>
      <p className="mt-[25px] flex items-center gap-4">
        <button type="submit" disabled={pending} className={wooButton}>Регистрация</button>
      </p>
      <p className="mt-1 pb-[9px]">
        <Link href="/your-profile" className={wooLink}>Вече имаш профил? Влез</Link>
      </p>
    </form>
  );
}
