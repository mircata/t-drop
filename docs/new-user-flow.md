# New user flow — Figma "NEW USER FLOW" (515:2)

Read 2026-09-22 from the Figma section `515:2`, ten frames, all **402px wide — mobile**,
and re-read later the same day after the owner's revisions. A matching desktop section
`525:1426` ("NEW USER FLOW - DESKTOP", eight frames at 1440px) was added in that round —
see "Desktop" below. Nothing is built yet beyond the data model. This is what the design
contains, what it changes, and what has to be answered before it can be built.

Every frame's node id is given so a future session can go back to the source. Dev Mode
annotations are quoted verbatim — they carry instructions that appear nowhere else.

## The frames

| Node | Name | Step label |
|---|---|---|
| `519:3` | step 0 landing page | — |
| `519:377` | step 1-1 пакет | 1/3 |
| `519:486` | step 1-2-waiting | 1/3 |
| `525:1340` | update-mail-popup | 1/3 |
| `519:579` | step 1-2-success | 1/3 |
| `519:628` | step 2-1-order-BASIC | 2/3 |
| `524:179` | step 2-1-order-SUPPORTER | 2/3 |
| `524:479` | step 2-2-account details | 2/3 |
| `524:720` | opened bottom sheet | 2/3 |
| `525:1000` | step 3-1-payment info | 3/3 |

Annotation on the step counter (`523:16`): *"this is step counter. There are actually more
than 3, but 3 is a good number to use"* — so 1/3, 2/3, 3/3 are **phases**, not screens.
Phase 1 = plan + email verification, phase 2 = designs + account, phase 3 = payment.

## The flow, screen by screen

### step 0 — landing hero (`519:3`)

Annotated *"this is a the new redesigned hero section of the landing page"*. So this
replaces the hero on `/`, it is not a new page.

- "ВСЕКИ МЕСЕЦ" in **Handjet ExtraBold 85.58px** (not Dela Gothic), "НОВИ ТЕНИСКИ" in Dela
  Gothic 38px under it, then a blob/star vector.
- Three photo cards, rotated `20.54deg`, `-18.11deg`, `-1.98deg`, 143×167 and 211×246.
- Body copy, then an email field and a "ЗАПИШИ СЕ" button, 353px wide, 71px tall.
- Annotation on that button (`519:348`): *"this button starts the main user flow; is it
  legal to save the entered mail here and send reminders to the customer that he has more
  steps until subscribing?"* — answered under "The GDPR question" below.

### step 1-1 — избери пакет (`519:377`)

Annotated *"this is package selector. Here you will to create 3 types of subscriptions
based on this info here. You can translate it to bulgarian"*.

| Package | Shirts | Price | State in the design |
|---|---|---|---|
| Basic | 1 тениска /месец | €17,99 | plain |
| Supporter | 2 тениски /месец | €22,99 | "избрано" — selected, red card |
| Family | 4 тениски /месец | €24,99 | "recommended" — neon gradient badge |

"НАПРЕД" (`519:408`) is annotated *"when the user click it leads to the next step and send
the user a confirmation link that when clicked it will verify his mail"*.

**Revised later on 2026-09-22**: this frame grew from 874px to **2845px**. Two sections were
added below the package cards, and НАПРЕД moved from just under the header to the bottom of
the page (now `525:3866`, 362×71):

- A **four-claim USP row** (`525:3798`, 359×295) — the same four claims as the existing
  `JoinUsps` on `/join`: proven print technology, 100% cotton, artists hired monthly,
  production in Bulgaria. Reuse the component rather than rebuilding it.
- A **FAQ** (`525:3824`), heading "Често задавани въпроси", ten question/answer pairs in a
  357px column. New Bulgarian copy, not the copy in the existing `faq` block. Two answers
  are placeholders — see [pre-launch.md](pre-launch.md).

So the package step is no longer a compact chooser; it is a scrolling page that sells the
subscription and puts the button at the end.

