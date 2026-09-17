"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, type FormState } from "@/lib/actions/auth";
import { authButton, authField, authLabel, authSideLink } from "@/components/site/auth-page";
import { ErrorNotice } from "./notice";

const intro = "w-[563px] max-w-full font-dot text-[18px] leading-[1.4] text-t-black";

export function LostPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPassword, {});
  if (state.ok) {
    return (
      <div className="flex flex-col gap-[31px]">
        <p className={intro}>Ако този имейл има профил, ще получиш линк за нова парола до няколко минути.</p>
        <Link href="/login" className={`${authSideLink} w-fit`}>Обратно към влизане</Link>
      </div>
    );
  }
  return (
    <form className="flex flex-col" action={action}>
      <ErrorNotice message={state.error} />
      <p className={`${intro} mb-[28px]`}>Забравена парола? Въведи имейла си и ще ти изпратим линк за нова.</p>

      <div className="flex w-[563px] max-w-full flex-col gap-[10px]">
        <label className={authLabel} htmlFor="email">Имейл адрес</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={authField} />
      </div>

      <div className="mt-[31px] flex flex-wrap items-center gap-x-[30px] gap-y-5">
        <button type="submit" disabled={pending} className={authButton}>
          Изпрати
        </button>
        <Link href="/login" className={`${authSideLink} w-[262px]`}>
          Обратно към влизане
        </Link>
      </div>
    </form>
  );
}
