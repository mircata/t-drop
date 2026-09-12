import type { Metadata } from "next";
import Link from "next/link";
import { pageTitle } from "@/components/site/shared";

export const metadata: Metadata = { title: "Отписване – T-Drop Monthly T-Shirts" };

export default function NewsletterUnsubscribedPage() {
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className={pageTitle}>Отписа се</h1>
      <p className="text-[16px] leading-[1.8] text-[#333]">Няма да получаваш повече новини от T-Drop. Ако размислиш, запиши се пак от формата най-долу.</p>
      <p className="text-[16px] leading-[1.8] text-[#333]">
        <Link href="/" className="text-[#cc3366] underline">Към началото</Link>
      </p>
    </section>
  );
}