### step 1-2 — потвърди мейл, waiting (`519:486`) and success (`519:579`)

A dashed panel reading "В ИЗЧАКВАНЕ" in grey, then "ИЗПРАТИ ОТНОВО" and a "Друг мейл?"
link. On success the panel reads "ВЕРИФИЦИРАН" in green `#1faa3d` and the button becomes
"НАПРЕД".

Annotation on the body copy (`523:22`): *"this holds the info for the mail and this way the
user will have enough time to actually receive the mail instead of refreshing every
minute."*

**Verification is a blocking step in the middle of the funnel.** You cannot reach the
design picker until the email is confirmed.

### update-mail-popup (`525:1340`)

The waiting screen with a modal over it, opened by "Друг мейл?". Red scrim
`rgba(204,14,69,0.54)` over the whole 402×874, white card 378×280, `rounded-[29px]`,
20px padding, 20px gaps.

Card contents: a "НОВ ИМЕЙЛ" label (Dela Gothic 18px, `#686868`, `tracking-[1.44px]`) with
"Моля въведете активен мейл акаунт." under it, an X close icon top-right, the standard
50.5px email field, and a full-width "РЕДАКТИРАЙ" button annotated *"on submit - return to
last screen"*. The card itself is annotated *"popup for mail update"*.

So changing the address returns to the waiting screen, now waiting on the new address —
which means a re-send, and the old pending address must stop being valid.

### step 2-1 — избери дизайн (`519:628` BASIC, `524:179` SUPPORTER)

Annotated *"this is the standard category picker; ill try to explain at my best, this is
the screen for basic t-shirt package"* and, on the Supporter frame, *"this screen is if the
user has selected the supporter pack or higher"*.

One dashed-border card containing the package name, then ПОЛ (МЪЖ / ЖЕНА, two pills),
Размер (S/M/L/XL, four pills), a "Виж размерите" link, and ДИЗАЙН as a 2×2 grid of four
category cards (Фитнес, Изкуство, Спорт, Култура) at 152.3×212.8. Then "ИЗБЕРИ" and, under
it, an error line annotated *"this is the error notification bar if the user still hasnt
selected everything"*.

**Revised later on 2026-09-22**: the "дизайн" label became a two-part row on both frames
(`525:5701` on BASIC, `525:5730` on SUPPORTER) — the label on the left and a **"drop - OCT"
badge** on the right, 181×60. This is the dashed drop badge `/join` already renders, computed
from `nextDeliveryDate()` and sharing `MONTHS_BG` with the announcement strip. Existing code;
do not build a second one.

The Supporter frame adds a **sticky bottom sheet**, annotated *"this bottom sheet appears
as a cart and its stuck at the bottom. It shows your selected tees and how much picks
remain"*. Basic has no bottom sheet — one pick, nothing to track.

The sheet collapsed shows N numbered slots: filled ones get a thumbnail, the active one is
red with neon text and a red overlay on its image, empty ones are grey `#f5f5f5`.

### opened bottom sheet (`524:720`)

Annotated *"this screen is the expanded bottom sheet with all the selected designs. If
there are only 2 - show only 2 and so on."*

Each row: thumbnail, категория / пол / Размер as label-over-value pairs, and a
"РЕДАКТИРАЙ" link annotated *"this on click opens the category picker container page to
edit this pick"*. The active pick (`524:924`, annotated *"this is the currently active
design pick"*) has no РЕДАКТИРАЙ — it is the one being edited.

**Each shirt carries its own gender and size**, not one setting for the whole order.

### step 2-2 — създаване на акаунт (`524:479`)

Password, Повторете Парола, then "ИНФОРМАЦИЯ ЗА ДОСТАВКА" (Имена за доставка, Тел. номер),
then "ИНФОРМАЦИЯ ЗА СПЕДИТОР" (SPEEDY / BOXNOW / SAMEDAY), Град, Пощенски код, "Адрес на
доставка/footlocker/автомат", then "НОТИФИКАЦИИ И ПОЛИТИКИ" with two checkboxes:

