# Courier integration — Speedy, Sameday, BOX NOW

Research collected 2026-09-22. Nothing is built yet. This is what each carrier's API
actually offers, what t-drop needs from it, and what has to change in our data model
before any of it can be called.

**Confidence marks:** facts below come from each carrier's own documentation unless marked
*(unconfirmed)*, which means they came from a search summary or a third-party plugin and
must be checked against the real docs once we have credentials.

## What t-drop actually needs

Narrower than a typical shop, and that matters — several expensive courier features are
things we can skip:

- **One parcel per customer per drop.** One t-shirt, same weight and box every time
  (~0.3 kg). No multi-parcel, no oversized, no per-order weight calculation.
- **Never cash on delivery.** The subscription is charged by Stripe before the parcel is
  made. Every COD field in all three APIs stays empty. This removes the reconciliation
  work that normally dominates a BG courier integration.
- **Shipments are created in a batch, once a month**, from the same run that produces the
  factory CSV (`/admin-tools/deliveries`) — not one at a time at checkout.
- **We do not need price quoting at checkout.** Shipping is part of the subscription
  price. Speedy's `/calculate` and Sameday's cost-estimate endpoints are optional; we may
  still want them later to see our own cost per drop.

So the integration reduces to four operations per carrier:

1. **Fetch the office / locker list** so the customer picks a real one, not free text.
2. **Create the shipment** for each of the month's picks and get a tracking number.
3. **Get the label PDF** to print and hand to the courier.
4. **Read the status back** so `fulfillmentStatus` stops being set by hand.

## Speedy

REST/JSON. The old SOAP service ("EPS") was switched off on 30 September 2024 — ignore
every SOAP example and PHP EPS library you find, they are dead.

| | |
|---|---|
| Base URL | `https://api.speedy.bg/v1/` |
| Auth | Credentials in the **JSON body of every request**: `userName`, `password`, optional `language` ("BG"/"EN") and `clientSystemId`. No token, no session. |
| Sandbox | Not self-serve — a test account is requested from Speedy. *(unconfirmed: whether it is a separate host or a test client id on the same host)* |
| Onboarding | Existing Speedy client contract + client number. |

Endpoints we would use:

- `POST /location/office` — search offices by criteria; `GET /location/office/{id}` for one.
  This is the list behind the office picker. Also `POST /location/office/nearest-offices`
  (by address), which is a nicer UX than a dropdown of thousands of offices.
- `POST /location/site` — cities. `POST /location/postcode/csv/{countryId}` — the whole
  postcode list as CSV, worth caching rather than querying live.
