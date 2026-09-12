import type { Metadata } from "next";
import { pageTitle } from "@/components/site/shared";

export const metadata: Metadata = { title: "Checkout – T-Drop Monthly T-Shirts" };

/* On the WordPress site this page holds the checkout shortcode inside a code tag,
   so it renders only its title. Kept identical for v0.1; Stripe Checkout replaces it later. */
export default function CheckoutPage() {
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>Checkout</h1>
    </section>
  );
}
