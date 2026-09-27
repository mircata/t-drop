import { describe, expect, it } from "vitest";
import { downgradeAllowedFrom, monthAfter, planForSlot, shirtCountFor } from "@/lib/account-drop";
import type { Plan } from "@/payload-types";

const plan = (id: number, shirtCount: number) => ({ id, shirtCount, name: `p${id}` }) as unknown as Plan;
const basic = plan(2, 1);
const fan = plan(3, 2);
const family = plan(4, 4);

describe("monthAfter", () => {
  it("rolls over the year", () => {
    expect(monthAfter("2026-11")).toBe("2026-12");
    expect(monthAfter("2026-12")).toBe("2027-01");
  });
});

describe("shirtCountFor — a package change that only applies from the next drop", () => {
  it("uses the current plan when nothing changed", () => {
    expect(shirtCountFor({ plan: fan, previousPlan: null, planEffectiveMonth: null }, "2026-11")).toBe(2);
  });
  it("keeps the previous plan's count for months before the change takes effect", () => {
    const sub = { plan: family, previousPlan: fan, planEffectiveMonth: "2026-12" };
    expect(shirtCountFor(sub, "2026-11")).toBe(2);
    expect(shirtCountFor(sub, "2026-12")).toBe(4);
    expect(shirtCountFor(sub, "2027-01")).toBe(4);
  });
  it("applies at once when the change took effect this month (picking was open)", () => {
    expect(shirtCountFor({ plan: fan, previousPlan: basic, planEffectiveMonth: "2026-11" }, "2026-11")).toBe(2);
  });
});

describe("planForSlot — the upgrade tile's offer", () => {
  it("offers the smallest package that covers the slot", () => {
    const plans = [family, basic, fan];
    expect(planForSlot(plans, 2)?.id).toBe(fan.id);
    expect(planForSlot(plans, 3)?.id).toBe(family.id);
    expect(planForSlot(plans, 4)?.id).toBe(family.id);
    expect(planForSlot(plans, 5)).toBeNull();
  });
});

describe("downgradeAllowedFrom", () => {
  it("is a month after the last upgrade, and unrestricted without one", () => {
    expect(downgradeAllowedFrom(null)).toBeNull();
    expect(downgradeAllowedFrom("2026-09-27T10:00:00.000Z")?.toISOString()).toBe("2026-10-27T10:00:00.000Z");
  });
});
