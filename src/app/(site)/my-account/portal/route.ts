import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";

/* Sends a signed-in customer to the Stripe Customer Portal (card, invoices, cancel). */
export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.redirect(`${siteUrl()}/your-profile`);
  if (!stripeEnabled() || !customer.stripeCustomerId) return NextResponse.redirect(`${siteUrl()}/my-account?portal=none`);
  const session = await getStripe().billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${siteUrl()}/my-account`,
  });
  return NextResponse.redirect(session.url);
}
