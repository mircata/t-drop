import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { wooTitle } from "@/components/forms/woo";

export const metadata: Metadata = { title: "Нова парола – T-Drop Monthly T-Shirts" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) redirect("/your-profile/lost-password");
  return (
    <section className="site-container flex flex-col max-md:px-5">
      <h2 className={wooTitle}>Нова парола</h2>
      <ResetPasswordForm token={token} />
    </section>
  );
}
