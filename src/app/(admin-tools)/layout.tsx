import { Dela_Gothic_One, Handjet, Roboto } from "next/font/google";
import "../globals.css";

const headline = Dela_Gothic_One({ weight: "400", subsets: ["latin", "cyrillic"], variable: "--font-headline" });
const body = Handjet({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin", "cyrillic"], variable: "--font-roboto" });
// font-dot used to be DotGothic16; the brief now wants Handjet everywhere it appears.
const dot = Handjet({ subsets: ["latin", "cyrillic"], variable: "--font-dot" });

export const metadata = { title: "T-Drop staff tools", robots: { index: false, follow: false } };

/*
 * Root layout for internal, staff-only tools (src/app/(admin-tools)/), separate
 * from the public site and the customer account area — same brand fonts as the
 * rest of the site (loaded here since this is its own parallel root layout),
 * but no site chrome/header. Protected per-page via getAdminUser()
 * (src/lib/admin-auth.ts), not by this layout, same as Payload's own /admin.
 */
export default function AdminToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={`${headline.variable} ${body.variable} ${roboto.variable} ${dot.variable} antialiased`}>
      <body className="min-h-screen bg-[#f5f5f5] font-roboto text-t-black">{children}</body>
    </html>
  );
}
