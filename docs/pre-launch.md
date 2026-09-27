# Pre-launch checklist

Things that are knowingly wrong, stubbed or placeholder in the codebase right now, and
must be fixed before the site takes real money from real customers.

This is deliberately not a backlog. Everything here is a **blocker**, not an improvement —
if an item is still unticked, the site is not ready. Nice-to-haves live in
[ux-backlog.md](ux-backlog.md).

## Copy that is placeholder

- [ ] **The FAQ price.** The funnel FAQ (Figma `525:3834`) reads *"Само 17.99 € на месец"*
      while the package selector directly above it offers three prices — €17,99 / €22,99 /
      €24,99. Owner 2026-09-22: placeholder. Whoever writes the final copy also has to
      decide whether the answer names one price, a "от €X" range, or all three. Note the
      format too: the rest of the site writes `€17,99` (sign leading, comma decimal); this
      draft writes `17.99 €`.
- [ ] **The FAQ courier list.** The same FAQ (`525:3843`) promises *"Работим със Speedy,
      Sameday и BoxNow"* by name, on the screen where the customer is deciding. Per
      [courier-integration.md](courier-integration.md) there is no contract with any of the
      three yet; Speedy and BOX NOW are planned, Sameday is undecided. Owner 2026-09-22:
      placeholder. The final wording must match the contracts that actually exist.
- [ ] **Package prices and their Stripe ids.** The names are settled — Базов / Фен /
      Семеен, seeded by `scripts/seed-content.ts` — but the three prices (€17,99 / €22,99 /
      €24,99) are placeholders (decision 7 in [new-user-flow.md](new-user-flow.md)) and none
      of the three plans has a `stripePriceId` yet. Nothing may depend on their ratios.
- [ ] **Pictures for the package cards.** The picture is the biggest thing on each card at
      step 1-1, and both frames (`519:434`, `525:3769` and their siblings) draw it as a
      plain grey `#f5f5f5` rounded rectangle — a placeholder, not artwork. `Plans.image`
      exists for it in /admin and a plan with none renders that same grey box, which is what
      the three seeded packages do today. Nothing has been invented to fill it.
- [ ] **The privacy policy.** A lawyer is writing it. Until it exists the consent checkbox
      at step 2-2 points at a dead link, which is worse than no checkbox. The footer's other
      legal links are `#` for the same reason.

## Email

The full list, with the reasoning, is under "Email sending — deferred" in
[new-user-flow.md](new-user-flow.md). The two that can do real damage if forgotten:

- [ ] **Build the verification screens that do not exist yet.** As of 2026-09-22 the funnel's
      step 1-2 renders only the *verified* state (`519:579` / `525:4180`) and verifies
      nothing. The waiting state (`519:486`), "ИЗПРАТИ ОТНОВО" and the "Друг мейл?" popup
      (`525:1340`) are designed but deliberately not built, and their server actions
      (`resendVerification`, `changeSignupEmail`) were removed with them — an unused Server
      Action is still a live endpoint. Build the screens and the actions together with real
      sending, so there is never a half-wired verification flow.
- [ ] **Remove the auto-verify stub** and the flag that switches it: `SIGNUP_AUTOVERIFY`,
      read by `signupAutoVerify()` in `src/lib/signup-flags.ts` and used by
      `issueVerification()` in `src/lib/signup.ts`. Drafts waved through this way are stamped
      `verifiedWithoutEmail`, so they can be found and dealt with. Setting the flag in a
      production build already throws at startup rather than passing silently, but the stub
      and the flag should both go once real sending works. The guard lets Vercel through on purpose
      (it is the test site, not production — CLAUDE.md "Environments"); the real
      production host is where it bites.
- [ ] **Set `RESEND_API_KEY`.** Without it every email in the app prints to the server
      console instead of sending, including password resets and the guest-checkout
      "choose your password" link.

Also outstanding there: turning real verification back on in `Customers.ts`
(`auth.verify: false`, with the working block commented out below it), sending on НАПРЕД and
both re-send paths, invalidating a superseded pending address, and a retention rule that
deletes abandoned signup drafts.

## Stripe

- [ ] Move off the sandbox onto the live account: `STRIPE_SECRET_KEY`,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and a live webhook
      endpoint with the same event list as the sandbox one (see CLAUDE.md, "Stripe setup").
- [ ] Put the live `price_…` ids on the plans in `/admin`.

## Deploy

From CLAUDE.md's deploy section, still open there:

- [ ] Point t-drop.net at Vercel.
- [ ] Create the first `/admin` user on production.
- [ ] Regenerate `importMap.js` with the S3 vars set before any deploy — a plain local
      `npm run generate:importmap` omits the S3 upload handler and `/admin` breaks outright.
