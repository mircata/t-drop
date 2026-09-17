import Image from "next/image";
import Link from "next/link";
import { Shirt, SHIRT, badgeNeon, button, headline } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";
import { Lines } from "./lines";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "aboutStory" }>;

/* About page, first section: intro, two steps and the sticky shirt on the right */
export function AboutStoryBlock(b: Props) {
  return (
    <section className="site-container flex flex-row">
      <div className="flex w-1/2 flex-col max-lg:w-full">
        <div className="flex flex-col gap-10 pt-10 max-lg:items-center max-lg:text-center">
          <h1 className={headline}><Lines text={b.heading} /></h1>
          <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
            <Lines text={b.intro} />
          </p>

          <div className="relative mt-20 flex w-full flex-col gap-10 pt-10 max-lg:items-center">
            <h2 className={headline}>{b.step1Heading}</h2>
            {/* Sticker sits above the heading, not across it: the Elementor offset hid "АШ" on lg+. */}
            <div className={`${badgeNeon} left-[202px] top-[-32px] w-1/2 rotate-[5deg] md:max-lg:left-[51px] md:max-lg:top-[-11px] md:max-lg:w-[139px] max-md:left-[78px] max-md:top-[-28px] max-md:w-[179px]`}>{b.step1Sticker}</div>
            <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
              <Lines text={b.step1Text} />
            </p>
            <Link href={b.ctaHref || "/join"} className={`${button} self-start max-lg:self-center`}>{b.ctaLabel}</Link>

            <div className="relative mt-20 flex w-full flex-col justify-end gap-10 pt-10 max-lg:items-center">
              <h2 className={headline}>{b.step2Heading}</h2>
              <div className={`${badgeNeon} left-[-117px] top-[11px] w-1/2 -rotate-[8deg] md:max-lg:left-[10px] md:max-lg:top-[12px] md:max-lg:w-[182px] max-md:left-[69px] max-md:top-[-24px] max-md:w-[179px]`}>{b.step2Sticker}</div>
              <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
                <Lines text={b.step2Text} />
              </p>
              <div className="flex w-full flex-row items-end justify-center max-md:mt-[60px]">
                <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]"><Lines text={b.step2Note} /></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The shirt's rotate+scale overflows 99px above its layout box, so a 150px gap from the top
          of the page needs 249px of offset. pt matches the sticky top, otherwise the shirt would
          start overlapping the header and only drop into place once it began sticking. */}
      <div className="flex w-1/2 flex-col pt-[93px] max-lg:hidden">
        <div className="sticky top-[249px] flex flex-row items-center justify-center">
          {/* Scaled 20% as one unit so the shirt and the blob keep their relative geometry. */}
          <div className="relative flex w-full scale-[1.2] flex-row items-center justify-center">
            <Image src="/wp/2025/12/shapeA.svg" alt="" width={270} height={188} className="absolute left-[195px] top-[211px] w-[270px]" />
            <div className="w-[32%] shrink-0">
              <Shirt src={mediaUrl(b.shirt, SHIRT)} className="rotate-[9deg] scale-[1.3]" />
            </div>
            <div className="z-[2] w-[35%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
