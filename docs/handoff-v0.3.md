# Handoff: t-drop v0.3

Written 2026-09-13, right after commit 98f12b5 went live on Vercel. Read `docs/handoff-v0.2.md` first for the decisions that still hold, then this file.

A handoff is a claim, not a fact. Before acting, check `git log`, `bd ready`, the Vercel dashboard and the Stripe sandbox. Where they disagree with this file, trust them.

## Where things stand

v0.2 is done and closed in beads (epic `tdrop-oaz`). The site runs at https://t-drop.vercel.app from the `main` branch: Payload CMS at `/admin`, Supabase Postgres in Frankfurt, media in a public Supabase bucket, Stripe in sandbox mode, no email provider yet. CI on GitHub runs lint, typecheck, 20 unit tests, 5 browser tests and the build on every push.

The v0.3 epic is `tdrop-f1f`. Its six tasks are the whole scope of the next session:

1. `tdrop-f1f.1` broaden the tests
2. `tdrop-f1f.2` review payment handling end to end
3. `tdrop-f1f.3` review the database model, access rules and operations
4. `tdrop-f1f.4` write the root README for the owner — **done 2026-09-16**
5. `tdrop-f1f.5` decide what to do with the two login pages — **done 2026-09-15**, see "The two logins" below
6. `tdrop-f1f.6` launch checklist

Work them in the order 2, 3, 1, 4, 5, 6. The reviews may change code that the tests and README then have to describe.

## What the owner asked, in their words

- Write tests and make sure we are ready for a production deploy.
- The pages `/your-profile` and `/register` (now `/login`, see below) are two separate logins. Is that how the site came from WordPress? (Yes. See "The two logins" below.)
- Review payment information and the databases carefully.
- A README in the repo root that explains the stack, how to work with the CMS, how to create admin accounts, and so on.

## The two logins — resolved 2026-09-15

Both pages were faithful ports of the WordPress site. `/register` is an Elementor "login widget" page titled "Акаунт": username, password, "Влез", with a "Register" link that on WordPress led to... `/your-profile`, which is the WooCommerce My Account page, whose logged-out state is also a login form. So the old site had two login forms and no real sign-up page; WooCommerce created accounts at checkout. v0.2 kept both forms (copy rule: Bulgarian text stays as ported), wired both to the same server action, added `/your-profile/register` for sign-up, and let checkout create accounts for guests.

`tdrop-f1f.5` asked the owner to pick: keep both, or fold into one. Resolved in commit `77017ce` (2026-09-15, "Redesign the header, retire /your-profile for /register, and rebuild /join"): `/register` became the one surviving login page, and `/your-profile` permanently redirects to it (`next.config.ts`). Its sub-pages (`/your-profile/register`, `/lost-password`, `/reset-password`, `/verify`) were left in place since those links were already emailed out. `CLAUDE.md`'s account-routes line was updated 2026-09-16 to match — it had still described `/your-profile` as a login form after this shipped.

**Renamed `/register` to `/login` (2026-09-16):** the owner flagged that `/register` was a confusing slug for a page that's purely a login form (sign-up lives at `/your-profile/register`). Renamed the route to `/login` and added a permanent redirect from `/register` (`next.config.ts`) in case anything has it bookmarked. Updated every internal `redirect("/register")` / `Link href="/register"` call site (account pages, auth actions, OAuth routes, the email-verify page, logout, the checkout guest-signup error copy) plus `CLAUDE.md` and the e2e smoke test.

## Idea, not urgent: clearer naming for Users vs Customers in /admin

While testing locally (2026-09-14), the owner created a test account under "Users" in the /admin sidebar meaning to create a site login, then couldn't log in on the public site — `users` is the `/admin` login collection, `customers` is the site login, and the two labels don't make that distinction obvious to someone who didn't write the code. Worth a naming or admin-grouping pass at some point (e.g. clearer labels, grouping, or a sidebar description) so this mix-up doesn't repeat, especially once other people besides the owner get /admin access. Not launch-blocking.

## Fixed: signed-in customer locked the owner out of /admin (2026-09-15)

Payload names its auth cookie `${cookiePrefix}-token` with no per-collection distinction — every `auth: true` collection in one Payload instance shares the same browser cookie by default. With `users` (admin) and `customers` (site) both auth-enabled, being signed in to one silently signed you out of the other: the owner hit this after testing the account redesign, then opened `/admin` in the same browser and landed straight on "Unauthorized" without ever seeing a login form, because the browser still held a valid `customers` session under the cookie Payload's admin auth checks too.

