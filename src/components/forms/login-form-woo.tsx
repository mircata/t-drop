"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/lib/actions/auth";
import { ErrorNotice, InfoNotice } from "./notice";
import { wooBox, wooButton, wooInput, wooLabel, wooLink, wooRequired } from "./woo";

/* The WooCommerce login form on /your-profile. Markup matches the v0.1 port. */
export function LoginFormWoo({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form className={wooBox} action={action}>
      <InfoNotice message={notice} />
      <ErrorNotice message={state.error} />
      <p className="pt-1">
        <label className={wooLabel} htmlFor="username">
          Потребителско име или имейл адрес {wooRequired}
        </label>
        <input id="username" name="username" type="email" autoComplete="email" required className={wooInput} />
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="password">
          Парола {wooRequired}
        </label>
        <span className="relative block">
          <input id="password" name="password" type="password" autoComplete="current-password" required className={wooInput} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-roboto text-[18px] text-t-black" aria-hidden="true">👁</span>
        </span>
      </p>
      <p className="mt-[25px] flex items-center gap-4">
        <button type="submit" disabled={pending} className={wooButton}>
          Влизане
        </button>
        <label className="flex items-center gap-1.5 font-roboto text-[14px] text-[#69727d]">
          <input type="checkbox" name="rememberme" className="size-[13px]" /> Запомняне
        </label>
      </p>
      <p className="mt-1 pb-[9px]">
        <Link href="/your-profile/lost-password" className={wooLink}>Изгубена парола?</Link><Link href="/your-profile/register" className={`${wooLink} ml-4`}>Нов профил</Link>
      </p>
    </form>
  );
}
