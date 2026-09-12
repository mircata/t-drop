import type { Metadata } from "next";
import { LostPasswordForm } from "@/components/forms/lost-password-form";
import { wooTitle } from "@/components/forms/woo";

export const metadata: Metadata = { title: "Изгубена парола – T-Drop Monthly T-Shirts" };

export default function LostPasswordPage() {
  return (
    <section className="site-container flex flex-col max-md:px-5">
      <h2 className={wooTitle}>Изгубена парола</h2>
      <LostPasswordForm />
    </section>
  );
}
