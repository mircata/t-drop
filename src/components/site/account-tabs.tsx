"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropIcon, HistoryIcon, DeliveryIcon, PaymentIcon, SettingsIcon, LogoutIcon } from "@/components/site/account-tab-icons";

const tabs = [
  { label: "Дроп", href: "/account", Icon: DropIcon, iconClass: "h-[17px] w-[18px]" },
  { label: "История", href: "/account/orders", Icon: HistoryIcon, iconClass: "h-[18px] w-[14px]" },
  { label: "Доставка", href: "/account/address", Icon: DeliveryIcon, iconClass: "h-[16px] w-[18px]" },
  { label: "Плащане", href: "/account/payment", Icon: PaymentIcon, iconClass: "h-[14px] w-[18px]" },
  { label: "Настройки", href: "/account/details", Icon: SettingsIcon, iconClass: "h-[12px] w-[18px]" },
  { label: "Изход", href: "/logout", Icon: LogoutIcon, iconClass: "size-[16px]" },
];

/* The grey pill tab bar on every /account page, replacing the old sidebar-style AccountNav. */
export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-[15px] pb-[30px]">
      {tabs.map(({ label, href, Icon, iconClass }) => {
        const active = href !== "#" && pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={`group flex h-[46px] min-w-[150px] flex-1 items-center justify-center gap-[12px] rounded-[14px] px-4 font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px] max-md:min-w-[calc(50%-7.5px)] ${
              active ? "bg-t-red text-t-cream" : "bg-[#d9d9d9] text-[#686868] hover:bg-t-red hover:text-t-neon"
            }`}
          >
            {label}
            <Icon className={`${iconClass} shrink-0 ${active ? "text-t-cream" : "text-t-red group-hover:text-t-neon"}`} />
          </Link>
        );
      })}
    </nav>
  );
}
