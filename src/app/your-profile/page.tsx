import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Your Profile – T-Drop Monthly T-Shirts" };

/* WooCommerce "My account" page as a logged-out visitor sees it: the login form.
   Reference: reference/screenshots/wp/your-profile-1440.jpeg */

const label = "block font-roboto text-[14px] leading-[2] text-[#69727d]";
const input = "mt-0 h-[49px] w-full bg-[#f9fafa] px-3 font-roboto text-[14px] text-t-black outline-none";

export default function YourProfilePage() {
  return (
    <section className="site-container flex flex-col max-md:px-5">
      <h2 className="font-roboto text-[32px] font-normal leading-[1.2] text-black">Влизане</h2>
      <form className="mt-[45px] rounded-[3px] border border-[#d5d8dc] bg-white px-[30px] py-4" action="#">
        <p className="pt-1">
          <label className={label} htmlFor="username">
            Потребителско име или имейл адрес <span className="text-[#b81c23]">*</span>
          </label>
          <input id="username" name="username" className={input} />
        </p>
        <p className="mt-3">
          <label className={label} htmlFor="password">
            Парола <span className="text-[#b81c23]">*</span>
          </label>
          <span className="relative block">
            <input id="password" name="password" type="password" className={input} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-roboto text-[18px] text-t-black" aria-hidden="true">👁</span>
          </span>
        </p>
        <p className="mt-[25px] flex items-center gap-4">
          <button
            type="submit"
            className="h-[38px] rounded-[3px] bg-[#5bc0de] px-[26px] font-headline text-[14px] uppercase leading-none tracking-[0.84px] text-white"
          >
            Влизане
          </button>
          <label className="flex items-center gap-1.5 font-roboto text-[14px] text-[#69727d]">
            <input type="checkbox" name="rememberme" className="size-[13px]" /> Запомняне
          </label>
        </p>
        <p className="mt-1 pb-[9px]">
          <Link href="#" className="font-roboto text-[12px] text-[#5bc0de]">Изгубена парола?</Link>
        </p>
      </form>
    </section>
  );
}
