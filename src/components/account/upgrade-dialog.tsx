import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { UpgradeChooser, type UpgradePlan } from "@/components/account/upgrade-chooser";
import { changePlan } from "@/lib/actions/plan-change";

/* What `changePlan` sends back when it cannot go ahead. */
const ERRORS: Record<string, string> = {
  declined: "Картата ти беше отказана. Пакетът не е сменен.",
  "too-soon": "Към по-малък пакет можеш да минеш месец след последния ъпгрейд.",
  same: "Това е пакетът, който вече имаш.",
  plan: "Този пакет не е наличен.",
  "no-subscription": "Нямаш активен абонамент.",
  rate: "Твърде много опити. Опитай пак след малко.",
  stripe: "Нещо се обърка при смяната. Опитай пак или ни пиши.",
};

const title = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868]";

/**
 * The package change popup — Figma `554:2472` (1/2) and `554:2718` (2/2). A white 860px
 * card over a 54% red wash, 29px round, inset 45 / 46 / 45 / 36px; the title and a close ×,
 * the "ВАЖНА ИНФОРМАЦИЯ" note, then either the package list (1/2) or the two answers (2/2).
 *
 * Driven by the URL — `?upgrade=1` opens it, `?upgrade=confirm&plan=<id>` is the second
 * step, and closing is a link back to /account — so it needs no client state beyond the
 * package list's own selection, and the back button walks back through it.
 */
export function UpgradeDialog({
  step,
  plans,
  currentPlanId,
  preselectId,
  confirmPlan,
  error,
  downgradeLockedUntil,
}: {
  step: "choose" | "confirm";
  plans: UpgradePlan[];
  currentPlanId: number;
  preselectId: number | null;
  confirmPlan: UpgradePlan | null;
  error?: string;
  /** Lower packages stay greyed out until this date (a month after the last upgrade). */
  downgradeLockedUntil: string | null;
}) {
  return (
    <div className="fixed inset-0 z-[700] flex items-start justify-center overflow-y-auto bg-t-red/54 px-4 py-[80px] max-lg:py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="flex w-[860px] max-w-full flex-col gap-[40px] rounded-[29px] bg-white py-[45px] pl-[36px] pr-[46px] max-lg:gap-[30px] max-lg:px-[20px] max-lg:py-[30px]"
      >
        <div className="flex items-start justify-between">
          <p id="upgrade-title" className={title}>
            {step === "confirm" ? "Сигурни ли сте?" : "Ъпгрейд на абонамент"}
          </p>
          <Link href="/account" scroll={false} aria-label="Затвори" className="relative block size-[18px] shrink-0">
            <Image src="/figma/account/close.svg" alt="" width={20} height={20} className="absolute -top-px -left-px size-[20px] max-w-none" />
          </Link>
        </div>

        <Note>
          След като изберете по-горен пакет, трябва да мине поне един месец преди да промените решението си и вземете по-долен.
          {downgradeLockedUntil ? <span className="mt-[8px] block">По-малък пакет можеш да избереш след {downgradeLockedUntil}</span> : null}
        </Note>

        {error && ERRORS[error] ? (
          <p role="alert" className="font-dot text-[18px] leading-[normal] text-t-red">
            {ERRORS[error]}
          </p>
        ) : null}

        {step === "confirm" && confirmPlan ? (
          <form action={changePlan} className="flex flex-col gap-[20px]">
            <input type="hidden" name="plan" value={confirmPlan.id} />
            <button
              type="submit"
              className="flex min-h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red px-5 text-center font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black max-lg:text-[16px]"
            >
              Да, минавам на {confirmPlan.name} пакет
            </button>
            <Link
              href="/account"
              scroll={false}
              className="flex min-h-[71px] w-full items-center justify-center rounded-[59px] bg-[#737373] px-5 text-center font-headline text-[21px] uppercase leading-[normal] tracking-[0.84px] text-t-cream max-lg:text-[16px]"
            >
              Не, отказах се
            </Link>
          </form>
        ) : (
          <UpgradeChooser plans={plans} currentPlanId={currentPlanId} preselectId={preselectId} lowerDisabled={Boolean(downgradeLockedUntil)} />
        )}
      </div>
    </div>
  );
}

/* "ВАЖНА ИНФОРМАЦИЯ": the funnel's dashed cream note, its text 445px wide as drawn. */
function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-[15px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] p-[18.5px]">
      <p className="flex items-center gap-[15px] font-dot text-[18px] font-bold uppercase leading-[normal] tracking-normal text-t-red">
        <span className="relative block size-[18px] shrink-0">
          <Image src="/figma/signup/payment/info.svg" alt="" width={20} height={20} className="absolute -top-px -left-px size-[20px] max-w-none" />
        </span>
        Важна информация
      </p>
      <p className="w-[445px] max-w-full font-dot text-[18px] leading-[normal] tracking-normal text-[#212121]">{children}</p>
    </div>
  );
}
