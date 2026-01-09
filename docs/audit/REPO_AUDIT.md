# EquiProfile Repository Audit - Phase 0

**Date**: 2026-01-09  
**Branch**: upgrade-ux-admin-weather-storage  
**Purpose**: Comprehensive audit before implementing major UX, admin, weather, and storage upgrades

---

## Executive Summary

This audit examines the current EquiProfile codebase to identify:
- All client routes and pages
- All server API endpoints
- Current authentication and admin mechanisms
- Broken or problematic features
- Areas requiring major upgrades

**Overall System Health**: 🟡 **Functional but needs improvements**

### Key Findings:
1. ✅ Core horse management, health records, and training features work
2. ⚠️ Breeding page has loading issues (horses not fetched properly)
3. ⚠️ Lessons scheduling has navigation/menu bugs
4. ⚠️ API keys are admin-only but UI placement confuses users
5. ⚠️ "Show admin" command is exposed in multiple places (should be hidden)
6. ⚠️ Weather section exists but is basic (needs UK-specific upgrade)
7. ❌ No secure per-user file storage for uploads
8. ❌ No admin secrets vault for system-wide API keys
9. ❌ Marketing pages exist but need complete redesign
10. ❌ Pricing shown is outdated (needs 7-day trial, correct GBP amounts)

---

## 1. CLIENT ROUTES & PAGES

### 1.1 Marketing Pages (Public - No Auth Required)

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/` | Home.tsx | 🟡 Needs redesign | Landing page exists, needs marketing upgrade |
| `/about` | About.tsx | 🟡 Needs redesign | Should be first in nav |
| `/features` | Features.tsx | 🟡 Needs redesign | Needs UK-focused content |
| `/pricing` | Pricing.tsx | ⚠️ Outdated | Shows wrong trial/pricing (needs 7-day, £7.99/£24.99) |
| `/contact` | Contact.tsx | 🟡 Needs redesign | Should show email + WhatsApp only |
| `/terms` | TermsPage.tsx | 🟡 Basic | Needs UK legal review |
| `/privacy` | PrivacyPage.tsx | 🟡 Basic | Needs UK GDPR/PECR compliance |

**Missing Marketing Pages:**
- ❌ Cookie notice + preferences modal (required for UK/PECR)
- ❌ Image-based premium auth pages (Login/Register need backgrounds)

### 1.2 Authentication Pages

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/login` | auth/Login.tsx | ✅ Works | Needs premium image background |
| `/register` | auth/Register.tsx | ✅ Works | Needs premium image background |
| `/forgot-password` | auth/ForgotPassword.tsx | ✅ Works | - |
| `/reset-password` | auth/ResetPassword.tsx | ✅ Works | - |

### 1.3 Dashboard/App Pages (Protected - Auth Required)

| Route | Component | Status | Issues/Notes |
|-------|-----------|--------|--------------|
| `/dashboard` | Dashboard.tsx | ✅ Works | Needs layout redesign (3 bottom blocks in row on desktop) |
| `/horses` | Horses.tsx | ✅ Works | - |
| `/horses/new` | HorseForm.tsx | ✅ Works | Needs photo upload capability |
| `/horses/:id` | HorseDetail.tsx | ✅ Works | Needs to display uploaded photos |
| `/horses/:id/edit` | HorseForm.tsx | ✅ Works | - |
| `/health` | Health.tsx | ✅ Works | - |
| `/training` | Training.tsx | ✅ Works | - |
| `/training-templates` | TrainingTemplates.tsx | ✅ Works | - |
| `/breeding` | BreedingManagement.tsx | ⚠️ **BROKEN** | Horses not loading properly in form |
| `/lessons` | LessonScheduling.tsx | ⚠️ **BROKEN** | Navigation/menu bugs when accessing |
| `/feeding` | Feeding.tsx | ✅ Works | - |
| `/weather` | Weather.tsx | 🟡 Basic | Needs UK location search + Open-Meteo integration |
| `/documents` | Documents.tsx | ✅ Works | Needs secure upload capability |
| `/stable` | Stable.tsx | ✅ Works | - |
| `/messages` | Messages.tsx | ✅ Works | - |
| `/analytics` | Analytics.tsx | ✅ Works | - |
| `/reports` | Reports.tsx | ✅ Works | - |
| `/calendar` | Calendar.tsx | ✅ Works | - |
| `/settings` | Settings.tsx | ✅ Works | No user-facing API keys section (correct) |
| `/billing` | BillingPage.tsx | ✅ Works | Needs pricing update |
| `/ai-chat` | AIChat.tsx | ⚠️ Shows "show admin" | Hint text must be removed |
| `/client/:clientId` | ClientPortal.tsx | ✅ Works | - |
| `/admin` | Admin.tsx | ⚠️ Shows "show admin" | Message must not instruct users |

