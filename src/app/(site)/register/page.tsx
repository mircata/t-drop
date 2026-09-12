import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFormElementor } from "@/components/forms/login-form-elementor";
import { headlineBase } from "@/components/site/shared";
import { getCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "Register – T-Drop Monthly T-Shirts" };

/* The Elementor "Акаунт" page: a login form, as on the old site. Signed-in customers go to /my-account. */
export default async function RegisterPage() {
  if (await getCustomer()) redirect("/my-account");
  return (
    <section className="site-container flex flex-col items-center max-md:mt-10 max-md:px-5">
      <h1 className={`${headlineBase} max-md:text-[32px]`}>Акаунт</h1>
      <div className="flex w-[36%] flex-col md:max-lg:w-[464px] max-md:w-full">
        <p className="w-[74%] self-center text-center max-lg:w-[304px]">Чрез акаунта можете да управляте абонамента си.</p>
        <LoginFormElementor />
      </div>
    </section>
  );
}
