"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export type NavItem = { href: string; label: string };

function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M17 7V6a5 5 0 0 0-10 0v1H4v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7h-3zM9 6a3 3 0 0 1 6 0v1H9V6z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[41px] fill-current" aria-hidden="true">
      <path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" />
    </svg>
  );
}

export function SiteHeader({ announcement, nav }: { announcement: string; nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <header className="relative z-[500] min-h-[156px] pt-2.5 max-md:h-[118px] max-md:min-h-0 max-md:pt-0">
      {/* Announcement marquee, fixed to the top of the viewport like the Elementor header */}
      <div className="fixed inset-x-0 top-0 z-[500] bg-t-black">
        <div className="marquee py-[10px] font-body text-[24px] uppercase leading-[1.12] tracking-[0.04em] text-t-neon">
          <span className="marquee-track">{announcement}</span>
        </div>
      </div>

      <div className="site-container mt-10 flex min-h-[80px] items-center justify-between md:max-lg:px-5 max-md:mt-[39px] max-md:min-h-0 max-md:px-2.5">
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

        <nav className="hidden flex-1 items-center justify-end lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href === "/your-profile" && pathname === "/my-account");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-[13px] font-headline text-[21px] uppercase leading-[1.12] tracking-[0.84px] hover:text-t-red ${active ? "text-t-red" : "text-t-black"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-10 flex items-center gap-4 max-lg:ml-0 max-lg:flex-1 max-lg:justify-end max-md:gap-[68px]">
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
                    className="font-headline text-[21px] uppercase tracking-[0.84px] text-t-black"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href="/cart"
            aria-label="Количка"
            className="flex h-[87px] items-center gap-1.5 rounded-[24px] border-[3px] border-[#69727d] px-5 text-[#69727d] max-md:h-[50px] max-md:w-[79px] max-md:justify-center max-md:px-0"
          >
            <span className="font-headline text-[28px] leading-none max-md:text-[17px]">0</span>
            <BagIcon className="size-8 max-md:size-[17px]" />
          </Link>

        </div>
      </div>
    </header>
  );
}
