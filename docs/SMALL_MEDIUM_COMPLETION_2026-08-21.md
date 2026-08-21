# EquiProfile Core / Academy / Shop small-medium completion handoff — 21 August 2026

## Branch

`phase-1/small-medium-completion`

Base checkpoint:

`40995fdfe7afbff5e723e59e6a6419ecf6329d3c`

This branch is isolated from Manus draft PR #44. No merge or production action is authorised.

## Completed in this branch

### Core → standalone Marketing protocol alignment

`server/_core/marketingPublisher.ts` now uses the standalone Marketing application's canonical Application Connector protocol:

- `X-Application-Id`
- `X-Application-Key`
- `X-Application-Timestamp`
- `X-Application-Nonce`
- `X-Application-Signature`
- canonical JSON HMAC-SHA256 message: `timestamp + newline + nonce + newline + canonical body`
- canonical endpoint: `/api/v1/application-connectors/events/conversion`

The former incompatible `X-EquiProfile-*` protocol is no longer used by this publisher.

The allow-list now has explicit `management`, `academy` and `shop` product lines. Sensitive/private fields remain rejected, explicit marketing consent remains required, and remote Marketing failure remains failure-contained so Core transactions do not fail solely because Marketing is unavailable.

`server/marketingPublisher.test.ts` locks the exact endpoint, headers and recomputed HMAC signature.

### Core environment contract

`.env.example` now documents the same canonical Application Connector variables as standalone Marketing:

- `MARKETING_APP_URL`
- `MARKETING_API_URL`
- `HOST_APP_ID`
- `HOST_APP_CONNECTOR_KEY`
- legacy compatibility aliases `EQUIPROFILE_APP_ID` / `EQUIPROFILE_CONNECTOR_KEY`

The stale separate `MARKETING_CONNECTOR_SIGNING_SECRET` contract has been removed from the Core example.

### Acceptance truth

`docs/academy/ACADEMY_ACCEPTANCE.md` now truthfully records the current factual-review state:

- 105 lessons total
- 4 `NOT_MATERIAL_FACT_CHECK_REQUIRED`
- 101 `SOURCE_MAPPED_REQUIRES_SPECIFIC_CLAIM_REVIEW`
- release status: **NOT READY TO DEPLOY**

It no longer represents source mapping/structural validation as 105/105 factual acceptance.

It also records the remaining authenticated Student/Teacher/Owner/Tutor acceptance gaps and the latest Manus stopping validation of 25 test files / 182 tests.

`docs/commerce/COMMERCE_ACCEPTANCE.md` now distinguishes implemented customer/admin software from external supplier/payment activation and the remaining final-Core/browser/provider tests.

## Confirmed existing work to preserve from the base

The base branch already contains substantial implemented work that must not be redone or discarded:

- canonical Academy naming/domain direction;
- real Academy invitation email delivery/resend with persisted outcomes;
- provider-neutral Core AI interface;
- Academy Stripe TEST-only software path;
- Shop catalogue/product/cart/order/tracking/return/refund customer views;
- Commerce Admin operational surfaces;
- return-policy/quantity hardening;
- Store payment reconciliation module;
- clean single-Core installation documentation;
- 15 pathways / 105 lessons / 334 knowledge checks / 198 competency references.

## Large work deliberately left for the next pass

### 1. Academy lesson factual acceptance

The principal large task is the explicit source-to-claim review of the remaining **101 lessons**. Do not bulk-mark them PASS. Each material factual/numerical/legal/clinical/safety/riding/competition claim must be checked against a suitable current source or rewritten as an appropriately variable professional-guidance principle.

### 2. Final single-Core reconciliation

Reconcile the newer Management rescue branch with this Academy/Shop Core branch into one final Core release candidate. Preserve the best/current Management code and import Academy/Shop without replacing Management with this older shared snapshot wholesale.

### 3. Full role acceptance

Complete authenticated acceptance for:

- Student/Teacher assignments/tasks/feedback;
- groups/classes;
- scheduling/calendar;
- Academy Owner curriculum/admin/activity/reporting;
- provider-enabled Tutor guided questioning/reading adaptation;
- Academy onboarding batch invitation partial-failure UI truth.

### 4. Runtime Marketing event wiring

The canonical publisher contract is now correct, but current application transaction paths still need to emit the approved events during the final Core integration. Wire trusted server/provider events only (for example paid conversions from signed webhooks). Do not publish private student/health/supplier-cost/payment-secret data.

### 5. Final Shop acceptance

Using synthetic/authorised data and Stripe TEST credentials, prove the complete catalogue → product → cart → checkout → paid webhook → order → fulfilment/tracking → return/refund lifecycle and Commerce Admin operational journey, including concurrency/race cases.

## External-only blockers after internal work

- real supplier trade/API/feed credentials and usage rights;
- real supplier shipping/fulfilment agreements;
- Stripe TEST/live provider credentials where not already configured;
- SMTP/live provider acceptance;
- production DNS/TLS/reverse-proxy/device acceptance.

These external blockers do not justify unfinished internal software work.
