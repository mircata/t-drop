import type { Metadata } from "next";
import { headline } from "@/components/site/shared";

export const metadata: Metadata = { title: "Payment Confirmation – T-Drop Monthly T-Shirts" };

export default function PaymentConfirmationPage() {
  return (
    <section className="site-container flex flex-col gap-6 py-10 max-md:px-5">
      <h1 className={`${headline} text-[40px]`}>Payment Confirmation</h1>
      <p>Thanks for your purchase. Here is your receipt.</p>
      <div className="max-w-xl rounded-[20px] bg-white p-6 shadow-[0_0_10px_5px_rgba(0,0,0,0.06)] text-[18px]">
        <div className="flex justify-between border-b border-t-black/10 py-2"><span>Item</span><span>1 месец</span></div>
        <div className="flex justify-between border-b border-t-black/10 py-2"><span>Amount</span><span>17,99 €</span></div>
        <div className="flex justify-between py-2"><span>Billing</span><span>Every month</span></div>
      </div>
    </section>
  );
}
