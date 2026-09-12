import { Shirt, SHIRT, badgeDot, badgeNeon, badgeRed } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "fabric" }>;

/* Fabric: shirt on top of the illustrated background (bg.svg) */
export function FabricBlock(b: Props) {
  return (
    <section
      className="site-container relative mt-40 flex flex-col items-center bg-[url('/wp/2025/12/bg.svg')] bg-[length:96%_auto] bg-center bg-no-repeat max-lg:mt-[120px] max-lg:bg-cover"
    >
      <div className="relative z-[2] w-[30%] max-md:w-full">
        <Shirt src={mediaUrl(b.shirt, SHIRT)} className="w-full rotate-[4deg] scale-[0.8] md:max-lg:scale-[1.1] max-md:scale-[0.7]" />
        <div className={`${badgeRed} left-[-148px] top-[306px] w-[257px] rotate-[9deg] md:max-lg:left-[-187px] md:max-lg:top-[186px] max-md:left-[13px] max-md:top-[367px]`}>{b.stickerRed}</div>
        <div className={`${badgeNeon} left-[279px] top-[217px] w-1/2 -rotate-[4deg] md:max-lg:left-[178px] md:max-lg:top-[-2px] md:max-lg:w-[242px] max-md:left-[-9px] max-md:top-[84px]`}>{b.stickerNeon}</div>
        <div className={`${badgeDot} left-[259px] top-[424px] w-1/2 rotate-[14deg] md:max-lg:left-[143px] md:max-lg:top-[244px] md:max-lg:w-[268px] max-md:left-[110px] max-md:top-[265px]`}>{b.stickerDot}</div>
      </div>
    </section>
  );
}
