"use client";

import { useActionState } from "react";
import { resetPassword, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";
import { wooBox, wooButton, wooInput, wooLabel, wooRequired } from "./woo";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, {});
  return (
    <form className={wooBox} action={action}>
      <ErrorNotice message={state.error} />
      <input type="hidden" name="token" value={token} />
      <p className="mt-3">
        <label className={wooLabel} htmlFor="password">Нова парола (поне 8 знака) {wooRequired}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={wooInput} />
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="password2">Повтори паролата {wooRequired}</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" required minLength={8} className={wooInput} />
      </p>
      <p className="mt-[25px] flex items-center gap-4 pb-[9px]">
        <button type="submit" disabled={pending} className={wooButton}>Запази</button>
      </p>
    </form>
  );
}
