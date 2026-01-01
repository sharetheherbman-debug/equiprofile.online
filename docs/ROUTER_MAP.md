# tRPC Router & Procedure Map

**Generated:** January 1, 2026  
**Purpose:** Complete inventory of all tRPC routers and procedures with their usage mapping

---

## Router Overview

EquiProfile uses tRPC for type-safe API communication between client and server. This document maps all available procedures to their UI implementations.

### Security Levels

- **publicProcedure** - No authentication required
- **protectedProcedure** - User must be logged in
- **subscribedProcedure** - User must have active subscription (trial or paid)
- **adminUnlockedProcedure** - User must be admin with active unlock session (30 min)

---

## 1. system Router

**Path:** `server/_core/systemRouter.ts`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| health | public | System health check | Load balancer, monitoring |
| version | public | Get app version | About page, footer |

---

## 2. auth Router

**Path:** `server/routers.ts:63`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| me | publicProcedure | Get current user or null | All pages (auth context) |
| logout | publicProcedure | Clear session cookie | Header (logout button) |

**UI Components:**
- `client/src/_core/hooks/useAuth.tsx` - Uses `auth.me`
- `client/src/components/DashboardLayout.tsx` - Uses `auth.logout`

---

## 3. adminUnlock Router

**Path:** `server/routers.ts:73`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getStatus | protectedProcedure | Check if admin session active | Admin page, DashboardLayout |
| requestUnlock | protectedProcedure | Initiate unlock flow | AI Chat |
| submitPassword | protectedProcedure | Verify password & create session | AI Chat |
| lock | protectedProcedure | Revoke admin session | Admin panel |

**UI Components:**
- `client/src/pages/AIChat.tsx` - Admin unlock flow
- `client/src/pages/Admin.tsx` - Session status display
- `client/src/components/DashboardLayout.tsx` - Conditional admin menu

**Security Features:**
- Rate limiting: 5 attempts → 15 min lockout
- Session expires after 30 minutes
- All attempts logged to activity log

---

## 4. ai Router

**Path:** `server/routers.ts:152`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| chat | protectedProcedure | AI chat + admin unlock trigger | AI Chat page |

**Special Commands:**
- `"show admin"` - Triggers admin unlock flow (for users with admin role)

**UI Components:**
- `client/src/pages/AIChat.tsx` - Main AI chat interface

---

## 5. billing Router

**Path:** `server/routers.ts:206`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getPricing | publicProcedure | Get pricing info (£7.99/£79.90) | Pricing page, Home page |
| createCheckout | protectedProcedure | Create Stripe checkout session | Pricing page, Dashboard |
| createPortal | protectedProcedure | Create Stripe customer portal | Dashboard, Settings |
| getStatus | protectedProcedure | Get subscription status | Dashboard, Settings |

**UI Components:**
- `client/src/pages/Pricing.tsx` - ⚠️ **NEEDS CREATION**
- `client/src/pages/Dashboard.tsx` - Subscription status display

---

## 6. user Router

**Path:** `server/routers.ts:310`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getProfile | protectedProcedure | Get user profile | Settings, Profile page |
| updateProfile | protectedProcedure | Update name, email, photo | Settings page |
| getSubscriptionStatus | protectedProcedure | Detailed subscription info | Dashboard |
| getDashboardStats | subscribedProcedure | Stats for dashboard | Dashboard page |

**UI Components:**
- `client/src/pages/Dashboard.tsx` - Uses `getDashboardStats`
- Settings page - ⚠️ **NEEDS CREATION OR WIRING**

---

## 7. horses Router

**Path:** `server/routers.ts:364`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| list | subscribedProcedure | List all user's horses | Horses page |
| get | subscribedProcedure | Get single horse by ID | Horse detail page |
| create | subscribedProcedure | Create new horse | Horse form |
| update | subscribedProcedure | Update horse details | Horse form |
| delete | subscribedProcedure | Soft delete horse | Horse detail page |

**UI Components:**
- `client/src/pages/Horses.tsx` - List view
- `client/src/pages/HorseDetail.tsx` - Detail view
- `client/src/pages/HorseForm.tsx` - Create/edit form

**Status:** ✅ Fully implemented

---

## 8. healthRecords Router

