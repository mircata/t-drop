"use client";

import { useState, type FormEvent } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { stripeAppearance, stripeFonts, stripePromise } from "@/components/forms/stripe-elements";
import { FunnelError } from "@/components/site/funnel-glyph";
import { startSubscription } from "@/lib/actions/signup-payment";

const button =
  "flex h-[71px] w-full shrink-0 items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-70";

/* 54px from the widget to the button on desktop, 30px on the phone — both frames. */
const buttonGap = "mt-[54px] max-lg:mt-[30.27px]";

function PayForm({ initialError }: { initialError?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    setError(undefined);

    /* Validate the card fields before anything is created on Stripe's side. */
    const { error: fieldError } = await elements.submit();
    if (fieldError) {
      setError(fieldError.message ?? "Провери данните на картата.");
      setPending(false);
      return;
    }

    const started = await startSubscription();
    if ("error" in started) {
      setError(started.error);
      setPending(false);
      return;
    }

    const complete = `${window.location.origin}/signup/payment/complete?subscription=${encodeURIComponent(started.subscriptionId)}`;
    const { error: payError } = await stripe.confirmPayment({
      elements,
      clientSecret: started.clientSecret,
      confirmParams: { return_url: complete },
      /* Stripe leaves the page only when the bank asks for 3-D Secure; otherwise the card is
         charged here and the browser goes to the same completion route itself. */
      redirect: "if_required",
    });
    if (payError) {
      setError(payError.message ?? "Плащането не мина. Опитай пак или с друга карта.");
      setPending(false);
      return;
    }
    /* A full navigation on purpose: the target is a route handler that answers with a
       redirect, which the client-side router cannot follow. */
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(complete);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col">
      <PaymentElement options={{ layout: "tabs" }} />
      <button type="submit" disabled={!stripe || pending} className={`${button} ${buttonGap}`}>
        {pending ? "Обработва се…" : "Абонирай се"}
      </button>
      <FunnelError message={error} className="mt-[15px]" />
    </form>
  );
}

/**
 * Step 3-1's card form — the box the frames draw grey and label "STRIPE WIDGET" (579×790
 * on desktop, 359×482 on the phone), which is Stripe's Payment Element, card only.
 *
 * The Element is mounted before any subscription exists (Stripe's deferred-intent mode:
 * it is told the amount and currency up front), so opening the page creates nothing on
 * Stripe's side. "АБОНИРАЙ СЕ" creates the subscription and confirms its first payment in
 * one go — see `startSubscription` and `/signup/payment/complete`.
 */
export function SignupPaymentForm({ amountCents, currency, initialError }: { amountCents: number; currency: string; initialError?: string }) {
  if (!stripePromise) return <FunnelError message="Плащанията още не са включени. Опитай по-късно." />;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "subscription",
        amount: amountCents,
        currency,
        paymentMethodTypes: ["card"],
        locale: "bg",
        fonts: stripeFonts,
        appearance: stripeAppearance(18),
      }}
    >
      <PayForm initialError={initialError} />
    </Elements>
  );
}
