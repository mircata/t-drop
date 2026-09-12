import Image from "next/image";
import Link from "next/link";
import { Shirt, SHIRT, button, headline } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";
import { Lines } from "./lines";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "hero" }>;

/* Hero: 517px tall on desktop */
export function HeroBlock(b: Props) {
  const shirt = mediaUrl(b.shirt, SHIRT);
  return (
    <section className="site-container flex flex-row max-lg:flex-col max-md:px-5">
      <div className="flex w-1/2 flex-col gap-5 pt-10 max-lg:w-full max-lg:items-center max-lg:text-center">
        <h1 className={headline}><Lines text={b.heading} /></h1>
        <p className="md:max-lg:w-[60%] max-md:w-[80%]">{b.subheading}</p>
        <Link href={b.ctaHref || "/join"} className={`${button} mt-3.5 self-start max-lg:self-center`}>{b.ctaLabel}</Link>
      </div>

      <div className="relative flex h-[517px] w-1/2 flex-row flex-nowrap items-center max-lg:h-auto max-lg:w-full max-md:mt-[60px]">
        <Image src="/wp/2025/12/shapeA.svg" alt="" width={640} height={445} className="absolute left-[-10px] top-[26px] z-[1] w-full translate-x-[37px] scale-90 md:max-lg:left-[-267px] md:max-lg:top-[6px] md:max-lg:w-[30%] md:max-lg:translate-x-[99px] max-md:left-[-93px] max-md:top-[-61px] max-md:w-full max-md:scale-50" />
        <Image src="/wp/2025/12/shapeB.svg" alt="" width={241} height={237} className="absolute left-[399px] top-[402px] z-[1] w-[241px] translate-x-[37px] md:max-lg:left-[125px] md:max-lg:top-[218px] md:max-lg:w-[29%] max-md:left-[99px] max-md:top-[135px] max-md:w-[276px]" />
        <div className="w-[32%] shrink-0 md:max-lg:w-[233px] max-md:w-[38%]">
          <Shirt src={shirt} className="-rotate-[9deg] scale-[1.3] max-lg:scale-[0.8]" />
        </div>
        <div className="z-[2] flex-1 max-md:w-[36%] max-md:flex-none">
          <Shirt src={shirt} className="scale-[1.5] md:max-lg:scale-100 max-md:scale-[1.5]" />
        </div>
        <div className="flex-1 max-md:w-[32%] max-md:flex-none">
          <Shirt src={shirt} className="rotate-[9deg] scale-[1.3] max-lg:scale-[0.8]" />
        </div>
      </div>
    </section>
  );
}
