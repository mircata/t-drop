"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/lib/actions/auth";
import { ErrorNotice } from "./notice";

const field =
  "h-[48px] w-full rounded-[4px] border border-[#69727d] bg-white px-4 text-[24px] text-t-black outline-none focus:border-t-red";
const label = "mb-0 block text-[24px] leading-[34px]";

/* The Elementor login widget on /register. Markup matches the v0.1 port. */
export function LoginFormElementor() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form className="mt-[54px] flex flex-col gap-[25px] pb-10" action={action}>
      <ErrorNotice message={state.error} />
      <div>
        <label className={label} htmlFor="user">Username or Email Address</label>
        <input id="user" name="user" type="email" autoComplete="email" required className={field} placeholder="Username or Email Address" />
      </div>
      <div>
        <label className={label} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} placeholder="Password" />
      </div>
      <label className="flex items-center gap-1 text-[24px] leading-[34px]">
        <input type="checkbox" name="remember" className="size-[13px]" /> Remember Me
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-[71px] w-full rounded-[50px] bg-t-red font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black"
      >
        Влез
      </button>
      <div className="flex text-[13.6px] leading-[29px]">
        <Link href="/your-profile/lost-password" className="text-t-black hover:text-t-red">Lost your password?</Link>
        <span className="px-0.5">|</span>
        <Link href="/your-profile/register" className="text-t-black hover:text-t-red">Register</Link>
      </div>
    </form>
  );
}
