"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export type NavItem = { href: string; label: string };
type HeaderNavItem = NavItem & { accent?: boolean };

/* Figma "MENU HEADER states" (2026-09-16): the header nav is now just these
   2-3 links, swapped by whether a customer is signed in — not the full CMS
   nav list anymore (that's still admin-editable, just no longer shown here). */
const LOGGED_OUT_NAV: HeaderNavItem[] = [
  { href: "/join", label: "Запиши се", accent: true },
  { href: "/about", label: "За нас" },
  { href: "/login", label: "Вход" },
];
const LOGGED_IN_NAV: HeaderNavItem[] = [
  { href: "/about", label: "За нас" },
  { href: "/account", label: "Акаунт" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[41px] fill-current" aria-hidden="true">
      <path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" />
    </svg>
  );
}

export function SiteHeader({ announcement }: { announcement: string }) {
  const pathname = usePathname();
  // Defaults to the logged-out nav (correct for the vast majority of marketing-page
  // visitors) and swaps in a quick client fetch — see /auth-status for why this
  // isn't just read server-side in the (site) layout.
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/auth-status")
      .then((res) => res.json())
      .then((data: { loggedIn: boolean }) => {
        if (!cancelled) setLoggedIn(data.loggedIn);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const nav = loggedIn ? LOGGED_IN_NAV : LOGGED_OUT_NAV;
  return (
    <header className="relative z-[500] min-h-[156px] pt-2.5 max-md:h-[118px] max-md:min-h-0 max-md:pt-0">
      {/* Announcement marquee, fixed to the top of the viewport like the Elementor header */}
      <div className="fixed inset-x-0 top-0 z-[500] bg-t-black">
        <div className="marquee py-[10px] font-body text-[24px] uppercase leading-[1.12] tracking-[0.04em] text-t-neon">
          <span className="marquee-track">{announcement}</span>
        </div>
      </div>

      <div className="site-container mt-16 flex min-h-[80px] items-center justify-between md:max-lg:px-5 max-md:mt-14 max-md:min-h-0 max-md:px-2.5">
        <Link href="/" className="block w-[39%] md:max-lg:w-[13%] max-md:w-1/4">
          <Image
            src="/wp/2025/12/cs.png"
            alt="T-Drop Monthly T-Shirts"
            width={768}
            height={245}
            priority
            className="hidden h-[62px] w-auto md:block"
          />
          <Image
            src="/wp/2026/04/cropped-favicon-1.png"
            alt="T-Drop"
            width={192}
            height={192}
            className="h-[98px] w-auto object-cover md:hidden"
          />
        </Link>

        {/* Figma "Login" header (495:316): links 50px apart, "Запиши се" as a 174×33 outlined pill. */}
        <nav className="hidden flex-1 items-center justify-end gap-[50px] lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.accent
                    ? "flex h-[33px] w-[174px] items-center justify-center rounded-full border border-t-red font-headline text-[12px] uppercase leading-none tracking-[0.72px] text-t-red hover:bg-t-red hover:text-t-cream"
                    : `py-[13px] font-headline text-[14px] uppercase leading-[1.12] tracking-[0.84px] hover:text-t-red ${active ? "text-t-red" : "text-[#686868]"}`
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-10 flex items-center max-lg:ml-0 max-lg:flex-1 max-lg:justify-end">
          <Sheet>
            <SheetTrigger
              className="inline-flex size-[62px] items-center justify-center text-t-black md:max-lg:mx-auto lg:hidden"
              aria-label="Меню"
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="bg-t-cream">
              <SheetTitle className="sr-only">Меню</SheetTitle>
              <nav className="mt-10 flex flex-col gap-6">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-headline text-[21px] uppercase tracking-[0.84px] ${item.accent ? "text-t-red" : "text-t-black"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
