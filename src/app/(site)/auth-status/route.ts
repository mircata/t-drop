import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";

/*
 * GET /auth-status — {loggedIn: boolean}. Lets SiteHeader (a Client Component,
 * rendered from the static/ISR (site) layout) know whether to show the
 * signed-in nav, without making the whole public site dynamic: reading the
 * auth cookie via getCustomer() directly in the layout would force every page
 * under it to render on every request instead of staying static/ISR
 * (revalidate = 3600), which is the deliberate tradeoff this route avoids.
 * Not under /api/ — that prefix is Payload's own REST API.
 */
export async function GET() {
  const customer = await getCustomer();
  return NextResponse.json({ loggedIn: !!customer });
}
