import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShippingForm } from "@/components/forms/shipping-form";
import { AccountTabs } from "@/components/site/account-tabs";
import { SubscriptionStatusBar } from "@/components/site/subscription-status-bar";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Адрес за доставка – T-Drop Monthly T-Shirts" };

export default async function ShippingAddressPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/login");

  const payload = await getPayloadClient();
  const subs = await payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, depth: 0, limit: 10 });
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
          <p className="mb-[15px] font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Доставка</p>
          <div className="flex flex-wrap items-start justify-between gap-10">
            <ShippingForm customer={customer} />
            <div className="flex min-w-[300px] flex-1 flex-col items-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center font-dot text-[24px] uppercase text-t-black">
              <p>Доставяме с/със:</p>
              <p>Speedy</p>
              <p>Sameday</p>
              <p>BoxNow</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
