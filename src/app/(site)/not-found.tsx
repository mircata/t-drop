import Link from "next/link";
import { button, headline } from "@/components/site/shared";

/* Backlog #18: the default Next.js 404 had no header, footer or way back. Living in the
   (site) route group means it renders inside that layout, so it picks up the brand fonts,
   SiteHeader and SiteFooter for free. Next.js serves this for any unmatched URL under the
   group and for notFound() — which /about and / call when their Payload page is missing. */
export default function NotFound() {
  return (
    <section className="site-container flex flex-col items-start gap-10 pb-[120px] pt-[84px] max-md:px-5 max-md:pt-10">
      {/* Neon on cream is close to unreadable, so use the site's neon-badge pairing instead. */}
      <p className="w-fit rounded-[20px] bg-t-neon px-6 py-2 font-dot text-[64px] leading-none text-t-black max-md:text-[44px]">404</p>
      <h1 className={headline}>Тази страница я няма</h1>
      <p className="w-[563px] max-w-full font-dot text-[18px] leading-[1.4] text-t-black">
        Линкът е стар или сгрешен. Върни се в началото или разгледай абонамента.
      </p>
      <div className="flex flex-row flex-wrap items-center gap-5">
        <Link href="/" className={button}>Към началото</Link>
        <Link href="/join" className="font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868] hover:text-t-red">
          Виж абонамента
        </Link>
      </div>
    </section>
  );
}