Fixed by giving each its own cookie: `payload.config.ts` sets `cookiePrefix: "tdrop-admin"` for Payload's own admin login (`tdrop-admin-token`), and `src/lib/auth.ts` now issues and reads a separate `tdrop-account-token` for customers, independent of Payload's cookie-name matching (the token is handed to `payload.auth()` via an `Authorization: JWT ...` header). Verified with Playwright: a customer and an admin can now be logged in in the same browser at once, each session working independently.

## Fixed: design picks stayed locked through week 4 (2026-09-15)

The owner clarified the real production cycle: week 1 — customers choose/change their design; weeks 2-3 — locked while production runs; week 4 — delivery happens and the next drop is announced, so choosing reopens (for the *next* delivery, since the one arriving that week is already final). `isDropLocked()` only implemented the week 1 → weeks 2-3 transition; it stayed locked straight through delivery day and only opened the day after, so week 4 was wrongly treated as locked.

Fixed in `src/lib/stripe-sync.ts`: `isDropLocked()` now returns to open 6 days before delivery (`PICK_REOPEN_LEAD_DAYS`), and a new `pickTargetDate()` helper makes `dropMonth()` skip ahead to the following delivery once inside that week-4 window, so a pick made then doesn't wrongly attach to the delivery that's already final. Covered by `tests/unit/stripe-sync.test.ts` and verified live for both the locked and reopened states.

~~Known gap, not addressed: the dashboard only surfaces one "current pick" at a time...~~ Addressed later the same day — see the account redesign entry below; the dashboard now has a "Преден дроп" strip for exactly this.

## Account redesign complete (2026-09-15)