**Total Pages**: 35 page components

---

## 2. SERVER API ENDPOINTS

### 2.1 Core HTTP/Express Routes

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| GET | `/healthz` | Simple health check | ✅ Works |
| GET | `/build` | Build info | ✅ Works |
| GET | `/api/health` | Detailed health check | ✅ Works |
| GET | `/api/oauth/status` | OAuth config status | ✅ Works |
| POST | `/api/webhooks/stripe` | Stripe webhook handler | ✅ Works |
| * | `/api/auth/*` | Local authentication (authRouter) | ✅ Works |
| * | `/api/billing/*` | Billing/Stripe (billingRouter) | ✅ Works |
| POST | `/api/admin/send-test-email` | Admin test email | ✅ Works |
| * | `/api/trpc/*` | tRPC API (main application API) | ✅ Works |
| * | `/api/v1/*` | REST API v1 (third-party) | ✅ Works |

**Note**: There is NO "EP_API_GUARD_BEFORE_STATIC" marker in the code. The `/api` routes are naturally protected by being defined before the static file handler.

### 2.2 tRPC API Routers (via `/api/trpc`)

#### System Router (`system.*`)
- Environment and system-level operations
- Details in `server/_core/systemRouter.ts`

#### Auth Router (`auth.*`)
| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| me | query | public | Get current user |
| logout | mutation | public | Clear session cookie |

#### Admin Unlock Router (`adminUnlock.*`)
| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getStatus | query | protected | Check if admin mode unlocked |
| requestUnlock | mutation | protected | Request admin unlock challenge |
| submitPassword | mutation | protected | Submit admin password |
| lock | mutation | protected | Revoke admin session |

**Admin Password**: Stored in env var `ADMIN_UNLOCK_PASSWORD` (default: `ashmor12@`)

#### AI Router (`ai.*`)
| Procedure | Type | Auth | Purpose | Issue |
|-----------|------|------|---------|-------|
| chat | mutation | protected | AI chat + admin unlock | ⚠️ Responds to "show admin" command |

**Issue**: When user sends "show admin", AI returns instructions. This must be hidden.

#### Admin Router (`admin.*`)
All procedures require `adminUnlockedProcedure` (admin session active).

| Sub-Router | Procedures | Purpose |
|------------|------------|---------|
| admin.{users} | getUsers, getUserDetails, suspendUser, unsuspendUser, deleteUser, updateUserRole | User management |
| admin.{stats} | getStats, getOverdueUsers, getExpiredTrials | System statistics |
| admin.{activity} | getActivityLogs | Activity audit logs |
| admin.{settings} | getSettings, updateSetting | System settings (DB-stored) |
| admin.{backups} | getBackupLogs | Backup history |
| admin.apiKeys.{} | list, create, revoke, rotate, updateSettings | **API key management** |
| admin.{envHealth} | getEnvHealth | Environment variable health check |

**⚠️ CRITICAL ISSUE: API Keys**
- API keys are in the ADMIN router (correct)
- But Admin panel shows them prominently
- Users should NEVER see "API keys" UI
- These are for system-wide configuration (OpenAI, SMTP, weather provider if needed)

#### Billing Router (`billing.*`)
| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getPricing | query | public | Get pricing info | ⚠️ Returns old pricing |
| createCheckout | mutation | protected | Create Stripe checkout |
| createPortal | mutation | protected | Create Stripe portal |
| getStatus | query | protected | Get subscription status |

**Issue**: Pricing shows old amounts, needs update to 7-day trial + £7.99/£24.99

#### User Router (`user.*`)
| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getProfile | query | protected | Get user profile |
| updateProfile | mutation | protected | Update user profile |
| getSubscriptionStatus | query | protected | Get subscription |
| getDashboardStats | query | subscribed | Get dashboard stats |

#### Horses Router (`horses.*`)
All require `subscribedProcedure`.
- list, get, create, update, delete, exportCSV
- ✅ All working correctly
- ❌ Missing: Horse photo upload/display

#### Health Records Router (`healthRecords.*`)
All require `subscribedProcedure`.
- listAll, listByHorse, get, create, update, delete, getReminders, exportCSV
- ✅ All working

#### Training Router (`training.*`)
All require `subscribedProcedure`.
- listByHorse, listAll, getUpcoming, create, update, delete, complete, exportCSV
- ✅ All working

#### Feeding Router (`feeding.*`)
All require `subscribedProcedure`.
- listAll, listByHorse, create, update, delete, exportCSV
- ✅ All working

#### Documents Router (`documents.*`)
All require `subscribedProcedure`.
- list, listByHorse, upload, delete, exportCSV
- 🟡 Upload exists but uses S3 (BUILT_IN_FORGE or AWS)
- ❌ No secure per-user VPS storage implementation

