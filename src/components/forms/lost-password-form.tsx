"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";
import { wooBox, wooButton, wooInput, wooLabel, wooLink, wooRequired } from "./woo";

export function LostPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPassword, {});
  if (state.ok) {
    return (
      <div className={wooBox}>
        <p className="py-2 font-roboto text-[14px] leading-[1.8] text-[#515151]">
          Ако този имейл има профил, ще получиш линк за нова парола до няколко минути.
        </p>
      </div>
    );
  }
  return (
    <form className={wooBox} action={action}>
      <ErrorNotice message={state.error} />
      <p className="pt-1 font-roboto text-[14px] leading-[1.8] text-[#515151]">
        Забравена парола? Въведи имейла си и ще ти изпратим линк за нова.
      </p>
      <p className="mt-3">
        <label className={wooLabel} htmlFor="email">Имейл адрес {wooRequired}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={wooInput} />
      </p>
      <p className="mt-[25px] flex items-center gap-4">
        <button type="submit" disabled={pending} className={wooButton}>Изпрати</button>
      </p>
      <p className="mt-1 pb-[9px]">
        <Link href="/register" className={wooLink}>Обратно към влизане</Link>
      </p>
    </form>
  );
}
