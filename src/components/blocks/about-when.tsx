import { badgeNeon, headline } from "@/components/site/shared";
import type { Page } from "@/payload-types";
import { Lines } from "./lines";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "aboutWhen" }>;

/* About page: "when" heading, the countdown line and two paragraphs */
export function AboutWhenBlock(b: Props) {
  return (
    <>
      <section className="site-container mt-[120px] flex flex-row gap-10 max-lg:flex-col-reverse">
        <div className="relative flex w-full flex-col justify-end gap-10 pt-10 max-lg:items-center">
          <h2 className={`${headline} text-center`}>{b.heading}</h2>
          <div className={`${badgeNeon} left-[308px] top-[-13px] w-[9.141%] rotate-[5deg] md:max-lg:left-[23px] md:max-lg:top-[186px] md:max-lg:w-[164px] max-md:left-[-11px] max-md:top-[1px] max-md:w-[179px]`}>{b.sticker}</div>
        </div>
      </section>

      <section className="site-container my-20 flex flex-col items-center">
        <p className="w-[90%] text-center font-dot text-[52px] leading-[1.12] max-lg:w-[80%] max-md:text-[21px]">
          {b.countdownBefore} <br /><b>12:24:10:035</b><br /> {b.countdownAfter}
        </p>
      </section>

      <section className="site-container flex flex-row gap-10 md:max-lg:flex-col-reverse max-md:flex-col">
        <div className="flex w-[49.658%] flex-row items-start max-lg:w-full max-lg:flex-col max-lg:items-center">
          <p className="mb-[15px] md:max-lg:w-[60%] max-lg:text-center max-md:w-[80%]"><Lines text={b.textLeft} /></p>
        </div>
        <div className="flex flex-1 flex-row items-start justify-center max-md:mt-[60px]">
          <p className="mb-[15px] md:max-lg:w-[60%] max-lg:text-center max-md:w-[80%]"><Lines text={b.textRight} /></p>
        </div>
      </section>
    </>
  );
}