- Съгласявам се с Политиката за поверителност.
- Искам да получавам нотификации за нов дроп и новини по мейл.

"СЪЗДАЙ АКАУНТ" is annotated *"after this click you can create the profile"*. The cart
strip is pinned at the bottom, annotated *"this container on click opens the bottom sheet"*.

No email field — the address was captured at step 0. No name field beyond "Имена за
доставка".

### step 3-1 — метод на плащане (`525:1000`)

A dashed "ВАЖНА ИНФОРМАЦИЯ" panel about monthly automatic billing, then a 359×482 grey
placeholder labelled **"STRIPE WIDGET"**, then "АБОНИРАЙ СЕ" annotated *"after this click
redirect to account page"*.

## What this changes

### Data model

1. **`Plans` needs a shirt count.** Today: `name`, `priceCents`, `currency`,
   `stripePriceId`, `active`, `sortOrder`. Needs a `shirtCount` (1 / 2 / 4) and probably a
   `badge` field for "recommended". Three Stripe prices instead of one.
2. **`CategorySelections` unique index must go.** It is
   `indexes: [{ fields: ["customer", "month"], unique: true }]` — one pick per customer per
   month. Family needs four rows for the same month. Replace with a `slot` (1..N) and make
   the unique key `customer + month + slot`, so a re-pick still updates in place rather than
   duplicating.
3. Everything that reads a customer's pick assumes exactly one: `/account`'s dashboard, the
   `/admin-tools/deliveries` join, the orders table's Category column, and the CSV export
   (which needs one row per shirt — already noted in the UX backlog).

### Auth

4. **Email verification goes back on.** `Customers.ts` has `verify: false` with a TODO. The
   commented-out block and `/your-profile/verify` still exist, so re-enabling is mostly
   uncommenting — but see the blocking question about Resend below.
5. **Account creation is split across the funnel.** Today `/join/delivery` takes email +
   password together and creates the account in one action. The new flow takes the email at
   step 0, verifies it, and only asks for a password two screens later. So there is a period
   where an email exists with no account behind it.
6. **The verification link can open in a different browser.** Someone enters their email on
   a phone, opens the link in their mail app's in-app browser, and lands with no session and
   no funnel state. **Funnel state must live server-side, keyed to the pending signup, not in
   `sessionStorage`.** Getting this wrong silently drops people who verify on another device.

### Stripe

7. **Hosted Checkout is replaced by an embedded widget.** `startCheckout` currently builds
   `stripe.checkout.sessions.create({ mode: "subscription" })` and redirects to Stripe's own
   page, with gender/size/theme/shipping riding along as session metadata that
   `stripe-sync.ts` reads back out of `checkout.session.completed`. The design puts the card
   form on our own page and redirects to `/account` after.
   That means either Checkout in **embedded mode**, or Elements + a server-created
   subscription. Either way the metadata path through the webhook changes, and `/join`'s
   `startCheckout`, `/payment-confirmation` and `/payment-failed` all need rework.
   `/account/payment` already embeds the Payment Element via a SetupIntent — that component
   and its `appearance` rules are the obvious starting point.

### Routing and pages

8. **`/join` and `/join/delivery` are replaced.** The two-step funnel built on 2026-09-16
   and redesigned 2026-09-17 becomes a five-screen one. `join-picker.tsx`, `delivery-form.tsx`,
   `join-usps.tsx` and `wash-care.tsx` are all in scope.
9. **The `/` hero is replaced** by step 0. The other home blocks (fabric, usps, reviews,
   faq, cta, social) are not in this design — see question 2.
10. ~~The header becomes logo + hamburger. No desktop nav appears in any frame.~~
    **Superseded.** Every frame, mobile and desktop, draws a logo + hamburger header with no
    nav, but the owner's decision on 2026-09-22 is to **use the global `SiteHeader`
    unchanged**. Do not build a funnel-specific header, and do not strip the desktop nav to
    match the drawing.

