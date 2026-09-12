import type { Metadata } from "next";
import { Dela_Gothic_One, Handjet, Roboto, DotGothic16 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

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

const dot = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot",
});

export const metadata: Metadata = {
  title: "T-Drop Monthly T-Shirts",
  description: "Свежи тениски всеки месец на вратата ти",
  icons: { icon: "/wp/2026/04/cropped-favicon-1.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bg"
      className={`${headline.variable} ${body.variable} ${roboto.variable} ${dot.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-foreground bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
