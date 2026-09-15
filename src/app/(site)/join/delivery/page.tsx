import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeliveryForm } from "@/components/forms/delivery-form";
import { headline36 } from "@/components/site/shared";

export const metadata: Metadata = { title: "Доставка – T-Drop Monthly T-Shirts" };

const SIZES = new Set(["s", "m", "l", "xl"]);
const GENDERS = new Set(["male", "female"]);

const ERRORS: Record<string, string> = {
  "delivery-fields": "Попълни всички полета за доставка.",
  "payments-off": "Плащанията още не са включени. Опитай по-късно.",
  stripe: "Плащането не можа да започне. Опитай пак след малко.",
  "rate-limit": "Твърде много опити. Опитай пак след малко.",
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

  return (
    <section className="site-container flex flex-col items-center pt-10 max-md:px-5">
      <h1 className={headline36}>Доставка</h1>
      <p className="mb-10 mt-2 text-center">Последна стъпка преди плащането — къде да пратим тениската.</p>
      <DeliveryForm gender={gender} size={size} theme={theme} errorMessage={error} />
    </section>
  );
}
