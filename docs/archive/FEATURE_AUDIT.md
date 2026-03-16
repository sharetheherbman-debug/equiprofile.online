# EquiProfile Dashboard Feature Audit

**Date**: March 4, 2026  
**Audited By**: Copilot Engineering  
**Scope**: Every feature and function accessible from the dashboard

---

## Summary

| Status                                  | Count | Description                                                |
| --------------------------------------- | ----- | ---------------------------------------------------------- |
| ✅ **Fully Connected**                  | 30    | Feature has full backend tRPC/API integration              |
| ⚠️ **Partially Connected**              | 2     | Feature exists but some functions are stubbed/simulated    |
| ❌ **Not Connected**                    | 3     | Frontend UI exists but makes no backend calls              |
| 🔗 **Backend Exists, Frontend Missing** | 2     | Router defined in `routers.ts` but frontend never calls it |

**Total Features Audited: 35**

---

## Dashboard Home (`/dashboard`)

| Feature / Function                        | Status       | Backend Procedure            | Notes                                        |
| ----------------------------------------- | ------------ | ---------------------------- | -------------------------------------------- |
| Welcome header (user name)                | ✅ Connected | `useAuth` → JWT session      | Reads authenticated user from context        |
| Stats: Total Horses count                 | ✅ Connected | `user.getDashboardStats`     | Live count from DB                           |
| Stats: Upcoming Events count              | ✅ Connected | `user.getDashboardStats`     | Counts upcoming training sessions            |
| Stats: Health Reminders count             | ✅ Connected | `user.getDashboardStats`     | Counts active health reminders               |
| Subscription badge (trial/active/expired) | ✅ Connected | `user.getSubscriptionStatus` | Real-time subscription state                 |
| Quick Action → Add Horse                  | ✅ Connected | Links to `/horses/new`       | Navigation only                              |
| Quick Action → Log Training               | ✅ Connected | Links to `/training`         | Navigation only                              |
| Quick Action → Schedule                   | ✅ Connected | Links to `/calendar`         | Navigation only (calendar page itself is ❌) |
| Quick Action → AI Chat                    | ✅ Connected | Links to `/ai-chat`          | Navigation only                              |
| Module grid (all category cards)          | ✅ Connected | Navigation links             | All links are wired to real routes           |

---

## 1. Horses Module

### All Horses (`/horses`)

| Feature / Function     | Status       | Backend Procedure                        | Notes                            |
| ---------------------- | ------------ | ---------------------------------------- | -------------------------------- |
| List all horses        | ✅ Connected | `horses.list`                            | Full list for authenticated user |
| Delete horse           | ✅ Connected | `horses.delete`                          | Ownership verified on server     |
| Export horses to CSV   | ✅ Connected | `horses.exportCSV`                       | Server-generated CSV             |
| Search / filter horses | ✅ Connected | Client-side filter on `horses.list` data | No server-side search            |

### Add / Edit Horse (`/horses/new`, `/horses/:id/edit`)

| Feature / Function           | Status       | Backend Procedure | Notes                |
| ---------------------------- | ------------ | ----------------- | -------------------- |
| Create horse                 | ✅ Connected | `horses.create`   | Full form submission |
| Update horse details         | ✅ Connected | `horses.update`   | Full form submission |
| Load existing horse for edit | ✅ Connected | `horses.get`      | Pre-populates form   |

### Horse Detail (`/horses/:id`)

| Feature / Function               | Status       | Backend Procedure           | Notes                |
| -------------------------------- | ------------ | --------------------------- | -------------------- |
| View horse profile               | ✅ Connected | `horses.get`                | Full horse record    |
| View health records for horse    | ✅ Connected | `healthRecords.listByHorse` | Filtered by horse ID |
| View training sessions for horse | ✅ Connected | `training.listByHorse`      | Filtered by horse ID |
| View feeding plans for horse     | ✅ Connected | `feeding.listByHorse`       | Filtered by horse ID |

### Pedigree (`/pedigree`)

| Feature / Function          | Status       | Backend Procedure         | Notes                             |
| --------------------------- | ------------ | ------------------------- | --------------------------------- |
| View pedigree tree          | ✅ Connected | `pedigree.get`            | Retrieves parent/grandparent data |
| Create / update pedigree    | ✅ Connected | `pedigree.createOrUpdate` | Saves ancestry data               |
| Horse selector for pedigree | ✅ Connected | `horses.list`             | Populates dropdown                |

