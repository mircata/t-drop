import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { wooTitle } from "@/components/forms/woo";
import { getCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "Регистрация – T-Drop Monthly T-Shirts" };

export default async function RegisterCustomerPage() {
  if (await getCustomer()) redirect("/my-account");
  return (
    <section className="site-container flex flex-col max-md:px-5">
      <h2 className={wooTitle}>Регистрация</h2>
      <RegisterForm />
    </section>
  );
}
