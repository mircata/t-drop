import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { verifyStripeEvent } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/stripe-sync";

/*
 * Stripe posts events here. Point the webhook endpoint in the Stripe dashboard
 * (or `stripe listen --forward-to localhost:3100/webhooks/stripe`) at this URL
 * and put its signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  const body = await request.text();
  let event;
  try {
    event = await verifyStripeEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const seen = await payload.find({ collection: "webhook-events", where: { eventId: { equals: event.id } }, limit: 1 });
  if (seen.totalDocs > 0) return NextResponse.json({ received: true, duplicate: true });

  try {
    await handleStripeEvent(payload, event);
  } catch (err) {
    payload.logger.error({ err, eventId: event.id, type: event.type }, "Stripe event failed");
    // 500 makes Stripe retry later.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  await payload.create({ collection: "webhook-events", data: { eventId: event.id, type: event.type, provider: "stripe" }, overrideAccess: true });
  return NextResponse.json({ received: true });
}
