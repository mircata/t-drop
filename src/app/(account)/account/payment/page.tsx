import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PaymentMethodForm } from "@/components/forms/payment-method-form";
import { AccountTabs } from "@/components/site/account-tabs";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getDefaultPaymentMethod } from "@/lib/actions/payment";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Метод за плащане – T-Drop Monthly T-Shirts" };

const CARD_BRANDS: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "American Express" };

export default async function PaymentMethodPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/register");

  const payload = await getPayloadClient();
  const [subs, currentCard] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, depth: 0, limit: 10 }),
    getDefaultPaymentMethod(),
  ]);
  const hasActive = subs.docs.some((s) => !["canceled", "unpaid", "past_due", "incomplete"].includes(s.status));

  return (
    <section className="site-container pt-[45px] pb-[60px] max-md:px-5">
      <SubscriptionStatusBar hasActive={hasActive} hasStripeCustomer={stripeEnabled() && !!customer.stripeCustomerId} />
      <div className="mt-[30px]">
        <AccountTabs />
      </div>

      {!hasActive && (
        <div className="mt-[30px] flex flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center">
          <p className="font-body text-[32px] uppercase text-t-black">Абонамента ви е неактивен</p>
          <p className="text-[16px] text-t-black">
            Моля проверете метода на плащане или се свържете с нас директно за повече информация:{" "}
            <a href="mailto:office@t-drop.net" className="underline">office@t-drop.net</a>.
          </p>
        </div>
      )}

      {hasActive && (
        <div className="mt-[30px]">
          <p className="mb-[15px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Плащане</p>
          {currentCard && (
            <p className="mb-[20px] text-[16px] text-t-black">
              Текуща карта: {CARD_BRANDS[currentCard.brand] ?? currentCard.brand} •••• {currentCard.last4}
            </p>
          )}
          <PaymentMethodForm />
        </div>
      )}
    </section>
  );
}