- `POST /shipment` — create. (`/shipment/add_parcel` + `/shipment/finalize` exist for
  multi-parcel; we don't need them.)
- `POST /print` — label PDF or ZPL; supports A4, A6 and A4_4xA6. **A4_4xA6 is the one we
  want** — four labels per sheet for a monthly batch run.
- `POST /track` — up to 10 parcels per call, with operation history. `POST /track/bulk`
  for bigger runs.
- `POST /shipment/cancel` (or `DELETE /shipment`) — only before pickup.
- `POST /validation/*` — validate address, postcode and phone. Useful on `/join/delivery`
  and `/account/address` regardless of whether we ever create a shipment automatically.

Note: Speedy's address model is structured (site id + street id + number), not one
free-text line, so `shipping.addressOrOffice` will not map onto it cleanly. Either we
adopt structured fields or we accept that Speedy address (not office) shipments still need
a human to retype them.

## BOX NOW

Locker-only (APT). OAuth2, clean REST, the most modern of the three.

| | |
|---|---|
| Base URL | Supplied at onboarding as `API_URL`; separate stage and production hosts. Do not guess them. |
| Auth | OAuth2 **client credentials**: `POST {baseURL}/api/v1/auth-sessions` with `client_id`, `client_secret`, `grant_type=client_credentials`. Returns `access_token`, `expires_in: 3600`. Send as `Authorization: Bearer <token>`. Cache the token, refresh hourly. |
| Sandbox | Yes — a stage environment with limited functionality, **separate credentials from production**. Test locker id `5365` ("Test Locker 1"). |
| Onboarding | Email `integrationsupport@boxnow.bg` with company name, address, tax ID (ЕИК) and contact details. They issue `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` and `API_URL`. |

Endpoints:

- `GET /api/v1/origins` — our own warehouse/pickup points.
- `GET /api/v1/destinations` — the locker list. This is the picker data.
- `POST /api/v1/delivery-requests` — create the parcel.
- `GET /api/v1/parcels/{id}/label.pdf` — one label.
  `GET /api/v1/delivery-requests/{orderNumber}/label.pdf` — all labels for an order.
- `GET /api/v1/parcels` — list/status.
- `POST /api/v1/parcels/{id}:cancel` — cancel.
- Webhooks for parcel tracking: documented separately, downloadable from the partner
  portal. Prefer these over polling.

BOX NOW also ships a **locker-picker widget** (map + search, embedded in checkout) rather
than making you build one from `/destinations`. Worth using on `/join/delivery` — it is the
part of this whole project that is most annoying to build by hand.
*(unconfirmed: the BG widget host; the GR one is `widget-v5.boxnow.gr`.)*

Customer phone and email are required on the delivery request — the locker sends the pickup
code by SMS. We have the phone; `/join/delivery` already collects it.

## Sameday

Token-based REST. Runs separate country instances (RO, HU, BG) with **separate credentials
per country and per environment**.

| | |
|---|---|
| Base URL | `https://api.sameday.bg` production, `https://sameday-api-bg.demo.zitec.com` demo *(unconfirmed — both come from plugin config, not from docs I read; the RO equivalents are `api.sameday.ro` and `sameday-api.demo.zitec.com`)* |
| Auth | `POST /api/authentication` with the username in an `X-AUTH-USERNAME` header and the password in `X-AUTH-PASSWORD`. Returns a token valid **12 hours**; `remember_me=1` extends it. Send the token on every other call. |
| Sandbox | Yes, the demo host above, with its own credentials. There is a public sandbox UI at `https://sameday-api.demo.zitec.com/documentation/client` (RO) — useful for reading the schemas before we have a contract. |
| Onboarding | Credentials are issued **after signing a contract**. Enrolment contact: `software@sameday.ro`. |

Endpoints (names as in the official PHP SDK, the clearest published reference):

- `GET /api/client/pickup-points` — our pickup points, paginated.
- Counties and cities lookups (`GetCounties`, `GetCities`) — Sameday wants a structured
  county + city, not free text.
- Lockers ("easybox") and SAMEDAY points — a separate list from pickup points.
- `POST` AWB — create the waybill.
- Get AWB PDF — the label.
- Parcel status history — tracking.
- Delete AWB — cancel.

There is an official PHP SDK and WooCommerce/OpenCart/Magento plugins, but **no official
JS/TS SDK**. We would write a thin client ourselves; the surface we need is small.

## What has to change on our side

This is the real work, and it is the same work for all three carriers.

**`Customers.shipping` is too loose for any API.** Today it is `recipientName`, `city`,
`postcode`, `carrier` (a select) and `addressOrOffice` — one free-text line that is *either*
a street address *or* an office name. No API accepts that. Every carrier needs to know which
of the two it is, and offices/lockers need their **id**, not their name.

**Picker shape — decided by the owner 2026-09-22: carrier first, then method.** The
customer picks the courier from the existing Спедитор radios, and the form then shows only
that courier's options. All three radios stay, Sameday included, even though there is no
contract for it.

| Carrier | Methods offered | What we must store |
|---|---|---|
| Speedy | to an address, or to a Speedy office | structured street address, or Speedy office id |
| BOX NOW | locker only — no method step, go straight to the locker picker | BOX NOW locker id |
| Sameday | to an address, office, or easybox locker | address, office id, or locker id |

The alternative considered and rejected was asking *how* the parcel should be handed over
and deriving the carrier from the answer. Recorded here only so it is not re-proposed.

Whichever way it is asked, the same failure mode has to be designed out: today a customer
can pick BOX NOW and then type a street address into the free-text field, and nothing
catches it. With carrier first, the method step must be gated on the carrier — BOX NOW
never offers an address input at all.

Minimum change:

- Add `deliveryType`: `address` | `office` (Speedy/Sameday) | `locker` (BOX NOW).
- Add `officeId` / `lockerId` — the carrier's own id, plus the display name we showed the
  customer at the time (ids get retired; keep the label for the CSV and for history).
- Keep `addressOrOffice` as the street line for `deliveryType: address`, and rename it so
  it stops pretending to be both.
- `city` probably needs the carrier's site id alongside the typed name.

This is also exactly what the **"clearer delivery address picker"** item in
[ux-backlog.md](ux-backlog.md) describes, so the two should be done as one job: the picker
is the UI half, this schema change is the data half. Doing the picker first with free text
and retrofitting ids later means migrating live customer addresses twice.

**Secrets**: three more credential pairs in `.env.example` / Vercel, all server-side only.
Each carrier needs a stage set and a production set; nothing goes in a `NEXT_PUBLIC_` var
except possibly the BOX NOW widget key.

**Where shipment creation lives**: `/admin-tools/deliveries` already has the month's rows
and an admin-only action pattern (`src/lib/actions/deliveries.ts`). A "Създай товарителници"
button there, writing the returned tracking number back onto each `CategorySelections` row,
fits the existing shape better than anything new. `fulfillmentStatus` then becomes partly
carrier-driven instead of hand-set.

## Open questions for the owner

1. ~~**Which carriers does t-drop actually have contracts with?**~~ Answered by the owner
   2026-09-22: **none yet.** Contracts are planned with **Speedy and BOX NOW** — both
   treated as certain. **Sameday is undecided** and may never happen. So: build for Speedy
   and BOX NOW, keep Sameday behind the same internal interface but do not spend time on it
   until there is a contract. Note that nothing can be called against any of them until
   client numbers and credentials exist, so the schema and picker work below is all that is
   actually unblocked today.

   All three carriers stay visible in the UI in the meantime — owner's call, same day. The
   site is not live on t-drop.net yet, so an unfulfillable Sameday pick costs nothing today;
   revisit before launch if the Sameday contract still has not happened.
2. **Is there a physical dispatch address / warehouse?** Every carrier needs an origin
   registered on their side (Speedy client address, BOX NOW `origins`, Sameday pickup point).
3. **Who prints labels, and on what?** A4 sheets of four (Speedy A4_4xA6) versus a thermal
   label printer changes which format we request.
4. **Returns.** BOX NOW has a dedicated returns flow; the footer's "Условия за връщане" is
   still a dead link. Out of scope for a first pass, but it affects whether we store the
   outbound tracking number in a way a return can reference.
5. **BOX NOW widget or our own locker list?** The widget is much less work and is what their
   other BG merchants use, at the cost of an embedded third-party script in checkout.

## Suggested order of work

1. Schema + picker together (`deliveryType`, office/locker id, the `/join/delivery` and
   `/account/address` UI) — carrier-agnostic, unblocks everything, needs no contract.
2. One carrier end to end against its sandbox, whichever is signed first. BOX NOW is the
   easiest (OAuth2, clean REST, self-serve onboarding email, a real stage environment).
3. Label batch + tracking write-back on `/admin-tools/deliveries`.
4. The remaining carriers behind the same internal interface.

## Sources

- Speedy: <https://api.speedy.bg/web-api.html>, <https://services.speedy.bg/api/api_examples.php>
- BOX NOW: <https://www.boxnow.bg/en/partner-api>, <https://t.boxnow.bg/en/diy/eshops/api>, <https://www.boxnow.bg/en/partner-portal>
- Sameday: <https://github.com/sameday-courier/php-sdk>, <https://wordpress.org/plugins/samedaycourier-shipping/>, <https://sameday-api.demo.zitec.com/documentation/client>
