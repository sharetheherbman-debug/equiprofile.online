# Commerce Acceptance Record

## Implemented software evidence

| Capability | Evidence | Status |
|---|---|---|
| Isolated Shop frontend | `client/shop`, dedicated Vite target, hostname and asset namespace | Implemented |
| Catalogue and product detail | Public API excludes development/archived/unpublished products; product detail exposes active variants and licensed images only | Implemented |
| Persistent cart | Authenticated cart API, customer-scoped item mutation, server eligibility validation | Implemented |
| Trusted totals | Checkout recalculates persisted price, VAT and freshness; client totals are informational only | Implemented |
| Customer lifecycle | Address, customer order detail, shipment visibility and return-request API contracts | Implemented pending migration |
| Payment boundary | Checkout-pending order and idempotency contract; no fake charge or success | Implemented; Store Stripe `NOT CONFIGURED` |
| Governance | Human approval gate, Product Manager service, source provenance, audit records and development-only synthetic supplier | Implemented |
| Admin | API-backed metrics and restricted administration screen | Implemented |

## Deliberately blocked until external setup

Supplier connection, public supplier products, licensed supplier images, exact shipping prices, delivery estimates, payment-session creation, signed payment webhook processing, test payments, refunds through Stripe, production VAT settings, and live fulfilment remain blocked on real commercial agreements and credentials. The UI and API use explicit `NOT CONFIGURED` / unavailable states rather than fabricating these outcomes.

## Required test evidence before activation

Run the full repository quality suite, targeted Commerce domain/API tests, a local migration against a disposable database, and authenticated browser acceptance across catalogue, product, cart, checkout boundary, orders, returns, and admin. Then repeat with approved test supplier data and Stripe test credentials before enabling any payment route.
