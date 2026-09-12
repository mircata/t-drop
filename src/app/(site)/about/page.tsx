import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getPage, getSite } from "@/lib/payload";

/* About page. Copy comes from the "about" page in /admin. */

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return page ? { title: page.title } : {};
}

export default async function AboutPage() {
  const [page, site] = await Promise.all([getPage("about"), getSite()]);
  if (!page) notFound();
  return <RenderBlocks blocks={page.layout} site={site} wrapSocial />;
}
