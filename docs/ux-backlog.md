# UX backlog

Started 2026-09-16 from a browser pass over every public and account page (1440px and 390px, signed out and signed in with a never-subscribed account), plus feature requests added the same day. Nothing here is fixed yet. Tick items off as they land, and move them into beads (`bd create`) once the Dolt server is reachable again.

Copy items marked **(owner)** change existing Bulgarian text, so they need the owner's OK first (see "Rules for edits" in CLAUDE.md).

## Features to add

- [ ] **Subscriptions for more than one shirt per order.** Today there is one plan and one pick per customer per month. Needs:
  - plans with a shirt count and price (`Plans.ts`)
  - a size, gender and design pick per shirt (`CategorySelections.ts` is unique per customer and month, so that constraint changes)
  - `/join` and the `/account` picker handling several shirts
  - one row per shirt in the `/admin-tools/deliveries` CSV export
- [ ] **A clearer delivery address picker.** `/join/delivery` and `/account/address` ask for a carrier from a dropdown, then one free-text field for "address or courier office". Better: choose "to an address" or "to an office" first, then show the matching fields. For offices, a searchable list per carrier (Speedy, Sameday and BoxNow all publish office lists or APIs).
- [ ] **Order summary before paying.** `/join/delivery` never shows what was chosen. Show gender, size, design (with image), price per month and the first delivery date (`nextDeliveryDate()`), with a link back to `/join` to change them. Consider the same summary on `/payment-confirmation`.

## Blocks people or loses customers

- [ ] **Account pages are locked without an active subscription.** Доставка, Плащане and Настройки show only "Абонамента ви е неактивен". A never-subscribed or lapsed customer can't change name, email or password, or fix the card on Плащане that the message tells them to check. Files: `src/app/(account)/account/{address,payment,details}/page.tsx`.
- [ ] **New accounts are told their payment failed.** A never-subscribed account gets the dark-red "НЕАКТИВЕН" bar and "Моля проверете метода на плащане…". Tell "never subscribed" (invite to `/join`) apart from "lapsed" (fix payment). Only the dashboard has a "запиши се" link.
- [ ] **The mobile menu sits under the announcement bar.** The Sheet is `z-50` and the header or marquee is `z-[500]`, so the first link is half hidden and the close button is fully covered. Files: `site-header.tsx`, `components/ui/sheet.tsx`.
- [ ] **Stripe result pages are unfinished.** `/payment-confirmation` (Stripe `success_url`) and `/payment-failed` (`cancel_url`) have English headings, and the failed page has English body text. Neither has a next-step button (to `/account`, or back to `/join/delivery` to retry). `/checkout` is an empty page titled "Checkout"; remove or redirect it.
- [ ] **Footer legal links are dead.** Правила за ползване, Политика за поверителност and Условия за връщане all point to `#` (Site global, seeded in `scripts/seed-content.ts`). An EU subscription shop needs terms and a returns policy before taking payment.
- [ ] **No terms checkbox before payment.** `/join/delivery` goes straight to Stripe from "Поръчай" without accepting the terms and privacy policy.

## Confusing flows

- [ ] **Sign-up doesn't sign you in.** `/your-profile/register` ends with "Готово, профилът е създаден. Влез от тук.", while `/join/delivery` logs the customer in right away. Make them match.
- [ ] **Nothing links to the sign-up page.** The login page's "Нямаш акаунт? Направи си" goes to `/join` (per the Figma note), so no account can be made without starting a subscription, and `/your-profile/register` is unlinked. Decide whether that's intended.
- [ ] **Existing customers get no login path on `/join/delivery`.** A signed-out visitor sees email + password + repeat password with no "Вече имаш профил? Влез" link. Entering an existing email probably fails.
- [x] **The disabled "Избери" button on `/join` gives no reason.** Done 2026-09-16: a hint beside it lists what is left — "Избери пол, размер и дизайн, за да продължиш." — narrowing as each is picked and disappearing when the button enables (`aria-live`, and the button is `aria-describedby` it).
- [ ] **Unsubscribe always reports success.** `/newsletter/unsubscribe` says "Отписа се" even for an invalid token (`newsletter/unsubscribe/route.ts`).
- [ ] **Password reset reveals a bad token too late.** `/your-profile/reset-password` shows the form for an invalid token, so the error only appears after typing the new password twice.
- [ ] **Two footer and home-page links go to the wrong place.** "Актуален дроп" goes to `/`, not the current drop. The Instagram and Facebook icons fall back to `#` because the Site global has no URLs.