#### Weather Router (`weather.*`)
All require `subscribedProcedure`.
| Procedure | Purpose | Status |
|-----------|---------|--------|
| analyze | mutation | AI weather analysis | 🟡 Basic |
| getLatest | query | Latest weather log | 🟡 Basic |
| getHistory | query | Weather history | 🟡 Basic |

**Issue**: Weather is basic. Needs UK location search, Open-Meteo integration, forecast display.

#### Breeding Router (`breeding.*`)
All require `subscribedProcedure` or `protectedProcedure`.
- createRecord, list, get, update, delete, confirmPregnancy, addFoal, listFoals, exportCSV
- ⚠️ **BROKEN**: Frontend doesn't load horses properly (query issue)

#### Lesson Bookings Router (`lessonBookings.*`)
All require `protectedProcedure`.
- create, list, get, update, delete, markCompleted, markCancelled
- ⚠️ **BROKEN**: Frontend has navigation/menu bugs

#### Trainer Availability Router (`trainerAvailability.*`)
All require `protectedProcedure`.
- create, list, update, delete
- ✅ Works

#### Other Routers
- `stables.*` - Stable management ✅
- `messages.*` - Messaging ✅
- `analytics.*` - Analytics ✅
- `reports.*` - Reporting ✅
- `calendar.*` - Events/calendar ✅
- `competitions.*` - Competition tracking ✅
- `trainingPrograms.*` - Training program templates ✅

**Total tRPC Procedures**: ~100+ procedures across all routers

---

## 3. AUTHENTICATION & ADMIN MODEL

### 3.1 User Authentication

**Method**: JWT-based session cookies  
**Cookie Name**: Defined in `shared/const.ts` as `COOKIE_NAME`  
**Implementation**: `server/_core/context.ts` checks cookie and validates JWT

**User Roles**:
- `user` (default)
- `admin`

**Subscription Statuses**:
- `trial` - Free trial (default, currently 14 days but needs to be 7)
- `active` - Paid subscription
- `cancelled` - Subscription cancelled
- `overdue` - Payment failed
- `expired` - Trial/subscription expired

**Plans**:
- `monthly` - ⚠️ Needs update to £7.99/month, 5 horses max
- `yearly` - ⚠️ Needs update to £79/year, 5 horses max
- (Missing) "stable" plan - £24.99/month or £249/year, unlimited horses

### 3.2 Admin Unlock Mechanism

**How It Works**:
1. User must have `role = 'admin'` in database
2. User types "show admin" in AI chat (`/ai-chat`)
3. AI responds with password challenge
4. User submits password via `adminUnlock.submitPassword`
5. System creates admin session (expires in 30 minutes)
6. Admin can access `/admin` panel

**Admin Session Table**: `adminSessions` (schema.ts line ~185)
- userId, expiresAt, createdAt
- Rate limiting: Max 5 attempts, 15-minute lockout

**Admin Password**: `process.env.ADMIN_UNLOCK_PASSWORD` (default: `ashmor12@`)

**⚠️ ISSUES WITH CURRENT ADMIN SYSTEM**:

1. **Multiple "show admin" hints visible**:
   - `client/src/pages/AIChat.tsx` - No explicit hint currently, but mechanism exists
   - `client/src/pages/Admin.tsx` line 89 - Shows "type 'show admin' in AI chat"
   - `client/src/lib/adminToggle.ts` - Legacy console command system (not used in new system)
   - `docs/ADMIN_UNLOCK_GUIDE.md` - Documentation mentions "show admin"

2. **Admin panel shows API keys prominently**:
   - Admin panel has "API Keys" tab
   - API keys are system-wide (not per-user)
   - Users should never see "API keys" concept
   - Only hidden admin should manage global API keys

**REQUIREMENT**: 
- Admin chat UI must NOT display "show admin" hint
- Only admins who already know can unlock
- Admin panel is hidden (no nav link)

### 3.3 User Data Isolation

**Model**: Strict tenancy via userId foreign key

Every data table has `userId` column:
- horses.userId
- healthRecords.userId
- trainingSessions.userId
- feedingPlans.userId
- documents.userId
- weatherLogs.userId
- etc.

**Protection**: All tRPC procedures use `subscribedProcedure` which:
1. Checks user is authenticated (`protectedProcedure`)
2. Checks user has active subscription
3. Filters all queries by `ctx.user.id`

**Verification Needed**: Ensure no procedures allow cross-user access.

---

## 4. DATABASE SCHEMA OVERVIEW

