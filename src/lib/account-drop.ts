import type { Plan, Subscription } from "@/payload-types";

/**
 * Package-aware helpers for the /account dashboard (Figma "ДРОП page states V2",
 * 2026-09-27). Pure — no Payload, no Stripe — so the rules are testable on their own.
 */

/** "2026-11" -> "2026-12", "2026-12" -> "2027-01". */
export function monthAfter(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

const planOf = (p: Subscription["plan"] | Subscription["previousPlan"]): Plan | null => (p && typeof p === "object" ? p : null);

/**
 * How many shirts a subscription gets in a given drop month. A package change made while
 * picking is locked (weeks 2-3) applies from the next drop, so months before
 * `planEffectiveMonth` keep the previous plan's count. Needs the subscription read at
 * depth 1 or more, so both plans are documents.
 */
export function shirtCountFor(sub: Pick<Subscription, "plan" | "previousPlan" | "planEffectiveMonth">, month: string): number {
  const current = planOf(sub.plan);
  const previous = planOf(sub.previousPlan);
  if (previous && sub.planEffectiveMonth && month < sub.planEffectiveMonth) return previous.shirtCount;
  return current?.shirtCount ?? 1;
}

/**
 * The package an upgrade tile offers for a slot beyond the customer's own: the smallest
 * active package that has that many shirts — on a Базов dashboard, Фен for shirt 2 and
 * Семеен for 3 and 4.
 */
export function planForSlot<T extends Pick<Plan, "shirtCount">>(plans: T[], slot: number): T | null {
  return [...plans].filter((p) => p.shirtCount >= slot).sort((a, b) => a.shirtCount - b.shirtCount)[0] ?? null;
}

/** A lower package is allowed one month after the last upgrade. */
export function downgradeAllowedFrom(lastUpgradeAt: string | null | undefined): Date | null {
  if (!lastUpgradeAt) return null;
  const d = new Date(lastUpgradeAt);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}