---

## 2. Health Module

### Health Hub (`/health`)

| Feature / Function           | Status       | Backend Procedure            | Notes                         |
| ---------------------------- | ------------ | ---------------------------- | ----------------------------- |
| List all health records      | ✅ Connected | `healthRecords.listAll`      | All records across all horses |
| View records by horse        | ✅ Connected | `healthRecords.listByHorse`  | Filtered view                 |
| Health reminders             | ✅ Connected | `healthRecords.getReminders` | Outstanding care reminders    |
| Create health record         | ✅ Connected | `healthRecords.create`       | Saves to DB                   |
| Export health records to CSV | ✅ Connected | `healthRecords.exportCSV`    | Server-generated CSV          |

### Vaccinations (`/vaccinations`)

| Feature / Function | Status       | Backend Procedure     | Notes |
| ------------------ | ------------ | --------------------- | ----- |
| List vaccinations  | ✅ Connected | `vaccinations.list`   |       |
| Add vaccination    | ✅ Connected | `vaccinations.create` |       |
| Edit vaccination   | ✅ Connected | `vaccinations.update` |       |
| Delete vaccination | ✅ Connected | `vaccinations.delete` |       |

### Dental Care (`/dental`)

| Feature / Function   | Status       | Backend Procedure   | Notes |
| -------------------- | ------------ | ------------------- | ----- |
| List dental records  | ✅ Connected | `dentalCare.list`   |       |
| Add dental record    | ✅ Connected | `dentalCare.create` |       |
| Edit dental record   | ✅ Connected | `dentalCare.update` |       |
| Delete dental record | ✅ Connected | `dentalCare.delete` |       |

### Hoof Care (`/hoofcare`)

| Feature / Function      | Status       | Backend Procedure | Notes |
| ----------------------- | ------------ | ----------------- | ----- |
| List hoof care records  | ✅ Connected | `hoofcare.list`   |       |
| Add hoof care record    | ✅ Connected | `hoofcare.create` |       |
| Edit hoof care record   | ✅ Connected | `hoofcare.update` |       |
| Delete hoof care record | ✅ Connected | `hoofcare.delete` |       |

### Dewormings (`/dewormings`)

| Feature / Function      | Status       | Backend Procedure   | Notes |
| ----------------------- | ------------ | ------------------- | ----- |
| List deworming records  | ✅ Connected | `dewormings.list`   |       |
| Add deworming record    | ✅ Connected | `dewormings.create` |       |
| Edit deworming record   | ✅ Connected | `dewormings.update` |       |
| Delete deworming record | ✅ Connected | `dewormings.delete` |       |

### Treatments (`/treatments`)

| Feature / Function | Status       | Backend Procedure   | Notes |
| ------------------ | ------------ | ------------------- | ----- |
| List treatments    | ✅ Connected | `treatments.list`   |       |
| Add treatment      | ✅ Connected | `treatments.create` |       |
| Edit treatment     | ✅ Connected | `treatments.update` |       |
| Delete treatment   | ✅ Connected | `treatments.delete` |       |

### X-Rays (`/xrays`)

| Feature / Function  | Status       | Backend Procedure | Notes |
| ------------------- | ------------ | ----------------- | ----- |
| List X-ray records  | ✅ Connected | `xrays.list`      |       |
| Add X-ray record    | ✅ Connected | `xrays.create`    |       |
| Edit X-ray record   | ✅ Connected | `xrays.update`    |       |
| Delete X-ray record | ✅ Connected | `xrays.delete`    |       |

---

## 3. Training Module

### Training Log (`/training`)

| Feature / Function     | Status       | Backend Procedure      | Notes |
| ---------------------- | ------------ | ---------------------- | ----- |
| List all sessions      | ✅ Connected | `training.listAll`     |       |
| View upcoming sessions | ✅ Connected | `training.getUpcoming` |       |
| Log new session        | ✅ Connected | `training.create`      |       |
| Mark session complete  | ✅ Connected | `training.complete`    |       |
| Filter by horse        | ✅ Connected | `training.listByHorse` |       |
| Export training to CSV | ✅ Connected | `training.exportCSV`   |       |

### Training Templates (`/training-templates`)