**ORM**: Drizzle ORM  
**Database**: MySQL  
**Schema File**: `drizzle/schema.ts`

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| users | User accounts | id, openId, email, role, subscriptionStatus, subscriptionPlan |
| horses | Horse profiles | id, userId, name, breed, photoUrl |
| healthRecords | Health/vet records | id, userId, horseId, recordType, nextDueDate |
| trainingSessions | Training logs | id, userId, horseId, sessionDate, sessionType |
| feedingPlans | Feeding schedules | id, userId, horseId, feedType, mealTime |
| documents | File uploads | id, userId, horseId, fileUrl, fileKey |
| weatherLogs | Weather analysis | id, userId, location, temperature, ridingRecommendation |
| adminSessions | Admin unlock sessions | id, userId, expiresAt |
| activityLogs | Audit trail | id, userId, action, entityType, entityId |
| settings | System settings (DB) | id, key, value, type |
| apiKeys | Admin API keys | id, userId, keyHash, name, rateLimit |
| stripeEvents | Stripe webhook dedup | id, eventId, eventType, processed |
| backupLogs | Backup history | id, backupType, status, startedAt |

### Stable Management Tables
- stables, stableMembers, stableInvites
- messageThreads, messages

### Breeding Tables
- breeding (mare + stallion records)
- foals (offspring)

### Training Tables
- trainingProgramTemplates
- trainingPrograms (instances)

### Events & Reporting
- events (calendar)
- competitions
- reports, reportSchedules

### Lessons
- lessonBookings
- trainerAvailability

**Total Tables**: ~30 tables

**⚠️ Missing Table**: Per-user file metadata for secure VPS storage

---

## 5. BROKEN FEATURES & ROOT CAUSES

### 5.1 Breeding Page Not Loading Horses

**File**: `client/src/pages/BreedingManagement.tsx`

**Symptom**: When creating a breeding record, horse dropdown is empty or doesn't load.

**Root Cause** (Suspected):
- Line 30-50: Component mounts and tries to fetch horses
- May be missing `trpc.horses.list.useQuery()` call
- Or may have conditional rendering that hides form before data loads

**Investigation Needed**:
```typescript
// Check if this exists:
const { data: horses = [] } = trpc.horses.list.useQuery();
```

**Fix Strategy**:
1. Ensure `trpc.horses.list.useQuery()` is called on component mount
2. Add loading state while horses are fetching
3. Show error if query fails
4. Populate dropdown with `horses.map(h => <SelectItem value={h.id}>{h.name}</SelectItem>)`

**Effort**: Low (1-2 hours)  
**Risk**: Low (isolated to breeding page)

### 5.2 Lessons Section Breaking Menu/Nav

**File**: `client/src/pages/LessonScheduling.tsx`

**Symptom**: When navigating to `/lessons`, the page loads but dashboard navigation/menu breaks or disappears.

**Root Cause** (Suspected):
- Line 1-50: Component structure may not use `<DashboardLayout>`
- Or may have styling issues that overlay/hide nav
- Or may have router issue that breaks Wouter navigation

**Investigation Needed**:
```typescript
// Check if component is wrapped:
export default function LessonScheduling() {
  return (
    <DashboardLayout>
      {/* content */}
    </DashboardLayout>
  );
}
```

**Fix Strategy**:
1. Verify `<DashboardLayout>` wrapper exists
2. Check for z-index issues in CSS
3. Check for state management issues that affect parent layout
4. Test navigation with React DevTools

**Effort**: Low-Medium (2-4 hours)  
**Risk**: Low (isolated to lessons page)

### 5.3 API Keys UI Confusing Users

**Files**:
- `client/src/pages/Admin.tsx` - Shows "API Keys" tab
- `server/routers.ts` line 1099 - `admin.apiKeys` router

**Symptom**: Admin panel prominently displays "API Keys" which confuses users. Users don't need API keys; only the admin manages system-wide keys.

**Root Cause**: 
- API keys are correctly admin-only in backend
- But frontend makes them visible as a top-level tab
- Users expect "API keys" to be for their own use (like GitHub personal access tokens)
- In reality, these are for configuring the platform (OpenAI, SMTP, weather API if needed)

**Fix Strategy**:
1. Rename "API Keys" tab to "System Secrets" or "Integration Keys"
2. Add clear description: "Configure global API keys for platform integrations (OpenAI, weather, SMTP, etc.)"
3. Or move to a sub-section under "System Settings"
4. Never show in user-facing UI

**Effort**: Low (1 hour)  
**Risk**: Low (UI change only)

### 5.4 "Show Admin" Command Exposed

**Files with "show admin" mentions**:
- `client/src/pages/Admin.tsx` line 89 - "type 'show admin' in AI chat"
- `client/src/lib/adminToggle.ts` - Console commands (legacy, not used)
- `server/routers.ts` line 176 - Checks for "show admin" in chat
- `docs/ADMIN_UNLOCK_GUIDE.md` - Documentation

**Symptom**: UI instructs users to type "show admin", but requirement is that only admins who already know can unlock.

**Root Cause**: 
- Instructions were added for convenience during development
- Must be removed for production security-by-obscurity

