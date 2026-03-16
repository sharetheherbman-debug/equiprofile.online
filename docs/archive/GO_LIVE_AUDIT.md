# EquiProfile Go-Live Audit Report

**Date:** 2026-03-03  
**Branch:** `copilot/make-system-production-ready`

---

## 1. App Map

### Frontend Routes → Files

| Path                  | Component                                  | Auth Required    |
| --------------------- | ------------------------------------------ | ---------------- |
| `/`                   | `client/src/pages/Home.tsx`                | No               |
| `/features`           | `client/src/pages/Features.tsx`            | No               |
| `/pricing`            | `client/src/pages/Pricing.tsx`             | No               |
| `/about`              | `client/src/pages/About.tsx`               | No               |
| `/contact`            | `client/src/pages/Contact.tsx`             | No               |
| `/terms`              | `client/src/pages/TermsPage.tsx`           | No               |
| `/privacy`            | `client/src/pages/PrivacyPage.tsx`         | No               |
| `/login`              | `client/src/pages/auth/Login.tsx`          | No               |
| `/register`           | `client/src/pages/auth/Register.tsx`       | No               |
| `/forgot-password`    | `client/src/pages/auth/ForgotPassword.tsx` | No               |
| `/reset-password`     | `client/src/pages/auth/ResetPassword.tsx`  | No               |
| `/dashboard`          | `client/src/pages/Dashboard.tsx`           | Yes              |
| `/horses`             | `client/src/pages/Horses.tsx`              | Yes              |
| `/horses/new`         | `client/src/pages/HorseForm.tsx`           | Yes              |
| `/horses/:id/edit`    | `client/src/pages/HorseForm.tsx`           | Yes              |
| `/horses/:id`         | `client/src/pages/HorseDetail.tsx`         | Yes              |
| `/health`             | `client/src/pages/Health.tsx`              | Yes              |
| `/vaccinations`       | `client/src/pages/Vaccinations.tsx`        | Yes              |
| `/dental`             | `client/src/pages/DentalCare.tsx`          | Yes              |
| `/hoofcare`           | `client/src/pages/Hoofcare.tsx`            | Yes              |
| `/dewormings`         | `client/src/pages/Dewormings.tsx`          | Yes              |
| `/treatments`         | `client/src/pages/Treatments.tsx`          | Yes              |
| `/xrays`              | `client/src/pages/Xrays.tsx`               | Yes              |
| `/pedigree`           | `client/src/pages/Pedigree.tsx`            | Yes              |
| `/training`           | `client/src/pages/Training.tsx`            | Yes              |
| `/training-templates` | `client/src/pages/TrainingTemplates.tsx`   | Yes              |
| `/breeding`           | `client/src/pages/BreedingManagement.tsx`  | Yes              |
| `/lessons`            | `client/src/pages/LessonScheduling.tsx`    | Yes              |
| `/feeding`            | `client/src/pages/Feeding.tsx`             | Yes              |
| `/nutrition-plans`    | `client/src/pages/NutritionPlans.tsx`      | Yes              |
| `/nutrition-logs`     | `client/src/pages/NutritionLogs.tsx`       | Yes              |
| `/weather`            | `client/src/pages/Weather.tsx`             | Yes              |
| `/documents`          | `client/src/pages/Documents.tsx`           | Yes              |
| `/tasks`              | `client/src/pages/Tasks.tsx`               | Yes              |
| `/contacts`           | `client/src/pages/Contacts.tsx`            | Yes              |
| `/stable`             | `client/src/pages/Stable.tsx`              | Yes              |
| `/messages`           | `client/src/pages/Messages.tsx`            | Yes              |
| `/analytics`          | `client/src/pages/Analytics.tsx`           | Yes              |
| `/reports`            | `client/src/pages/Reports.tsx`             | Yes              |
| `/calendar`           | `client/src/pages/Calendar.tsx`            | Yes              |
| `/appointments`       | `client/src/pages/Appointments.tsx`        | Yes              |
| `/tags`               | `client/src/pages/Tags.tsx`                | Yes              |
| `/settings`           | `client/src/pages/Settings.tsx`            | Yes              |
| `/billing`            | `client/src/pages/BillingPage.tsx`         | Yes              |
| `/ai-chat`            | `client/src/pages/AIChat.tsx`              | Yes              |
| `/client/:clientId`   | `client/src/pages/ClientPortal.tsx`        | No               |
| `/admin`              | `client/src/pages/Admin.tsx`               | Yes (admin role) |

### Auth Flow

