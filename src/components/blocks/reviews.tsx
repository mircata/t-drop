import Image from "next/image";
import { Shirt, SHIRT, badgeNeon, badgeRed, headline36 } from "@/components/site/shared";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "reviews" }>;

/* Card tilt, image size and sticker position per card, from the WordPress render.
   Card 1's sticker is lifted onto the photo (the WordPress offset dropped it across the
   quote, hiding "Перфект" on lg+ and clipping the first line at md); cards 2 and 3 already
   sat clear. See the note in CLAUDE.md before restoring any of these to the Elementor values. */
const CARDS = [
  { rotate: "-rotate-[4deg]", w: 480, h: 580, aspect: "aspect-[480/580]", badge: `${badgeNeon} left-[-65px] top-[325px] w-1/2 rotate-[14deg] md:max-lg:left-[-35px] md:max-lg:top-[141px] md:max-lg:w-full max-md:left-[-11px] max-md:top-[275px] max-md:w-[179px]` },
  { rotate: "rotate-0", w: 600, h: 800, aspect: undefined, badge: `${badgeRed} left-[247px] top-[389px] w-1/2 rotate-[14deg] md:max-lg:left-[51px] md:max-lg:top-[-19px] md:max-lg:w-full max-md:left-[11px] max-md:top-[327px] max-md:w-[140px]` },
  { rotate: "rotate-[4deg]", w: 600, h: 800, aspect: undefined, badge: `${badgeNeon} left-[-49px] top-[333px] w-1/2 rotate-[14deg] md:max-lg:left-[40px] md:max-lg:top-[171px] md:max-lg:w-full max-md:left-[169px] max-md:top-[337px] max-md:w-[139px]` },
];

export function ReviewsBlock(b: Props) {
  return (
    <>
      {/* Reviews heading with the two neon shapes */}
      <section className="site-container relative mt-40">
        <h2 className={`${headline36} relative z-[2] text-center`}>{b.heading}</h2>
        <Image src="/wp/2025/12/shapeB.svg" alt="" width={150} height={148} className="absolute left-[99px] top-[-50px] z-[1] w-[150px] translate-x-[37px] max-md:left-[178px] max-md:top-[27px] max-md:w-[105px]" />
        <Image src="/wp/2025/12/shapeA.svg" alt="" width={150} height={104} className="absolute left-[1043px] top-[5px] z-[1] w-[150px] translate-x-[37px] max-md:left-[-41px] max-md:top-[-40px]" />
      </section>

      {/* Review cards: 1140px container, gap 80 */}
      <section className="mx-auto mt-20 flex w-full max-w-[1140px] flex-row gap-20 pb-[27px] max-lg:max-w-[678px] max-md:flex-col max-md:gap-0">
        {(b.items ?? []).slice(0, CARDS.length).map((r, i) => {
          const c = CARDS[i];
          return (
            <div key={r.id ?? i} className={`relative z-[2] flex flex-1 flex-col ${c.rotate} max-md:p-5`}>
              <Shirt src={mediaUrl(r.photo, SHIRT)} w={c.w} h={c.h} aspect={c.aspect} className="w-full max-md:scale-[0.8]" />
              <div className={c.badge}>{r.name}</div>
              <p className="mt-7 max-md:mt-0">{r.quote}</p>
            </div>
          );
        })}
      </section>
    </>
  );
}