All six `/account` pages rebuilt to the Figma redesign in one extended session (see `project_account_redesign` in the assistant's memory for the full detail — the design itself was revised more than once mid-project, so always re-check Figma before touching this area again rather than trusting old notes). Headline changes beyond styling: `CategorySelections` gained `size`/`gender` — a monthly pick is now design+size+gender chosen together, no separate "just change size" flow. `Customers.shipping` is a new, simpler courier-oriented address model (carrier + one combined address/office field), deliberately kept separate from the pre-existing Stripe-populated `Customers.address`. `/account/payment` embeds Stripe Elements directly (a real, deliberate exception to "never build card forms" — see the Stripe setup section) instead of redirecting to the Portal.

## Google/Facebook login + delivery tracking (2026-09-15)

Two more owner requests, both self-contained — see "Google/Facebook login for customers" and "Delivery tracking" in CLAUDE.md for the details. OAuth needs the owner to create apps in Google Cloud Console and Meta for Developers and paste in four env vars before either button appears (they're hidden per-provider until configured, verified working). Delivery tracking needed one new field (`fulfillmentStatus`) and one new staff-only page (`/admin-tools/deliveries`, linked from the /admin sidebar) — no new collection, reusing `CategorySelections` as the single source of truth for what a customer gets each month.

## Payment review: what to look at

The code is small: `src/lib/actions/checkout.ts`, `src/app/(site)/webhooks/stripe/route.ts`, `src/lib/stripe-sync.ts`, `src/app/(account)/account/portal/route.ts`, `src/app/(site)/payment-confirmation/page.tsx`. Known state and known gaps:

- Tested in the sandbox: full checkout, renewal via test clock, a card that fails on first charge, cancel at period end and immediate cancel, events arriving out of order or two at once. Fixtures from those runs are in `tests/unit/fixtures/sandbox/`.
- Not tested: a card declined at hosted Checkout (no webhook fires), disputes, a price change on the plan, a customer with two subscriptions, Stripe retries after a 500 on the real endpoint, the Customer Portal UI itself.
- The webhook endpoint in Stripe was registered on `https://t-drop-t-drop.vercel.app`, but the public alias is `https://t-drop.vercel.app`. Re-register on the final host (the custom domain once it exists) and put the new signing secret in Vercel. Until then production receives no webhooks.
- `/payment-confirmation` re-syncs the session from Stripe on load, so a buyer sees the right page even before the webhook lands. The race between that sync and the webhook's own sync is now handled: `upsertSubscription` catches the concurrent-create case and converges on whichever row won, instead of surfacing "unknown" to a buyer who did pay.
- The Stripe account is a sandbox. Two live accounts exist from the old site; the owner has not chosen one. Do not touch live mode.
- Read the code with the Stripe API version in mind: the SDK pins 2026-08-26, where `current_period_end` sits on subscription items, invoices point at subscriptions via `parent.subscription_details`, and a `Charge` has no direct `invoice` field — to find the invoice behind a charge, go through `stripe.invoicePayments.list({ payment: { type: "payment_intent", payment_intent } })`, as `markPaymentRefunded` in `stripe-sync.ts` does.
- Refunds are now tracked: a `charge.refunded` handler sets a payment row to `"refunded"` (see `markPaymentRefunded`). `charge.refunded` needs adding to the webhook endpoint's event list in the Stripe dashboard (already documented in `CLAUDE.md`'s setup steps) before this fires in production.
- Disputes are still untracked — deliberately deferred, not an oversight. Before building it: does a disputed charge need a new `Payments.status` value (`"disputed"`)? Should it pause or flag the subscription? Should it notify the owner? That's a product decision, not just plumbing — ask the owner before implementing.
- The checkout server action (`startCheckout`) now goes through `rateLimited()` like every other public form (10 attempts / 10 min per IP), matching the security rule in `CLAUDE.md`.

## Database review: what to look at

- Collections in `src/collections/`, global in `src/globals/`, access helpers in `src/lib/access.ts`. Every operation must be set explicitly; Payload's default lets any logged-in user (customers included) do anything. `tests/unit/access.test.ts` guards this. Extend it for every new collection.
- Supabase: Data API and GraphQL are meant to be off. The probe from this Mac cannot confirm it without the publishable key; ask the owner to check Project Settings > Data API, or check with the key. Payload's tables have no row-level security, so this matters.
- Connections: runtime uses the transaction pooler (port 6543, pool of 3 per instance), migrations the session pooler (port 5432). The direct host is IPv6-only. Explained in `CLAUDE.md` under Deploy.
- Backups: Supabase's plan determines point-in-time recovery. Nobody has checked what the project has. Find out and write it down.
- PII: customers hold name, email, phone, address; payments hold a trimmed invoice; nothing holds card data. Checked: the Stripe `raw` field on payments stays trimmed (no card data, only invoice summary fields) — confirmed by reading `upsertPayment` in `stripe-sync.ts`.
- Test rows: the production database has only seed content. The local `tdrop` and `tdrop_test` databases hold throwaway accounts.
- Media files carry a `-1` suffix in the bucket because the local folder had the originals at seed time. Cosmetic.
- **Fixed 2026-09-16:** deleting a customer, plan, or category that has any related subscriptions/payments/category-selections used to throw a raw, unhandled Postgres error instead of failing gracefully (every relationship back to `customers`/`plans`/`categories` is `required: true`, but Payload generates the foreign key as `ON DELETE SET NULL` — contradictory, so Postgres's `NOT NULL` constraint fired). The owner chose to block rather than cascade, to keep payment/order history intact for accounting. `src/lib/delete-guards.ts` has a `blockDeleteIfReferenced` helper wired into each collection's `beforeDelete` hook (`Customers.ts`, `Plans.ts`, `Categories.ts`); it now refuses the delete with a friendly Bulgarian message naming what's still attached, instead of a raw error. Covered by `tests/unit/delete-guards.test.ts`. The launch checklist's "delete test rows before the live account switch" step now needs test rows' subscriptions/payments/picks removed first (or those customers left in place), rather than hitting a crash.

## Tests: what exists and what is missing

Existing: `tests/unit/stripe-sync.test.ts`, `tests/unit/stripe-sandbox.test.ts`, `tests/unit/access.test.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`. How to run them is in `CLAUDE.md` under Tests.

Missing: the checkout action (needs a Stripe stub), the portal redirect, profile edit, password reset in the browser, the rate limiter, the revalidation hooks, phone-width rendering of the account pages, anything on the deployed site itself. A production smoke that hits the live URL after each deploy would catch the pooler class of failure that took the site down on the first deploy.

## README — done 2026-09-16

`README.md` was rewritten to cover: the stack in plain words, running locally, editing in `/admin` (including the Users-vs-Клиенти naming trap flagged earlier in this doc), creating admin accounts (the first-user signup Payload shows on an empty database, then Users in the admin for every one after), the monthly shipping list (now `/admin-tools/deliveries`, added after the original README draft), signing in (`/login`, after the rename above), money, keys, deploy, and beads. `CLAUDE.md` stays the file for agents, the README the file for the owner. (The `unslop` skill named in the original task isn't available in this environment — the rewrite just followed the existing README's plain, direct voice by hand.)

## Launch checklist (tdrop-f1f.6)

- Stripe webhook on the final host, secret into Vercel.
- t-drop.net pointed at Vercel; `NEXT_PUBLIC_SERVER_URL` updated to it.
- First `/admin` user created by the owner, with a fresh unique password. Never run `npm run seed:admin` against the production database — it creates `admin@t-drop.local` / `tdrop-local-admin`, fixed credentials that are readable in this repo's `CLAUDE.md`.
- `RESEND_API_KEY` set; until then production sends no emails, which breaks sign-up verification and password reset.
- Vercel project Node.js version set to 22 to silence the package.json warning.
- Delete test rows before the live account switch.
- A nonce-based Content-Security-Policy; `/logout` and `/account/portal` as POST.
- Confirm Data API off.

## Security backlog (2026-09-16, undecided — owner to pick what to use)

From a security review pass after the payment/database/README work above. Not prioritized against each other; two items overlap with the launch checklist above (marked below) rather than duplicating it.

- **`/admin` (Users collection) has no login lockout.** `Customers.ts` sets `maxLoginAttempts: 5, lockTime: 10min`; `Users.ts` has none, so Payload's brute-force lockout never activates for admin logins (confirmed by reading `payload/dist/auth/operations/login.js` — lockout only triggers when `maxLoginAttempts > 0`). Admin is the higher-value target (full customer PII, pricing, Stripe config) and currently the less-protected login.
- **`/logout` and `/account/portal` are plain `GET` routes with side effects** (already on the launch checklist above). `GET /logout` clears the session unconditionally — forgeable via `<img src>` or link prefetch. `GET /account/portal` redirects an authenticated session to Stripe billing on a bare GET. Convert both to POST-triggered actions.
- **No Content-Security-Policy** (already on the launch checklist above). Other headers are set (HSTS, X-Frame-Options, etc.) but no CSP, so any stray XSS has no second line of defense.
- **Rate limiting is per-server-instance only.** `src/lib/rate-limit.ts` is an in-memory map; on Vercel's serverless model each instance has its own counter, so the effective limit across instances is looser than the configured numbers suggest, especially for login/password-reset. A shared store (Upstash Redis, Vercel KV) would make this real.
- **Email verification is disabled** (already tracked separately, see "Email verification disabled" in the assistant's memory / the TODO in `Customers.ts`). Restating here because it means anyone can register with an email they don't own — fine for now, not for production launch.
- **Confirm Supabase's Data API and GraphQL are actually off** (already on the launch checklist above, still unconfirmed). Payload's tables have no row-level security, so if either is still on it's a second, unaudited path to every table.
- **Dependency audit before going live.** `npm audit` currently shows moderate issues in `dompurify` (via Payload admin's rich-text editor dependency chain) and dev-only tooling (`esbuild`/`drizzle-kit`, no production impact). Worth a look at `dompurify` specifically since it affects what admins can safely paste into rich-text fields.
- **Consider 2FA for `/admin`** before the live Stripe cutover and before other staff get admin access (the Users-vs-Клиенти naming-confusion note above already anticipates more people getting `/admin` access). No urgency while it's just the owner locally on the sandbox account.

## Other backlog items (2026-09-16, owner requests, not yet scoped)

- **Animations / interaction polish.** No specifics yet — owner wants "cool animations" on interactions somewhere on the site. Needs a follow-up conversation to pin down which interactions before building anything.
- **Legal texts.** The footer's "Правила за ползване", "Политика за поверителност" and "Условия за връщане" links (`scripts/seed-content.ts`, `footerRight`) all currently point at `#` — there's no actual Terms of Service, Privacy Policy, or Returns page yet. Needs the owner to supply or approve the text (this is exactly the kind of Bulgarian copy that shouldn't be invented rather than provided/approved by the owner, per the copy rule in `CLAUDE.md`).
- **Explicit "agree to receive emails" consent at registration.** Today `Customers.emailPreferences.newsletter` defaults to `true` with no checkbox shown at signup — worth checking whether that's GDPR-compliant for an EU (Bulgarian) audience, since opt-out-by-default marketing consent is legally shakier than an explicit opt-in checkbox on `/your-profile/register` (and the inline signup at `/join/delivery` / checkout).

## Working agreements that still apply

- Commit and push only when the owner says so. They have said it after every batch so far.
- Never print `.env*` files. Compare values by name and length if you must.
- Say before running anything against Supabase or Stripe. One migration in v0.2 ran against Supabase by accident because `.env.local` points there; the owner was told.
- Ask before adding dependencies outside Payload, Stripe, Resend and the test tools already present.
- Log decisions with ign-memory `log_decision` and track work in beads.
- Skills worth loading: `unslop` for any prose, `security-review` after the payment and database work, `code-review` before asking the owner to push.
