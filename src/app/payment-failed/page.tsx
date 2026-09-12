import type { Metadata } from "next";
import { pageTitle } from "@/components/site/shared";

export const metadata: Metadata = { title: "Payment Failed – T-Drop Monthly T-Shirts" };

export default function PaymentFailedPage() {
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>Payment Failed</h1>
      <p className="text-[16px] leading-[1.8] text-[#333]">
        We&apos;re sorry, but your transaction failed to process. Please try again or contact site support.
      </p>
    </section>
  );
}
