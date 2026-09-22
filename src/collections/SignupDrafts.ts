import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/access";
import { genderOptions, sizeOptions } from "../lib/shirt-options";
import { FUNNEL_STEPS, FUNNEL_STEP_LABELS } from "../lib/signup-steps";

/**
 * One in-progress trip through the signup funnel (docs/new-user-flow.md).
 *
 * The funnel spans five screens and an email round-trip: an address is entered on the
 * landing page, a package is chosen, the address is verified, each shirt is picked, and
 * only then is a password set and a real `customers` row created. Everything before that
 * last step lives here.
 *
 * It is a collection rather than browser state on purpose. The verification link is opened
 * from a mail client, which routinely means a different browser from the one that started
 * the signup — `sessionStorage` would silently lose those people, and they are exactly the
 * ones who were about to pay. Keying the state to the pending address instead means the
 * link resumes the funnel wherever it is opened.
 *
 * It is also not a half-created `customers` row: an unverified account with no password
 * would show up in admin lists, in access checks and in Payload's own auth, and would have
 * to be cleaned up if the person never finished.
 *
 * Nothing here is public. Access is admin-only; the funnel's server actions reach it
 * through the Local API, which skips access control, and must look rows up by token rather
 * than trusting anything the browser sends.
 *
 * Rows are disposable. A draft is finished once `customer` is set, and abandoned drafts
 * hold an email address that we have no reason to keep — see the retention item in
 * docs/new-user-flow.md.
 */
export const SignupDrafts: CollectionConfig = {
  slug: "signup-drafts",
  labels: { singular: "Незавършена регистрация", plural: "Незавършени регистрации" },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "step", "emailVerified", "plan", "updatedAt"],
    group: "Абонаменти",
    description: "Хора, започнали регистрация, които още нямат профил.",
  },
  fields: [
    { name: "email", type: "email", label: "Имейл", required: true, unique: true, index: true },
    /* What the browser's `tdrop-signup` cookie holds, and what the verification link
       carries, so the funnel resumes in whichever browser opens that link. Re-issued on
       every resume. Never an id: a guessable cookie value would expose other people's
       email and shipping addresses. See src/lib/signup.ts. */
    { name: "resumeToken", type: "text", label: "Код за продължаване", index: true, admin: { readOnly: true } },
    {
      name: "step",
      type: "select",
      label: "Докъде е стигнал",
      defaultValue: "plan",
      index: true,
      options: FUNNEL_STEPS.map((step) => ({ label: FUNNEL_STEP_LABELS[step], value: step })),
    },
    { name: "plan", type: "relationship", relationTo: "plans", label: "Пакет" },

    { name: "emailVerified", type: "checkbox", label: "Потвърден имейл", defaultValue: false, index: true },
    /* The token behind the link in the verification email. Changing the address from the
       "Друг мейл?" popup issues a new one, which is what invalidates the old link. */
    { name: "verifyToken", type: "text", label: "Код за потвърждение", index: true },
    { name: "verifyTokenExpiresAt", type: "date", label: "Валиден до" },
    /* Set when a draft was waved through by the auto-verify stub instead of a real email
       (see the deferred email checklist in docs/new-user-flow.md). It exists so that these
       rows can be found and dealt with when real sending is turned on, rather than sitting
       in the database indistinguishable from genuinely verified ones. */
    {
      name: "verifiedWithoutEmail",
      type: "checkbox",
      label: "Потвърден без имейл (временно)",
      defaultValue: false,
      admin: { description: "Временно, докато изпращането на имейли не е включено." },
    },

    /* One entry per shirt in the package, numbered the same way `category-selections.slot`
       is, so a finished draft copies across one-for-one. Partial by design: the customer
       fills these in one at a time and the bottom-sheet cart shows which are still empty. */
    {
      name: "picks",
      type: "array",
      label: "Избори",
      labels: { singular: "Избор", plural: "Избори" },
      fields: [
        { name: "slot", type: "number", label: "Тениска №", required: true, min: 1 },
        { name: "category", type: "relationship", relationTo: "categories", label: "Тема" },
        { name: "size", type: "select", label: "Размер", options: sizeOptions() },
        { name: "gender", type: "select", label: "Пол", options: genderOptions() },
      ],
    },

    /* Captured on the account screen. privacyAccepted is a condition of creating the
       account; marketingOptIn is the separate, unticked consent that makes any non-
       transactional email to this address lawful. Keep them apart — bundling them is
       exactly what makes the consent invalid. */
    { name: "privacyAccepted", type: "checkbox", label: "Приета политика за поверителност", defaultValue: false },
    { name: "marketingOptIn", type: "checkbox", label: "Съгласие за новини по имейл", defaultValue: false },

    /* Set once the account exists. A draft with a customer is finished and can be cleared. */
    { name: "customer", type: "relationship", relationTo: "customers", label: "Създаден профил" },
  ],
};
