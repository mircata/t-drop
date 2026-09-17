import Image from "next/image";
import type { ReactNode } from "react";
import { headlineBase } from "@/components/site/shared";

/* Shared shell of the Figma "Login" frame (495:3, 2026-09-16): headline over a neon blob,
   content on the left, three faded t-shirt illustrations on the right. Used by /login and
   /your-profile/lost-password. Offsets are Figma pixels relative to the blob's top-left
   corner. The illustrations need the full 1280px container to clear the form, so they
   only show from xl up. */
export function AuthPage({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="site-container relative pb-[84px] pt-[55px] max-md:px-5 max-md:pt-10 xl:min-h-[935px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[55px] hidden xl:block">
        <Image src="/figma/login/mona.svg" alt="" width={235} height={301} className="absolute right-[222.6px] top-[108px] h-[301.4px] w-[235px] rotate-[17.22deg]" />
        <Image src="/figma/login/never-know.svg" alt="" width={196} height={295} className="absolute right-[53.2px] top-[266px] h-[294.8px] w-[196.2px] -rotate-[5.43deg]" />
        <Image src="/figma/login/muscles.svg" alt="" width={288} height={234} className="absolute right-[292.1px] top-[548px] h-[233.8px] w-[288px] -rotate-[6.26deg] opacity-[0.23]" />
      </div>

      <div className="relative flex flex-col">
        <div className="relative pt-[84.4px] max-md:pt-[50px]">
          <div aria-hidden="true" className="absolute left-[400px] top-[23.7px] h-[209.7px] w-[214.5px] rotate-[14.63deg] max-md:left-[45%] max-md:top-[10px] max-md:h-[120px] max-md:w-[123px]">
            <Image src="/figma/login/blob.svg" alt="" width={215} height={210} className="size-full" />
          </div>
          <h1 className={`${headlineBase} relative w-[733px] max-w-full max-md:text-[40px]`}>{title}</h1>
        </div>

        <div className="mt-[58px] max-md:mt-10">{children}</div>
      </div>
    </section>
  );
}

/* Form styles from the same frame, shared by the forms rendered inside AuthPage. */
export const authField =
  "h-[50.5px] w-full rounded-[6px] border border-t-red bg-t-grey px-4 font-dot text-[18px] text-t-black outline-none focus:border-2";
export const authLabel = "font-dot text-[16px] tracking-[0.2em] text-t-black";
export const authButton =
  "flex h-[71px] w-[326px] max-w-full items-center justify-center rounded-[59px] bg-t-red font-headline text-[21px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black disabled:opacity-70";
export const authSideLink = "font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868] hover:text-t-red";