- **Login:** POST `/api/auth/login` → validates email+password → issues HttpOnly JWT cookie → redirects to `/dashboard`
- **Register:** POST `/api/auth/signup` → creates user with 7-day trial → issues HttpOnly JWT cookie → redirects to `/dashboard` (or Stripe checkout if plan intent)
- **Forgot Password:** POST `/api/auth/request-reset` → emails reset token link
- **Reset Password:** POST `/api/auth/reset-password` → validates token → updates hash
- **Logout:** POST `/api/auth/logout` → clears HttpOnly cookie
- **Auth Check:** tRPC `auth.me` query → reads JWT cookie via `server/_core/context.ts` → returns user object

Cookie settings: `httpOnly: true`, `secure: ENV.cookieSecure`, `sameSite: "lax"`, `maxAge: 30d`, `domain: ENV.cookieDomain`

### Backend Endpoints

| Method | Path                         | Purpose                     |
| ------ | ---------------------------- | --------------------------- |
| POST   | `/api/auth/signup`           | Register new user           |
| POST   | `/api/auth/login`            | Login                       |
| POST   | `/api/auth/logout`           | Logout                      |
| POST   | `/api/auth/request-reset`    | Request password reset      |
| POST   | `/api/auth/reset-password`   | Reset password with token   |
| GET    | `/api/auth/me`               | (via tRPC) Get current user |
| POST   | `/api/contact`               | Public contact form         |
| GET    | `/api/health`                | Detailed health check       |
| GET    | `/healthz`                   | Simple health check         |
| GET    | `/api/health/ping`           | Minimal ping                |
| GET    | `/api/version`               | Build info                  |
| GET    | `/api/system/config-status`  | Service config flags        |
| GET    | `/api/admin/status`          | Admin readiness report      |
| POST   | `/api/admin/send-test-email` | Test email (admin only)     |
| GET    | `/api/realtime/events`       | SSE stream (authenticated)  |
| GET    | `/api/realtime/stats`        | SSE stats (admin only)      |
| GET    | `/api/realtime/health`       | SSE health check            |
| POST   | `/api/webhooks/stripe`       | Stripe webhook              |
| GET    | `/api/webhooks/whatsapp`     | WhatsApp webhook verify     |
| POST   | `/api/webhooks/whatsapp`     | WhatsApp message handler    |
| ALL    | `/api/trpc/*`                | tRPC batch endpoint         |
| GET    | `/api/billing/*`             | Stripe billing routes       |

### Realtime Endpoints

- **SSE:** `GET /api/realtime/events` — authenticated, per-user channel push (`server/_core/realtime.ts`)

### DB Models (Auth + Core)

Schema lives in `drizzle/schema.ts`. Key tables:

- `users` — id, openId, email, passwordHash, name, role, subscriptionStatus, trialEndsAt, stripeCustomerId, stripeSubscriptionId, resetToken, resetTokenExpiry, isSuspended
- `horses` — per-user horse records
- `healthRecords`, `vaccinations`, `treatments`, `dentalRecords`, `hoofCareRecords`, `dewormings`, `xrays`
- `trainingLogs`, `trainingTemplates`, `breedingRecords`, `feedingPlans`, `nutritionLogs`
- `documents`, `tasks`, `contacts`, `stable`, `lessons`, `messages`
- `contactSubmissions` — public contact form entries
- `stripeEvents` — idempotency for Stripe webhooks

---

## 2. Feature Status

