import type { Metadata } from "next";
import { Dela_Gothic_One, Handjet, Roboto } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getAnnouncementText, getSite } from "@/lib/payload";

const headline = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-headline",
});

const body = Handjet({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
});

/* font-dot used to be DotGothic16; the brief now wants Handjet everywhere it appears. */
const dot = Handjet({
  subsets: ["latin", "cyrillic"],
  variable: "--font-dot",
});

export const metadata: Metadata = {
  title: "Акаунт – T-Drop Monthly T-Shirts",
  description: "Свежи тениски всеки месец на вратата ти",
  icons: { icon: "/wp/2026/04/cropped-favicon-1.png" },
};

export const revalidate = 3600;

/*
 * Root layout for the account area (/account and its sub-pages). Separate from
 * (site)/layout.tsx only because Next.js route groups each need their own root
 * layout — the header and footer are the same SiteHeader/SiteFooter as the rest
 * of the site (2026-09-16: account pages used to get their own minimal
 * AccountHeader, but that made the header visibly inconsistent across the site;
 * SiteHeader's own auth-status check already shows the signed-in nav here).
 */
export default async function AccountRootLayout({ children }: { children: React.ReactNode }) {
  const [site, announcement] = await Promise.all([getSite(), getAnnouncementText()]);
  return (
    <html
      lang="bg"
      className={`${headline.variable} ${body.variable} ${roboto.variable} ${dot.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-foreground bg-background">
        <SiteHeader announcement={announcement} />
        <main className="flex-1">{children}</main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
