import type { Metadata } from "next";
import Link from "next/link";
import { pageTitle } from "@/components/site/shared";

export const metadata: Metadata = { title: "Бюлетин – T-Drop Monthly T-Shirts" };

export default async function NewsletterConfirmedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { state } = await searchParams;
  const invalid = state === "invalid";
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>{invalid ? "Линкът не е валиден" : "Абонаментът е потвърден"}</h1>
      <p className="text-[16px] leading-[1.8] text-[#333]">
        {invalid
          ? "Този линк е изтекъл или вече е използван. Запиши се отново от формата най-долу на сайта."
          : "Ще получаваш новини и оферти от T-Drop. Можеш да се отпишеш от линка във всеки имейл."}
      </p>
      <p className="text-[16px] leading-[1.8] text-[#333]">
        <Link href="/" className="text-[#cc3366] underline">Към началото</Link>
      </p>
    </section>
  );
}