**Fix Strategy**:
1. Remove all UI hints about "show admin"
2. Keep the mechanism in backend (checking for "show admin" in chat)
3. Update admin guide to be internal-only
4. Admin panel should say "Admin session expired" without mentioning how to unlock

**Effort**: Low (1 hour)  
**Risk**: Low (text removal)

### 5.5 Sign Out Doesn't Redirect to Landing Page

**File**: Unknown (need to check auth/logout flow)

**Symptom**: After signing out, user is not redirected to landing page.

**Root Cause** (Suspected):
- `auth.logout` mutation succeeds but doesn't trigger navigation
- Or navigation goes to wrong route

**Investigation Needed**:
```typescript
// Check where logout is called
const logoutMutation = trpc.auth.logout.useMutation({
  onSuccess: () => {
    // Should navigate to '/'
  }
});
```

**Fix Strategy**:
1. Find all logout button locations
2. Ensure `navigate('/')` is called after successful logout
3. Test across all pages with logout button

**Effort**: Low (1 hour)  
**Risk**: Low (navigation change)

---

## 6. MAJOR FEATURE GAPS

### 6.1 Secure Per-User File Storage (Missing)

**Current State**:
- `documents.upload` procedure exists (line 803-851 in routers.ts)
- Uses S3 or "BUILT_IN_FORGE" API
- Files stored at `{userId}/documents/{nanoid}-{filename}`

