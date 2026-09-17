import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthPage } from "@/components/site/auth-page";
import { getCustomer } from "@/lib/auth";
import { oauthEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Регистрация – T-Drop Monthly T-Shirts" };

export default async function RegisterCustomerPage() {
  if (await getCustomer()) redirect("/account");
  return (
    <AuthPage title="Направи си профил">
      <RegisterForm oauth={{ google: oauthEnabled("google"), facebook: oauthEnabled("facebook") }} />
    </AuthPage>
  );
}
