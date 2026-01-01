# Feature Gap Analysis & Implementation Plan

**Date:** January 1, 2026  
**Purpose:** Map all requested features from production audit requirements to current implementation status

**Legend:**
- ✅ **Implemented** - Feature complete and working
- 🟡 **Partial** - Feature partially implemented, needs completion
- ❌ **Missing** - Feature not implemented, needs creation

---

## DEPLOYMENT READINESS

### 1.1 Environment Variables (.env.example)
**Status:** 🟡 Partial

**Current State:**
- `.env.example` exists with most vars
- Has `ADMIN_UNLOCK_PASSWORD=ashmor12@`
- Missing some recommended vars

**Gaps:**
- ❌ Missing `LOG_FILE_PATH` documentation
- ❌ Missing SMTP password field (has USER but not PASSWORD)
- ❌ Missing complete Stripe webhook example

**Files to Change:**
- `.env.example` - Add missing vars with clear comments

**Plan:**
1. Add `LOG_FILE_PATH=/var/log/equiprofile/app.log`
2. Add `SMTP_PASSWORD=your_app_password`
3. Add all Stripe vars with correct naming
4. Add OpenAI key with usage note
5. Verify all production-critical vars documented

---

### 1.2 Production Checklist Script
**Status:** ❌ Missing

**Required:**
- `/scripts/prod_checklist.sh` that verifies:
  - Node version >= 18
  - npm install succeeds
  - npm build succeeds
  - DB connectivity test
  - Migrations applied check
  - Critical env vars existence check

**Files to Create:**
- `/scripts/prod_checklist.sh`

**Plan:**
1. Create bash script with Node version check
2. Add DB connection test (mysql client)
3. Add env var validation
4. Add build test
5. Add migration check via drizzle-kit
6. Make executable with clear error messages

---

### 1.3 Database Migrations
**Status:** ✅ Implemented

**Current State:**
- Drizzle migrations in `drizzle/` directory
- `pnpm db:push` works
- Migrations tracked in `_journal.json`

**No gaps identified.**

---

### 1.4 Stripe Webhook Handling
**Status:** 🟡 Partial

**Current State:**
- Webhook endpoint exists in `server/_core/index.ts`
- Signature verification implemented
- Basic event handling present

**Gaps:**
- ❌ No idempotency check (duplicate events not prevented)
- ❌ Missing `stripeEvents` table for event tracking
- ❌ Not all event types handled

**Files to Change:**
- `drizzle/schema.ts` - Add `stripeEvents` table
- `server/_core/index.ts` - Add idempotency check
- `server/stripe.ts` - Add missing event handlers

**Plan:**
1. Create `stripeEvents` table with eventId unique index
2. Check for duplicate eventId before processing
3. Add handlers for all 5 critical events
4. Add error logging

---

### 1.5 Logging
**Status:** ❌ Missing

**Current State:**
- Using console.log() throughout
- No structured logging
- No log file output

**Gaps:**
- ❌ No Winston or Pino setup
- ❌ No LOG_FILE_PATH usage
- ❌ Secrets might be logged

**Files to Change:**
- `server/_core/logger.ts` - Create new file
- `server/_core/index.ts` - Import and use logger
- All server files - Replace console.log

**Plan:**
1. Install Winston (already in deps? Check)
2. Create logger.ts with Winston config
3. Configure file transport to LOG_FILE_PATH
4. Add log levels (error, warn, info, debug)
5. Add secret redaction
6. Replace console.log throughout server

---

### 1.6 PM2 Configuration
**Status:** 🟡 Partial

**Current State:**
- `ecosystem.config.js` exists
- Basic PM2 config present

**Gaps:**
- ❌ Not optimized for low-memory VPS
- ❌ No documentation for scaling
- ❌ Missing env_production section

**Files to Change:**
- `ecosystem.config.js` - Update for low-memory

**Plan:**
1. Set `instances: 1` default
2. Add comment for scaling to 2 if RAM >= 4GB
3. Add env_production section
4. Add log paths configuration
5. Document in DEPLOYMENT.md

---

## UI MODERNIZATION

### 2.1 Landing Page Redesign
**Status:** 🟡 Partial

