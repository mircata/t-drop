import { type NextRequest, NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { clearDraftCookie } from "@/lib/signup";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { upsertPayment, upsertSubscription } from "@/lib/stripe-sync";

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/**
 * Where the payment step lands once the card is confirmed — straight from the browser when
 * no extra step was needed, or as Stripe's `return_url` after a 3-D Secure page.
 *
 * Reads the subscription from Stripe rather than trusting the query string, records it and
 * its first invoice the same way the webhook does (both are idempotent, and whichever runs
 * first wins), and sends the customer on: to their account when it is paid — the button is
 * annotated *"after this click redirect to account page"* — or back to the payment step
 * when it is not.
 */
export async function GET(request: NextRequest) {
  const back = (error: string) => NextResponse.redirect(new URL(`/signup/payment?error=${error}`, request.nextUrl));

  const subscriptionId = request.nextUrl.searchParams.get("subscription");
  if (!subscriptionId || !stripeEnabled()) return back("unknown");

  const customer = await getCustomer();
  if (!customer?.stripeCustomerId) return NextResponse.redirect(new URL("/login", request.nextUrl));

  const payload = await getPayloadClient();
  let status: string;
  try {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
    /* Someone else's subscription id in the URL gets them nothing. */
    if (idOf(sub.customer) !== customer.stripeCustomerId) return back("unknown");
    status = sub.status;

    try {
      await upsertSubscription(payload, sub, customer.id);
      if (typeof sub.latest_invoice === "object" && sub.latest_invoice) await upsertPayment(payload, sub.latest_invoice);
    } catch (err) {
      /* Most likely the webhook writing the same rows at the same moment. It will finish
         the job either way; the customer should not see an error for it. */
      payload.logger.warn({ err, subscriptionId }, "Signup completion sync deferred to the webhook");
    }
  } catch (err) {
    payload.logger.error({ err, subscriptionId }, "Signup completion could not read the subscription");
    return back("unknown");
  }

  if (status !== "active" && status !== "trialing") return back("declined");

  await clearDraftCookie();
  return NextResponse.redirect(new URL("/account", request.nextUrl));
}
