import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AuthPage } from "@/components/site/auth-page";

export const metadata: Metadata = { title: "Нова парола – T-Drop Monthly T-Shirts" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) redirect("/your-profile/lost-password");
  return (
    <AuthPage title="Нова парола">
      <ResetPasswordForm token={token} />
    </AuthPage>
  );
}