**Path:** `server/routers.ts:460`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| listAll | subscribedProcedure | All health records for user | Health page |
| listByHorse | subscribedProcedure | Health records for specific horse | Horse detail page |
| get | subscribedProcedure | Get single health record | Health detail modal |
| create | subscribedProcedure | Add health record | Health page, Horse detail |
| update | subscribedProcedure | Update health record | Health page |
| delete | subscribedProcedure | Delete health record | Health page |
| getReminders | subscribedProcedure | Get upcoming health reminders | Dashboard |

**UI Components:**
- `client/src/pages/Health.tsx` - Main health tracking
- `client/src/pages/HorseDetail.tsx` - Horse-specific health view

**Status:** ✅ Implemented

---

## 9. training Router

**Path:** `server/routers.ts:552`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| listByHorse | subscribedProcedure | Training sessions for horse | Horse detail, Training page |
| listAll | subscribedProcedure | All training sessions | Training page |
| getUpcoming | subscribedProcedure | Upcoming sessions | Dashboard |
| create | subscribedProcedure | Log training session | Training page |
| update | subscribedProcedure | Update session | Training page |
| delete | subscribedProcedure | Delete session | Training page |
| complete | subscribedProcedure | Mark session complete | Training page |

**UI Components:**
- `client/src/pages/Training.tsx` - Training session management

**Status:** ✅ Implemented

---

## 10. feeding Router

**Path:** `server/routers.ts:649`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| listAll | subscribedProcedure | All feeding plans | Feeding page |
| listByHorse | subscribedProcedure | Feeding plan for horse | Horse detail |
| create | subscribedProcedure | Add feeding plan | Feeding page |
| update | subscribedProcedure | Update plan | Feeding page |
| delete | subscribedProcedure | Delete plan | Feeding page |

**UI Components:**
- `client/src/pages/Feeding.tsx` - Feeding management

**Status:** ✅ Implemented

**Missing:**
- ❌ Feed cost optimization recommendations (REQUIRED)

---

## 11. documents Router

**Path:** `server/routers.ts:706`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| list | subscribedProcedure | All user's documents | Documents page |
| listByHorse | subscribedProcedure | Documents for horse | Horse detail |
| upload | subscribedProcedure | Upload document to S3 | Documents page |
| delete | subscribedProcedure | Delete document | Documents page |

**UI Components:**
- `client/src/pages/Documents.tsx` - Document management

**Status:** ✅ Implemented

---

## 12. weather Router

**Path:** `server/routers.ts:767`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| analyze | subscribedProcedure | Get weather + AI riding analysis | Weather page |
| getLatest | subscribedProcedure | Most recent weather log | Dashboard |
| getHistory | subscribedProcedure | Past weather logs | Weather page |

**UI Components:**
- `client/src/pages/Weather.tsx` - Weather analysis

**Status:** ✅ Implemented

---

## 13. admin Router

**Path:** `server/routers.ts:863`

All procedures require **adminUnlockedProcedure** (admin role + active unlock session)

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getUsers | adminUnlockedProcedure | List all users | Admin panel - Users tab |
| getUserDetails | adminUnlockedProcedure | Get user detail | Admin panel |
| suspendUser | adminUnlockedProcedure | Suspend user account | Admin panel |
| unsuspendUser | adminUnlockedProcedure | Unsuspend user | Admin panel |
| deleteUser | adminUnlockedProcedure | Delete user (soft) | Admin panel |
| updateUserRole | adminUnlockedProcedure | Change user role | Admin panel |
| getStats | adminUnlockedProcedure | System statistics | Admin panel - Dashboard |
| getOverdueUsers | adminUnlockedProcedure | Users with overdue subs | Admin panel - Stripe tab |
| getExpiredTrials | adminUnlockedProcedure | Expired trial users | Admin panel |
| getActivityLogs | adminUnlockedProcedure | Activity audit logs | Admin panel - Logs tab |
| getSettings | adminUnlockedProcedure | System settings | Admin panel - Settings tab |
| updateSetting | adminUnlockedProcedure | Update system setting | Admin panel |
| getBackupLogs | adminUnlockedProcedure | Backup history | Admin panel |

**UI Components:**
- `client/src/pages/Admin.tsx` - Main admin panel

