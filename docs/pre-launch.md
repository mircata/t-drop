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
- [ ] **Package names and prices.** Basic / Supporter / Family are untranslated and the
      three prices are placeholders (decisions 7 and 11 in
      [new-user-flow.md](new-user-flow.md)). Three real Stripe prices are needed, and the
      seed script still seeds a single plan.
- [ ] **The privacy policy.** A lawyer is writing it. Until it exists the consent checkbox
      at step 2-2 points at a dead link, which is worse than no checkbox. The footer's other
      legal links are `#` for the same reason.

## Email

The full list, with the reasoning, is under "Email sending — deferred" in
[new-user-flow.md](new-user-flow.md). The two that can do real damage if forgotten:

- [ ] **Remove the auto-verify stub** and the flag that switches it. Left in, it lets
      unverified addresses through silently — the failure mode is invisible.
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
