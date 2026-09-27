"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { ErrorNotice } from "@/components/forms/notice";
import { startSignup, type FormState } from "@/lib/actions/signup";

/**
 * The email capture of the landing hero — Figma `519:374` (mobile) and `525:3432`
 * (desktop), annotated on the button: *"this button starts the main user flow"*.
 *
 * Submitting creates the signup draft and the action redirects to the package step. The
 * address is the only thing asked for here; the password comes two screens later, which is
 * the gradual commitment the owner asked for (decision 5, docs/new-user-flow.md).
 *
 * Geometry straight from the frame: a 353px column with 17px between its three rows, the
 * note *above* the field rather than below the button, a 50.513px field and a 71px button.
 * The rows are centred on mobile and left-aligned on desktop, which is the only difference
 * between the two frames — hence `align`.
 */
/* Scroll the field to the middle of the screen and focus it. Retried for a moment because
   a closing menu sheet (the header's, on mobile) holds focus until it has finished. */
function focusField(input: HTMLInputElement) {
  let tries = 0;
  const go = () => {
    input.scrollIntoView({ block: "center", behavior: "smooth" });
    input.focus({ preventScroll: true });
    if (document.activeElement !== input && ++tries < 10) setTimeout(go, 60);
  };
  go();
}

export function SignupEmailForm({
  placeholder,
  ctaLabel,
  note,
  align = "center",
}: {
  placeholder: string;
  ctaLabel: string;
  note: string;
  align?: "center" | "start";
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(startSignup, {});
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  /* Links to SIGNUP_HREF land here with the email field focused. Arriving from another
     page, the hash is already set on mount. Clicking one on this page is a hash-only
     navigation, which fires no event React can see, so the click itself is caught — in the
     capture phase, before `Link` handles it. The hero renders a mobile and a desktop copy
     of this form; only the visible one acts. */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const visible = () => input.getClientRects().length > 0;
    if (window.location.hash === "#signup" && visible()) focusField(input);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.pathname !== "/" || a.hash !== "#signup" || window.location.pathname !== "/" || !visible()) return;
      e.preventDefault();
      focusField(input);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <form
      action={action}
      className={`flex w-[353px] max-w-full flex-col gap-[17px] ${align === "center" ? "items-center" : "items-start"}`}
    >
      <ErrorNotice message={state.error} />

      {/* 14px Handjet at 80% opacity, centred in the column — `519:372` / `525:3433`.
          One line in both frames, and the desktop node is explicitly `whitespace-nowrap`.
          The browser needs 366px against Figma's 304px, so nowrap is applied from lg up,
          where there is room to overhang the 353px column; on a phone it wraps to two
          lines rather than being clipped by the section's overflow. */}
      <p className="w-full text-center font-dot text-[14px] leading-[normal] text-t-black opacity-80 lg:whitespace-nowrap">
        {note}
      </p>

      <label className="sr-only" htmlFor={inputId}>
        Имейл
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={placeholder}
        className="h-[50.513px] w-full rounded-[6px] border border-t-red bg-t-grey px-5 font-dot text-[16px] text-t-black outline-none placeholder:text-t-black focus:border-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-70"
      >
        {ctaLabel}
      </button>
    </form>
  );
}
