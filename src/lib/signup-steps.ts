/**
 * The shape of the signup funnel: which screens exist, what order they come in, and which
 * of them a given draft is allowed to open (docs/new-user-flow.md).
 *
 * Deliberately pure — no Payload, no cookies, no `next/headers`. The cookie and database
 * half lives in `signup.ts`, which is unreachable from a unit test because it needs a
 * request context. Keeping the rules here means the interesting part (what happens when
 * someone opens the payment screen with an unverified address) is testable directly.
 *
 * Single source of truth for the step list, the same way `delivery-status.ts` and
 * `shirt-options.ts` are for theirs. `SignupDrafts.step` takes its options from here.
 */

/** In flow order. These are also the URL segments under `/signup`. */
export const FUNNEL_STEPS = ["plan", "verify", "design", "account", "payment"] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const FUNNEL_STEP_LABELS: Record<FunnelStep, string> = {
  plan: "Избор на пакет",
  verify: "Потвърждаване на имейл",
  design: "Избор на дизайн",
  account: "Данни за профила",
  payment: "Плащане",
};

/**
 * Which of the three phases a step belongs to. The design shows 1/3, 2/3, 3/3 against five
 * screens, and the Figma annotation on the counter says so outright: *"this is step
 * counter. There are actually more than 3, but 3 is a good number to use"*. So the counter
 * measures phases, not screens — two screens share phase 1 and two share phase 2.
 */
export const FUNNEL_PHASES = 3;

const PHASE_OF: Record<FunnelStep, number> = {
  plan: 1,
  verify: 1,
  design: 2,
  account: 2,
  payment: 3,
};

export function phaseOf(step: FunnelStep): number {
  return PHASE_OF[step];
}

/** "1/3" — what the counter renders. */
export function phaseLabel(step: FunnelStep): string {
  return `${phaseOf(step)}/${FUNNEL_PHASES}`;
}

export function stepIndex(step: FunnelStep): number {
  return FUNNEL_STEPS.indexOf(step);
}

export function isFunnelStep(value: unknown): value is FunnelStep {
  return typeof value === "string" && (FUNNEL_STEPS as readonly string[]).includes(value);
}

export function stepPath(step: FunnelStep): string {
  return `/signup/${step}`;
}

/** The step after this one, or null at the end of the funnel. */
export function nextStep(step: FunnelStep): FunnelStep | null {
  return FUNNEL_STEPS[stepIndex(step) + 1] ?? null;
}

/** Just enough of a draft to decide where its owner is allowed to be. */
export type DraftPosition = {
  step: FunnelStep;
  emailVerified: boolean;
};

/**
 * Where a draft may go when it asks for `target`.
 *
 * Returns `null` to allow it, or the path to send them to instead. Two rules:
 *
 * - **Never skip ahead.** A draft that has reached `design` cannot open `payment` by typing
 *   the URL; it goes back to the furthest step it has actually reached. Without this the
 *   payment screen would be reachable with no picks behind it.
 * - **Going back is fine.** Someone on `account` can return to `plan` to change package.
 *   The draft's own `step` is the high-water mark and is not lowered by visiting an earlier
 *   screen, so they do not have to redo the steps in between to get forward again.
 *
 * The verification gate is checked separately rather than folded into the ordering, because
 * an unverified draft whose `step` has somehow advanced past `verify` is a bug — a
 * contradiction in the row rather than a customer in the wrong place — and it should land
 * on the waiting screen rather than be quietly allowed through.
 */
export function redirectFor(draft: DraftPosition, target: FunnelStep): string | null {
  if (stepIndex(target) > stepIndex(draft.step)) return stepPath(draft.step);
  if (!draft.emailVerified && stepIndex(target) > stepIndex("verify")) return stepPath("verify");
  return null;
}