**Current State:**
- `client/src/pages/Home.tsx` exists
- Basic landing page present

**Gaps:**
- ❌ Not modern/premium design
- ❌ No social proof section
- ❌ Images might be missing/broken
- ❌ Not fully mobile optimized

**Files to Change:**
- `client/src/pages/Home.tsx` - Complete redesign

**Plan:**
1. Modern hero section with value prop
2. Add social proof (testimonials/trust badges)
3. Feature highlights with icons
4. Better imagery (local assets or safe placeholders)
5. Mobile responsive polish
6. Fast load optimization
7. Working CTA buttons

---

### 2.2 Pricing Page
**Status:** ❌ Missing

**Current State:**
- No dedicated pricing page
- Billing logic exists in routers

**Files to Create:**
- `client/src/pages/Pricing.tsx`

**Plan:**
1. Create Pricing.tsx component
2. Feature comparison table (Trial/Pro/Stable)
3. Stripe checkout integration
4. Show current plan if subscribed
5. "Manage Billing" button → Customer Portal
6. Mobile responsive design
7. Add route to App.tsx

---

### 2.3 Dashboard Improvements
**Status:** 🟡 Partial

**Current State:**
- `client/src/pages/Dashboard.tsx` exists
- Shows basic stats

**Gaps:**
- ❌ No Quick Actions panel
- ❌ No dark mode toggle
- ❌ Accessibility issues

**Files to Change:**
- `client/src/pages/Dashboard.tsx` - Add Quick Actions
- `client/src/main.tsx` - Add ThemeProvider
- Create `client/src/components/ThemeToggle.tsx`

**Plan:**
1. Add Quick Actions panel with 6 buttons
2. Implement dark mode:
   - Add ThemeProvider in main.tsx
   - Create theme toggle component (sun/moon icon)
   - Ensure localStorage persistence
   - Test light/dark/system modes
3. Accessibility improvements:
   - Keyboard navigation
   - Visible focus states
   - Aria labels for icon buttons
   - Color contrast verification

---

## ENHANCED FEATURES

### 3.1 Competition Results Visualization
**Status:** ❌ Missing

**Current State:**
- `client/src/pages/Analytics.tsx` exists but empty
- Backend procedures exist

**Gaps:**
- ❌ No charts implemented
- ❌ Empty placeholder page

**Files to Change:**
- `client/src/pages/Analytics.tsx` - Add real charts
- `server/routers.ts` - Add missing analytics procedures

**Plan:**
1. Add backend procedures:
   - `getPerformanceOverTime` (line chart data)
   - `getPlacementsDistribution` (pie chart data)
   - `getScoresTrend` (area chart data)
   - `getPerHorseComparison` (bar chart data)
2. Wire up UI with Recharts:
   - Performance Over Time (line)
   - Placements Distribution (pie)
   - Scores Trend (area)
   - Per-Horse Comparison (bar)
3. Handle empty states
4. Add filters (date range, horse selection)

---

### 3.2 Medical Passport Printable View
**Status:** ❌ Missing

**Current State:**
- Health records exist
- No medical passport feature

**Files to Create:**
- `client/src/components/MedicalPassport.tsx`
- `client/src/pages/ShareMedical.tsx`

**Files to Change:**
- `server/routers.ts` - Add medicalPassport procedures

**Plan:**
1. Backend:
   - Add `healthRecords.getMedicalPassport` procedure
   - Add share link generation with token
   - Add `/share/medical/:horseId` route
2. Frontend:
   - Create MedicalPassport component
   - Pull vaccinations, dewormings, health records
   - Generate QR code (using qrcode library)
   - Add print CSS (@media print)
   - Add PDF export (jspdf + html2canvas)
   - Download PDF button

---

### 3.3 Feed Cost Optimization
**Status:** ❌ Missing

**Current State:**
- Feed costs tracked
- No optimization engine

**Files to Change:**
- `server/routers.ts` - Add optimization procedure
- `client/src/pages/Feeding.tsx` or Analytics

**Plan:**
1. Backend:
   - Add `feedCosts.getOptimizationRecommendations`
   - Aggregate costs by feedType, brand
   - Identify top cost drivers
   - Calculate potential savings
   - Generate recommendations (rules-based)
