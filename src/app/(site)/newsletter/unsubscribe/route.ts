import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { siteUrl } from "@/lib/stripe";

/* Link at the bottom of every newsletter: /newsletter/unsubscribe?token=... */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const payload = await getPayloadClient();
  const found = token ? await payload.find({ collection: "subscribers", where: { token: { equals: token } }, limit: 1 }) : null;
  const sub = found?.docs[0];
  if (sub && sub.status !== "unsubscribed") {
    await payload.update({ collection: "subscribers", id: sub.id, data: { status: "unsubscribed" } });
  }
  return NextResponse.redirect(`${siteUrl()}/newsletter/unsubscribed`);
}
