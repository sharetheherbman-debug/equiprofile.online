# Browser Acceptance Notes

## Local static Shop preview

The production-built Shop artifact rendered at `http://localhost:4174/` in the sandbox browser. The public header, Store identity, search control, category control, Cart link, governed provenance message, empty cart state, and footer safety statements rendered at desktop width.

The catalogue remained in a loading state because static preview has no authenticated backend/API, and the full local server could not start without deliberately absent local `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_UNLOCK_PASSWORD`. This is an environment-configuration blocker for authenticated browser journeys, not a claim that API flows were exercised. The Shop build completed successfully before the preview.

No production system, payment system, supplier system, or external repository was accessed.

## 2026-08-21 — disposable customer catalogue check

The Shop bundle rendered successfully against the isolated `equiprofile_acceptance` database. Before any approved product existed, the customer catalogue showed **“No customer products are published yet”** and explicitly stated that development and unapproved supplier records remain excluded until source facts, stock freshness, image rights, and human approval are verified. The empty cart made no delivery or payment promise. This is a truthful governed-catalogue result, not a missing-data claim.

## 2026-08-21 — local session-handling observation

The synthetic teacher session persisted across the disposable bundle switch and was redirected to onboarding under the Management bundle. This is normal shared-cookie behaviour in the local acceptance host. The next Commerce-admin check will explicitly clear that local-only session before restoring the synthetic owner-admin account; no production session is involved.

## 2026-08-21 — owner-session customer surface check

After restoring the synthetic local owner-admin session and reopening the Shop bundle, the customer surface still displayed the same truthful empty-catalogue boundary. Administrative authentication does not bypass public publication controls: no product became visible merely because an administrator was signed in.

## 2026-08-21 — Commerce admin-status diagnosis in progress

The synthetic owner-admin was signed in and the supported local `adminUnlock.submitPassword` procedure returned `success: true` with an eight-hour expiry. After reloading the Shop admin view, however, the UI still stated that the admin session was expired. This is logged as a real client/admin-status integration defect under investigation, not as a successful Commerce-admin acceptance result.