## Inconsistencies

- [x] **Three form styles.** Done 2026-09-16: register and reset-password moved onto `AuthPage` + `authField/authLabel/authButton`, and `components/forms/woo.tsx` is deleted — no WooCommerce styling left anywhere. `/join/delivery` keeps its pills by decision (owner: it is the paid funnel and was designed that way), so there are now two intentional styles: auth pages and the funnel. Its placeholder-only fields stay open under "Placeholder-only fields" below.
- [x] **Leftover English.** Done 2026-09-16:
  - "My account – …" → "Акаунт – …" (`(account)/account/page.tsx`, `(account)/layout.tsx`) and the link label on `/payment-confirmation`
  - About page title → "За нас – …" (DB + `seed-content.ts`)
  - "Newsletter" → "Бюлетин", "Email" → "Имейл" (Site global + seed)
  - "Continue with Google" → "Влез с Google" (`login-form.tsx` — the audit pointed at `oauth-buttons.tsx`, which was already Bulgarian; the English was in the login form)
  - branded 404 at `(site)/not-found.tsx` with the real header and footer, reached via a `(site)/[...notFound]` catch-all (see CLAUDE.md for why the catch-all is needed)
- [ ] **Formal and informal Bulgarian are mixed (owner).** The account messages use "ви / Моля проверете"; the rest of the site uses "ти".
- [ ] **Grammar (owner).** "Абонамента ви е неактивен" should be "Абонаментът ви е неактивен". ~~"Очаквайте новият дроп" in the announcement~~ — fixed 2026-09-16.
- [ ] **Price is written two ways (owner).** The home page says "17.99EU на месец"; `/join` now says "€17,99/месец" (changed 2026-09-16 to match the Figma redesign), so they still disagree.
- [ ] **The status bar red (`#bf0000`) isn't the brand red** (`t-red`, `#cc0e45`). File: `subscription-status-bar.tsx`.
- [ ] **The header "Акаунт" link is only highlighted on `/account`,** not on its sub-pages.
- [ ] **No `<h1>` on the account pages or `/your-profile/register`.**

## Smaller things

- [ ] **Placeholder-only fields.** ~~`/join/delivery`~~ fixed 2026-09-17 — the redesign gave every field a real label. The footer newsletter email still has only a placeholder.
- [ ] **Small tap targets.** "Виж размерите" and "Вече имаш профил? Влез" are 14–18px tall; footer links are 24px (aim for 44px on phones).
- [ ] **Unreadable size-chart numbers** on `/join`, especially on phones.
- [ ] **Home page placeholder content (owner).**
  - All three reviews are "Георги" with the same text and stock gradient image.
  - ~~On desktop the first name tag overlaps its review text.~~ Fixed 2026-09-16 (`reviews.tsx`, card 1 sticker lifted onto the photo).
  - "Запиши се сега, ако си задаваш следните въпроси: искам нещо лежерно за фитнес" reads unfinished.
- [ ] **Empty order history has no next step.** "Все още нямаш поръчки." needs a link to `/join`.
- [ ] **Console warning on `/`.** `wp/2025/12/shapeB.svg` has its width changed but not its height.

## Cleanup

- [ ] **Delete the throwaway audit account.** `ux-audit-1789554452036@example.com` in the local database (/admin > Customers).
