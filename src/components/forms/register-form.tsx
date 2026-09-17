"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authButton, authField, authLabel, authSideLink } from "@/components/site/auth-page";
import { register, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";
import { OAuthButtons } from "./oauth-buttons";

const intro = "w-[563px] max-w-full font-dot text-[18px] leading-[1.4] text-t-black";

/* Restyled 2026-09-16 to the Figma "Login" frame's fields (backlog #17): this and
   reset-password were the last two pages on the old WooCommerce look, which is gone.
   The copy is unchanged — the "log in from here" ending is backlog #10, a separate call. */
export function RegisterForm({ oauth }: { oauth: { google: boolean; facebook: boolean } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});

  if (state.ok) {
    return (
      <div className="flex flex-col gap-[31px]">
        <p className={intro}>Готово, профилът е създаден.</p>
        <Link href="/login" className={`${authSideLink} w-fit`}>Влез от тук</Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col" action={action}>
      <ErrorNotice message={state.error} />

      <div className="flex w-[563px] max-w-full flex-col gap-[28px]">
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="name">Име и фамилия</label>
          <input id="name" name="name" autoComplete="name" required className={authField} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="email">Имейл адрес</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={authField} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="password">Парола (поне 8 знака)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={authField} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="password2">Повтори паролата</label>
          <input id="password2" name="password2" type="password" autoComplete="new-password" required minLength={8} className={authField} />
        </div>
      </div>

      <div className="mt-[31px] flex flex-wrap items-center gap-x-[30px] gap-y-5">
        <button type="submit" disabled={pending} className={authButton}>
          Регистрация
        </button>
        <Link href="/login" className={`${authSideLink} w-[262px]`}>
          Вече имаш профил? Влез
        </Link>
      </div>

      <OAuthButtons google={oauth.google} facebook={oauth.facebook} />
    </form>
  );
}
