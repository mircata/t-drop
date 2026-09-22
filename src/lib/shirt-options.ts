/**
 * The size and gender choices for one shirt, in the order the funnel's picker draws them.
 *
 * Single source of truth, the same way `delivery-status.ts` is for fulfillment statuses:
 * `CategorySelections` and `SignupDrafts` both store a pick, and the two drifting apart
 * would mean a draft that cannot be copied onto the real row it becomes.
 */

export const SHIRT_SIZES = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
] as const;

export const SHIRT_GENDERS = [
  { value: "male", label: "Мъж" },
  { value: "female", label: "Жена" },
] as const;

export type ShirtSize = (typeof SHIRT_SIZES)[number]["value"];
export type ShirtGender = (typeof SHIRT_GENDERS)[number]["value"];

export const SHIRT_SIZE_LABELS: Record<string, string> = Object.fromEntries(SHIRT_SIZES.map((s) => [s.value, s.label]));
export const SHIRT_GENDER_LABELS: Record<string, string> = Object.fromEntries(SHIRT_GENDERS.map((g) => [g.value, g.label]));

/** Payload `options` want a plain mutable array, and `as const` above makes these readonly. */
export const sizeOptions = () => SHIRT_SIZES.map((s) => ({ label: s.label, value: s.value }));
export const genderOptions = () => SHIRT_GENDERS.map((g) => ({ label: g.label, value: g.value }));