2. Frontend:
   - Add "Feed Optimization" section
   - Display top 3 cost drivers
   - Show potential savings
   - List recommended actions

---

### 3.4 Training Program Templates
**Status:** 🟡 Partial

**Current State:**
- Schema exists
- Partial backend

**Gaps:**
- ❌ No UI
- ❌ Incomplete CRUD

**Files to Create:**
- `client/src/pages/TrainingTemplates.tsx`

**Files to Change:**
- `server/routers.ts` - Complete CRUD procedures

**Plan:**
1. Backend:
   - Add `update`, `delete`, `duplicate` procedures
   - Add `applyToHorse` with session generation
2. Frontend:
   - Create TrainingTemplates.tsx
   - List templates (filterable)
   - Create/edit form
   - Duplicate button
   - Delete with confirmation
   - Apply Template flow (select horse → generate sessions)

---

### 3.5 Automated Report Generation
**Status:** ❌ Missing

**Current State:**
- `client/src/pages/Reports.tsx` exists as placeholder
- Backend partial

**Gaps:**
- ❌ No report builder UI
- ❌ No PDF generation
- ❌ No scheduling system
- ❌ No email delivery

**Files to Change:**
- `client/src/pages/Reports.tsx` - Full implementation
- `server/routers.ts` - Complete reports procedures
- Create `/scripts/run_scheduled_reports.js`
- `drizzle/schema.ts` - Verify reportSchedules table

**Plan:**
1. Backend:
   - Add `reports.generate` (PDF generation with jspdf)
   - Add `createSchedule`, `updateSchedule`, `deleteSchedule`
   - Add `listSchedules`
2. Frontend:
   - Report builder UI (select horse, date range, sections)
   - Generate PDF button
   - Download PDF
   - Schedule management UI
3. Scheduled reports:
   - Create run_scheduled_reports.js
   - Query reportSchedules
   - Generate and email reports
   - Document cron setup

---

### 3.6 CSV Export for All Data Types
**Status:** ❌ Missing

**Current State:**
- No CSV export procedures

**Files to Change:**
- `server/routers.ts` - Add exportCSV to each router

**Plan:**
1. Add procedures:
   - `horses.exportCSV`
   - `healthRecords.exportCSV`
   - `training.exportCSV`
   - `competitions.exportCSV`
   - `feedCosts.exportCSV`
   - `breeding.exportCSV`
   - `foals.exportCSV`
   - `documents.exportCSV` (metadata)
   - `reports.exportCSV` (metadata)
2. Generate CSV with proper headers
3. Return as downloadable file
4. Ensure user-scoped data only
5. Add "Export CSV" button to each list page

---

## MOBILE APP MVPS

### 4.1-4.5 Mobile Apps
**Status:** ❌ Missing

**Current State:**
- No mobile directory

**Directories to Create:**
- `/mobile/ios/` - Swift/SwiftUI project
- `/mobile/android/` - Kotlin/Jetpack Compose project

**Docs to Create:**
- `/docs/MOBILE_SYNC.md`
- `/docs/MOBILE_BUILD.md`

**Plan:**
1. iOS MVP:
   - Create Xcode project structure
   - 5 screens (Login, Horse List, Horse Detail, Add Health Record, Medical Passport)
   - URLSession for API calls
   - Camera integration stub
   - CoreData for offline
   - Push notification placeholders
2. Android MVP:
   - Create Gradle project structure
   - 5 screens (same as iOS)
   - Retrofit/Ktor for API
   - Camera integration stub
   - Room database for offline
   - FCM placeholders
3. Documentation:
   - MOBILE_SYNC.md - Offline-first strategy
   - MOBILE_BUILD.md - Build instructions

---

## ADVANCED FEATURES

### 5.1 Multi-Language Support
**Status:** 🟡 Partial

**Current State:**
- i18next installed
- Translation files exist (en, fr, de, es)
- No UI switcher

**Gaps:**
- ❌ Translations incomplete
- ❌ No language switcher UI
- ❌ Not all strings use t()

**Files to Change:**
- `client/src/i18n/locales/*.json` - Complete translations
- Create `client/src/components/LanguageSwitcher.tsx`
- `client/src/components/DashboardLayout.tsx` - Add switcher

