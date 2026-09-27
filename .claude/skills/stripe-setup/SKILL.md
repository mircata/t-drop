---
name: stripe-setup
description: "Set up or reconfigure Stripe for T-Drop: the product and monthly EUR price, the secret and publishable keys, the webhook endpoint and its events, local stripe listen, and the Customer Portal."
---

# Stripe setup

State on 2026-09-12: the sandbox has the product, the monthly 17.99 EUR price (already on the plan in /admin) and a default Customer Portal configuration. The webhook is order-independent: if an invoice or subscription event arrives before the checkout session, the customer is created from the Stripe record.

1. In the Stripe dashboard (sandbox until the owner picks the live account) create a product with a recurring monthly EUR price. Copy the `price_...` id into the plan in /admin > Планове.
2. Put the secret key in `.env.local` as `STRIPE_SECRET_KEY`, and the publishable key (same Developers > API keys page, starts `pk_...`) as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — this second one powers the embedded card form on `/account/payment`; without it that page shows "Плащанията още не са включени." instead of crashing.
3. Add a webhook endpoint for `https://<site>/webhooks/stripe` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Locally, run `stripe listen --forward-to localhost:3100/webhooks/stripe` and use the secret it prints.
5. Enable the Customer Portal in Stripe settings (Billing > Customer portal) and allow cancelling.
