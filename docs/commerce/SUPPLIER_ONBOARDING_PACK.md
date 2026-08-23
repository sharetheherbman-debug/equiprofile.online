# EquiProfile Store — Supplier Onboarding Pack

**Status:** operational pre-approval checklist. **Owner:** Commerce Operations. **Last reviewed:** 21 August 2026.

> **Purpose.** This pack turns supplier discovery into a controlled onboarding process. It is not a trade agreement, an integration authorisation, an image licence, or permission to list a supplier’s products. A supplier must pass every applicable gate below before an authorised operator may request activation.

## 1. Non-negotiable activation gate

A supplier remains **not configured** and cannot feed the public catalogue, create fulfilment promises, receive orders, or supply marketing assets until all required evidence is recorded and an authorised human approves the `supplier_activation` action.

| Gate                                | Required evidence                                                                                                                                | Owner                       | Result when absent                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------ |
| Legal trading identity              | Legal entity name, registered address, company number where applicable, VAT number where applicable, named trade contact                         | Commerce Operations         | Do not open or use an account              |
| Trade eligibility                   | Approved trade account and written confirmation of reseller eligibility for EquiProfile’s intended sales channels                                | Commerce Operations         | `PENDING_TRADE_APPROVAL`                   |
| Distribution and dropship authority | Written agreement covering permitted channels, territories, marketplace restrictions, dropship permissions, allocation and cancellation handling | Commerce Operations         | No product listing or order routing        |
| Commercial terms                    | Current trade cost, RRP/MAP policy, currency, VAT basis, credit/payment terms, MOQ, opening order, shipping charges and returns terms            | Commerce + Finance          | No price or margin decision                |
| Catalogue and identifiers           | Supplier SKU, EAN/GTIN where available, variant attributes, brand, product facts, current status and source timestamp                            | Commerce Operations         | Reject incomplete import records           |
| Availability and delivery           | Stock quantity/status, refresh cadence, feed freshness target, lead time, carrier method, delivery coverage and exception process                | Commerce Operations         | Show unavailable; make no delivery promise |
| Content rights                      | Written licence/permission for every image, logo, product description and document; provenance and expiry/withdrawal rules                       | Commerce Operations + Legal | `IMAGE_RIGHTS_REVIEW_REQUIRED`             |
| Technical connection                | Authenticated API/feed specification, sandbox/test process, rate limits, pagination, error semantics and credential-storage route                | Engineering                 | Connector stays disabled                   |
| Returns and customer care           | RMA path, damaged/incorrect-item handling, return window, reimbursement responsibility and customer-contact boundaries                           | Commerce Operations         | No automatic returns flow                  |
| Security and audit                  | Named data controller/processor roles if personal data is exchanged, least-privilege credentials, source audit trail and incident contact        | Engineering + Legal         | No credential provisioning                 |
| Human go-live approval              | Recorded review of every preceding artefact and approval for supplier activation                                                                 | Commerce lead               | Supplier remains `not_configured`          |

## 2. Supplier-specific readiness register

The public web pages below establish only the stated preliminary facts. They do not substitute for signed agreements or authenticated documentation.

| Supplier           | Current onboarding status                 | Publicly observed preliminary position                                                                                                                                                                                      | Required external next step                                                                                                                         | Connector rule                                                                                                                                        |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avasam             | `PENDING_AVASAM_ACCOUNT_CREDENTIALS`      | UK marketplace platform publicly promotes automated order processing, inventory synchronisation, CSV export and multichannel support. Public material reviewed does not grant this project authenticated seller API access. | Obtain approved seller account, authenticated API documentation/credentials, channel permission, product-data rights, fulfilment and returns terms. | `AvasamSupplierConnector` is intentionally `NOT_CONFIGURED`; it makes no network calls and rejects catalogue, stock, pricing and shipping operations. |
| Stable Environment | `PENDING_TRADE_APPROVAL`                  | Public trade information states dropshipping is available, low minimums apply and online retailers are welcome.                                                                                                             | Obtain approved trade/dropship agreement, current range feed, pricing/VAT data, image/content licence, stock cadence and returns process.           | No connector is enabled; manual contact and written approval are required first.                                                                      |
| Equetech           | `PENDING_TRADE_AND_IMAGE_RIGHTS_APPROVAL` | Stockist information indicates a trade stock-level ordering site, no order minimums, website-optimised images and dropship handling for out-of-stock items.                                                                 | Obtain trade approval and written image/text reuse permission with scope, plus current stock/price feed, delivery, returns and VAT terms.           | No connector is enabled; images and copy are `review_required` until written permission is recorded.                                                  |

## 3. Trade-account submission dossier

The Commerce Operations owner must assemble the following before submitting any supplier application.

