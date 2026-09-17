"use client";

import { useActionState } from "react";
import { authButton, authField, authLabel } from "@/components/site/auth-page";
import { resetPassword, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";

/* Restyled 2026-09-16 to the Figma "Login" frame's fields (backlog #17). */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, {});

  return (
    <form className="flex flex-col" action={action}>
      <ErrorNotice message={state.error} />
      <input type="hidden" name="token" value={token} />

      <div className="flex w-[563px] max-w-full flex-col gap-[28px]">
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="password">Нова парола (поне 8 знака)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={authField} />
        </div>
        <div className="flex flex-col gap-[10px]">
          <label className={authLabel} htmlFor="password2">Повтори паролата</label>
          <input id="password2" name="password2" type="password" autoComplete="new-password" required minLength={8} className={authField} />
        </div>
      </div>

      <div className="mt-[31px]">
        <button type="submit" disabled={pending} className={authButton}>
          Запази
        </button>
      </div>
    </form>
  );
}
