# Supplier Connector Specification

A supplier connector is server-side only. It implements authentication, connection testing, catalogue retrieval, single-product retrieval, inventory retrieval, pricing retrieval, shipping-profile retrieval, and synchronisation. Supported future transport families are REST, GraphQL, CSV, XML, SFTP, authorised scheduled-file import, and manual administrative CSV import.

Every imported record must preserve supplier SKU, EAN/GTIN when present, source timestamp, factual source payload, supplier cost, availability, lead time, and provenance. The connector must normalise identifiers before deduplication, record each sync run, and reject malformed or duplicate supplier SKU records. It must never hotlink images or publish a product with `IMAGE_RIGHTS_REVIEW_REQUIRED`.

The deterministic Synthetic Development Supplier exercises only development records. It is blocked in production and remains excluded from the public catalogue even after a review action. It proves ingestion and governance paths; it is not a commercial supplier, payment simulation, or fulfilment promise.

# AI Product Manager

The Product Manager service normalises supplier inputs, detects SKU/EAN/title duplicates, scores equestrian relevance, data completeness, freshness, margin potential, and duplicate risk, then produces a price proposal that respects configured minimum margin and maximum movement rules. It can request copy enrichment only through the existing server-side AI abstraction. The enrichment prompt receives factual source data and explicitly prohibits invented specifications, certifications, health claims, or delivery promises.

Every first publication, supplier activation, major factual change, abnormal price change, or purchasing commitment requires human approval. Product Manager output is a proposal, not a publication. Important system, AI, and human actions must be written to Product Manager action and audit records.
