import type { Metadata } from "next";
import { headline } from "@/components/site/shared";

export const metadata: Metadata = { title: "Payment Failed – T-Drop Monthly T-Shirts" };

export default function PaymentFailedPage() {
  return (
    <section className="site-container flex flex-col gap-6 py-10 max-md:px-5">
      <h1 className={`${headline} text-[40px]`}>Payment Failed</h1>
      <p>We&apos;re sorry, but your transaction failed to process. Please try again or contact site support.</p>
    </section>
  );
}
