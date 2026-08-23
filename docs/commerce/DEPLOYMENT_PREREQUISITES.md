# Store Deployment Prerequisites

No deployment, DNS change, production migration, VPS access, live charge, or production configuration change is included in PR #44.

Before any Store activation, obtain signed supplier agreements, supplier credentials and feed documentation, image-use licences, shipping and returns terms, stock/price update expectations, UK VAT/tax operating decisions, approved storage configuration, Store-specific Stripe test and production credentials, a separately verified Stripe webhook secret, consent configuration for marketing events, and a production DNS/reverse-proxy plan for `shop.equiprofile.online`.

Apply `0022_commerce_foundation.sql` and `0023_commerce_lifecycle_integrity.sql` only through the approved environment migration process after a backup and disposable-environment rehearsal. Verify foreign-key compatibility with the target MySQL configuration before applying. Publish no product until its supplier facts, stock policy, margin policy, images and human approval are recorded.
