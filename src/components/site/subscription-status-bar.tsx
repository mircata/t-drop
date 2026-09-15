import Link from "next/link";
import { Pencil } from "lucide-react";

const bar = "flex h-[74px] flex-1 items-center justify-between rounded-[14px] px-5 max-md:flex-col max-md:justify-center max-md:gap-1 max-md:py-3";
const label = "font-headline text-[14px] uppercase leading-[1.12] tracking-[1.12px] text-white";
const value = "font-headline text-[21px] uppercase leading-[1.12] tracking-[1.68px] text-white";
const manageLink = "flex shrink-0 items-center gap-2 font-body text-[16px] text-t-black underline max-md:justify-center";

/**
 * Green/red subscription status pill, at the top of every /account page. The
 * "Управление на абонамент" Stripe Portal link only shows when the
 * subscription is NOT active — while active, payment method and shipping are
 * managed on our own pages; the Portal is the recovery path once something
 * (payment, cancellation) needs fixing.
 */
export function SubscriptionStatusBar({ hasActive, hasStripeCustomer }: { hasActive: boolean; hasStripeCustomer: boolean }) {
  return (
    <div className="flex items-center gap-4 max-md:flex-col max-md:items-stretch">
      <div className={`${bar} ${hasActive ? "bg-[#1faa3d]" : "bg-[#bf0000]"}`}>
        <span className={label}>Статус на абонамента</span>
        <span className={value}>{hasActive ? "Активен" : "Неактивен"}</span>
      </div>
      {!hasActive && hasStripeCustomer && (
        <Link href="/account/portal" className={manageLink}>
          <Pencil size={16} aria-hidden="true" /> Управление на абонамент
        </Link>
      )}
    </div>
  );
}
