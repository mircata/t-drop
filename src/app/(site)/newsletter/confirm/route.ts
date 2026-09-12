import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";

/* Target of the confirmation email. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const payload = await getPayloadClient();
  const found = token ? await payload.find({ collection: "subscribers", where: { token: { equals: token } }, limit: 1 }) : null;
  const sub = found?.docs[0];
  if (!sub) return NextResponse.redirect(`${siteUrl()}/newsletter/confirmed?state=invalid`);
  if (sub.status !== "confirmed") {
    await payload.update({ collection: "subscribers", id: sub.id, data: { status: "confirmed", confirmedAt: new Date().toISOString() } });
  }
  return NextResponse.redirect(`${siteUrl()}/newsletter/confirmed`);
}
