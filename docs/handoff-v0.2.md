# Handoff: t-drop v0.2

Written 2026-09-12 at the end of v0.1. Read this before touching code.

## Where things stand

v0.1 is a static visual copy of t-drop.net, pushed to main as `9af0ffa`. Every page matches the WordPress render within a few pixels at 390, 900 and 1440 wide. Nothing is wired: forms post to `#`, there is no database, no auth, no Stripe. The beads epic `tdrop-xg2` holds the record of how each page was matched.

v0.2 turns it into a working product. The epic is `tdrop-oaz`; run `bd ready` to see what is unblocked. The dependency chain is Payload install, content model, render from Payload, customer auth, subscriptions model, Stripe, then deploy and security.

## Decisions already made (do not reopen)

- Next.js App Router on Node 22 and npm. No Bun.
- Payload CMS 3 embedded in this app for content, admin UI and customer auth. It is MIT, self-hosted, no fee.
- Supabase managed Postgres in Frankfurt, used as plain Postgres from the server only. Disable the Supabase REST and GraphQL API. No Supabase Auth.
- Drizzle only through Payload's Postgres adapter. No Prisma.
- Stripe hosted Checkout and Customer Portal with one webhook. Never build card forms. Sandbox keys until the owner picks the canonical Stripe account; the old site has two.
- Vercel Pro for hosting. Fallback Hetzner plus Coolify if cost matters more than ops.
- Copy stays in Bulgarian exactly as ported until the owner changes it in /admin.
- Data model from the owner's diagram, adjusted: subscriptions is its own table, payments mirror providers through an enum, category_selections is unique per user and month, email preferences live on the user.

## Reference WordPress site

The original runs in Docker on thebox at `~/tdrop-ref`. From this Mac:

```bash
ssh -f -N -L 127.0.0.1:18080:127.0.0.1:8080 thebox
```

Open http://127.0.0.1:18080. WordPress admin user `dropadmin`, password `admin`. Do not use `admin`, that user does not exist. Screenshots and DOM measurements of both sites are in `reference/screenshots/`. When v0.2 changes rendering, re-measure against this stack, do not eyeball.

## Lessons from v0.1 that still apply

- Elementor text widgets carry a 15px bottom margin and Elementor headings use letter-spacing normal while body text uses 4%. Both are already encoded in the components; keep them when moving copy into Payload blocks.
- Never put `max-lg:` and `max-md:` on the same property in one element. Use `md:max-lg:` for tablet-only values.
- Fonts come from next/font with the cyrillic subset. Keep the subsets when adding fonts.
- The reference has quirks that were deliberately not copied: double logo in the tablet header, a lazy-load failure on the first review card on phones, a raw shortcode on the payment confirmation page.

## Working agreements

- Beads is the tracker. Claim with `bd update <id> --status in_progress`, close with a reason. Server mode against thebox; the launchd tunnel on port 3307 must be up.
- Commit only when asked. Attribution lines are in the session instructions.
- Keep CLAUDE.md current for the owner, who has WordPress-level skills.
- The backup zip in `wordpress-site/` stays untracked.
