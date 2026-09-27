"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { downgradeAllowedFrom, monthAfter } from "@/lib/account-drop";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { planPriceCents } from "@/lib/plan-price";
import { rateLimited } from "@/lib/rate-limit";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { dropMonth, isDropLocked } from "@/lib/stripe-sync";

/**
 * "ДА, МИНАВАМ НА <ПАКЕТ> ПАКЕТ" — the upgrade popup's second step (Figma `554:2718`,
 * annotated *"change the user monthly sub to selected new package"*).
 *
 * The owner's rules of 2026-09-27, by where the production cycle is (src/lib/stripe-sync.ts):
 *
 * - **while picking is open** (week 1, or week 4 for the drop after the one arriving) the
 *   change applies to the drop being picked now. Going up, the full price difference is
 *   charged at once to the saved card, and the extra shirts open for picking; going down,
 *   the difference is credited to the next invoice and picks past the new count are dropped.
 * - **while picking is locked** (weeks 2-3) the change applies from the next drop: the new
 *   price from the next renewal, the new shirt count from the drop after the locked one.
 *
 * Either way Stripe's price is swapped without proration — the difference, when there is
 * one to settle now, is settled explicitly above. A lower package is only allowed a month
 * after the last upgrade (the popup's "ВАЖНА ИНФОРМАЦИЯ").
 *
 * The charge happens before anything changes: a declined card leaves the package as it was.
 */
export async function changePlan(formData: FormData) {
  const customer = await getCustomer();
  if (!customer) redirect("/login");

  const planId = Number(formData.get("plan") ?? 0);
  const back = (error: string) => redirect(`/account?upgrade=confirm&plan=${planId}&error=${error}`);
  if (!stripeEnabled() || !customer.stripeCustomerId) back("stripe");
  if (await rateLimited("plan-change", 5, 10 * 60 * 1000)) back("rate");

  const payload = await getPayloadClient();
  const [subs, target, site] = await Promise.all([
    payload.find({
      collection: "subscriptions",
      where: { and: [{ customer: { equals: customer.id } }, { status: { in: ["active", "trialing"] } }, { provider: { equals: "stripe" } }] },
      sort: "-createdAt",
      depth: 1,
      limit: 1,
    }),
    payload.findByID({ collection: "plans", id: planId }).catch(() => null),
    payload.findGlobal({ slug: "site", depth: 0 }),
  ]);
  const sub = subs.docs[0];
  const current = sub && typeof sub.plan === "object" ? sub.plan : null;
  if (!sub || !current) back("no-subscription");
  if (!target?.active || !target.stripePriceId) back("plan");
  if (target!.id === current!.id) back("same");

  const upgrade = target!.shirtCount > current!.shirtCount;
  if (!upgrade) {
    const allowedFrom = downgradeAllowedFrom(sub!.lastUpgradeAt);
    if (allowedFrom && allowedFrom > new Date()) back("too-soon");
  }

  const open = !isDropLocked(site.deliveryDay);
  const month = dropMonth(site.deliveryDay);
  const [fromCents, toCents] = await Promise.all([planPriceCents(current!), planPriceCents(target!)]);
  const diff = toCents - fromCents;
  const currency = target!.currency || "eur";
  const stripe = getStripe();
  const stripeCustomerId = customer.stripeCustomerId!;

  try {
    const live = await stripe.subscriptions.retrieve(sub!.providerSubscriptionId);
    /* The signup saves the card on the subscription, not as the customer's default, so the
       difference is charged to that card explicitly. */
    const card = typeof live.default_payment_method === "string" ? live.default_payment_method : (live.default_payment_method?.id ?? undefined);

    if (open && diff > 0) {
      /* The difference for the drop being picked, as its own invoice, paid now with the
         card the subscription already uses. */
      const invoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        collection_method: "charge_automatically",
        pending_invoice_items_behavior: "exclude",
        auto_advance: false,
        default_payment_method: card,
        description: `Ъпгрейд: ${current!.name} → ${target!.name} (${month})`,
        metadata: { payloadCustomerId: String(customer.id), planChange: `${current!.id}->${target!.id}`, month },
      });
      await stripe.invoiceItems.create({ customer: stripeCustomerId, invoice: invoice.id, amount: diff, currency, description: `${current!.name} → ${target!.name}, ${month}` });
      await stripe.invoices.finalizeInvoice(invoice.id!);
      try {
        const paid = await stripe.invoices.pay(invoice.id!, { off_session: true });
        if (paid.status !== "paid") throw new Error(`invoice ${invoice.id} is ${paid.status}`);
      } catch (err) {
        await stripe.invoices.voidInvoice(invoice.id!).catch(() => {});
        payload.logger.warn({ err: err instanceof Error ? err.message : err, customer: customer.id }, "Plan upgrade charge declined");
        back("declined");
      }
    } else if (open && diff < 0) {
      await stripe.customers.createBalanceTransaction(stripeCustomerId, {
        amount: diff,
        currency,
        description: `${current!.name} → ${target!.name}, ${month}`,
      });
    }

    const item = live.items.data[0];
    await stripe.subscriptions.update(live.id, {
      items: [{ id: item.id, price: target!.stripePriceId! }],
      proration_behavior: "none",
    });
  } catch (err) {
    /* `back()` redirects by throwing; let those through. */
    if (err && typeof err === "object" && "digest" in err) throw err;
    payload.logger.error({ err, customer: customer.id }, "Plan change failed");
    back("stripe");
  }

  await payload.update({
    collection: "subscriptions",
    id: sub!.id,
    data: {
      plan: target!.id,
      previousPlan: current!.id,
      planEffectiveMonth: open ? month : monthAfter(month),
      ...(upgrade ? { lastUpgradeAt: new Date().toISOString() } : {}),
    },
  });

  if (open && !upgrade) {
    /* The drop being picked now shrinks to the new package; picks past it go. */
    await payload.delete({
      collection: "category-selections",
      where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }, { slot: { greater_than: target!.shirtCount } }] },
    });
  }

  revalidatePath("/account");
  redirect(`/account?changed=${target!.id}`);
}
