# Handoff: t-drop v0.3

Written 2026-09-13, right after commit 98f12b5 went live on Vercel. Read `docs/handoff-v0.2.md` first for the decisions that still hold, then this file.

A handoff is a claim, not a fact. Before acting, check `git log`, `bd ready`, the Vercel dashboard and the Stripe sandbox. Where they disagree with this file, trust them.

## Where things stand

v0.2 is done and closed in beads (epic `tdrop-oaz`). The site runs at https://t-drop.vercel.app from the `main` branch: Payload CMS at `/admin`, Supabase Postgres in Frankfurt, media in a public Supabase bucket, Stripe in sandbox mode, no email provider yet. CI on GitHub runs lint, typecheck, 20 unit tests, 5 browser tests and the build on every push.

The v0.3 epic is `tdrop-f1f`. Its six tasks are the whole scope of the next session:

1. `tdrop-f1f.1` broaden the tests
2. `tdrop-f1f.2` review payment handling end to end
3. `tdrop-f1f.3` review the database model, access rules and operations
4. `tdrop-f1f.4` write the root README for the owner
5. `tdrop-f1f.5` decide what to do with the two login pages
6. `tdrop-f1f.6` launch checklist

Work them in the order 2, 3, 1, 4, 5, 6. The reviews may change code that the tests and README then have to describe.

## What the owner asked, in their words

- Write tests and make sure we are ready for a production deploy.
- The pages `/your-profile` and `/register` are two separate logins. Is that how the site came from WordPress? (Yes. See "The two logins" below.)
- Review payment information and the databases carefully.
- A README in the repo root that explains the stack, how to work with the CMS, how to create admin accounts, and so on.

## The two logins

Both pages are faithful ports of the WordPress site. `/register` is an Elementor "login widget" page titled "Акаунт": username, password, "Влез", with a "Register" link that on WordPress led to... `/your-profile`, which is the WooCommerce My Account page, whose logged-out state is also a login form. So the old site had two login forms and no real sign-up page; WooCommerce created accounts at checkout. v0.2 kept both forms (copy rule: Bulgarian text stays as ported), wired both to the same server action, added `/your-profile/register` for sign-up, and let checkout create accounts for guests.

The question for the owner in `tdrop-f1f.5`: keep both as they are, or fold them into one. Do not change the copy or remove a page without their answer. A reasonable proposal: `/register` becomes the sign-up form and `/your-profile` stays the login, since the nav labels already say "Register" and "Your Profile". That is a copy change and needs the owner's yes.

## Payment review: what to look at

The code is small: `src/lib/actions/checkout.ts`, `src/app/(site)/webhooks/stripe/route.ts`, `src/lib/stripe-sync.ts`, `src/app/(site)/my-account/portal/route.ts`, `src/app/(site)/payment-confirmation/page.tsx`. Known state and known gaps:

- Tested in the sandbox: full checkout, renewal via test clock, a card that fails on first charge, cancel at period end and immediate cancel, events arriving out of order or two at once. Fixtures from those runs are in `tests/unit/fixtures/sandbox/`.
- Not tested: a card declined at hosted Checkout (no webhook fires), refunds, disputes, a price change on the plan, a customer with two subscriptions, Stripe retries after a 500 on the real endpoint, the Customer Portal UI itself.
- The webhook endpoint in Stripe was registered on `https://t-drop-t-drop.vercel.app`, but the public alias is `https://t-drop.vercel.app`. Re-register on the final host (the custom domain once it exists) and put the new signing secret in Vercel. Until then production receives no webhooks.
- `/payment-confirmation` re-syncs the session from Stripe on load, so a buyer sees the right page even before the webhook lands. Check what happens when the same session is synced twice from the page and the webhook.
- The Stripe account is a sandbox. Two live accounts exist from the old site; the owner has not chosen one. Do not touch live mode.
- Read the code with the Stripe API version in mind: the SDK pins 2026-08-26, where `current_period_end` sits on subscription items and invoices point at subscriptions via `parent.subscription_details`.

## Database review: what to look at

- Collections in `src/collections/`, global in `src/globals/`, access helpers in `src/lib/access.ts`. Every operation must be set explicitly; Payload's default lets any logged-in user (customers included) do anything. `tests/unit/access.test.ts` guards this. Extend it for every new collection.
- Supabase: Data API and GraphQL are meant to be off. The probe from this Mac cannot confirm it without the publishable key; ask the owner to check Project Settings > Data API, or check with the key. Payload's tables have no row-level security, so this matters.
- Connections: runtime uses the transaction pooler (port 6543, pool of 3 per instance), migrations the session pooler (port 5432). The direct host is IPv6-only. Explained in `CLAUDE.md` under Deploy.
- Backups: Supabase's plan determines point-in-time recovery. Nobody has checked what the project has. Find out and write it down.
- PII: customers hold name, email, phone, address; payments hold a trimmed invoice; nothing holds card data. Check the Stripe `raw` field on payments stays trimmed.
- Test rows: the production database has only seed content. The local `tdrop` and `tdrop_test` databases hold throwaway accounts.
- Media files carry a `-1` suffix in the bucket because the local folder had the originals at seed time. Cosmetic.

## Tests: what exists and what is missing

Existing: `tests/unit/stripe-sync.test.ts`, `tests/unit/stripe-sandbox.test.ts`, `tests/unit/access.test.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`. How to run them is in `CLAUDE.md` under Tests.

Missing: the checkout action (needs a Stripe stub), the portal redirect, profile edit, password reset in the browser, the rate limiter, the revalidation hooks, phone-width rendering of the account pages, anything on the deployed site itself. A production smoke that hits the live URL after each deploy would catch the pooler class of failure that took the site down on the first deploy.

## README

The current `README.md` is a first draft for the owner. `tdrop-f1f.4` rewrites it to cover: the stack in plain words, running locally, editing in `/admin`, creating admin accounts (open `/admin` on a fresh database and it asks; afterwards Users in the admin), the monthly shipping list, keys and where they live, deploy, beads. Keep `CLAUDE.md` as the file for agents and the README as the file for the owner. Apply the `unslop` skill before writing prose.

## Launch checklist (tdrop-f1f.6)

- Stripe webhook on the final host, secret into Vercel.
- t-drop.net pointed at Vercel; `NEXT_PUBLIC_SERVER_URL` updated to it.
- First `/admin` user created by the owner.
- `RESEND_API_KEY` set; until then production sends no emails, which breaks sign-up verification and password reset.
- Vercel project Node.js version set to 22 to silence the package.json warning.
- Delete test rows before the live account switch.
- A nonce-based Content-Security-Policy; `/logout` and `/my-account/portal` as POST.
- Confirm Data API off.

## Working agreements that still apply

- Commit and push only when the owner says so. They have said it after every batch so far.
- Never print `.env*` files. Compare values by name and length if you must.
- Say before running anything against Supabase or Stripe. One migration in v0.2 ran against Supabase by accident because `.env.local` points there; the owner was told.
- Ask before adding dependencies outside Payload, Stripe, Resend and the test tools already present.
- Log decisions with ign-memory `log_decision` and track work in beads.
- Skills worth loading: `unslop` for any prose, `security-review` after the payment and database work, `code-review` before asking the owner to push.
