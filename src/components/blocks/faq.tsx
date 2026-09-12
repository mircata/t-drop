import Image from "next/image";
import Link from "next/link";
import { buttonWhite, headline36, subheadline } from "@/components/site/shared";
import type { Page } from "@/payload-types";
import { Lines } from "./lines";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "faq" }>;

/* FAQ: red band, 60px padding */
export function FaqBlock(b: Props) {
  return (
    <section className="site-container relative my-40 flex flex-col items-center justify-center bg-t-red pb-[74px] pt-[60px] max-lg:px-10 max-md:pb-[60px]">
      <h2 className={`${headline36} relative z-[2] w-full text-left text-white`}>{b.heading}</h2>
      <div className="mt-5 flex w-full flex-row gap-20 text-white max-lg:mt-10 max-lg:flex-col md:max-lg:gap-[14px] max-md:gap-[54px]">
        {(b.items ?? []).map((f, i) => (
          <div key={f.id ?? i} className="flex flex-1 flex-col">
            <h3 className={subheadline}>{f.question}</h3>
            <p className="mt-5"><Lines text={f.answer} /></p>
            {f.ctaLabel && (
              <Link href={f.ctaHref || "/join"} className={`${buttonWhite} mt-[34px] self-start`}>{f.ctaLabel}</Link>
            )}
          </div>
        ))}
      </div>
      <Image src="/wp/2025/12/line2.svg" alt="" width={289} height={131} className="absolute left-[1063px] top-[500px] z-[1] w-[289px] max-lg:left-[303px] max-lg:top-[821px]" />
      <Image src="/wp/2025/12/star2.svg" alt="" width={200} height={202} className="absolute left-[72px] top-[-77px] z-[1] w-[120px] md:max-lg:left-[139px] md:max-lg:top-[-123px] max-md:left-[93px] max-md:top-[-129px]" />
    </section>
  );
}
