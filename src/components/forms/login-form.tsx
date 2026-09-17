"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/lib/actions/auth";
import { authButton, authField, authLabel, authSideLink } from "@/components/site/auth-page";
import { ErrorNotice } from "./notice";
import { GoogleIcon } from "./oauth-buttons";

const googleButton =
  "flex h-[50px] w-[336.5px] max-w-full items-center justify-center gap-[9.6px] rounded-[15.4px] border border-[#f5f5f5] bg-white px-[19px] font-roboto text-[13.5px] font-medium text-[#595959]";

/* Figma "Login" (495:3, full redesign 2026-09-16). The design dropped "Remember Me",
   so the session is always kept for 30 days (hidden `remember`). The Google button is
   in the design as a placeholder: it links to the OAuth flow once GOOGLE_CLIENT_ID/SECRET
   are set, and until then renders as an inert button. No Facebook button in the design.
   "Забравена парола?" isn't in the design; placed under the sign-up link on request. */
export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form className="flex flex-col" action={action}>
      <ErrorNotice message={state.error} />
      <input type="hidden" name="remember" value="on" />

      <div className="flex w-[563px] max-w-full flex-col gap-[28px]">
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="email">Имейл</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={authField} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="password">Парола</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={authField} />
        </div>
      </div>

      <div className="mt-[31px] flex flex-wrap items-center gap-x-[30px] gap-y-5">
        <button type="submit" disabled={pending} className={authButton}>
          Вход
        </button>
        <div className="flex w-[262px] flex-col gap-[10px]">
          <Link href="/join" className={authSideLink}>
            Нямаш акаунт? Направи си
          </Link>
          <Link href="/your-profile/lost-password" className="font-dot text-[18px] leading-none text-[#686868] hover:text-t-red">
            Забравена парола?
          </Link>
        </div>
      </div>

      <div className="mt-[51px] flex w-[336.5px] max-w-full flex-col items-center gap-4">
        <p className="font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-t-red">или</p>
        {googleEnabled ? (
          <Link href="/your-profile/oauth/google" prefetch={false} className={`${googleButton} hover:border-t-red`}>
            <GoogleIcon className="size-[21px] shrink-0" /> Влез с Google
          </Link>
        ) : (
          <span className={`${googleButton} cursor-default`} aria-disabled="true" title="Скоро">
            <GoogleIcon className="size-[21px] shrink-0" /> Влез с Google
          </span>
        )}
      </div>
    </form>
  );
}
