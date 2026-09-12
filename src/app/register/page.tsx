import type { Metadata } from "next";
import Link from "next/link";
import { headline } from "@/components/site/shared";

export const metadata: Metadata = { title: "Register – T-Drop Monthly T-Shirts" };

const field =
  "h-[48px] w-full rounded-[4px] border border-[#69727d] bg-white px-4 text-[24px] text-t-black outline-none focus:border-t-red";
const label = "mb-0 block text-[24px] leading-[34px]";

export default function RegisterPage() {
  return (
    <section className="site-container flex flex-col items-center max-md:mt-10 max-md:px-5">
      <h1 className={`${headline} max-md:text-[32px]`}>Акаунт</h1>
      <div className="flex w-[36%] flex-col max-lg:w-[464px] max-md:w-full">
        <p className="w-[74%] self-center text-center max-lg:w-[304px]">Чрез акаунта можете да управляте абонамента си.</p>
        <form className="mt-10 flex flex-col gap-[25px] pb-10" action="#">
          <div>
            <label className={label} htmlFor="user">Username or Email Address</label>
            <input id="user" name="user" className={field} placeholder="Username or Email Address" />
          </div>
          <div>
            <label className={label} htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className={field} placeholder="Password" />
          </div>
          <label className="flex items-center gap-1 text-[24px] leading-[34px]">
            <input type="checkbox" name="remember" className="size-[13px]" /> Remember Me
          </label>
          <button
            type="submit"
            className="w-full rounded-[50px] bg-t-red py-[25px] font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black"
          >
            Влез
          </button>
          <div className="flex text-[13.6px] leading-[29px]">
            <Link href="#" className="text-t-black hover:text-t-red">Lost your password?</Link>
            <span className="px-0.5">|</span>
            <Link href="/your-profile" className="text-t-black hover:text-t-red">Register</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
