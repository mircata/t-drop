# T-Drop

Next.js site for t-drop.net, a monthly t-shirt subscription for Bulgaria. It replaces the WordPress site. Content lives in Payload CMS at `/admin`, customers log in on the site, Stripe takes the money, Vercel and Supabase host it.

## Run it locally

```bash
createdb tdrop                    # any Postgres 17 works — Homebrew, Docker, whatever's on hand
npm install
cp .env.example .env.local        # fill DATABASE_URI=postgres://localhost:5432/tdrop and a PAYLOAD_SECRET
npm run migrate                   # creates the tables
npm run seed:admin                # admin@t-drop.local / tdrop-local-admin — local only, see below
npm run seed:content              # the site copy, images, plan and themes
npm run dev
```

Node 22 (`.nvmrc`). Emails print to the terminal until `RESEND_API_KEY` is set. Payments need the Stripe keys — see `CLAUDE.md`.

## Editing the site

Open `/admin`.

- Home and About text and pictures: **Pages**. Each page is a list of sections. Press Enter in a heading to break the line.
- The moving strip at the top, the footer links and the socials: **Сайт**.
- The day of the month packages are delivered: **Сайт** → "Ден от месеца, в който пристигат пратките" (default 21st). Everything else — which month a customer is currently picking a theme for, and when picks lock — is computed from this one number, so change it here rather than anywhere else.
- The themes people can pick this month: **Теми**. Tick "Предлага се този месец" on the ones you offer. The same list feeds `/join` and the picker in `/account`. Turn old themes off, don't delete them — past picks still point at them, and deleting one with any picks attached is refused for exactly that reason.
- The price: **Планове**. The number is in euro cents (1799 is 17.99). The Stripe price id must match a price in your Stripe account.

Layout, colours and spacing are code, not settings. Ask Claude in this repo to change them; the pages are measured against the old WordPress renders in `reference/screenshots`.

One naming trap in the `/admin` sidebar: **Users** is the login for `/admin` itself (you and any staff). **Клиенти** is everyone who signed up on the site. Adding someone under Users does not give them a site account, and vice versa — they're separate logins with separate cookies.

## Creating admin accounts

The very first one: open `/admin` on a database that has no admin users yet, and Payload shows a signup form instead of a login form. Fill it in once — that becomes the first admin.

Every admin after that: an existing admin adds them under **Users** in the sidebar. There's no self-service signup for `/admin` — that's deliberate, since anyone with an admin account can see and edit customer data.

Never run `npm run seed:admin` against the production database. It creates a fixed, publicly-documented login (`admin@t-drop.local` / `tdrop-local-admin`) meant only for a throwaway local database.

## Who gets a shirt this month

Go to **`/admin-tools/deliveries`** (also linked from the `/admin` sidebar as "📦 Доставки"). It shows this month's list already joined with each customer's theme, size, shipping address and phone, with a status dropdown per row (Чака плащане → Подготовка → Изчаква → Доставено, or Отказано) and an "Export CSV" button to send the run to the factory. That one page replaces stitching together the Клиенти, Абонаменти and Избори за дроп lists by hand — do that manually only if the page is somehow unavailable.

Picks lock automatically partway through the month so production has time to work: open right after a delivery, locked for the two weeks in between, and open again in the run-up to the next one. There's nothing to set per month — only the delivery day itself (**Сайт**), which stays the same until you change it.

## Signing in

Customers have one login page, `/login`. Signing up is separate (`/your-profile/register`, or automatically at checkout) — `/login` is only for people who already have an account. Google and Facebook sign-in are available once you've set up OAuth apps for them (see `CLAUDE.md`); until then those buttons just don't appear.

## Money

Everything about cards, refunds and cancellations happens in the Stripe dashboard or in the Customer Portal a customer reaches from `/account`. The site only records what Stripe reports through its webhook — if a subscription looks wrong on the site, check **Абонаменти** against Stripe; the Stripe side is the truth. Refunds show up automatically as "Възстановено" on the matching row in **Плащания**.

The Stripe account in use today is a sandbox (test payments only, no real money moves). Switching to a live Stripe account is a deliberate step for later, not something to flip casually.

## Keys and where they live

All secrets are environment variables, listed with comments in `.env.example`: the database connection, Stripe, Resend (email), Google/Facebook OAuth, and Supabase Storage. Locally they're in `.env.local`, which is never committed. In production they're in the Vercel project settings. To rotate one, change it at the source (Stripe, Supabase, Resend, Google/Meta), paste the new value into Vercel, and redeploy.

## Deploy

Every push to `main` runs the test suite on GitHub and, separately, builds and deploys on Vercel — nothing to trigger by hand, but a red GitHub check doesn't currently block the deploy, so watch both. The database is Supabase Postgres (Frankfurt); uploaded images go to a Supabase Storage bucket. `CLAUDE.md` has the full deploy walkthrough and the launch checklist for going live.

## Tracking work

Tasks live in beads. `bd ready` shows what is unblocked, `bd show <id>` the details — it needs the `bd` CLI installed and access to this project's database, so it isn't available from every machine. `CLAUDE.md` has the folder map, the rules Claude follows in this repo, and the deploy steps.
