/**
 * Whether the signup funnel verifies email addresses at all. Right now it does not.
 *
 * The funnel blocks on an email round-trip by design (docs/new-user-flow.md, step 1-2), but
 * there is no Resend account, so every email in this app prints to the server console
 * instead of sending. The owner's decision on 2026-09-22 was to build the screens and defer
 * everything to do with sending. So the step stays in the path — the customer sees it and
 * presses НАПРЕД — and the address is marked verified without anything being checked.
 *
 * Drafts waved through this way are stamped `verifiedWithoutEmail`, so they can be found
 * again and dealt with once verification is real.
 *
 * Vercel is not production (owner, 2026-09-27): it is the test site shared with colleagues
 * and friends, and the real production will be hosted elsewhere. Vercel builds run with
 * `NODE_ENV=production`, so it is recognised by the `VERCEL` variable Vercel sets on every
 * deployment and allowed through; any other production host still throws.
 *
 * **This must never reach production.** It is the one stub in the pre-launch list whose
 * failure mode is invisible: an unverified address walks straight through and nothing looks
 * wrong. A comment asking a future session to remember is not enough, so the guard is
 * mechanical — a production build throws at startup rather than quietly letting addresses
 * through. Turning verification on means setting `RESEND_API_KEY`, building the waiting
 * screen and the mail popup, and deleting this file.
 */

/** True when addresses are waved through. Throws in production rather than doing it there. */
export function signupAutoVerify(): boolean {
  /* An explicit "false" turns the stub off, which is what a staging environment that has
     real sending wired up would set. Anything else outside production waves through, so a
     fresh clone can walk the funnel without configuring anything. */
  const off = process.env.SIGNUP_AUTOVERIFY === "false";
  /* Vercel is the shared test site, not production — see above. */
  const production = process.env.NODE_ENV === "production" && process.env.VERCEL !== "1";

  if (!off && production) {
    throw new Error(
      "The signup funnel's email verification is still stubbed: addresses are marked verified " +
        "without an email being sent, and this is a production build. Set RESEND_API_KEY, build " +
        "the waiting screen and mail popup, then remove src/lib/signup-flags.ts — or set " +
        "SIGNUP_AUTOVERIFY=false to block the funnel instead. See docs/pre-launch.md.",
    );
  }
  return !off;
}