**What's Missing**:
- ❌ VPS-based secure storage (requirement: store on VPS, not S3)
- ❌ Per-user directory structure `/var/equiprofile/storage/users/{userId}/`
- ❌ Authenticated streaming endpoints (can't serve files via static route)
- ❌ Horse photo upload
- ❌ Photo display on horse profile
- ❌ Storage quota tracking by plan
- ❌ Admin storage dashboard (usage/quota/files per user)

**Implementation Plan** (Phase 4):
1. Create storage directory structure:
   ```
   /var/equiprofile/storage/
     users/
       {userId}/
         horses/
           {horseId}/
             photos/
             documents/
         documents/
   ```
2. Add `files` table to schema:
   - id, userId, horseId, filePath, fileSize, fileType, category, uploadedAt
3. Create upload endpoint: `POST /api/user/files/upload`
   - Accept multipart/form-data
   - Validate file type, size
   - Check user quota
   - Save to VPS storage
   - Create DB record
4. Create streaming endpoint: `GET /api/user/files/:fileId/stream`
   - Verify user owns file
   - Stream file with correct Content-Type
   - Support range requests for large files
5. Update horses.photoUrl to reference fileId instead of URL
6. Add upload UI to HorseForm.tsx
7. Add photo display to HorseDetail.tsx

**Effort**: High (8-16 hours)  
**Risk**: Medium (new file handling system)

### 6.2 Admin Secrets Vault (Missing)

**Current State**:
- `settings` table exists for system settings
- `apiKeys` table exists for admin keys
- Keys stored as plain text or simple hash

**What's Missing**:
- ❌ Encrypted secrets storage
- ❌ Master key from environment
- ❌ Admin UI to manage secrets (weather API, SMTP, OpenAI)
- ❌ Secrets masked in UI (show last 4 chars only)
- ❌ Audit log of secrets changes

**Implementation Plan** (Phase 2):
1. Add encryption module:
   ```typescript
   // server/_core/secrets.ts
   - encryptSecret(plaintext, masterKey) -> encrypted
   - decryptSecret(encrypted, masterKey) -> plaintext
   - Use AES-256-GCM with env var SECRETS_MASTER_KEY
   ```
2. Add `secretsVault` table:
   - id, key (unique), encryptedValue, description, updatedAt, updatedBy
3. Create admin UI in Admin panel:
   - Tab: "System Secrets"
   - List: Weather API, SMTP config, OpenAI key, Stripe keys
   - Edit: Mask value (show •••• + last 4 chars)
   - Save: Encrypt before storing
4. Update admin.settings router to use vault
5. Add audit logging

**Effort**: Medium-High (6-12 hours)  
**Risk**: Medium (encryption handling)

### 6.3 Weather Upgrade (Needs Enhancement)

**Current State**:
- Weather page exists (`client/src/pages/Weather.tsx`)
- Weather API router exists (`weather.*`)
- AI analysis works

**What's Missing**:
- ❌ UK location search (postcode/city)
- ❌ Open-Meteo integration (currently no provider)
- ❌ Current + forecast display
- ❌ User's selected location persistence
- ❌ Automatic inclusion in AI recommendations

**Implementation Plan** (Phase 3):
1. Add location search using UK postcode/city database
   - Option 1: Use geoapify.com (free tier)
   - Option 2: Use postcodes.io (free UK postcode API)
2. Integrate Open-Meteo API (no key needed):
   ```typescript
   // server/_core/weather.ts
   - getWeatherByLocation(lat, lon) -> current + forecast
   - Use https://api.open-meteo.com/v1/forecast
   ```
3. Update `weatherLogs` table to store lat/lon
4. Update Weather.tsx:
   - Add location search autocomplete
   - Display current conditions
   - Display 7-day forecast
   - Save selected location to user preferences
5. Update AI chat to include weather context:
   ```typescript
   // When user asks for advice, fetch latest weather and prepend:
   systemMessage += `\n\nCurrent weather at ${location}: ${temp}°C, ${conditions}. Consider this in your recommendations.`
   ```

**Effort**: Medium (6-8 hours)  
**Risk**: Low (external API integration)

### 6.4 Marketing Pages Redesign (Needs Complete Overhaul)

**Current State**:
- All marketing pages exist (Home, About, Features, Pricing, Contact, Terms, Privacy)
- Basic layout and content

**What's Missing**:
- ❌ Professional, modern "WOW factor" design
- ❌ Mobile-responsive images
- ❌ Conversion-focused landing page
- ❌ UK-focused content (GBP, British terminology)
- ❌ Correct pricing (7-day trial, £7.99/£24.99)
- ❌ Cookie notice + preferences modal
- ❌ Realistic stats (not 5000+ users)
- ❌ Image management system for easy swapping

**Implementation Plan** (Phase 6):
1. Update all marketing pages with premium design
2. Add About page as first in nav
3. Update pricing display
4. Add cookie notice component
5. Create image mapping system:
   ```typescript
   // client/src/assets/images.ts
   export const images = {
     landing: {
       hero: '/assets/landing/hero.jpg',
       feature1: '/assets/landing/feature1.jpg',
       // ...
     },
     auth: {
       loginBg: '/assets/auth/login-bg.jpg',
       registerBg: '/assets/auth/register-bg.jpg',
     },
   };
   ```
6. Add placeholder images from Unsplash (horses, stables, UK landscapes)
7. Document image replacement in `docs/ops/IMAGES.md`

**Effort**: High (16-24 hours)  
**Risk**: Low (UI changes)

### 6.5 Admin Control Center Expansion (Needs Enhancement)

**Current State**:
- Admin panel exists
- User management works (suspend, delete, change role)
- Stats display works

**What's Missing**:
- ❌ Password reset capability (admin resets user password)
- ❌ Force logout/revoke sessions
- ❌ Email broadcast (send to all/selected users)
- ❌ Storage dashboard (usage/quota by user)
- ❌ File management (view/delete user files)
- ❌ System monitoring with auto-refresh
- ❌ Environment health status dashboard

**Implementation Plan** (Phase 5):
1. Add user password reset:
   ```typescript
   admin.resetUserPassword({ userId, newPassword? })
   // If newPassword not provided, generate random and email
   ```
2. Add force logout:
   ```typescript
   admin.revokeUserSessions({ userId })
   // Delete all active sessions for user
   ```
3. Add email broadcast:
   ```typescript
   admin.sendEmail({ 
     recipients: 'all' | userId[], 
     subject, 
     body, 
     useTemplate? 
   })
   // Uses SMTP from secrets vault
   ```
4. Add storage dashboard:
   - Show total storage by user
   - Show file counts
   - Show quota limits
   - Allow adjusting quotas
5. Add system monitoring panel:
   - Auto-refresh every 30s
   - Show active users
   - Show recent errors
   - Show request counts
6. Expand environment health:
   - Show critical vs optional vars
   - Add "how to enable" help text

**Effort**: High (12-20 hours)  
**Risk**: Medium (email sending, storage management)

---

## 7. PRICING & TRIAL DISCREPANCIES

### Current Pricing (INCORRECT)

**In Code** (`server/stripe.ts`):
```typescript
export const STRIPE_PRICING = {
  monthly: {
    amount: 999, // £9.99
    interval: 'month',
  },
  yearly: {
    amount: 9999, // £99.99
    interval: 'year',
  },
};
```

**Trial Period**: Not clearly defined, appears to be 14 days

### Required Pricing (CORRECT)

**Plans**:
1. **Monthly Plan**:
   - £7.99/month OR £79/year
   - Max 5 horses per user
   - Trial: 7 days

2. **Stable Plan** (NEW):
   - £24.99/month OR £249/year
   - Unlimited horses
   - Trial: 7 days

**Stats** (Marketing Pages):
Must be realistic for early-stage product:
- Active users: 120+
- Horses managed: 480+
- Uptime: 99.9%
- Rating: 4.8/5

Store in config file: `client/src/const.ts`

### Files to Update

1. `server/stripe.ts` - Add new price IDs
2. `client/src/pages/Pricing.tsx` - Update pricing display
3. `server/routers.ts` (billing.getPricing) - Return new pricing
4. Marketing pages - Update stats
5. `client/src/const.ts` - Add stats config
6. User schema - Add horse count limit enforcement

**Effort**: Medium (4-6 hours)  
**Risk**: Low (data changes)

---

## 8. IMAGE MANAGEMENT SYSTEM

### Current State
- Images hardcoded in components
- Mix of local files and placeholder URLs
- No central management

### Required System

**Structure**:
```
client/src/assets/
  images.ts          # Central image map
  landing/           # Marketing page images
    hero.jpg
    about-us.jpg
    features-*.jpg
  auth/              # Auth page backgrounds
    login-bg.jpg
    register-bg.jpg
  dashboard/         # Dashboard imagery
    placeholder-horse.jpg
  icons/             # Icons and logos
    logo.svg
    favicon.ico
```

**Usage**:
```typescript
// In any component
import { images } from '@/assets/images';

<img src={images.landing.hero} alt="..." />
```

**Documentation** (`docs/ops/IMAGES.md`):
- List all images
- Specify dimensions
- Explain replacement process
- No code changes needed for swaps

**Effort**: Low-Medium (4-6 hours)  
**Risk**: Low (refactoring)

---

## 9. PRIORITIZED FIX LIST

### Phase 1: Critical Fixes (Immediate)

| # | Issue | File(s) | Effort | Risk | Priority |
|---|-------|---------|--------|------|----------|
| 1.1 | Remove "show admin" hints | Admin.tsx, AIChat.tsx | 1h | Low | **HIGH** |
| 1.2 | Rename "API Keys" tab | Admin.tsx | 1h | Low | **HIGH** |
| 1.3 | Fix breeding horses loading | BreedingManagement.tsx | 2h | Low | **HIGH** |
| 1.4 | Fix lessons nav/menu bug | LessonScheduling.tsx | 3h | Low | **HIGH** |
| 1.5 | Fix sign out redirect | Find logout buttons | 1h | Low | **HIGH** |
| 1.6 | Resize/clean chat box | AIChat.tsx, Dashboard.tsx | 2h | Low | **MEDIUM** |

**Total Phase 1 Effort**: 10 hours  
**Total Phase 1 Risk**: Low

### Phase 2: Admin Secrets Vault

| # | Task | Effort | Risk |
|---|------|--------|------|
| 2.1 | Add encryption module | 3h | Medium |
| 2.2 | Create secretsVault table | 1h | Low |
| 2.3 | Build admin secrets UI | 4h | Medium |
| 2.4 | Add audit logging | 2h | Low |
| 2.5 | Testing | 2h | Medium |

**Total Phase 2 Effort**: 12 hours  
**Total Phase 2 Risk**: Medium

### Phase 3: Weather Upgrade

| # | Task | Effort | Risk |
|---|------|--------|------|
| 3.1 | Integrate UK location search | 2h | Low |
| 3.2 | Integrate Open-Meteo | 2h | Low |
| 3.3 | Update Weather UI | 3h | Low |
| 3.4 | Add AI weather context | 1h | Low |
| 3.5 | Testing | 2h | Low |

**Total Phase 3 Effort**: 10 hours  
**Total Phase 3 Risk**: Low

### Phase 4: Secure Storage + Uploads

| # | Task | Effort | Risk |
|---|------|--------|------|
| 4.1 | Create storage structure | 2h | Low |
| 4.2 | Add files table | 1h | Low |
| 4.3 | Build upload endpoint | 4h | Medium |
| 4.4 | Build streaming endpoint | 3h | Medium |
| 4.5 | Add horse photo upload UI | 3h | Low |
| 4.6 | Add photo display | 2h | Low |
| 4.7 | Add quota tracking | 3h | Medium |
| 4.8 | Testing | 2h | Medium |

**Total Phase 4 Effort**: 20 hours  
**Total Phase 4 Risk**: Medium

### Phase 5: Admin Control Center

| # | Task | Effort | Risk |
|---|------|--------|------|
| 5.1 | Add password reset | 3h | Medium |
| 5.2 | Add force logout | 2h | Low |
| 5.3 | Add email broadcast | 5h | High |
| 5.4 | Add storage dashboard | 4h | Medium |
| 5.5 | Add system monitoring | 4h | Low |
| 5.6 | Auto-refresh panels | 2h | Low |

**Total Phase 5 Effort**: 20 hours  
**Total Phase 5 Risk**: Medium-High

### Phase 6: UI Overhaul

| # | Task | Effort | Risk |
|---|------|--------|------|
| 6.1 | Redesign marketing pages | 8h | Low |
| 6.2 | Add cookie notice | 2h | Low |
| 6.3 | Update auth page backgrounds | 3h | Low |
| 6.4 | Modernize dashboard layout | 5h | Low |
| 6.5 | Update pricing | 2h | Low |
| 6.6 | Create image system | 4h | Low |
| 6.7 | Add placeholder images | 2h | Low |
| 6.8 | Document image replacement | 2h | Low |

**Total Phase 6 Effort**: 28 hours  
**Total Phase 6 Risk**: Low

---

## 10. BUILD & DEPLOYMENT

### Build Process

**Scripts** (from package.json):
```bash
npm run build:sw       # Update service worker version
npm run build          # Full build (SW + Vite + esbuild server)
npm start              # Production start
```

**Build Output**:
- Client: `dist/` (Vite output, served as static files)
- Server: `dist/index.js` (esbuild bundle)

**Service**:
- Systemd service: `equiprofile`
- Runs: `node dist/index.js`
- Port: 3000 (proxied by Nginx)

### Smoke Tests Needed

**Create** `scripts/smoke-test.sh`:
```bash
#!/bin/bash
# Basic smoke tests for post-deployment validation

echo "🧪 Running EquiProfile smoke tests..."

# 1. Health check
curl -f http://localhost:3000/healthz || exit 1

# 2. Build info
curl -f http://localhost:3000/build || exit 1

# 3. Static files (check for 200, not 404)
curl -f http://localhost:3000/ -I || exit 1

# 4. API health
curl -f http://localhost:3000/api/health || exit 1

echo "✅ All smoke tests passed"
```

**Create** `docs/ops/SMOKE_TESTS.md`:
- Document all smoke tests
- Expected responses
- How to run
- What to check after deploy

### Deployment Process Needed

**Create** `docs/ops/DEPLOYMENT.md`:
1. Pre-deployment checklist
2. Build steps
3. Service restart steps
4. Smoke test steps
5. Rollback procedure

---

## 11. SUMMARY & RECOMMENDATIONS

### Current State Assessment

✅ **Strong Foundation**:
- Comprehensive horse management
- Working authentication
- Subscription/billing system
- Admin panel exists
- tRPC API well-structured

⚠️ **Needs Improvement**:
- 2 broken pages (breeding, lessons)
- Admin UI hints need hiding
- Weather section is basic
- No secure VPS file storage
- Marketing pages need redesign
- Pricing is outdated

❌ **Missing Critical Features**:
- Admin secrets vault
- Per-user file upload/storage
- Storage quota management
- Email broadcast system
- Image management system

### Risk Assessment

**Low Risk Changes** (Phases 1, 3, 6):
- UI text changes
- CSS/layout changes
- External API integrations (weather)
- Documentation

**Medium Risk Changes** (Phases 2, 4):
- Encrypted secrets storage
- File upload/storage system
- Quota tracking

**High Risk Changes** (Phase 5):
- Email sending (SMTP configuration)
- Session revocation
- Bulk operations

### Recommended Approach

1. **Start with Phase 1** (10 hours):
   - Quick wins
   - Fix visible bugs
   - Remove security concerns

2. **Build foundational features** (Phases 2-4, 42 hours):
   - Secrets vault
   - Weather upgrade
   - Storage system
   - These enable later features

3. **Expand admin capabilities** (Phase 5, 20 hours):
   - User management
   - Email system
   - Monitoring

4. **Polish UI** (Phase 6, 28 hours):
   - Professional appearance
   - Correct pricing
   - Easy image swapping

**Total Estimated Effort**: 100 hours (12-15 working days)

### Next Steps

1. ✅ Create this audit document
2. ⏭️ Begin Phase 1 implementation
3. ⏭️ Document findings and solutions
4. ⏭️ Test each phase thoroughly
5. ⏭️ Create deployment documentation

---

## 12. APPENDIX: FILE LOCATIONS

### Client Structure
```
client/src/
  pages/              # 35 page components
  components/         # Reusable UI components
  lib/                # Utilities (trpc.ts, adminToggle.ts)
  hooks/              # React hooks
  contexts/           # React contexts
  assets/             # Static assets (to be organized)
  i18n/               # Internationalization
```

### Server Structure
```
server/
  _core/              # Core server setup
    index.ts          # Express app & middleware
    authRouter.ts     # Local auth routes
    billingRouter.ts  # Stripe routes
    systemRouter.ts   # System-level tRPC
    trpc.ts           # tRPC setup & procedures
    context.ts        # tRPC context (auth check)
    env.ts            # Environment variables
  routers.ts          # Main tRPC app router
  db.ts               # Database functions
  api.ts              # REST API v1
  stripe.ts           # Stripe integration
  storage.ts          # S3/Forge storage
  csvExport.ts        # CSV export functions
```

### Database
```
drizzle/
  schema.ts           # All table definitions
  relations.ts        # Table relationships
```

### Documentation
```
docs/
  audit/              # This audit
  ADMIN_UNLOCK_GUIDE.md
  API_REFERENCE.md
  ROUTER_MAP.md
  (many other docs)
```

---

**End of Audit Report**

**Next Action**: Begin Phase 1 implementation (fix breakages + remove "show admin" hints)
