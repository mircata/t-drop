---
name: delivery-export
description: "Work with T-Drop's monthly factory delivery run: the fulfillmentStatus field, the /admin-tools/deliveries staff page, per-row status updates, and the CSV export sent to the factory."
---

# Delivery tracking (factory export)

`CategorySelections.fulfillmentStatus` (Чака плащане / Подготовка / Изчаква / Доставено / Отказано, `src/lib/delivery-status.ts` is the single source of truth for the options — the collection field and every consumer import from it) — set it per row either in `/admin > Дропове > Избори за дроп`, or more usably at **`/admin-tools/deliveries`** (linked from the /admin sidebar, "📦 Доставки" — a plain Next.js page outside Payload's own generated admin, protected by `getAdminUser()` in `src/lib/admin-auth.ts`, which reads Payload's own admin cookie directly since — unlike customers — admin sessions were never rerouted around Payload's cookie matching). That page joins each month's picks with the customer's phone/shipping info and shows an inline status dropdown per row (`updateFulfillmentStatus` action, `src/lib/actions/deliveries.ts`) plus an "Export CSV" button (`.../deliveries/export/route.ts`, admin-only, UTF-8 BOM so Cyrillic opens correctly in Excel) for sending the month's run to the factory.