**Status:** 🟡 Partially implemented - **NEEDS FULL 6-TAB UI**

**Missing Tabs:**
- ❌ Users tab (list, suspend, delete, change role)
- ❌ Activity Logs tab
- ❌ System Settings tab
- ❌ Stripe Status Viewer tab
- ❌ Environment Health tab
- ❌ API Keys Management tab (see below)

---

## 14. admin.apiKeys Router

**Path:** `server/routers.ts:992`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| list | adminUnlockedProcedure | List API keys (prefix only) | Admin panel - API Keys |
| create | adminUnlockedProcedure | Generate new API key | Admin panel |
| revoke | adminUnlockedProcedure | Revoke/disable key | Admin panel |
| rotate | adminUnlockedProcedure | Rotate key (new + invalidate old) | Admin panel |
| updateSettings | adminUnlockedProcedure | Update key settings | Admin panel |
| getEnvHealth | adminUnlockedProcedure | Check env vars status | Admin panel - Env Health |

**Status:** ✅ Backend implemented, ❌ UI not wired

---

## 15. stables Router

**Path:** `server/routers.ts:1103`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| create | subscribedProcedure | Create stable/team | Stable page |
| list | subscribedProcedure | User's stables | Stable page |
| getById | subscribedProcedure | Get stable details | Stable page |
| update | subscribedProcedure | Update stable info | Stable page |
| inviteMember | subscribedProcedure | Invite team member | Stable page |
| getMembers | subscribedProcedure | List team members | Stable page |

**UI Components:**
- `client/src/pages/Stable.tsx` - Stable management

**Status:** 🟡 Partially implemented

**Missing:**
- ❌ Full invitation workflow UI
- ❌ Role management UI
- ❌ Member permissions display

---

## 16. messages Router

**Path:** `server/routers.ts:1282`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getThreads | subscribedProcedure | List message threads | Messages page |
| getMessages | subscribedProcedure | Get thread messages | Messages page |
| sendMessage | subscribedProcedure | Send message | Messages page |
| createThread | subscribedProcedure | Create thread | Messages page |

**UI Components:**
- `client/src/pages/Messages.tsx` - Team messaging

**Status:** 🟡 Partially implemented

---

## 17. analytics Router

**Path:** `server/routers.ts:1353`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getTrainingStats | subscribedProcedure | Training analytics | Analytics page |
| getHealthStats | subscribedProcedure | Health cost stats | Analytics page |
| getCostAnalysis | subscribedProcedure | Financial analytics | Analytics page |

**UI Components:**
- `client/src/pages/Analytics.tsx` - Analytics dashboard

**Status:** ❌ **EMPTY PLACEHOLDER - NEEDS REAL CHARTS**

**Required:**
- ❌ Performance Over Time (line chart)
- ❌ Placements Distribution (pie chart)
- ❌ Scores Trend (area chart)
- ❌ Per-Horse Comparison (bar chart)
- ❌ Training Hours per Month (bar chart)
- ❌ Health Costs Over Time (line chart)
- ❌ Competition Success Rate (pie chart)

---

## 18. reports Router

**Path:** `server/routers.ts:1432`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| generate | subscribedProcedure | Generate PDF report | Reports page |
| list | subscribedProcedure | List report schedules | Reports page |
| scheduleReport | subscribedProcedure | Create scheduled report | Reports page |

**UI Components:**
- `client/src/pages/Reports.tsx` - Report generation

**Status:** ❌ **NOT IMPLEMENTED - PLACEHOLDER ONLY**

**Required:**
- ❌ Report builder UI (horse, date range, sections)
- ❌ PDF generation (jspdf)
- ❌ Schedule management UI
- ❌ Email delivery setup

---

## 19. calendar Router

**Path:** `server/routers.ts:1500`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| getEvents | subscribedProcedure | List calendar events | Calendar page |
| createEvent | subscribedProcedure | Create event | Calendar page |
| updateEvent | subscribedProcedure | Update event | Calendar page |
| deleteEvent | subscribedProcedure | Delete event | Calendar page |

**UI Components:**
- `client/src/pages/Calendar.tsx` - Calendar view

**Status:** ✅ Implemented

---

## 20. competitions Router