### Content

11. New copy throughout, all Bulgarian, plus one English word to decide on: the packages are
    named Basic / Supporter / Family and the annotation says *"You can translate it to
    bulgarian"*.
12. The privacy-policy checkbox needs a privacy policy. The footer's legal links are still
    `#` (a known UX-backlog item) — a required consent checkbox pointing at a dead link is
    worse than no checkbox.

## Likely design drift — confirm before copying

- ~~"Адрес на доставка/footlocker/автомат"~~ **Not drift — keep it.** Owner, 2026-09-22:
  "footlocker" is what BOX NOW call their parcel machines, so the label is correct as drawn.
  Do not "fix" this to "офис" in a later pass.
- **"изпратехния"** (`523:22`) should be "изпратения" — owner approved fixing the typos.
- **"НАПРЕд"** (`519:409`) — lowercase д, while every other button is fully uppercase.
  Owner approved fixing.
- **DotGothic16** on the step-0 email placeholder (`519:364`) and in the update-mail popup
  (`525:1400`). Owner confirmed 2026-09-22: **it is Handjet**, use `font-dot`. Stale layer.
- **"всяка първа седмица от месеца"** in the ВАЖНА ИНФОРМАЦИЯ панел (`525:1091`) contradicts
  the four-week cycle counted back from `Site.deliveryDay`. Owner 2026-09-22: **ignore for
  now**, the schedule will most likely change. Ship the copy as drawn; do not re-derive the
  cycle from it.
- **Mixed second person.** Step 0 addresses the customer as "ти" ("Въведи имейла си"), while
  steps 2-1 and 2-2 use "вие" ("Изберете дизайн", "Попълнете данните", "Моля въведете"). The
  existing site is "ти" throughout. Not yet decided — flagged under open questions.
- **The courier controls are drawn as checkboxes** (`data-name="Checkbox Unchecked"`) again.
  Same as the 2026-09-17 round, where the owner confirmed one courier per order, so they
  stay radios.

## The GDPR question

Asked in the annotation on the step-0 button. Not legal advice — get a lawyer's sign-off
before launch — but the shape of the answer is well established:

**Storing the email is fine.** Someone typing their address into a "start your subscription"
form and pressing the button is taking a pre-contractual step at their own request. Keep it,
use it to run the signup, and set a retention period for addresses that never complete
(say, delete after 30–90 days).

**Sending reminders is the risky half.** Under GDPR plus the ePrivacy rules as implemented
in Bulgaria, unsolicited commercial email to someone who is not yet a customer generally
needs prior consent. The "soft opt-in" exemption that lets you email existing customers
about similar products does not cleanly cover someone who abandoned a signup and never
bought anything.

Three things that keep it clean:

1. **The verification email itself is transactional** — they asked to sign up, it is needed
   to complete what they started. Send that without a consent checkbox.
2. **For anything beyond that** — "you still have 2 steps left", "your picks are waiting" —
   add an explicit opt-in at step 0, next to the email field. One unticked checkbox.
3. **Every such message carries an unsubscribe link.** `Subscribers.ts` already does double
   opt-in and `/newsletter/unsubscribe?token=` already exists; reuse it rather than building
   a second mailing path.

The cheapest compliant version: one verification email, one reminder of it, and nothing more
unless they ticked the box.

### Step 0 copy — new, owner-requested 2026-09-22

The owner asked for a line at the email field saying plainly that we will write to them
about their registration, and that it is not marketing. Draft, in "ти" to match the
surrounding step-0 copy ("Въведи имейла си"):

> Ще ти изпратим имейл, за да потвърдиш адреса си и да завършиш регистрацията. Няма да
> получаваш рекламни съобщения без твое съгласие.

In "вие", if the funnel settles on that instead:

> Ще Ви изпратим имейл, за да потвърдите адреса си и да завършите регистрацията. Няма да
> получавате рекламни съобщения без Вашето съгласие.

