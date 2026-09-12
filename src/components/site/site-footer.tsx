import Link from "next/link";
import type { Site } from "@/payload-types";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const footerLink =
  "font-headline text-[21px] uppercase leading-[1.12] tracking-[0.84px] text-t-black hover:text-t-red";

export function SiteFooter({ site }: { site: Site }) {
  return (
    <footer className="site-container">
      <div className="flex min-h-[432px] flex-row max-lg:flex-col max-lg:items-center max-lg:justify-center">
        <div className="flex flex-1 flex-col justify-center gap-2.5 max-lg:items-center md:max-lg:w-[40%] max-md:w-full max-md:pt-10">
          {(site.footerLeft ?? []).map((l, i) => (
            <Link key={l.id ?? i} href={l.href} className={footerLink}>{l.label}</Link>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-end bg-[url('/wp/2026/04/footer-img2.png')] bg-contain bg-top bg-no-repeat max-lg:order-first max-lg:min-h-[402px] max-lg:w-full max-lg:items-center">
          <div className="mb-5 text-center font-dot text-[14px] uppercase leading-[1.12]">{site.newsletterLabel}</div>
          <NewsletterForm placeholder={site.newsletterPlaceholder} buttonLabel={site.newsletterButton} />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2.5 max-lg:items-center max-lg:pt-2.5 md:max-lg:w-[40%] max-md:w-full max-md:pb-5">
          {(site.footerRight ?? []).map((l, i) => (
            <Link key={l.id ?? i} href={l.href} className={`${footerLink} max-lg:text-center`}>{l.label}</Link>
          ))}
        </div>
      </div>

      <div className="flex flex-row justify-between font-body text-[24px] uppercase leading-[1.12] tracking-[0.04em] max-lg:flex-col max-lg:items-center max-md:pt-10">
        <span>{site.copyright}</span>
        <span>{site.credit}</span>
      </div>
    </footer>
  );
}
