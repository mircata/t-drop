import type { Metadata } from "next";
import { pageTitle } from "@/components/site/shared";

export const metadata: Metadata = { title: "Payment Confirmation – T-Drop Monthly T-Shirts" };

/* The WordPress page prints a receipt shortcode whose plugin is no longer installed,
   so visitors see the raw shortcode text. That is a defect, not a design; we show the title only. */
export default function PaymentConfirmationPage() {
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>Payment Confirmation</h1>
    </section>
  );
}