This is new copy, not a change to the old WordPress wording, so it does not need the
owner's line-by-line approval the way the `/about` edits did — but the ти/вие choice does.

### "Retention" versus marketing — the three-month reminder

The owner asked whether emailing someone three months after an abandoned registration, with
the current t-shirt designs, counts as marketing or retention.

**It is marketing.** "Retention" is a business category, not a legal one, and the test under
GDPR and the ePrivacy rules is about the message's purpose, not its label. A message whose
content is the current designs, sent to someone who never bought anything, is direct
marketing to a non-customer, and it needs prior consent. Two things make this particular
example harder rather than easier:

- **They never completed registration**, so the "soft opt-in" that lets you email existing
  customers about similar products does not apply — there was no sale.
- **Three months is a long time to still be holding the address.** If the retention rule
  says abandoned drafts are deleted after 30–90 days, the address should not exist to be
  emailed. Keeping it *in order to* send that email is itself the thing that needs consent.

The fix is small and worth doing now rather than later: an explicit, unticked opt-in beside
the step-0 email field. With it, the three-month email is straightforwardly fine. Without
it, only the verification email and a re-send of it are safe.

## Decisions taken 2026-09-22

Answers from the owner to the questions this document originally raised.

1. **Database changes are expected and approved.**
2. **Email verification is stubbed for now.** The screens get built, but the address is
   marked verified without an email going out. Everything real about email is deferred —
   see "Email sending — deferred" below. This must be behind an explicit flag; it cannot be
   allowed to reach production silently.
3. **No Resend account yet.** Deferred with the above.
4. **Keep the customer on our site — embedded Stripe.** The owner's reason for wanting
   hosted Checkout was to keep card data off our systems, and that concern is satisfied by
   Elements: the card fields render inside an iframe served by Stripe, the details post
   straight from the browser to Stripe, and our server only ever sees an id
   (`pm_…` / `seti_…` / `sub_…`). Nothing card-shaped is stored, logged or processed here.
   This is already how `/account/payment` works. **The condition for keeping it true: never
   add a card input of our own anywhere.**
5. **Splitting account creation across screens is intentional** — gradual commitment from
   the customer.
6. **Blocking on verification**: the owner is researching drop-off before deciding. Build
   the screens as designed; the decision only changes whether the step can be skipped.
7. **Prices are placeholders.** €17,99 / €22,99 / €24,99 are not final — do not build
   anything that depends on their ratios.
8. **Every shirt is picked individually, step by step.** The picker screen repeats once per
   shirt in the package; the bottom sheet holds the picks until the order is complete. Each
   pick carries its own design, gender and size.
9. **Plan changes after signup**: `/account`, stage 2. Out of scope.
10. **Privacy policy**: a lawyer is writing it. The consent checkbox can be built now and
    pointed at the page when it lands.
11. **Package names get translated** to Bulgarian, keeping them short enough not to overflow
    their card.
12. **`/account` showing N picks**: stage 2. Out of scope.
13. **Scope of this round is only the frames in the Figma section.** The rest of the site —
    `/about`, the remaining home blocks, `/login`, the six `/account` pages — is stage 2.

Answers to the questions raised by the second read, later the same day:

14. **The FAQ price and the FAQ courier list are placeholder copy.** Recorded in
    [pre-launch.md](pre-launch.md); build the screens with the copy as drawn.
15. **The cart renders `shirtCount` slots, not four.** The container stays full width
    whatever the package; only the boxes for slots that exist are rendered. A Supporter
    order shows two, and slots 3 and 4 are absent rather than empty.
16. **Use the global `SiteHeader`** on the funnel, despite the frames drawing a reduced
    logo + hamburger header.
17. **The FAQ is Payload content, editable, with new questions addable.** The existing `faq`
    block (`src/blocks/index.ts`) already has exactly that shape — a `heading` plus an
    `items` array of question/answer with `minRows: 1` — so no new field type is needed.
    What is needed is a way for a *route* to read it: the funnel steps are hard-coded routes,
    not Payload pages, and the FAQ now appears on the package step and on both order steps,
    so it is shared chrome rather than per-page content. Planned approach: hang the same
    `heading` + `items` shape off the `Site` global and have the funnel read it there,
    leaving the existing block alone for the marketing pages. Flagged because it is a
    judgement call, not an instruction.

