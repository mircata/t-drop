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
  title: "T-Drop Monthly T-Shirts",
  description: "Свежи тениски всеки месец на вратата ти",
  icons: { icon: "/wp/2026/04/cropped-favicon-1.png" },
};

/* Pages are prerendered and refreshed by Payload hooks on edit; this is the safety net. */
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