| Feature / Function      | Status       | Backend Procedure                    | Notes              |
| ----------------------- | ------------ | ------------------------------------ | ------------------ |
| List templates          | ✅ Connected | `trainingPrograms.listTemplates`     |                    |
| Create template         | ✅ Connected | `trainingPrograms.createTemplate`    |                    |
| Edit template           | ✅ Connected | `trainingPrograms.updateTemplate`    |                    |
| Delete template         | ✅ Connected | `trainingPrograms.deleteTemplate`    |                    |
| Duplicate template      | ✅ Connected | `trainingPrograms.duplicateTemplate` |                    |
| Apply template to horse | ✅ Connected | `trainingPrograms.applyTemplate`     |                    |
| Horse selector          | ✅ Connected | `horses.list`                        | Populates dropdown |

### Lessons (`/lessons`)

| Feature / Function                | Status       | Backend Procedure                        | Notes |
| --------------------------------- | ------------ | ---------------------------------------- | ----- |
| List lesson bookings (as student) | ✅ Connected | `lessonBookings.list` (asTrainer: false) |       |
| List lesson bookings (as trainer) | ✅ Connected | `lessonBookings.list` (asTrainer: true)  |       |
| Book a lesson                     | ✅ Connected | `lessonBookings.create`                  |       |
| Edit lesson booking               | ✅ Connected | `lessonBookings.update`                  |       |
| Cancel booking                    | ✅ Connected | `lessonBookings.markCancelled`           |       |
| Mark lesson completed             | ✅ Connected | `lessonBookings.markCompleted`           |       |
| Delete lesson booking             | ✅ Connected | `lessonBookings.delete`                  |       |
| View trainer availability         | ✅ Connected | `trainerAvailability.list`               |       |
| Add trainer availability slot     | ✅ Connected | `trainerAvailability.create`             |       |
| Delete availability slot          | ✅ Connected | `trainerAvailability.delete`             |       |

---

## 4. Nutrition Module

### Feeding Plans (`/feeding`)

| Feature / Function         | Status       | Backend Procedure     | Notes |
| -------------------------- | ------------ | --------------------- | ----- |
| List all feeding plans     | ✅ Connected | `feeding.listAll`     |       |
| List by horse              | ✅ Connected | `feeding.listByHorse` |       |
| Add feeding plan           | ✅ Connected | `feeding.create`      |       |
| Delete feeding plan        | ✅ Connected | `feeding.delete`      |       |
| Export feeding data to CSV | ✅ Connected | `feeding.exportCSV`   |       |

### Nutrition Plans (`/nutrition-plans`)

| Feature / Function    | Status       | Backend Procedure       | Notes |
| --------------------- | ------------ | ----------------------- | ----- |
| List nutrition plans  | ✅ Connected | `nutritionPlans.list`   |       |
| Create nutrition plan | ✅ Connected | `nutritionPlans.create` |       |
| Edit nutrition plan   | ✅ Connected | `nutritionPlans.update` |       |
| Delete nutrition plan | ✅ Connected | `nutritionPlans.delete` |       |

### Nutrition Logs (`/nutrition-logs`)

| Feature / Function         | Status       | Backend Procedure      | Notes |
| -------------------------- | ------------ | ---------------------- | ----- |
| List nutrition logs        | ✅ Connected | `nutritionLogs.list`   |       |
| Add nutrition log entry    | ✅ Connected | `nutritionLogs.create` |       |
| Edit nutrition log entry   | ✅ Connected | `nutritionLogs.update` |       |
| Delete nutrition log entry | ✅ Connected | `nutritionLogs.delete` |       |

---

## 5. Schedule Module

### Calendar (`/calendar`)

| Feature / Function            | Status           | Backend Procedure | Notes                                         |
| ----------------------------- | ---------------- | ----------------- | --------------------------------------------- |
| Display monthly calendar grid | ❌ Not Connected | None              | Static placeholder UI only                    |
| Add Event button              | ❌ Not Connected | None              | Button renders but has no action wired up     |
| View/Week/Day toggle          | ❌ Not Connected | None              | UI state only, no data is loaded for any view |
| Upcoming Events list          | ❌ Not Connected | None              | Hard-coded "No upcoming events" message       |
| Navigate months               | ❌ Not Connected | None              | Navigation works in UI only (no data loads)   |
| Event badges on calendar days | ❌ Not Connected | None              | Placeholder comment in code, never rendered   |

> **Note**: No backend router for calendar events exists. The `appointments` page provides a connected alternative. The appointments/tasks data is never surfaced on this calendar view.

