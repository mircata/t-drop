import Link from "next/link";
import { ShoppingBasket, Home, FileText, User, UserPlus, LogOut } from "lucide-react";

/* Payments, cards and invoices live in the Stripe Customer Portal (/my-account/portal). */
const accountItems = [
  { label: "Поръчки", href: "/my-account/portal", icon: ShoppingBasket, counted: true },
  { label: "Адреси", href: "/my-account/details", icon: Home },
  { label: "Методи за разплащане", href: "/my-account/portal", icon: FileText },
  { label: "Детайли на профила", href: "/my-account/details", icon: User },
  { label: "Subscriptions", href: "/my-account#subscriptions", icon: UserPlus },
  { label: "Излизане", href: "/logout", icon: LogOut },
];

/* WooCommerce account menu. Markup matches the v0.1 port of /my-account. `orders` is the paid-payment count badge. */
export function AccountNav({ orders = 0 }: { orders?: number }) {
  return (
    <nav className="pb-10">
      <ul className="flex items-stretch gap-px max-md:flex-col">
        {accountItems.map(({ label, href, icon: Icon, counted }) => {
          const count = counted && orders > 0 ? String(orders) : undefined;
          return (
          <li
            key={label}
            className="flex min-h-[82px] min-w-0 flex-1 rounded-[20px] bg-[#f7f7f7] max-md:min-h-0 max-md:w-full max-md:flex-none"
          >
            <Link
              href={href}
              className="flex w-full items-center justify-between px-5 py-3 font-roboto text-[14px] font-bold leading-[29px] tracking-normal text-[#69727d] max-md:mt-2.5 max-md:px-2.5 max-md:pt-0 max-md:text-[18px] max-md:font-medium max-md:leading-[21px] max-md:text-black"
            >
              <span className="min-w-0">
                {label}
                {count && (
                  <span className="ml-2 inline-flex h-[17px] w-[36px] items-center justify-center rounded-[9px] bg-[#1d9843] align-middle text-[14px] font-normal leading-[17px] text-white">
                    {count}
                  </span>
                )}
              </span>
              <Icon size={20} className="shrink-0 text-[#69727d]" aria-hidden="true" />
            </Link>
          </li>
          );
        })}
      </ul>
    </nav>
  );
}
