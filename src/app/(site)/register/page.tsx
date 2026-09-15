import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFormElementor } from "@/components/forms/login-form-elementor";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import { headlineBase } from "@/components/site/shared";
import { getCustomer } from "@/lib/auth";
import { oauthEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Register – T-Drop Monthly T-Shirts" };

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

/* The Elementor "Акаунт" page: a login form, as on the old site — now the one
   surviving login page (/your-profile retired, see next.config.ts redirects).
   Signed-in customers go to /account. */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await getCustomer()) redirect("/account");
  const params = await searchParams;
  const notice = Object.keys(NOTICES).find((k) => params[k] !== undefined);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return (
    <section className="site-container flex flex-col items-center max-md:mt-10 max-md:px-5">
      <h1 className={`${headlineBase} max-md:text-[32px]`}>Акаунт</h1>
      <div className="flex w-[36%] flex-col md:max-lg:w-[464px] max-md:w-full">
        <p className="w-[74%] self-center text-center max-lg:w-[304px]">Чрез акаунта можете да управляте абонамента си.</p>
        <InfoNotice message={notice ? NOTICES[notice] : undefined} />
        <ErrorNotice message={error} />
        <LoginFormElementor oauth={{ google: oauthEnabled("google"), facebook: oauthEnabled("facebook") }} />
      </div>
    </section>
  );
}
