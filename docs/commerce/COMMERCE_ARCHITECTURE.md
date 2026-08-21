# EquiProfile Store Architecture

The Store is a third isolated frontend within the existing EquiProfile application. It uses the existing authenticated API session, a dedicated `commerce` API namespace, and its own `shop` build output and asset path. SaaS subscription billing remains separate from Store carts, orders, refunds, and any future payment webhooks.

## Data model and migration decision

`0022_commerce_foundation.sql` remains unchanged as the original draft-branch foundation. `0023_commerce_lifecycle_integrity.sql` is a separate, additive continuation migration. This preserves reviewable history while adding customer addresses, licensed product images, factual attributes, price history, shipments, shipment items, tracking events, returns, return items, refunds, Product Manager actions, and foreign-key constraints. Neither migration has been applied to production.

| Domain | Core records |
|---|---|
| Catalogue | suppliers, sources, sync runs, categories, products, variants, product categories, images, attributes, price history |
| Supply and stock | supplier products, inventory freshness, supplier delivery model |
| Customer | carts, cart items, addresses, orders, order items |
| Fulfilment | shipments, shipment items, tracking events |
| Aftercare | returns, return items, refunds |
| Governance | product approvals, Product Manager actions, generic audit log |

## Security model

The browser never supplies a trusted price, sale price, tax, supplier cost, availability, or order total. Cart addition validates active variant, published product, non-development status, non-archived state, supplier availability, and stock freshness. Checkout recalculates totals from persisted server records and is keyed by customer-scoped idempotency. Customer order detail and return requests are scoped to the authenticated order owner.

## Payment and supplier state

Store payment remains `NOT CONFIGURED` until separate Store Stripe credentials and an approved webhook endpoint are supplied. No live or test charge is fabricated. Production suppliers remain `NOT CONFIGURED` until a signed agreement, credentials, feed terms, stock/price freshness policy, fulfilment profile, returns agreement, and permitted image rights are recorded.

## Migration policy

All migrations are additive. Source curriculum retirement unpublishes obsolete source-managed Academy material without deleting learner history. Commerce lifecycle records are retained for audit and reconciliation; archival replaces destructive deletion where a customer or payment record exists.
