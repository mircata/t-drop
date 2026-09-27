import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { FunnelFaq } from "@/components/site/funnel-faq";
import { getPage, getSite } from "@/lib/payload";

/* About page. Copy comes from the "about" page in /admin. */

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return page ? { title: page.title } : {};
}

export default async function AboutPage() {
  const [page, site] = await Promise.all([getPage("about"), getSite()]);
  if (!page) notFound();
  return (
    <>
      <RenderBlocks blocks={page.layout} site={site} wrapSocial />
      {/* The signup funnel's FAQ, at the foot of the page (owner, 2026-09-27). The same list
          as the package step's, edited once on the Site global in /admin. No frame draws it
          here, so it keeps the funnel's own layout, 120px under the last block like the
          social row above it. */}
      <FunnelFaq
        heading={site.funnelFaqHeading ?? "Често задавани въпроси"}
        items={(site.funnelFaq ?? []).map((item) => ({ question: item.question, answer: item.answer }))}
        className="site-container mt-[120px] max-md:px-4"
      />
    </>
  );
}
