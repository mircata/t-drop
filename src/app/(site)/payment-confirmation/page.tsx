import type { Metadata } from "next";
import Link from "next/link";
import { pageTitle } from "@/components/site/shared";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { syncCheckoutSession } from "@/lib/stripe-sync";

export const metadata: Metadata = { title: "Payment Confirmation – T-Drop Monthly T-Shirts" };

/* Stripe sends the buyer here after a successful checkout with ?session_id=...
   We read the session straight from Stripe so the page is right even if the
   webhook has not arrived yet. */

const text = "text-[16px] leading-[1.8] text-[#333]";
const link = "text-[#cc3366] underline";

export default async function PaymentConfirmationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { session_id } = await searchParams;
  let state: "paid" | "pending" | "unknown" = "unknown";
  let guest = false;

  if (typeof session_id === "string" && session_id && stripeEnabled()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id, { expand: ["subscription"] });
      if (session.status === "complete" || session.payment_status === "paid") {
        const payload = await getPayloadClient();
        const customer = await syncCheckoutSession(payload, session);
        const signedIn = await getCustomer();
        guest = !signedIn || signedIn.id !== customer.id;
        state = "paid";
      } else {
        state = "pending";
      }
    } catch {
      state = "unknown";
    }
  }

  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>Payment Confirmation</h1>
      {state === "paid" && (
        <>
          <p className={text}>Благодарим! Абонаментът ти е активен. Ще получиш имейл с потвърждение.</p>
          {guest ? (
            <p className={text}>
              Направихме ти профил с имейла от плащането. В имейла има линк, с който избираш парола. После влизаш от{" "}
              <Link href="/your-profile" className={link}>Your Profile</Link>.
            </p>
          ) : (
            <p className={text}>
              Виж абонамента си в <Link href="/my-account" className={link}>My account</Link>.
            </p>
          )}
        </>
      )}
      {state === "pending" && <p className={text}>Плащането още се обработва. Ще получиш имейл, когато мине.</p>}
      {state === "unknown" && (
        <p className={text}>
          Ако току-що плати, провери имейла си. Ако нещо не е наред, пиши ни.
        </p>
      )}
    </section>
  );
}
