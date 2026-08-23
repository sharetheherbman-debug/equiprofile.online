# EquiProfile Shop and Academy Integration Contract

This document defines **future-facing, consent-safe data boundaries**. It does not activate an integration, send marketing events, or copy any Marketing-system implementation.

## Shop publication feed

Only products that are both `published` and non-development records may be exposed. Every payload must distinguish factual supplier data from EquiProfile-authored marketing copy.

| Field                                                     | Source / rule                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `productId`, `slug`, `publicUrl`                          | Store product identity and canonical Shop URL.                                                     |
| `title`, `price`, `salePrice`, `currency`, `availability` | Trusted Commerce records only; never browser input.                                                |
| `imageUrl`                                                | Present only when image rights are explicitly licensed.                                            |
| `supplierStatus`, `sourceUpdatedAt`, `stockFreshUntil`    | Operational metadata for truthful publishing decisions; do not expose supplier confidential terms. |
| `generatedCopy`                                           | Mark as generated and retain an approval reference.                                                |

## Conversion events

Marketing systems may consume an event only if the customer has granted the required consent. The event must use an order identifier and server-calculated value; it must never contain payment-card data, medical data, or a complete customer address.

| Event                    | Minimum payload                                      | Trigger                                          |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------ |
| `shop_product_viewed`    | product identity, public URL, consent state          | Public-page analytics, subject to consent.       |
| `shop_checkout_prepared` | order number, trusted total, currency, consent state | A server-side checkout-pending order is created. |
| `shop_order_paid`        | order number, trusted total, currency, consent state | Verified Store payment webhook only.             |
| `academy_plan_viewed`    | plan identity, consent state                         | Academy pricing view, subject to consent.        |

## Ethical boundary

Academy completion data can inform educational navigation. It must not be used to pressure customers into buying health or supplement products, and no medical, welfare, or veterinary data may be used for aggressive commercial targeting. No production connector is configured by this repository change.