### Appointments (`/appointments`)

| Feature / Function | Status       | Backend Procedure     | Notes |
| ------------------ | ------------ | --------------------- | ----- |
| List appointments  | ✅ Connected | `appointments.list`   |       |
| Add appointment    | ✅ Connected | `appointments.create` |       |
| Edit appointment   | ✅ Connected | `appointments.update` |       |
| Delete appointment | ✅ Connected | `appointments.delete` |       |

### Tasks (`/tasks`)

| Feature / Function  | Status       | Backend Procedure  | Notes |
| ------------------- | ------------ | ------------------ | ----- |
| List tasks          | ✅ Connected | `tasks.list`       |       |
| Create task         | ✅ Connected | `tasks.create`     |       |
| Complete task       | ✅ Connected | `tasks.complete`   |       |
| Delete task         | ✅ Connected | `tasks.delete`     |       |
| Overdue tasks query | ✅ Connected | `tasks.getOverdue` |       |

---

## 6. AI Tools Module

### AI Assistant (`/ai-chat`)

| Feature / Function        | Status       | Backend Procedure | Notes                                         |
| ------------------------- | ------------ | ----------------- | --------------------------------------------- |
| Send message to AI        | ✅ Connected | `ai.chat`         | Calls LLM via server                          |
| View conversation history | ✅ Connected | Client-side state | Messages stored in React state, not persisted |
| Save AI response as note  | ✅ Connected | `notes.create`    | Notes persisted to DB                         |
| List saved notes          | ✅ Connected | `notes.list`      |                                               |
| Delete saved note         | ✅ Connected | `notes.delete`    |                                               |

### Weather (`/weather`)

| Feature / Function         | Status       | Backend Procedure        | Notes                         |
| -------------------------- | ------------ | ------------------------ | ----------------------------- |
| Current weather conditions | ✅ Connected | `weather.getCurrent`     | Uses stored location          |
| Weather forecast           | ✅ Connected | `weather.getForecast`    | Multi-day forecast            |
| Historical weather data    | ✅ Connected | `weather.getHistory`     |                               |
| Latest weather snapshot    | ✅ Connected | `weather.getLatest`      |                               |
| Update weather location    | ✅ Connected | `weather.updateLocation` | Saved to user profile         |
| AI weather analysis        | ✅ Connected | `weather.analyze`        | LLM-powered equestrian advice |

---

## 7. Documents Module

### Document Vault (`/documents`)

| Feature / Function          | Status       | Backend Procedure     | Notes                            |
| --------------------------- | ------------ | --------------------- | -------------------------------- |
| List all documents          | ✅ Connected | `documents.list`      |                                  |
| Upload document             | ✅ Connected | `documents.upload`    | File stored via storage provider |
| Delete document             | ✅ Connected | `documents.delete`    |                                  |
| Export document list to CSV | ✅ Connected | `documents.exportCSV` |                                  |

---

## 8. Breeding Module

### Breeding Manager (`/breeding`)

| Feature / Function     | Status       | Backend Procedure           | Notes |
| ---------------------- | ------------ | --------------------------- | ----- |
| List breeding records  | ✅ Connected | `breeding.list`             |       |
| Create breeding record | ✅ Connected | `breeding.createRecord`     |       |
| Update breeding record | ✅ Connected | `breeding.update`           |       |
| Delete breeding record | ✅ Connected | `breeding.delete`           |       |
| Confirm pregnancy      | ✅ Connected | `breeding.confirmPregnancy` |       |
| Add foal               | ✅ Connected | `breeding.addFoal`          |       |
| List foals             | ✅ Connected | `breeding.listFoals`        |       |

---

## 9. Stable Module

### Stable Management (`/stable`)

| Feature / Function    | Status           | Backend Procedure                 | Notes                                            |
| --------------------- | ---------------- | --------------------------------- | ------------------------------------------------ |
| Create stable         | ❌ Not Connected | `stables` router exists on server | "Create Stable" button has no action             |
| View stable overview  | ❌ Not Connected | None                              | Shows static hardcoded zeros                     |
| Total members count   | ❌ Not Connected | None                              | Always shows "0"                                 |
| Active horses count   | ❌ Not Connected | None                              | Always shows "0"                                 |
| Pending invites count | ❌ Not Connected | None                              | Always shows "0"                                 |
| Members tab           | ❌ Not Connected | None                              | "No members yet" — no list or invite call        |
| Invite members        | ❌ Not Connected | None                              | Button renders but triggers nothing              |
| Activity feed         | ❌ Not Connected | None                              | Always empty                                     |
| Stable settings       | ❌ Not Connected | None                              | Placeholder "Create a stable to access settings" |

