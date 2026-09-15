"use client";

import { ErrorNotice } from "@/components/forms/notice";
import { startCheckout } from "@/lib/actions/checkout";

const field = "h-[50.5px] w-full rounded-[29px] border border-t-red bg-[#eaeaea] px-6 text-center font-dot text-[16px] text-[#212121] outline-none appearance-none";

/* Step 2 of /join (Figma annotation on the "Избери" button, 2026-09-16): same
   delivery fields as /account/address (ShippingForm), collected here before Stripe
   so we have the courier/office choice Stripe's own address collection can't ask
   for. gender/size/theme ride along as hidden fields from the step-1 picker. */
export function DeliveryForm({ gender, size, theme, errorMessage }: { gender: string; size: string; theme: string; errorMessage?: string }) {
  return (
    <form action={startCheckout} className="flex w-full flex-col gap-[24px] lg:w-[719px]">
      <input type="hidden" name="gender" value={gender} />
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="theme" value={theme} />

      <ErrorNotice message={errorMessage} />

      <div className="flex flex-col gap-[14px]">
        <input name="recipientName" required placeholder="Име" className={field} />
        <div className="flex flex-col gap-[14px] sm:flex-row">
          <input name="phone" required placeholder="Тел. номер" className={field} />
          <input name="postcode" required placeholder="ПК" className={field} />
        </div>
        <select name="carrier" required defaultValue="" className={field}>
          <option value="" disabled>Спедитор</option>
          <option value="speedy">Speedy</option>
          <option value="sameday">Sameday</option>
          <option value="boxnow">BoxNow</option>
        </select>
        <input name="addressOrOffice" required placeholder="Точен адрес за доставка / офис на куриер" className={field} />
      </div>

      <button type="submit" className="flex h-[71px] w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream">
        Поръчай
      </button>
    </form>
  );
}
