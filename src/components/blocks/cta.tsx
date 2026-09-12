import Image from "next/image";
import Link from "next/link";
import { Shirt, SHIRT, button } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "cta" }>;

/* Call to action: 25% / 50% / 25% columns */
export function CtaBlock(b: Props) {
  const shirt = mediaUrl(b.shirt, SHIRT);
  return (
    <section className="site-container my-40 flex flex-row items-center">
      <div className="relative w-1/4 -rotate-[4deg] max-lg:hidden">
        <Shirt src={shirt} className="relative z-[2] w-full" />
        <Image src="/wp/2025/12/shapeB.svg" alt="" width={160} height={158} className="absolute left-[119px] top-[-89px] z-[1] w-[160px]" />
      </div>
      <div className="flex w-1/2 flex-col items-center max-lg:w-full">
        <h2 className="w-[80%] text-center font-headline text-[29px] uppercase leading-[1.12] tracking-[0.84px] text-t-red max-md:w-[80%]">
          {b.heading}
        </h2>
        <div className="mt-5 flex h-[121px] w-[80%] items-center justify-center text-center font-dot text-[21px] uppercase tracking-[0.84px] text-t-black max-md:text-[14px]">
          {b.tagline}
        </div>
        <Link href={b.buttonHref || "/join"} className={`${button} mt-5`}>{b.buttonLabel}</Link>
      </div>
      <div className="relative w-1/4 rotate-[9deg] max-lg:hidden">
        <Shirt src={shirt} className="relative z-[2] w-full" />
        <Image src="/wp/2025/12/shapeA.svg" alt="" width={164} height={127} className="absolute left-[110px] top-[382px] z-[1] w-[164px]" />
      </div>
    </section>
  );
}