| Dossier item         | Minimum contents                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Business profile     | Legal entity, trading name, Companies House number where applicable, VAT number where applicable, trading address, website, sales channels and named contact |
| Commercial narrative | Intended product categories, forecast volume stated as a non-binding estimate, fulfillment model, customer territory and whether dropshipping is requested   |
| Credit and finance   | Requested terms, VAT treatment questions, invoicing contact and any supplier references only where the supplier asks for them                                |
| Customer-care model  | Who handles pre-sale questions, delivery exceptions, defects, returns and refunds; escalation contact and response expectation                               |
| Compliance record    | Product-safety, recall, restricted-goods, age-gated, brand/MAP and insurance obligations to be checked against the supplier agreement                        |
| Channel declaration  | Own web store only unless a supplier has explicitly authorised marketplaces, social-commerce or any additional channel                                       |

**Do not submit credentials, tax records, identity documents, payment-card data or customer data to the code repository, issue tracker, source payload logs or browser-side configuration.** Use the approved secret/configuration route after trade approval.

## 4. Catalogue, price and stock data contract

Every source record must be traceable to a supplier and a source timestamp. Records lacking mandatory factual fields are rejected; an AI draft is never treated as a source of product facts.

| Field group   | Required before review                                                                                                             | Notes                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Identity      | Supplier SKU, brand, product title, variant title, EAN/GTIN where available                                                        | SKU and EAN/GTIN are used for deduplication; preserve source identifiers |
| Commercial    | Supplier cost, RRP/MAP where supplied, currency, VAT basis, pricing effective date                                                 | Store costs are confidential; do not send them to marketing systems      |
| Availability  | Quantity or supported availability state, source update timestamp, refresh SLA, back-order policy                                  | Stale or unavailable stock cannot be sold                                |
| Product facts | Supplier factual description, material/specification statements, care/safety information, category and any regulated-product flags | Preserve original provenance; no unsupported claims                      |
| Assets        | Image URL or delivered asset, alternative text, provenance, rights status, authorised scope and expiry/review date                 | No hotlinking or copying absent permission                               |
| Fulfilment    | Lead time, carrier/service, delivery territory, dispatch cut-off, tracking capability, returns/RMA route                           | Do not show promises until verified                                      |

## 5. Technical connection checklist

1. Obtain a supplier’s current API, CSV, XML, SFTP or portal-export documentation **after** commercial approval.
2. Record the permitted source type, authentication method, required IP allowlisting, rate limits, pagination, retry policy, schema version and support contact.
3. Store credentials only in server-side secrets/configuration. Browser code, source control, logs, exports and marketing payloads must contain no supplier credential.
4. Implement an inert connector first, followed by a sandbox or read-only connection test. Preserve raw source payload provenance, source timestamps and per-run accept/reject reports.
5. Run a controlled import into a non-public review queue. Validate identifiers, pricing, VAT assumptions, stock freshness, image rights and textual provenance.
6. Require explicit human approval for supplier activation, any public product publication, material factual change, price change outside policy and purchase commitment.
7. Revalidate stock and price server-side when a customer adds to cart or begins checkout. No browser-provided price, stock or delivery decision is authoritative.

## 6. Image and written-content rights record

For every authorised asset, retain a rights record containing the supplier, source URL or supplied file reference, product/variant scope, territory/channel scope, licence type, attribution requirement, expiry or review date, approved contact and evidence location. The default is `review_required`.

> **Equetech-specific caution.** Public availability of website-optimised images is not permission to copy them. Written consent must state the permitted images/text, channels, territory and duration before assets are downloaded, stored or published.

## 7. Approval record and ongoing review

| Approval event              | Required reviewers                          | Evidence to link                                                | Revalidation trigger                                        |
| --------------------------- | ------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| Trade account               | Commerce Operations                         | Account approval and terms                                      | Term renewal, channel expansion or entity change            |
| Dropship activation         | Commerce lead + Finance/Legal as applicable | Dropship and returns agreement                                  | Delivery/returns change or SLA breach                       |
| Technical source activation | Engineering + Commerce Operations           | API/feed documentation, safe test result, source schema mapping | Credential rotation, schema change or repeated sync failure |
| Image/content approval      | Commerce Operations + Legal as applicable   | Rights record and scope                                         | Licence expiry, complaint or asset change                   |
| Supplier activation         | Authorised Commerce approver                | Completed checklist and audit trail                             | Any material commercial, factual or compliance change       |
| Product publication         | Authorised Commerce approver                | Product approval, facts, inventory freshness, rights review     | Price, inventory, source or asset change                    |

## 8. External-only blockers at this stage

The software foundation is ready to hold and enforce the above gates. The following cannot be completed internally and therefore remain explicit external blockers:

- Avasam seller-account credentials and authenticated API documentation.
- Stable Environment trade/dropship approval and data/content/fulfilment terms.
- Equetech trade approval and written product-image/text rights permission.
- Supplier-specific VAT, delivery, tracking, returns and service-level terms.
- Any signed agreement authorising production order transmission.

## References

[1]: https://www.avasam.com/ "Avasam marketplace platform"
[2]: https://stable-environment.co.uk/ "Stable Environment"
[3]: https://www.equetech.com/pages/become-a-stockist "Equetech stockist programme"