### Desktop — section `525:1426`, eight frames at 1440px

Added by the owner on 2026-09-22, which closes the two questions this section used to raise.

| Node | Name | Height |
|---|---|---|
| `525:3048` | step 0 landing page | 876 |
| `525:3441` | step 1-1 пакет | 3545 |
| `525:3877` | step 1-2-waiting | 1445 |
| `525:4180` | step 1-2-success | 1445 |
| `525:5130` | step 2-1-order-BASIC | 4035 |
| `525:5775` | step 2-1-order-SUPPORTER | 4561 |
| `525:6298` | step 2-2-account details | 1987 |
| `525:6736` | step 3-1-payment info | 2087 |

The shell is identical across all eight and matches the `AuthPage` language as predicted:

- The **announcement strip** (`Rectangle 9`, 1440×42) and the **header** (`Logged OUT State`,
  x=80, 1280–1289×67) at the top of every frame, and the **full site footer** (`Group 63`,
  1266×821) at the bottom of every frame. Unlike the mobile frames, which are
  viewport-height steps with no footer, desktop steps are full scrolling pages inside normal
  site chrome.
- A **left content column at x=80**: the heading block is 575–766px wide, the forms and
  buttons 579px. The **step counter** (`Group 185`) sits under the heading at x=88, y≈413.
- A **right column at x≈767–769**, 591–602px wide, holding the illustration on the early
  steps and an order summary (`Frame 125`, 593×125; `Group 135`, ~591×801) on the order,
  account and payment steps.

Two mobile frames have no desktop counterpart, both explained:

- **`opened bottom sheet`** — on desktop the cart is not a sheet at all. It is an **inline
  full-width row** (`Group 135` at y=2003 on the SUPPORTER frame, 1280×528): slots side by
  side, each filled one showing a thumbnail with КАТЕГОРИЯ / ПОЛ / РАЗМЕР and a РЕДАКТИРАЙ
  link, the active slot red with a neon number and no РЕДАКТИРАЙ, empty slots plain grey.
  Same rules as mobile, different geometry — and no sticky positioning work on desktop.
- **`update-mail-popup`** — a centred modal over the waiting screen; no separate desktop
  treatment needed.

The desktop SUPPORTER frame draws four slots where Supporter is a two-shirt package. Owner
2026-09-22: the **container is always full width, but only `shirtCount` slots render** — a
Supporter order shows two boxes and slots 3 and 4 do not exist at all. Treat the four-slot
artwork as the Family case drawn into the wrong frame.

The desktop header in these frames is logo + hamburger with no nav. Owner 2026-09-22:
**use the global `SiteHeader`**, not a reduced funnel header. See the drift list.

## Build plan

Ordered so that nothing is built twice. Each numbered item is a commit-sized unit.

### 1. Data model and migrations

- `Plans`: add `shirtCount` (1 / 2 / 4) and a `badge` field for the "recommended" ribbon.
  Translate `name`. Seed the three packages; three Stripe prices instead of one.
- `CategorySelections`: drop `indexes: [{ fields: ["customer", "month"], unique: true }]`,
  add `slot` (1..N), make the unique key `customer + month + slot` so re-picking a slot
  updates in place instead of duplicating.
- New server-side funnel state (a `signup-drafts` collection, or fields hung off a
  not-yet-verified `Customers` row): chosen plan, picks so far, current step, verification
  state. **Keyed to the pending signup, not to a browser session** — the verification link
  routinely opens in a different browser, and `sessionStorage` would drop those people
  silently.
- Write the migrations by hand and register them in `src/migrations/index.ts`.
  `payload migrate:create` cannot generate these non-interactively in this repo — its
  Drizzle snapshot does not know about the hand-written columns and offers renames instead
  of adds (see `20260917_000500_shipping_city.ts`).
