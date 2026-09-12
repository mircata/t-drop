import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFormWoo } from "@/components/forms/login-form-woo";
import { wooTitle } from "@/components/forms/woo";
import { getCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "Your Profile – T-Drop Monthly T-Shirts" };

/* WooCommerce "My account" as a logged-out visitor sees it: the login form.
   Reference: reference/screenshots/wp/your-profile-1440.jpeg. Signed-in customers go to /my-account. */

const NOTICES: Record<string, string> = {
  verified: "Имейлът е потвърден. Вече можеш да влезеш.",
  reset: "Паролата е сменена. Влез с новата.",
  "verify-failed": "Линкът за потвърждение е невалиден или вече е използван.",
};

export default async function YourProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await getCustomer()) redirect("/my-account");
  const params = await searchParams;
  const notice = Object.keys(NOTICES).find((k) => params[k] !== undefined);
  return (
    <section className="site-container flex flex-col max-md:px-5">
      <h2 className={wooTitle}>Влизане</h2>
      <LoginFormWoo notice={notice ? NOTICES[notice] : undefined} />
    </section>
  );
}