**Plan:**
1. Complete translations for FR, DE, ES
2. Create LanguageSwitcher component (dropdown)
3. Save preference to user profile (update users.language)
4. Persist in localStorage for guests
5. Ensure all strings use t('key')
6. Test switching without reload

---

### 5.2 Advanced Analytics Dashboard
**Status:** ❌ Missing (covered in 3.1)

See section 3.1 - Competition Results Visualization

---

### 5.3 Breeding Management Module
**Status:** 🟡 Partial

**Current State:**
- Schema exists
- Partial backend

**Gaps:**
- ❌ No UI
- ❌ Incomplete CRUD

**Files to Create:**
- `client/src/pages/Breeding.tsx`

**Files to Change:**
- `server/routers.ts` - Complete breeding procedures

**Plan:**
1. Backend:
   - Add `update`, `delete` for breeding
   - Add `confirmPregnancy`
   - Add `update`, `delete` for foals
   - Add `recordMilestone`
2. Frontend:
   - Create Breeding.tsx
   - Breeding records CRUD
   - Foals CRUD
   - Confirm pregnancy flow
   - Milestones tracking
   - Link foal to horse profile

---

### 5.4 Lesson Scheduling
**Status:** ❌ Missing

**Current State:**
- No lesson scheduling

**Files to Create:**
- `client/src/pages/Lessons.tsx`
- `drizzle/schema.ts` - Add tables if missing

**Files to Change:**
- `server/routers.ts` - Add lessons router

**Plan:**
1. Schema:
   - `trainerAvailability` table (verify exists)
   - `lessonBookings` table (verify exists)
2. Backend:
   - `lessons.createAvailability`
   - `lessons.bookLesson`
   - `lessons.listBookings`
   - `lessons.markCompleted`
   - `lessons.markCancelled`
3. Frontend:
   - Lessons.tsx with calendar UI
   - Trainer availability management
   - Booking flow
   - Status tracking

---

### 5.5 Client Portal for Owners
**Status:** ❌ Missing

**Current State:**
- No client portal

**Files to Create:**
- `client/src/pages/ClientPortal.tsx`
- Share link routing

**Files to Change:**
- `server/routers.ts` - Add clientPortal router

**Plan:**
1. Backend:
   - `clientPortal.getHorseData` (read-only)
   - Share link token validation
2. Frontend:
   - ClientPortal.tsx (read-only views)
   - Horse profile (read-only)
   - Health records (filtered)
   - Training logs (read-only)
   - Competition results
   - Documents (filtered)
   - Reports (view/download)

---

### 5.6 Integration API (REST)
**Status:** ❌ Missing

**Current State:**
- Only tRPC endpoints
- No REST API

**Files to Create:**
- `server/api/v1/horses.ts`
- `server/api/v1/healthRecords.ts`
- `server/api/v1/trainingSessions.ts`
- `server/api/middleware/apiKeyAuth.ts`

**Files to Change:**
- `server/_core/index.ts` - Mount REST routes
- `drizzle/schema.ts` - Verify apiKeys table

**Plan:**
1. Create API key middleware:
   - Extract Bearer token
   - Hash and verify against apiKeys table
   - Check isActive and expiresAt
   - Rate limiting per key
2. Create REST endpoints:
   - GET /api/v1/horses
   - GET /api/v1/horses/:id
   - GET /api/v1/health-records/:horseId
   - GET /api/v1/training-sessions/:horseId
3. Documentation:
   - Create `/docs/API_REFERENCE.md`

---

### 5.7 White-Label Branding
**Status:** 🟡 Partial

**Current State:**
- Schema has branding fields in stables
- No UI

**Gaps:**
- ❌ No branding settings UI
- ❌ No CSS variable application

**Files to Change:**
- `client/src/pages/Admin.tsx` - Add Branding tab
- `server/routers.ts` - Add branding procedures
- `client/src/App.tsx` - Apply branding

**Plan:**
1. Backend:
   - `stables.updateBranding`
   - `stables.getBranding`
