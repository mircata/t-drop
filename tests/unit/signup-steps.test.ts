import { describe, expect, it } from "vitest";
import {
  FUNNEL_STEPS,
  type FunnelStep,
  isFunnelStep,
  nextEmptySlot,
  nextStep,
  phaseLabel,
  phaseOf,
  redirectFor,
  stepPath,
} from "@/lib/signup-steps";

/* The funnel's ordering rules (src/lib/signup-steps.ts). Pure, so unlike the rest of the
   signup machinery these run without a database or a request context. The cases that
   matter are the ones where someone arrives somewhere they should not be: a hand-typed
   URL, a stale link, or a draft whose row contradicts itself. */

const verified = (step: FunnelStep) => ({ step, emailVerified: true });
const unverified = (step: FunnelStep) => ({ step, emailVerified: false });

describe("phases", () => {
  it("maps five steps onto three phases", () => {
    expect(FUNNEL_STEPS.map(phaseOf)).toEqual([1, 1, 2, 2, 3]);
  });

  it("labels the counter as the design draws it", () => {
    expect(phaseLabel("plan")).toBe("1/3");
    expect(phaseLabel("account")).toBe("2/3");
    expect(phaseLabel("payment")).toBe("3/3");
  });
});

describe("ordering", () => {
  it("walks the steps in flow order and ends after payment", () => {
    expect(nextStep("plan")).toBe("verify");
    expect(nextStep("account")).toBe("payment");
    expect(nextStep("payment")).toBeNull();
  });

  it("recognises only real steps", () => {
    expect(isFunnelStep("design")).toBe(true);
    expect(isFunnelStep("checkout")).toBe(false);
    expect(isFunnelStep(undefined)).toBe(false);
  });
});

describe("redirectFor", () => {
  it("lets a draft open the step it is on", () => {
    expect(redirectFor(verified("design"), "design")).toBeNull();
  });

  it("lets a draft go back to an earlier step", () => {
    // Changing package after verifying is allowed; the draft keeps its high-water mark.
    expect(redirectFor(verified("account"), "plan")).toBeNull();
  });

  it("refuses to let a draft skip ahead", () => {
    expect(redirectFor(verified("design"), "payment")).toBe(stepPath("design"));
    expect(redirectFor(verified("plan"), "account")).toBe(stepPath("plan"));
  });

  it("sends an unverified draft to the waiting screen, whatever its step says", () => {
    // A row claiming to be on `payment` with an unconfirmed address is a contradiction,
    // not a customer in the wrong place. It must not be waved through.
    expect(redirectFor(unverified("payment"), "payment")).toBe(stepPath("verify"));
    expect(redirectFor(unverified("design"), "design")).toBe(stepPath("verify"));
  });

  it("still lets an unverified draft use the first two steps", () => {
    expect(redirectFor(unverified("verify"), "plan")).toBeNull();
    expect(redirectFor(unverified("verify"), "verify")).toBeNull();
  });

  it("never sends a draft to the step it is already asking for", () => {
    // Guards against a redirect loop: every answer is either null or a different path.
    for (const step of FUNNEL_STEPS) {
      for (const target of FUNNEL_STEPS) {
        for (const draft of [verified(step), unverified(step)]) {
          const answer = redirectFor(draft, target);
          expect(answer).not.toBe(stepPath(target));
        }
      }
    }
  });
});

describe("nextEmptySlot", () => {
  const pick = (slot: number) => ({ slot, category: 1 });

  it("walks a package from the first shirt to the last", () => {
    expect(nextEmptySlot([], 4)).toBe(1);
    expect(nextEmptySlot([pick(1)], 4)).toBe(2);
    expect(nextEmptySlot([pick(1), pick(2), pick(3)], 4)).toBe(4);
  });

  it("returns null once every slot in the package is picked", () => {
    expect(nextEmptySlot([pick(1)], 1)).toBeNull();
    expect(nextEmptySlot([pick(1), pick(2)], 2)).toBeNull();
  });

  it("finds a gap left in the middle", () => {
    // Someone edited slot 2 from the cart and abandoned it: the funnel has to come back
    // to that hole rather than treating the order as complete.
    expect(nextEmptySlot([pick(1), pick(3), pick(4)], 4)).toBe(2);
  });

  it("ignores picks beyond the package's shirt count", () => {
    // A Family order dropped to Базов leaves picks 2-4 behind. They must not make slot 1
    // look filled, and they must not keep the order open either.
    expect(nextEmptySlot([pick(2), pick(3)], 1)).toBe(1);
    expect(nextEmptySlot([pick(1), pick(2), pick(3)], 1)).toBeNull();
  });

  it("treats a slot with a size but no design as still empty", () => {
    // The picker writes design, size and gender together, but a half-written row must not
    // count as a made choice.
    expect(nextEmptySlot([{ slot: 1, category: null }], 2)).toBe(1);
  });
});
