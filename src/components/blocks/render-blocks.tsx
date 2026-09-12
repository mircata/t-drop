import { SocialFollow } from "@/components/site/shared";
import type { Page, Site } from "@/payload-types";
import { AboutStoryBlock } from "./about-story";
import { AboutWhenBlock } from "./about-when";
import { CtaBlock } from "./cta";
import { FabricBlock } from "./fabric";
import { FaqBlock } from "./faq";
import { HeroBlock } from "./hero";
import { ReviewsBlock } from "./reviews";
import { UspsBlock } from "./usps";

/**
 * Turns a page's "layout" blocks into sections. Add a case here when adding a
 * block in src/blocks/index.ts. The about page wraps its social block in a
 * 120px spacer, hence the `wrapSocial` flag.
 */
export function RenderBlocks({ blocks, site, wrapSocial = false }: { blocks: Page["layout"]; site: Site; wrapSocial?: boolean }) {
  return (blocks ?? []).map((block, i) => {
    const key = block.id ?? i;
    switch (block.blockType) {
      case "hero":
        return <HeroBlock key={key} {...block} />;
      case "fabric":
        return <FabricBlock key={key} {...block} />;
      case "usps":
        return <UspsBlock key={key} {...block} />;
      case "reviews":
        return <ReviewsBlock key={key} {...block} />;
      case "faq":
        return <FaqBlock key={key} {...block} />;
      case "cta":
        return <CtaBlock key={key} {...block} />;
      case "social": {
        const social = (
          <SocialFollow
            key={key}
            text={block.text}
            smallOnPhones={block.smallOnPhones ?? false}
            instagram={site.instagram || "#"}
            facebook={site.facebook || "#"}
          />
        );
        return wrapSocial ? <div key={key} className="mt-[120px]">{social}</div> : social;
      }
      case "aboutStory":
        return <AboutStoryBlock key={key} {...block} />;
      case "aboutWhen":
        return <AboutWhenBlock key={key} {...block} />;
      default:
        return null;
    }
  });
}
