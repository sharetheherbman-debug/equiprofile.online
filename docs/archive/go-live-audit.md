# EquiProfile Go-Live Audit

## Overview

This document describes the automated go-live audit for EquiProfile. The audit runs
post-deployment and checks for blockers that would prevent going live once API keys
are entered.

## Automated Audit Script

**Location:** `/scripts/go_live_audit.sh`

Run it against any environment:

```bash
# Local dev
BASE_URL=http://localhost:3000 bash scripts/go_live_audit.sh

# Staging / production
BASE_URL=https://equiprofile.online bash scripts/go_live_audit.sh
```

The script exits `0` on success, non-zero (`1`) if any blocker is found.

---

## Checks Performed

| #   | Check                     | Pass Condition                                                                                                        |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **Server health**         | `GET /api/health` returns HTTP 200 with JSON                                                                          |
| 2   | **DB connectivity**       | Health JSON includes `db: true`                                                                                       |
| 3   | **Migrations**            | `__drizzle_migrations` table present in DB (requires DB access)                                                       |
| 4   | **Auth – login valid**    | `POST /api/auth/login` with seeded user → 200 + `set-cookie`                                                          |
| 5   | **Auth – login invalid**  | `POST /api/auth/login` with wrong creds → 401                                                                         |
| 6   | **Auth – /auth/me JSON**  | `GET /api/auth/me` with valid cookie → JSON (not HTML)                                                                |
| 7   | **Pricing sanity**        | `GET /api/trpc/billing.getPricing` returns `pro.monthly.amount ≥ 1000` (£10) and `stable.monthly.amount ≥ 3000` (£30) |
| 8   | **No £0 pricing**         | All displayed prices > £0                                                                                             |
| 9   | **Stripe config warning** | Warns if `ENABLE_STRIPE=true` but price IDs missing                                                                   |
| 10  | **Required env vars**     | Lists any missing critical env vars (no secrets printed)                                                              |
| 11  | **Static assets**         | Hero video, CSS bundle, breadcrumb image all return 200                                                               |
| 12  | **SPA routing**           | `/api/` routes return JSON, not HTML (nginx fallback check)                                                           |

---

## Required Environment Variables

### Always Required

| Variable       | Description                                    |
| -------------- | ---------------------------------------------- |
| `DATABASE_URL` | MySQL connection string                        |
| `JWT_SECRET`   | Session signing key (≥32 chars)                |
| `BASE_URL`     | Public URL (e.g. `https://equiprofile.online`) |

### When `ENABLE_STRIPE=true`

| Variable                         | Description                        |
| -------------------------------- | ---------------------------------- |
| `STRIPE_SECRET_KEY`              | Stripe secret key (`sk_live_…`)    |
| `STRIPE_WEBHOOK_SECRET`          | Webhook signing secret (`whsec_…`) |
| `STRIPE_MONTHLY_PRICE_ID`        | Pro monthly price ID               |
| `STRIPE_YEARLY_PRICE_ID`         | Pro yearly price ID                |
| `STRIPE_STABLE_MONTHLY_PRICE_ID` | Stable monthly price ID            |
| `STRIPE_STABLE_YEARLY_PRICE_ID`  | Stable yearly price ID             |

### When `ENABLE_UPLOADS=true`

| Variable                 | Description           |
| ------------------------ | --------------------- |
| `BUILT_IN_FORGE_API_URL` | Forge storage API URL |
| `BUILT_IN_FORGE_API_KEY` | Forge storage API key |

### Optional (Email/WhatsApp)

| Variable                | Description                   |
| ----------------------- | ----------------------------- |
| `SMTP_HOST`             | SMTP server host              |
| `SMTP_USER`             | SMTP username                 |
| `SMTP_PASSWORD`         | SMTP password                 |
| `ENABLE_WHATSAPP`       | Set `true` to enable WhatsApp |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API token      |

---

## Default Pricing (GBP)

Even without Stripe configured the UI **must** display:

| Plan             | Monthly         | Yearly          |
| ---------------- | --------------- | --------------- |
| Individual (Pro) | **£10 / month** | **£100 / year** |
| Stable           | **£30 / month** | **£300 / year** |

These defaults are defined in `shared/pricing.ts` and are used by both the server
(`server/stripe.ts`) and the client (`client/src/pages/Pricing.tsx`) as fallbacks.

---

## Sample Audit Output

```
====================================================
 EquiProfile Go-Live Audit
 Target: https://equiprofile.online
 Time:   2026-03-02T08:42:15Z
====================================================

[PASS] Server health check (200 JSON)
[PASS] DB connectivity (db: true)
[PASS] Auth login returns 200 for valid creds
[PASS] Auth login returns 401 for invalid creds
[PASS] /api/auth/me returns JSON with cookie
[PASS] Pricing – Pro monthly £10.00 (≥ £10)
[PASS] Pricing – Stable monthly £30.00 (≥ £30)
[WARN] Stripe not configured – default prices shown (not a blocker)
[PASS] Static asset: /assets/marketing/hero/hero.mp4 (200)
[PASS] Static asset: /images/hero-horse.jpg (200)
[PASS] /api/ route returns JSON not HTML

====================================================
 BLOCKERS: 0
 WARNINGS: 1
 Result:   PASS
====================================================
```

---

## Post-Deploy Checklist

- [ ] Server starts without errors (`npm start`)
- [ ] `GET /api/health` returns `{"status":"ok"}`
- [ ] Login / register flows complete successfully
- [ ] Pricing page shows £10/£100 and £30/£300 (not £0)
- [ ] Footer has no "Dashboard" link
- [ ] All nav links return 200 (`/`, `/about`, `/features`, `/pricing`, `/contact`)
- [ ] Stripe: enter keys and price IDs, re-run audit
- [ ] Run `bash scripts/go_live_audit.sh` and verify exit code 0
