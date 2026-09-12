# T-Drop, Next.js port

Monthly t-shirt subscription site for Bulgaria (t-drop.net). This repo replaces the WordPress site whose backup sits in `wordpress-site/t-drop.zip`.

## Run it

```bash
npm install
npm run dev
```

Node 22 LTS and npm. No Bun. The dev server picks a free port when 3000 is busy.

## Where things live

- `src/app/` is one folder per page. `page.tsx` is the page. Routes match the old WordPress slugs: `/`, `/about`, `/join`, `/register`, `/your-profile`, `/cart`, `/checkout`, `/payment-confirmation`, `/payment-failed`.
- `src/components/site/` holds the header, footer and shared bits (buttons, badges, the shirt image, social icons).
- `src/components/ui/` is shadcn. Add more with `npx shadcn@latest add <name>`.
- `src/app/globals.css` defines the design tokens. Colors start with `t-` (`bg-t-red`, `text-t-neon`). Fonts are `font-headline` (Dela Gothic One), `font-body` (Handjet), `font-dot` (DotGothic16), `font-roboto`.
- `public/wp/` holds every image from the WordPress uploads folder, same paths minus `wp-content/uploads`.
- `reference/tokens.md` lists the colors, type sizes and page map pulled from the Elementor kit. `reference/screenshots/` has the WordPress renders each page is compared against.

## Rules for edits

- Copy stays in Bulgarian exactly as on the old site until the owner changes it.
- Milestone v0.1 is visual only. No Stripe, no auth, no database. Forms post to `#`.
- Next.js 16 differs from older versions. Read `node_modules/next/dist/docs/` before touching routing, fonts or metadata.
- Widths and offsets in the pages are copied from Elementor pixel values on purpose. Change them only when a screenshot comparison says so.

## Issue tracking

Issues live in beads. Run `bd ready` to see what is unblocked and `bd show <id>` for details. The epic for this milestone is `tdrop-xg2`. Close a task with `bd close <id> --reason "..."` when its page matches the reference.

## Later milestones

Payload CMS inside this app for editable content and admin, Supabase Postgres in Frankfurt, Stripe Checkout and Customer Portal, Vercel hosting. See the beads epic list when those start.