**Path:** `server/routers.ts:1594`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| create | subscribedProcedure | Add competition result | Competitions page |
| list | subscribedProcedure | List competition results | Competitions page |

**UI Components:**
- Competitions page - ❌ **NEEDS CREATION**
- Analytics page - Should display competition visualizations

**Status:** ❌ Backend exists, no UI

---

## 21. trainingPrograms Router

**Path:** `server/routers.ts:1639`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| listTemplates | subscribedProcedure | List training templates | Training Templates page |
| createTemplate | subscribedProcedure | Create template | Training Templates page |
| applyTemplate | subscribedProcedure | Apply template to horse | Training Templates page |

**UI Components:**
- Training Templates page - ❌ **NEEDS CREATION**

**Status:** ❌ Backend partial, no UI

**Missing:**
- ❌ Update template
- ❌ Delete template
- ❌ Duplicate template
- ❌ Full CRUD UI

---

## 22. breeding Router

**Path:** `server/routers.ts:1711`

| Procedure | Type | Purpose | Used By |
|-----------|------|---------|---------|
| createRecord | subscribedProcedure | Create breeding record | Breeding page |
| list | subscribedProcedure | List breeding records | Breeding page |
| addFoal | subscribedProcedure | Add foal to breeding | Breeding page |

**UI Components:**
- Breeding page - ❌ **NEEDS CREATION**

**Status:** ❌ Backend partial, no UI

**Missing:**
- ❌ Update breeding record
- ❌ Delete breeding record
- ❌ Confirm pregnancy
- ❌ Update foal
- ❌ Delete foal
- ❌ Record milestones
- ❌ Full CRUD UI

---

## Summary Statistics

### Router Count: 22 routers

### Procedure Count by Security Level:
- publicProcedure: 4
- protectedProcedure: 10
- subscribedProcedure: 60+
- adminUnlockedProcedure: 16

### Implementation Status:
- ✅ Fully Implemented: 10 routers (45%)
- 🟡 Partially Implemented: 5 routers (23%)
- ❌ Not Implemented: 7 routers (32%)

---

## Missing Procedures (Required by Spec)

### Feed Cost Optimization
- ❌ `feeding.getOptimizationRecommendations` - AI-powered feed cost analysis

### Medical Passport
- ❌ `healthRecords.getMedicalPassport` - Generate printable passport
- ❌ `healthRecords.generateQRCode` - QR code for sharing
- ❌ `healthRecords.exportPDF` - PDF export

### CSV Exports
- ❌ `horses.exportCSV`
- ❌ `healthRecords.exportCSV`
- ❌ `training.exportCSV`
- ❌ `competitions.exportCSV`
- ❌ `feeding.exportCSV`
- ❌ `breeding.exportCSV`
- ❌ `documents.exportCSV`

### Lesson Scheduling
- ❌ `lessons` router (entire router missing)
- ❌ `lessons.createAvailability`
- ❌ `lessons.bookLesson`
- ❌ `lessons.listBookings`
- ❌ `lessons.markCompleted`

### Client Portal
- ❌ `clientPortal` router (entire router missing)
- ❌ Read-only views for horse owners

### Integration API
- ❌ REST API endpoints (not tRPC)
- ❌ `/api/v1/horses`
- ❌ `/api/v1/health-records/:horseId`
- ❌ `/api/v1/training-sessions/:horseId`

### White-Label
- ❌ `stables.updateBranding`
- ❌ `stables.getBranding`

---

## Next Steps

1. **Create missing UI pages:**
   - Pricing.tsx
   - Competitions.tsx
   - TrainingTemplates.tsx
   - Breeding.tsx
   - Lessons.tsx
   - ClientPortal.tsx

2. **Enhance existing pages:**
   - Admin.tsx - Add 6 tabs
   - Analytics.tsx - Add real charts with Recharts
   - Reports.tsx - Full report builder

3. **Add missing procedures:**
   - CSV exports for all entities
   - Medical passport generation
   - Feed cost optimization
   - Lesson scheduling
   - Client portal endpoints
   - White-label branding

4. **Create REST API layer:**
   - Express routes in `/server/api/`
   - API key authentication middleware
   - Rate limiting per key

---

**Document Version:** 1.0  
**Last Updated:** January 1, 2026  
**Maintainer:** Development Team
