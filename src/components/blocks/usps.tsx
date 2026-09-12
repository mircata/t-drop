import Image from "next/image";
import { subheadline } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";
import { Lines } from "./lines";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "usps" }>;

/* Icon heights from the WordPress render, by position. Icons the owner adds later get 96. */
const ICON_HEIGHTS = [96, 82, 114, 90];

/* USP row: 1140px container, four equal columns */
export function UspsBlock(b: Props) {
  return (
    <section className="mx-auto mt-20 flex w-full max-w-[1140px] flex-row pb-[54px] pt-10 max-lg:flex-wrap max-lg:items-center max-lg:justify-center md:max-lg:gap-x-[15px] md:max-lg:gap-y-[54px] max-md:gap-[54px] max-md:px-5">
      {(b.items ?? []).map((u, i) => (
        <div key={u.id ?? i} className="flex flex-1 flex-col items-center max-lg:flex-none md:max-lg:w-[45%] max-md:w-full">
          <Image src={mediaUrl(u.icon, "")} alt="" width={114} height={ICON_HEIGHTS[i] ?? 96} className="w-[40%] max-lg:w-auto md:max-lg:h-[150px] max-md:h-[130px]" />
          <h3 className={`${subheadline} mt-5 text-center text-t-red`}><Lines text={u.title} /></h3>
          <p className="mt-5 text-center">{u.text}</p>
        </div>
      ))}
    </section>
  );
}
