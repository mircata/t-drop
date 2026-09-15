"use client";

import { useEffect, useState, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createSetupIntent, setDefaultPaymentMethod } from "@/lib/actions/payment";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const submitButton = "flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream disabled:opacity-50";

function SetupForm({ onSaved }: { onSaved: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Данните не можаха да се проверят.");
      setPending(false);
      return;
    }

    const { setupIntent, error: confirmError } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    if (confirmError) {
      setError(confirmError.message ?? "Плащането не можа да бъде запазено.");
      setPending(false);
      return;
    }

    const pmId = typeof setupIntent?.payment_method === "string" ? setupIntent.payment_method : setupIntent?.payment_method?.id;
    if (pmId) {
      await setDefaultPaymentMethod(pmId);
      onSaved();
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[24px] lg:w-[719px]">
      <PaymentElement />
      {error && <p className="text-[14px] text-t-red">{error}</p>}
      <button type="submit" disabled={!stripe || pending} className={submitButton}>
        {pending ? "Запазва се…" : "Запази"}
      </button>
    </form>
  );
}

/** Native Stripe Elements on the page itself — a SetupIntent + Payment Element, not a Portal redirect. */
export function PaymentMethodForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    createSetupIntent().then((res) => {
      if ("clientSecret" in res) setClientSecret(res.clientSecret);
      else setError(res.error);
    });
  }, []);

  if (!stripePromise || error) {
    return <p className="text-[16px] text-t-red">Плащанията още не са включени. Опитай по-късно.</p>;
  }
  if (saved) {
    return <p className="text-[16px] text-[#1faa3d]">Методът за плащане е записан.</p>;
  }
  if (!clientSecret) {
    return <p className="text-[16px] text-t-black">Зарежда се…</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "bg",
        fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" }],
        appearance: {
          variables: {
            colorPrimary: "#cc0e45",
            colorText: "#212121",
            colorBackground: "#eaeaea",
            borderRadius: "14px",
            fontFamily: "Roboto, sans-serif",
          },
        },
      }}
    >
      <SetupForm onSaved={() => setSaved(true)} />
    </Elements>
  );
}