> **Note**: The server has a fully implemented `stables` router with `create`, `list`, `get`, `update`, `addMember`, `removeMember`, and `getActivity` procedures. None of them are called by the frontend.

### Contacts (`/contacts`)

| Feature / Function | Status       | Backend Procedure | Notes |
| ------------------ | ------------ | ----------------- | ----- |
| List contacts      | ✅ Connected | `contacts.list`   |       |
| Add contact        | ✅ Connected | `contacts.create` |       |
| Delete contact     | ✅ Connected | `contacts.delete` |       |

### Client Portal (`/client/:clientId`)

| Feature / Function       | Status       | Backend Procedure       | Notes                 |
| ------------------------ | ------------ | ----------------------- | --------------------- |
| View client's horses     | ✅ Connected | `horses.list`           | Read-only public view |
| View health summary      | ✅ Connected | `healthRecords.listAll` |                       |
| View training summary    | ✅ Connected | `training.listAll`      |                       |
| View competition results | ✅ Connected | `competitions.list`     |                       |
| View documents           | ✅ Connected | `documents.list`        |                       |

### Messages (`/messages`)

| Feature / Function        | Status           | Backend Procedure                  | Notes                                                      |
| ------------------------- | ---------------- | ---------------------------------- | ---------------------------------------------------------- |
| View conversation threads | ❌ Not Connected | `messages` router exists on server | Always shows "No messages"                                 |
| Read messages in thread   | ❌ Not Connected | `messages.getThread` exists        | Thread list is empty static UI                             |
| Send message              | ❌ Not Connected | `messages.send` exists             | `handleSendMessage` clears the input but makes no API call |
| Chat area                 | ❌ Not Connected | None                               | Renders "Select a conversation" placeholder                |

> **Note**: The server has a `messages` router with `listThreads`, `getThread`, and `send` procedures. None are called from the frontend.

---

## 10. Financial Module

### Billing (`/billing`)

| Feature / Function                  | Status       | Backend Procedure                                   | Notes                              |
| ----------------------------------- | ------------ | --------------------------------------------------- | ---------------------------------- |
| View current subscription plan      | ✅ Connected | `useAuth` (user object from JWT)                    | Plan/status read from auth context |
| View trial days remaining           | ✅ Connected | `useAuth` (user.trialEndsAt)                        | Computed from JWT user data        |
| Start subscription checkout         | ✅ Connected | REST `GET /api/billing/checkout?plan=...`           | Redirects to Stripe                |
| Open billing portal (manage/cancel) | ✅ Connected | REST `GET /api/billing/portal`                      | Redirects to Stripe portal         |
| Display pricing tiers               | ✅ Connected | `billing.getPricing` (via shared `DEFAULT_PRICING`) | Prices read from shared constants  |

> **Note**: Billing uses direct REST redirects (`window.location.href`) rather than tRPC mutations — this is intentional for Stripe redirects. The `billing.createCheckout` and `billing.createPortal` tRPC mutations exist in the router but are not used by the billing page, which instead hits REST endpoints directly. Both approaches call the same underlying Stripe logic.

---

## 11. Reports Module

### Analytics (`/analytics`)

| Feature / Function      | Status       | Backend Procedure       | Notes               |
| ----------------------- | ------------ | ----------------------- | ------------------- |
| Training session charts | ✅ Connected | `training.listAll`      | Charted client-side |
| Health records overview | ✅ Connected | `healthRecords.listAll` |                     |
| Competition results     | ✅ Connected | `competitions.list`     |                     |
| Horse overview stats    | ✅ Connected | `horses.list`           |                     |

### Reports (`/reports`)

| Feature / Function        | Status       | Backend Procedure        | Notes                         |
| ------------------------- | ------------ | ------------------------ | ----------------------------- |
| List saved reports        | ✅ Connected | `reports.list`           |                               |
| Generate report           | ✅ Connected | `reports.generate`       | Server-side report generation |
| Schedule recurring report | ✅ Connected | `reports.scheduleReport` |                               |

### Tags (`/tags`)

