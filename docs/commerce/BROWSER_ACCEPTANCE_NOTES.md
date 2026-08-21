# Browser Acceptance Notes

## Local static Shop preview

The production-built Shop artifact rendered at `http://localhost:4174/` in the sandbox browser. The public header, Store identity, search control, category control, Cart link, governed provenance message, empty cart state, and footer safety statements rendered at desktop width.

The catalogue remained in a loading state because static preview has no authenticated backend/API, and the full local server could not start without deliberately absent local `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_UNLOCK_PASSWORD`. This is an environment-configuration blocker for authenticated browser journeys, not a claim that API flows were exercised. The Shop build completed successfully before the preview.

No production system, payment system, supplier system, or external repository was accessed.
