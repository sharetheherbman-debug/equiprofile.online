# AI Product Manager

The AI Product Manager is a governed proposal system. It does not create a public product, activate a supplier, purchase stock, commit delivery, or publish marketing copy without a human approval.

## Executable flow

`DISCOVER → INGEST → NORMALISE → VALIDATE → DEDUPLICATE → SCORE → PROPOSE → HUMAN APPROVAL → PUBLISH → MONITOR`

The current executable service normalises supplier SKU/EAN/title data, detects duplicates, scores equestrian relevance, completeness, freshness, margin potential and duplicate risk, creates a constrained pricing proposal, and requests optional copy enrichment via the existing server-side AI abstraction. The owner-only `commerce.admin.proposeProduct` endpoint records its proposal action and retains a mandatory human-approval result.

## Factual and safety boundary

AI receives a constrained supplier fact record. The service prompt prohibits invented materials, specifications, certifications, health claims, safety claims and delivery promises. Its result is stored as proposal metadata; supplier source facts remain separate. The browser has no model key, supplier credential, or direct provider implementation.

## Human gates

Human approval is mandatory for first publication, supplier activation, substantial factual change, abnormal price movement, and any purchase or fulfilment commitment. A synthetic development supplier can exercise the proposal path only outside production and remains excluded from the public catalogue.

## Not configured

No production supplier feed, Store Stripe webhook, automated supplier poll, or live monitoring scheduler is configured. Those require an approved supplier agreement, source-specific credentials, stock/price freshness policy, rights confirmation, and operational owner before activation.
