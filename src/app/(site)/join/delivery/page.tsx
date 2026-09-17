import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeliveryForm } from "@/components/forms/delivery-form";
import Image from "next/image";
import { headlineBase } from "@/components/site/shared";
import { getCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "Доставка – T-Drop Monthly T-Shirts" };

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);

const ERRORS: Record<string, string> = {
  "delivery-fields": "Попълни всички полета за доставка.",
  "payments-off": "Плащанията още не са включени. Опитай по-късно.",
  stripe: "Плащането не можа да започне. Опитай пак след малко.",
  "rate-limit": "Твърде много опити. Опитай пак след малко.",
  "email-invalid": "Въведи валиден имейл.",
  "password-short": "Паролата трябва да е поне 8 знака.",
  "password-mismatch": "Двете пароли не съвпадат.",
  "email-taken": "Вече има профил с този имейл. Влез от /login и опитай пак.",
};

/* Step 2 of /join, reached from the design/size/gender picker's "Избери" button
   (see join-picker.tsx). gender/size/theme come through as query params rather than
   session state since there's no cart or account yet at this point in the funnel. */
export default async function JoinDeliveryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const gender = typeof params.gender === "string" ? params.gender : "";
  const size = typeof params.size === "string" ? params.size : "";
  const theme = typeof params.theme === "string" ? params.theme : "";
  if (!GENDERS.has(gender) || !SIZES.has(size) || !theme) redirect("/join");

  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const customer = await getCustomer();

  return (
    <section className="site-container relative flex flex-col pb-[84px] pt-[55px] max-md:px-5 max-md:pt-10">
      {/* Illustration sits top-right of the heading; it needs the full container to clear
          the form, so it only shows from xl up — same rule as AuthPage's shirts. It is the
          first child in the Figma frame, so the ВАЖНО panel paints over its lower half and
          only the top peeks out above the card — same collage trick as the star on /join. */}
      <Image
        src="/figma/join/delivery-shirt.svg"
        alt=""
        aria-hidden="true"
        width={235}
        height={299}
        className="pointer-events-none absolute left-[915px] top-[261px] -z-10 hidden h-[299px] w-[235px] rotate-[1.5deg] xl:block"
      />

      <div className="relative pt-[84px] max-md:pt-[50px]">
        <div aria-hidden="true" className="absolute left-[497px] top-[16px] h-[209.7px] w-[214.5px] rotate-[14.63deg] max-md:left-[45%] max-md:top-[10px] max-md:h-[120px] max-md:w-[123px]">
          <Image src="/figma/login/blob.svg" alt="" width={215} height={210} className="size-full" />
        </div>
        <h1 className={`${headlineBase} relative w-[733px] max-w-full max-md:text-[40px]`}>Създаване на профил</h1>
      </div>

      <div className="mt-[110px] flex flex-row items-stretch justify-between gap-10 max-lg:flex-col max-md:mt-10">
        <DeliveryForm gender={gender} size={size} theme={theme} errorMessage={error} loggedInEmail={customer?.email} />

        <aside className="flex w-[507px] max-w-full flex-col items-center justify-center gap-[10px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10 text-center font-body text-[24px] text-[#212121] max-lg:w-full">
          <p className="w-[435px] max-w-full uppercase">Важно:</p>
          <p className="w-[435px] max-w-full">
            Всичките полета са задължителни, с цел обработка на поръчката и доставка. Те се съхраняват спрямо GDPR.
          </p>
        </aside>
      </div>
    </section>
  );
}
