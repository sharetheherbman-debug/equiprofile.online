# EquiProfile Marketing Ecosystem Contract

**Status:** integration contract for implementation and review. **Version:** `1.0`. **Last reviewed:** 21 August 2026.

> **Scope.** This document defines the only permitted interface between EquiProfile product lines and a marketing system. It does not authorise repository access, direct database access, audience export, advertising activation, tracking without consent, or movement of restricted personal data. Marketing remains an external consumer of approved event payloads only.

## 1. Core principles

1. **Consent first.** An event is emitted only when its `consentState` permits the specific processing purpose. Absence, withdrawal or uncertainty means no marketing event.
2. **Minimum necessary data.** The event carries public/commercial metadata and an opaque entity reference where required; it does not carry private learning, health, address, payment or supplier-cost data.
3. **Product-line separation.** Every event declares its producing product line. Academy education must never be used to infer a commercial need or create targeted product recommendations from student learning data.
4. **No direct access.** Marketing systems receive neither product databases nor supplier feeds. They consume approved payloads through a reviewed integration boundary.
5. **Idempotent and versioned.** Consumers must treat `idempotencyKey` as unique and reject unsupported `payloadVersion` values.
6. **Truthful public data only.** URLs, prices, availability and assets must be canonical and approved at event time. A marketing consumer must not manufacture products, availability, claims, discounts or delivery promises.

## 2. Common payload envelope

Every event uses this envelope. `payload` contains only event-type fields specified in this contract.

```json
{
  "sourceApp": "equiprofile.online",
  "productLine": "academy",
  "eventType": "academy_pathway_catalogue_viewed",
  "entityType": "pathway",
  "entityId": "equine-foundations",
  "publicUrl": "https://academy.equiprofile.online/pathways/equine-foundations",
  "timestamp": "2026-08-21T10:50:00.000Z",
  "consentState": "marketing_opt_in",
  "idempotencyKey": "uuid-or-stable-event-key",
  "payloadVersion": "1.0",
  "payload": {}
}
```

| Field            | Requirement                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `sourceApp`      | Constant, auditable producer identifier. Initial value: `equiprofile.online`.                                           |
| `productLine`    | Exactly one of `management`, `academy`, or `shop`.                                                                      |
| `eventType`      | Contracted event name. Unknown event names are rejected by consumers.                                                   |
| `entityType`     | Public domain object type such as `pathway`, `plan`, `product`, `order` or `catalogue`.                                 |
| `entityId`       | Canonical internal/public identifier. It is not an email address, address, payment token or health identifier.          |
| `publicUrl`      | HTTPS canonical public URL where one exists; no authenticated deep links containing a token or private identifier.      |
| `timestamp`      | ISO 8601 UTC producer event time.                                                                                       |
| `consentState`   | Consent status evaluated by the producer at emission time; see §3.                                                      |
| `idempotencyKey` | Stable unique key for this producer event. Consumers deduplicate indefinitely or for their documented retention period. |
| `payloadVersion` | Semantic contract version. A breaking change requires a new major version.                                              |
| `payload`        | Explicit allow-listed event-specific fields only.                                                                       |

## 3. Consent state and delivery policy

| `consentState`       | Marketing delivery rule                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `marketing_opt_in`   | Eligible only for the documented marketing purpose and event allow-list.                                                      |
| `transactional_only` | Do not send to marketing systems. May be retained only within transactional systems where independently lawful and necessary. |
| `withdrawn`          | Do not emit. Existing downstream records require the documented suppression/deletion workflow.                                |
| `unknown`            | Do not emit. Treat as no consent.                                                                                             |

The producer must retain consent provenance and timestamp in its own system. That provenance is **not** included in marketing payloads unless a future reviewed version explicitly adds a minimal legal basis reference.

## 4. Academy event allow-list

Academy events are limited to public discovery and voluntary commercial-plan moments. No individual educational activity, progression or assessment is available to marketing.

| Event type                         | Entity                 | Permitted `payload` fields                                    | Conditions                                                                                                           |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `academy_public_plans_viewed`      | `plan_catalogue`       | `planIds`, `currency`                                         | Public pricing page only; consent required.                                                                          |
| `academy_pathway_catalogue_viewed` | `pathway`              | `pathwaySlug`, `pathwayTitle`, `level`                        | Public pathway catalogue only; no learner identity or progress.                                                      |
| `academy_pricing_viewed`           | `pricing`              | `planId`, `pricePence`, `currency`, `billingInterval`         | Current public, approved price only.                                                                                 |
| `academy_registration_completed`   | `account_registration` | `registrationSurface`, `planInterest` if voluntarily selected | Requires marketing opt-in; never include verification tokens, password state or learner profile.                     |
| `academy_plan_purchase_completed`  | `plan_purchase`        | `planId`, `currency`, `purchaseState`                         | Only a non-sensitive outcome. Never include payment references, card/bank data, invoice address or learner progress. |

