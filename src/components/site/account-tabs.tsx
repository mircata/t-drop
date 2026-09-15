"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropIcon, HistoryIcon, DeliveryIcon, PaymentIcon, SettingsIcon, LogoutIcon } from "@/components/site/account-tab-icons";
import { logout } from "@/lib/actions/auth";

const tabClass = (active: boolean) =>
  `group flex h-[46px] min-w-[150px] flex-1 items-center justify-center gap-[12px] rounded-[14px] px-4 font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px] max-md:min-w-[calc(50%-7.5px)] ${
    active ? "bg-t-red text-t-cream" : "bg-[#d9d9d9] text-[#686868] hover:bg-t-red hover:text-t-neon"
  }`;
const iconClass = (active: boolean, sizeClass: string) => `${sizeClass} shrink-0 ${active ? "text-t-cream" : "text-t-red group-hover:text-t-neon"}`;

const tabs = [
  { label: "Дроп", href: "/account", Icon: DropIcon, iconSize: "h-[17px] w-[18px]" },
  { label: "История", href: "/account/orders", Icon: HistoryIcon, iconSize: "h-[18px] w-[14px]" },
  { label: "Доставка", href: "/account/address", Icon: DeliveryIcon, iconSize: "h-[16px] w-[18px]" },
  { label: "Плащане", href: "/account/payment", Icon: PaymentIcon, iconSize: "h-[14px] w-[18px]" },
  { label: "Настройки", href: "/account/details", Icon: SettingsIcon, iconSize: "h-[12px] w-[18px]" },
];

/* The grey pill tab bar on every /account page, replacing the old sidebar-style AccountNav.
   "Изход" submits the logout Server Action instead of linking to /logout: a plain GET link
   there got silently triggered by Next.js's automatic link prefetching the moment this bar
   rendered, logging people out before they clicked anything (real bug, hit 2026-09-16). */
export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-[15px] pb-[30px]">
      {tabs.map(({ label, href, Icon, iconSize }) => {
        const active = pathname === href;
        return (
          <Link key={label} href={href} className={tabClass(active)}>
            {label}
            <Icon className={iconClass(active, iconSize)} />
          </Link>
        );
      })}
      <form action={logout} className="flex flex-1 min-w-[150px] max-md:min-w-[calc(50%-7.5px)]">
        <button type="submit" className={`${tabClass(false)} w-full`}>
          Изход
          <LogoutIcon className={iconClass(false, "size-[16px]")} />
        </button>
      </form>
    </nav>
  );
}