| Feature          | UI Entry Point     | Backend Endpoint                | Status     | Evidence                           |
| ---------------- | ------------------ | ------------------------------- | ---------- | ---------------------------------- |
| Landing page     | `/`                | —                               | ✅ WORKING | `Home.tsx`                         |
| Features page    | `/features`        | —                               | ✅ WORKING | `Features.tsx`                     |
| Pricing page     | `/pricing`         | —                               | ✅ WORKING | `Pricing.tsx`                      |
| About page       | `/about`           | —                               | ✅ WORKING | `About.tsx`                        |
| Contact form     | `/contact`         | POST `/api/contact`             | ✅ WORKING | `Contact.tsx`, `index.ts:617`      |
| Register (email) | `/register`        | POST `/api/auth/signup`         | ✅ WORKING | `Register.tsx`, `authRouter.ts:27` |
| Login (email)    | `/login`           | POST `/api/auth/login`          | ✅ WORKING | `Login.tsx`, `authRouter.ts:118`   |
| Forgot password  | `/forgot-password` | POST `/api/auth/request-reset`  | ✅ WORKING | `ForgotPassword.tsx`               |
| Reset password   | `/reset-password`  | POST `/api/auth/reset-password` | ✅ WORKING | `ResetPassword.tsx`                |
| Dashboard        | `/dashboard`       | tRPC queries                    | ✅ WORKING | `Dashboard.tsx`                    |
| Horse management | `/horses`          | tRPC `horses.*`                 | ✅ WORKING | `Horses.tsx`, `HorseForm.tsx`      |
| Health records   | `/health`          | tRPC `health.*`                 | ✅ WORKING | `Health.tsx`                       |
| Training         | `/training`        | tRPC `training.*`               | ✅ WORKING | `Training.tsx`                     |
| Feeding plans    | `/feeding`         | tRPC `feeding.*`                | ✅ WORKING | `Feeding.tsx`                      |
| Weather          | `/weather`         | Open-Meteo (no key needed)      | ✅ WORKING | `Weather.tsx`                      |
| Documents        | `/documents`       | tRPC `documents.*`              | ⚠️ PARTIAL | Uploads require S3 env vars        |
| AI Chat          | `/ai-chat`         | tRPC `ai.*`                     | ⚠️ PARTIAL | Requires OPENAI_API_KEY            |
| Billing          | `/billing`         | `/api/billing/*`                | ⚠️ PARTIAL | Requires Stripe env vars           |
| Admin panel      | `/admin`           | tRPC `admin.*`                  | ✅ WORKING | `Admin.tsx` (role-gated)           |
| SSE realtime     | (background)       | GET `/api/realtime/events`      | ✅ WORKING | `realtime.ts`                      |
| WhatsApp         | (server only)      | `/api/webhooks/whatsapp`        | ⚠️ PARTIAL | Requires WhatsApp env vars         |
| Cookie consent   | Landing page       | —                               | ✅ WORKING | `CookieConsent.tsx` (added)        |

---

## 3. Blockers

### P0 — Must fix before launch

| #    | Issue                                                                                                    | File                                 | Fix Applied                                                              |
| ---- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| P0-1 | Register page showed password + confirm-password on the same screen (violates one-input-per-screen rule) | `client/src/pages/auth/Register.tsx` | ✅ Split into separate steps (step 3: password, step 4: confirm + terms) |
| P0-2 | Admin console banner `🐴 EquiProfile Admin Commands` printed in production builds                        | `client/src/lib/adminToggle.ts`      | ✅ Wrapped in `import.meta.env.DEV` guard                                |
| P0-3 | "Part of AmarktAI Network" text in footer/auth not linked to `https://amarktai.com`                      | `Footer.tsx`, `AuthSplitLayout.tsx`  | ✅ Wrapped in `<a href="https://amarktai.com">`                          |
| P0-4 | No cookie consent banner on landing page                                                                 | —                                    | ✅ Added `CookieConsent.tsx` component                                   |
| P0-5 | Missing SEO/OpenGraph meta tags in `index.html`                                                          | `client/index.html`                  | ✅ Added canonical, OG, and Twitter Card tags                            |

### P1 — Fix before or shortly after launch

| #    | Issue                                                                                                                       | Notes                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| P1-1 | Stripe billing not functional until `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLIC_KEY` env vars are set | Add env vars in production          |
| P1-2 | Document uploads not functional until S3/storage env vars are configured                                                    | Set `ENABLE_UPLOADS=true` + S3 keys |
| P1-3 | AI Chat requires `OPENAI_API_KEY` or `HUGGINGFACE_API_KEY`                                                                  | Add env vars                        |
| P1-4 | Email (welcome, reset, contact) requires SMTP env vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)                              | Add env vars                        |
| P1-5 | `ADMIN_UNLOCK_PASSWORD` must be set to secure the admin panel                                                               | Add env var                         |
| P1-6 | `JWT_SECRET` / `COOKIE_SECRET` must be a strong random value                                                                | Ensure set in production            |

### P2 — Nice to have

| #    | Issue                                                                                       | Notes                                   |
| ---- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| P2-1 | `og-image.png` referenced in meta tags doesn't exist yet                                    | Create and add to `client/public/`      |
| P2-2 | CSP nonce injection for Vite-injected module scripts in dev mode may still produce warnings | Dev-only issue, not blocking production |
| P2-3 | WhatsApp integration requires Meta/WhatsApp env vars                                        | Optional feature                        |

---

## 4. Required Env Vars for Production

```bash
# Core (required)
DATABASE_URL=mysql://...
JWT_SECRET=<random 64-char string>
COOKIE_SECRET=<random 64-char string>
ADMIN_UNLOCK_PASSWORD=<strong password>
NODE_ENV=production

# Email (required for welcome/reset emails)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@equiprofile.online

# Stripe (required for billing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# AI (optional)
OPENAI_API_KEY=

# File Uploads (optional)
ENABLE_UPLOADS=false
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_S3_BUCKET=
```
