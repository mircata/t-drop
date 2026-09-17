import type { Metadata } from "next";
import { LostPasswordForm } from "@/components/forms/lost-password-form";
import { AuthPage } from "@/components/site/auth-page";

export const metadata: Metadata = { title: "Изгубена парола – T-Drop Monthly T-Shirts" };

/* Styled after the Figma "Login" frame (no design of its own), see AuthPage. */
export default function LostPasswordPage() {
  return (
    <AuthPage title="Изгубена парола">
      <LostPasswordForm />
    </AuthPage>
  );
}