### Academy referrals

Permitted Academy referral material is limited to canonical public URLs, UTM-safe campaign parameters, non-personal referral code identifiers and aggregate conversion counts. A referral record must not expose the referred learner’s identity or infer ability, health, safeguarding status, completion, competency or feedback.

## 5. Shop event allow-list

Shop events use only approved product facts and customer-consented commercial interactions. Store payment events remain isolated from subscription billing and external marketing consumers never receive payment data.

| Event type                          | Entity     | Permitted `payload` fields                                                                    | Conditions                                                                                                                                                                                                  |
| ----------------------------------- | ---------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shop_approved_product_published`   | `product`  | `slug`, `title`, `brand`, `canonicalPricePence`, `currency`, `availabilityStatus`, `imageUrl` | Product must be human-approved, public, in stock/fresh state as required, and have licensed imagery.                                                                                                        |
| `shop_product_availability_changed` | `product`  | `slug`, `availabilityStatus`, `canonicalPricePence`, `currency`                               | Event is informational only; no delivery promise beyond the approved source data.                                                                                                                           |
| `shop_product_viewed`               | `product`  | `slug`, `categorySlugs`                                                                       | Consent required; no cart contents, profile information or inferred interests beyond the public product entity.                                                                                             |
| `shop_checkout_started`             | `checkout` | `currency`, `itemCount`, `subtotalPence`                                                      | Consent required. Excludes names, addresses, items unless a later reviewed contract specifically permits a product-level aggregate. No payment details.                                                     |
| `shop_order_paid`                   | `order`    | `orderNumber`, `currency`, `totalPence`, `itemCount`, `purchaseState`                         | Consent required; emitted only after the Store payment reconciliation boundary records an authoritative paid state. No Stripe identifiers, payment method, address, supplier cost or fulfilment credential. |

### Shop catalogue and asset rules

A Shop product is eligible for a marketing payload only where all of the following are true:

1. The product is not development-only, archived, pending approval or review-required.
2. A recorded human approval allows publication.
3. Product facts derive from recorded provenance rather than generated copy.
4. The advertised price and availability are the canonical server-side values at event time.
5. Every marketed image has recorded licensed rights/provenance and is permitted for the intended channel.
6. Supplier trade, dropship, data and image rights are active under the supplier onboarding process where supplier fulfillment applies.

## 6. Explicitly excluded data

The following data **must not** be sent to any marketing system, embedded in `publicUrl`, exported through a referral, or inferred into a marketing audience.

| Category                    | Excluded fields and examples                                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Academy private learning    | Student progress, completions, scores, knowledge-check answers, competencies, pathways assigned by a teacher, teacher feedback, tutor conversations, learning adjustments and certificate evidence |
| Sensitive/regulated records | Health records, veterinary/medical data, safeguarding information, accident details, insurance information, body measurements and special-category data                                            |
| Identity and contact data   | Email address, telephone number, postal address, IP address, raw device identifier, password/reset/verification token, private profile image and emergency contact                                 |
| Payment and finance         | Card/bank data, payment intent/session/reference IDs, invoices, tax identifiers, billing address, failed payment reason, refunds, chargebacks and subscription credentials                         |
| Supplier confidential data  | Supplier cost, margin, negotiated terms, API keys, account identifiers, unpublished stock data, purchase orders, returns/RMA details and trade agreement documents                                 |
| Operational security        | Session/JWT values, admin unlock state, access logs, raw analytics identifiers, database IDs where a public slug is available and internal audit logs                                              |

## 7. Delivery, validation and incident handling

1. Producers validate envelope shape, enum values, consent state and event-specific allow-lists before delivery.
2. Consumers reject unknown fields, unsupported versions, non-HTTPS URLs and payloads missing an idempotency key.
3. Event transport must use authenticated server-to-server delivery; client-side API keys are prohibited.
4. Producers log delivery status using minimal technical metadata and never log restricted payload content in plaintext diagnostics.
5. Failed delivery retries must preserve the same idempotency key. A replay must not produce duplicate campaign actions.
6. Consent withdrawal requires a documented suppression/deletion request to all downstream consumers according to their data-processing agreement and retention policy.
7. A suspected payload-boundary breach pauses affected delivery, preserves an audit record, scopes impacted events and is escalated to the privacy/security owner before resumption.

## 8. Change control

Any new event, field, product line, destination, referral use, data category or campaign purpose requires a reviewed contract update, privacy assessment where applicable, implementation test, and documented approval. No Marketing repository is modified by this contract; it is intentionally an application-side boundary specification.
