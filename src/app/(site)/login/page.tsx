import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import { AuthPage } from "@/components/site/auth-page";
import { getCustomer } from "@/lib/auth";
import { oauthEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Вход – T-Drop Monthly T-Shirts" };

const NOTICES: Record<string, string> = {
  verified: "Имейлът е потвърден. Вече можеш да влезеш.",
  reset: "Паролата е сменена. Влез с новата.",
  "verify-failed": "Линкът за потвърждение е невалиден или вече е използван.",
};

const ERRORS: Record<string, string> = {
  "oauth-off": "Влизането с този доставчик още не е включено.",
  "oauth-state": "Сесията изтече. Опитай пак.",
  "oauth-noemail": "Профилът не сподели имейл адрес. Влез с имейл и парола вместо това.",
  "oauth-login": "Влизането не успя. Опитай пак след малко.",
  "rate-limit": "Твърде много опити. Опитай пак след малко.",
};

/* Figma "Login" (495:3, full redesign 2026-09-16), layout in AuthPage.
   /register and /your-profile redirect here (next.config.ts). Signed-in customers go to /account. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await getCustomer()) redirect("/account");
  const params = await searchParams;
  const notice = Object.keys(NOTICES).find((k) => params[k] !== undefined);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return (
    <AuthPage title="Добре дошъл обратно">
      <InfoNotice message={notice ? NOTICES[notice] : undefined} />
      <ErrorNotice message={error} />
      <LoginForm googleEnabled={oauthEnabled("google")} />
    </AuthPage>
  );
}