2. Frontend:
   - Admin panel Branding tab
   - Logo upload form
   - Color pickers (primary, secondary)
   - Custom domain field
   - Apply branding via CSS variables
   - Show stable logo in header
3. Documentation:
   - Create `/docs/WHITE_LABEL_GUIDE.md`

---

## ADMIN PANEL ENHANCEMENT

### 6.1 Admin Panel - Full 6 Tabs
**Status:** 🟡 Partial

**Current State:**
- `client/src/pages/Admin.tsx` exists
- Some admin procedures exist

**Gaps:**
- ❌ Not organized into 6 tabs
- ❌ Missing several features

**Files to Change:**
- `client/src/pages/Admin.tsx` - Complete rewrite with tabs

**Plan:**

#### Tab 1: Users
- List users (paginated, searchable)
- Suspend/unsuspend
- Delete user
- Change role
- Bulk actions
- Already have backend: ✅

#### Tab 2: Activity Logs
- List activity logs (filterable)
- Export CSV
- Already have backend: ✅

#### Tab 3: System Settings
- Rate limits config
- SMTP test
- Feature flags
- OpenAI key management (view prefix, rotate)
- Already have backend: ✅

#### Tab 4: Stripe Status
- List subscriptions
- Show customer IDs
- Link to Stripe dashboard
- Backend needs: `admin.listSubscriptions`

#### Tab 5: Environment Health
- Node version
- DB status
- Env vars check
- Memory usage
- Uptime
- Already have backend: `getEnvHealth` ✅

#### Tab 6: API Keys
- List keys (prefix only)
- Create key
- Revoke key
- Rotate key
- Already have backend: ✅

**Enforcement:**
- Server: Already using adminUnlockedProcedure ✅
- Client: Add session timer, auto-logout ❌

---

## QUALITY GATES

### 7.1 Tests
**Status:** 🟡 Partial

**Current State:**
- Some tests exist
- Need to run and verify

**Plan:**
1. Run `npm test`
2. Fix failing tests
3. Add smoke tests for new features (if time)

---

### 7.2 TypeScript Check
**Status:** ❌ Failing

**Current State:**
- `npm run check` has errors

**Plan:**
1. Run `npm run check`
2. Fix all TypeScript errors
3. Ensure 0 errors

---

### 7.3 Build
**Status:** Unknown

**Plan:**
1. Run `npm run build`
2. Fix build errors
3. Verify dist/ output

---

### 7.4-7.5 Manual Testing
**Status:** ❌ Not done

**Plan:**
1. Test critical flows:
   - Signup/login
   - Dashboard loads
   - Add horse
   - Add health record
   - Admin unlock
   - Stripe checkout
   - Export CSV
   - Generate PDF

---

## DOCUMENTATION

### README.md Update
**Status:** 🟡 Partial

**Current State:**
- README.md exists and comprehensive
- Needs updates for new features

**Plan:**
1. Update feature list
2. Add deployment steps
3. Document admin unlock
4. Add all new features

---

## SUMMARY BY PRIORITY

### CRITICAL (Must Have)
1. ❌ Stripe webhook idempotency
2. ❌ Logging system (Winston)
3. ❌ Production checklist script
4. ❌ TypeScript errors fixed
5. ❌ Build succeeds
6. ✅ Admin unlock (already working)

### HIGH (Important for Production)
1. ❌ Pricing page
2. ❌ Dashboard Quick Actions + Dark Mode
3. ❌ Competition visualizations
4. ❌ Medical passport PDF
5. ❌ CSV exports
6. ❌ Admin panel 6 tabs
7. ❌ Mobile apps (basic MVPs)

### MEDIUM (Enhanced Features)
1. ❌ Training templates CRUD
2. ❌ Breeding management
3. ❌ Report generation
4. ❌ Feed cost optimization
5. ❌ Lesson scheduling
6. ❌ Multi-language complete

### LOW (Nice to Have)
1. ❌ Client portal
2. ❌ Integration REST API
3. ❌ White-label branding
4. ❌ Landing page redesign (current is ok)

---

**Document Version:** 1.0  
**Last Updated:** January 1, 2026  
**Total Features:** 60+  
**Implemented:** ~25%  
**Estimated Work:** 200+ hours for full completion