- Update every reader that assumes one pick per month: the `/account` dashboard, the orders
  table's Category column, the `/admin-tools/deliveries` join, and the CSV export, which
  needs one row per shirt.
- Add access rules for any new collection plus a line in `tests/unit/access.test.ts`, and a
  delete guard if anything points at it.
- **Land the courier schema change here too.** Step 2-2 collects courier, Град, Пощенски код
  and "Адрес на доставка/footlocker/автомат" — it *is* the delivery form. The `deliveryType`
  and office/locker id change described in [courier-integration.md](courier-integration.md)
  belongs in this same migration, otherwise these fields get built on free text now and
  migrated again the moment a courier contract lands. The owner's picker decision there
  (carrier first, then method) applies to this screen.

### 2. Funnel shell

- Route scheme for the steps, resumable from a link.
- The phase counter (1/3, 2/3, 3/3 — phases, not screens).
- Mobile layout at 402px; desktop as drawn in `525:1426` — left content column at x=80
  (579px wide), right column at x≈768 (~595px), inside the global header, announcement
  strip and site footer.
- Header: the global `SiteHeader`, unchanged (decision 16).
- Move the FAQ into Payload so the funnel steps can read it (decision 17), and reuse
  `JoinUsps` for the USP row rather than rebuilding it.

### 3. Screens

In flow order: step 0 hero → packages (with the USP row and the FAQ below them) → waiting /
mail popup / verified → picker (repeating per slot, with the drop badge on the дизайн label)
with the cart collapsed and expanded → account details with the two consent checkboxes →
payment.

The cart is a sticky bottom sheet on mobile and an inline full-width row on desktop, and
renders exactly `shirtCount` slots in both (decision 15).

### 4. Stripe rework

Move from hosted Checkout to the embedded Payment Element, reusing
`src/components/forms/payment-method-form.tsx` and its `appearance` rules. `startCheckout`,
the metadata path through `stripe-sync.ts`, `/payment-confirmation` and `/payment-failed`
all change; new fixtures in `tests/unit/fixtures/`.

### 5. Retire the old funnel

`/join`, `/join/delivery`, `join-picker.tsx`, `delivery-form.tsx`, `join-usps.tsx`,
`wash-care.tsx` — remove or redirect once the new flow is live. The old home hero is
replaced by step 0.

## Email sending — deferred

Everything here is knowingly stubbed. **Nothing in this list may reach production unfixed.**

- [ ] Create a Resend account and set `RESEND_API_KEY`. Without it every email in the app
      prints to the server console instead of sending.
- [ ] Turn real verification on: `Customers.ts` currently sets `auth.verify: false` with the
      working block commented out just below it, and `/your-profile/verify` still exists.
- [ ] **Remove the auto-verify stub** added for this round, and the flag that switches it.
      This is the one that silently lets unverified addresses through if forgotten.
- [ ] Send the verification email from step 1-1's "НАПРЕД", and re-send it from both
      "ИЗПРАТИ ОТНОВО" and the update-mail popup.
- [ ] Invalidate the previous pending address when the mail popup changes it.
- [ ] Reminder emails to people who abandoned the funnel — only with the opt-in described
      under "The GDPR question", and only with an unsubscribe link. Reuse
      `/newsletter/unsubscribe?token=`; do not build a second mailing path.
- [ ] A retention rule that deletes abandoned signup drafts and their email addresses.

## Still open

1. **"ти" or "вие"?** The design mixes them: step 0 says "Въведи имейла си", steps 2-1 and
   2-2 say "Изберете" and "Попълнете". The existing site is "ти" throughout. Needs one
   answer applied across all the new copy.
2. **Bulgarian names for Basic / Supporter / Family**, short enough for a 115px card.

Resolved 2026-09-22: desktop for the hero and the cart — the owner designed both, see
"Desktop" above.
