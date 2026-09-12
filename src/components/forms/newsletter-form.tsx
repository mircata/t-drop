"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/auth";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

/* Footer newsletter form. Markup matches the v0.1 port; a message replaces the form after submit. */
export function NewsletterForm({ placeholder, buttonLabel }: { placeholder: string; buttonLabel: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, {});
  if (state.ok) {
    return (
      <p className="flex min-h-[133px] w-full items-center justify-center text-center font-body text-[24px] tracking-[0.04em] text-t-black md:max-lg:w-[53%] max-md:w-[88%]">
        Провери имейла си и потвърди от линка.
      </p>
    );
  }
  return (
    <form className="flex w-full flex-col md:max-lg:w-[53%] max-md:w-[88%]" action={action}>
      <input
        type="email"
        name="email"
        required
        placeholder={placeholder}
        aria-invalid={state.error ? true : undefined}
        title={state.error}
        className="h-[52px] w-full rounded-[50px] border border-t-red bg-t-grey px-5 font-body text-[24px] tracking-[0.04em] text-t-black outline-none placeholder:text-[#666]"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2.5 h-[71px] w-full rounded-[50px] font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-red hover:bg-t-neon"
      >
        {state.error ?? buttonLabel}
      </button>
    </form>
  );
}