| Feature / Function | Status       | Backend Procedure | Notes |
| ------------------ | ------------ | ----------------- | ----- |
| List tags          | ✅ Connected | `tags.list`       |       |
| Create tag         | ✅ Connected | `tags.create`     |       |
| Edit tag           | ✅ Connected | `tags.update`     |       |
| Delete tag         | ✅ Connected | `tags.delete`     |       |

---

## 12. Settings Module

### Settings (`/settings`)

| Feature / Function                    | Status                 | Backend Procedure                                           | Notes                                                                                     |
| ------------------------------------- | ---------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Display current profile (name, email) | ✅ Connected           | `useAuth` (user from JWT)                                   | Read-only display from session                                                            |
| **Save profile (name)**               | ⚠️ Partially Connected | `user.updateProfile` exists on server but is **not called** | `handleProfileSave` uses `setTimeout` to simulate success — no real API call is made      |
| **Change password**                   | ⚠️ Partially Connected | No `changePassword` procedure exists                        | `handlePasswordChange` uses `setTimeout` to simulate — password is never actually changed |
| **Save notification preferences**     | ⚠️ Partially Connected | No backend procedure for notifications                      | `handleNotificationSave` uses `setTimeout` to simulate — preferences are never persisted  |
| Dark/light theme toggle               | ✅ Connected           | `ThemeContext` (localStorage)                               | Persisted in `localStorage`, no server-side state needed                                  |
| Capture GPS location for weather      | ✅ Connected           | `weather.updateLocation`                                    | Saves lat/lng to user profile on server                                                   |

### Admin Panel (`/admin`)

| Feature / Function             | Status       | Backend Procedure            | Notes                 |
| ------------------------------ | ------------ | ---------------------------- | --------------------- |
| List all users                 | ✅ Connected | `admin.getUsers`             | Admin-gated procedure |
| Get user activity logs         | ✅ Connected | `admin.getActivityLogs`      |                       |
| View platform stats            | ✅ Connected | `admin.getStats`             |                       |
| View overdue subscribers       | ✅ Connected | `admin.getOverdueUsers`      |                       |
| View expired trials            | ✅ Connected | `admin.getExpiredTrials`     |                       |
| Suspend user                   | ✅ Connected | `admin.suspendUser`          |                       |
| Unsuspend user                 | ✅ Connected | `admin.unsuspendUser`        |                       |
| Delete user                    | ✅ Connected | `admin.deleteUser`           |                       |
| Change user role               | ✅ Connected | `admin.updateUserRole`       |                       |
| View/get admin settings        | ✅ Connected | `admin.getSettings`          |                       |
| Admin env health check         | ✅ Connected | `admin.getEnvHealth`         |                       |
| View sales leads               | ✅ Connected | `admin.getLeads`             |                       |
| Manage API keys (list)         | ✅ Connected | `admin.apiKeys.list`         |                       |
| Create API key                 | ✅ Connected | `admin.apiKeys.create`       |                       |
| Revoke API key                 | ✅ Connected | `admin.apiKeys.revoke`       |                       |
| Rotate API key                 | ✅ Connected | `admin.apiKeys.rotate`       |                       |
| Admin unlock (get status)      | ✅ Connected | `adminUnlock.getStatus`      |                       |
| Admin unlock (submit password) | ✅ Connected | `adminUnlock.submitPassword` |                       |

---

## Issues Requiring Fixes

### 🔴 Critical — Broken Features (UI works but data is never saved)

| #   | Feature                      | Page        | Issue                                                                                                                           | Fix Required                                                          |
| --- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | **Save Profile**             | `/settings` | `handleProfileSave` uses a fake `setTimeout` instead of calling `trpc.user.updateProfile`. Profile changes are never persisted. | Call `trpc.user.updateProfile.useMutation()` with the `name` field    |
| 2   | **Change Password**          | `/settings` | `handlePasswordChange` uses a fake `setTimeout`. No `changePassword` procedure exists on the server. Password is never changed. | Create `auth.changePassword` tRPC procedure and call it from Settings |
| 3   | **Notification Preferences** | `/settings` | `handleNotificationSave` uses a fake `setTimeout`. No backend procedure or DB column for notification preferences.              | Create `user.updateNotificationPreferences` procedure and a DB column |

### 🟠 High — Completely Disconnected Pages

