import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { getCustomer } from "@/lib/auth";
import { getPage, getSite } from "@/lib/payload";

/*
 * Landing page. Copy and images come from the "home" page in /admin; the
 * section layouts live in src/components/blocks and match the WordPress
 * reference at 1440px (reference/screenshots/wp/home-1440.jpeg).
 */

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return page ? { title: page.title } : {};
}

export default async function HomePage() {
  /* The landing page is the signup funnel's step 0; a signed-in customer has nothing to
     sign up for, so they go straight to their account (owner, 2026-09-27). */
  if (await getCustomer()) redirect("/account");

  const [page, site] = await Promise.all([getPage("home"), getSite()]);
  if (!page) notFound();
  return <RenderBlocks blocks={page.layout} site={site} />;
}
