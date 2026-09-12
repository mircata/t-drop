# T-Drop

Next.js site for t-drop.net, a monthly t-shirt subscription for Bulgaria. It replaces the WordPress site. Content lives in Payload CMS at `/admin`, customers log in on the site, Stripe takes the money.

## Run it locally

```bash
brew install postgresql@17 && brew services start postgresql@17
createdb tdrop
npm install
cp .env.example .env.local        # fill DATABASE_URI=postgres://localhost:5432/tdrop and a PAYLOAD_SECRET
npm run migrate                   # creates the tables
npm run seed:admin                # admin@t-drop.local / tdrop-local-admin
npm run seed:content              # the site copy, images, plan and themes
npm run dev
```

Node 22 (`.nvmrc`). Emails print to the terminal until `RESEND_API_KEY` is set. Payments need the Stripe keys, see `CLAUDE.md`.

## Editing the site

Open `/admin`.

- Home and About text and pictures: Pages. Each page is a list of sections. Press Enter in a heading to break the line.
- The moving strip at the top, the menu, the footer links, the socials and the next drop date: Сайт.
- The themes people can pick this month: Теми. Tick "Предлага се този месец" on the ones you offer. The same list feeds `/join` and the picker in `/my-account`.
- The price: Планове. The number is in euro cents (1799 is 17.99). The Stripe price id must match a price in your Stripe account.

Layout, colours and spacing are code, not settings. Ask Claude in this repo to change them; the pages are measured against the old WordPress renders in `reference/screenshots`.

## Who gets a shirt this month

In `/admin`:

1. Абонаменти, filter status = Активен. That is the list to ship. Each row has the size, gender and the name the customer typed at checkout.
2. Избори за дроп, filter month = this month (format 2026-03). That is the theme each of them picked. A customer who picked nothing gets a random theme, as the About page promises.
3. Клиенти has the delivery address and phone.

Set the next drop date in Сайт before you announce it. After that date the picker locks until you set the next one.

## Money

Everything about cards, refunds and cancellations happens in the Stripe dashboard or in the Customer Portal the customer reaches from `/my-account`. The site only records what Stripe reports through the webhook. If a subscription looks wrong on the site, check Абонаменти against Stripe; the Stripe side is the truth.

## Keys and where they live

All secrets are environment variables, listed with comments in `.env.example`. Locally they are in `.env.local`, which is never committed. In production they are in the Vercel project settings. To rotate one, change it in Stripe or Supabase or Resend, paste the new value into Vercel, and redeploy.

## Tracking work

Tasks live in beads. `bd ready` shows what is unblocked, `bd show <id>` the details. `CLAUDE.md` has the folder map, the rules Claude follows in this repo and the deploy steps.