| #   | Feature               | Page        | Issue                                                                                                                                                       | Backend Router                                 |
| --- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 4   | **Calendar**          | `/calendar` | Entire page is a static UI placeholder. No events are loaded or saved. No backend calendar router exists.                                                   | Must be created from scratch                   |
| 5   | **Stable Management** | `/stable`   | All tabs show hardcoded zeros and empty states. The `stables` tRPC router is fully implemented on the server but never called.                              | `stables` router — needs frontend integration  |
| 6   | **Messages**          | `/messages` | "Send message" clears input but calls nothing. Thread list is always empty. The `messages` tRPC router is fully implemented on the server but never called. | `messages` router — needs frontend integration |

### 🟡 Medium — Minor Gaps

| #   | Feature                              | Page         | Issue                                                                                                                                                                             |
| --- | ------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | **AI Chat conversation history**     | `/ai-chat`   | Chat messages are stored in React state only. Refreshing the page clears all conversation history. No persistence to DB.                                                          |
| 8   | **Contacts — Edit**                  | `/contacts`  | There is a `contacts.create` and `contacts.delete` but no `contacts.update` mutation call in the frontend (though the backend has it). Edit functionality is absent from the UI.  |
| 9   | **Dashboard Stats — Training Hours** | `/dashboard` | `StatsOverview` receives `trainingHours={0}` hardcoded. The training hours stat is never computed or fetched.                                                                     |
| 10  | **Billing — tRPC mutations unused**  | `/billing`   | `billing.createCheckout` and `billing.createPortal` tRPC mutations exist on the server but the billing page uses direct REST URL redirects instead. Not broken, but inconsistent. |

---

## Backend Routers with No Frontend Usage

These routers exist in `server/routers.ts` but are never called from the frontend:

| Router     | Procedures                                                                                       | Status                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `stables`  | `create`, `list`, `get`, `update`, `addMember`, `removeMember`, `getActivity`, `getMemberHorses` | Frontend page (`/stable`) exists but does not call any of these   |
| `messages` | `listThreads`, `getThread`, `send`, `markRead`                                                   | Frontend page (`/messages`) exists but does not call any of these |

---

## Connection Status Quick Reference

```
HORSES MODULE
  ✅ /horses              — List, delete, export
  ✅ /horses/new          — Create horse
  ✅ /horses/:id/edit     — Edit horse
  ✅ /horses/:id          — Horse detail (health, training, feeding)
  ✅ /pedigree            — View/edit pedigree tree

HEALTH MODULE
  ✅ /health              — Health hub, reminders
  ✅ /vaccinations        — CRUD
  ✅ /dental              — CRUD
  ✅ /hoofcare            — CRUD
  ✅ /dewormings          — CRUD
  ✅ /treatments          — CRUD
  ✅ /xrays               — CRUD

TRAINING MODULE
  ✅ /training            — Log, complete, export
  ✅ /training-templates  — Create/apply templates
  ✅ /lessons             — Book/manage lessons & availability

NUTRITION MODULE
  ✅ /feeding             — Feeding plans
  ✅ /nutrition-plans     — CRUD
  ✅ /nutrition-logs      — CRUD

SCHEDULE MODULE
  ❌ /calendar            — STATIC PLACEHOLDER — no backend connection
  ✅ /appointments        — CRUD
  ✅ /tasks               — Create, complete, delete

AI TOOLS MODULE
  ✅ /ai-chat             — LLM chat, save/delete notes
  ✅ /weather             — Current, forecast, history, AI analysis

DOCUMENTS MODULE
  ✅ /documents           — Upload, list, delete

BREEDING MODULE
  ✅ /breeding            — Full breeding lifecycle management

STABLE MODULE
  ❌ /stable              — NOT CONNECTED (server router exists, unused)
  ✅ /contacts            — List, create, delete
  ✅ /client/:clientId    — Read-only client view
  ❌ /messages            — NOT CONNECTED (server router exists, unused)

FINANCIAL MODULE
  ✅ /billing             — Stripe checkout/portal via REST, plan display

REPORTS MODULE
  ✅ /analytics           — Charts from live data
  ✅ /reports             — Generate, schedule, list
  ✅ /tags                — CRUD

SETTINGS MODULE
  ⚠️  /settings           — Location update connected; profile/password/notifications SIMULATED
  ✅ /admin               — Full admin panel connected
```

---

_Generated by automated codebase audit — March 4, 2026_
