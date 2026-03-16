# Coverage Matrix - EquiProfile Route/Endpoint Mapping

This document maps every navigation item to its corresponding routes, backend endpoints, and realtime channels. Use this as a reference for debugging and understanding data flow.

## Marketing Site Routes

| Nav Item | Route       | Component         | Backend Endpoints                                                                                           | Realtime |
| -------- | ----------- | ----------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Home     | `/`         | Home.tsx          | None (public)                                                                                               | N/A      |
| About    | `/about`    | About.tsx         | None (public)                                                                                               | N/A      |
| Features | `/features` | Features.tsx      | None (public)                                                                                               | N/A      |
| Pricing  | `/pricing`  | Pricing.tsx       | `/api/billing/plans`, `/trpc/billing.getPricing`, `/trpc/billing.getStatus`, `/trpc/billing.createCheckout` | N/A      |
| Contact  | `/contact`  | Contact.tsx       | `/trpc/contact.send` (if exists)                                                                            | N/A      |
| Login    | `/login`    | auth/Login.tsx    | `/api/auth/login`, `/api/oauth/callback`                                                                    | N/A      |
| Register | `/register` | auth/Register.tsx | `/api/auth/signup`, `/api/oauth/callback`                                                                   | N/A      |

## Dashboard Routes (Protected)

| Nav Item          | Route                 | Component              | Backend Endpoints                                                                                       | Realtime Channel                    |
| ----------------- | --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Dashboard Home    | `/dashboard`          | Dashboard.tsx          | `/trpc/user.getProfile`, `/trpc/horses.list`, `/trpc/health.getUpcoming`                                | `user:{userId}`                     |
| My Horses         | `/horses`             | Horses.tsx             | `/trpc/horses.list`, `/trpc/horses.create`, `/trpc/horses.update`, `/trpc/horses.delete`                | `user:{userId}:horses`              |
| Horse Details     | `/horses/:id`         | HorseDetail.tsx        | `/trpc/horses.get`, `/trpc/health.getAll`, `/trpc/training.getAll`                                      | `horse:{horseId}`                   |
| New Horse         | `/horses/new`         | HorseForm.tsx          | `/trpc/horses.create`                                                                                   | N/A                                 |
| Edit Horse        | `/horses/:id/edit`    | HorseForm.tsx          | `/trpc/horses.get`, `/trpc/horses.update`                                                               | N/A                                 |
| Pedigree          | `/pedigree`           | Pedigree.tsx           | `/trpc/horses.getPedigree`                                                                              | N/A                                 |
| Health Records    | `/health`             | Health.tsx             | `/trpc/health.getAll`, `/trpc/health.create`, `/trpc/health.update`, `/trpc/health.delete`              | `user:{userId}:health`              |
| Vaccinations      | `/vaccinations`       | Vaccinations.tsx       | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:vaccinations` |
| Dental Care       | `/dental`             | DentalCare.tsx         | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:dental`       |
| Hoof Care         | `/hoofcare`           | Hoofcare.tsx           | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:hoofcare`     |
| Dewormings        | `/dewormings`         | Dewormings.tsx         | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:dewormings`   |
| Treatments        | `/treatments`         | Treatments.tsx         | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:treatments`   |
| X-Rays            | `/xrays`              | Xrays.tsx              | `/trpc/health.getByType`, `/trpc/health.create`                                                         | `user:{userId}:health:xrays`        |
| Training          | `/training`           | Training.tsx           | `/trpc/training.getAll`, `/trpc/training.create`, `/trpc/training.update`                               | `user:{userId}:training`            |
| Templates         | `/training-templates` | TrainingTemplates.tsx  | `/trpc/training.getTemplates`, `/trpc/training.applyTemplate`                                           | N/A                                 |
| Lessons           | `/lessons`            | LessonScheduling.tsx   | `/trpc/lessons.getAll`, `/trpc/lessons.create`                                                          | `user:{userId}:lessons`             |
| Tasks             | `/tasks`              | Tasks.tsx              | `/trpc/tasks.getAll`, `/trpc/tasks.create`, `/trpc/tasks.update`, `/trpc/tasks.delete`                  | `user:{userId}:tasks`               |
| Calendar          | `/calendar`           | Calendar.tsx           | `/trpc/calendar.getEvents`, `/trpc/tasks.getAll`, `/trpc/lessons.getAll`                                | `user:{userId}:calendar`            |
| Appointments      | `/appointments`       | Appointments.tsx       | `/trpc/appointments.getAll`, `/trpc/appointments.create`                                                | `user:{userId}:appointments`        |
| Contacts          | `/contacts`           | Contacts.tsx           | `/trpc/contacts.getAll`, `/trpc/contacts.create`, `/trpc/contacts.update`                               | `user:{userId}:contacts`            |
| Client Portal     | `/client/:clientId`   | ClientPortal.tsx       | `/trpc/clients.get`, `/trpc/horses.getByClient`                                                         | N/A                                 |
| Messages          | `/messages`           | Messages.tsx           | `/trpc/messages.getAll`, `/trpc/messages.send`                                                          | `user:{userId}:messages`            |
| Breeding          | `/breeding`           | BreedingManagement.tsx | `/trpc/breeding.getAll`, `/trpc/breeding.create`                                                        | `user:{userId}:breeding`            |
| Feeding           | `/feeding`            | Feeding.tsx            | `/trpc/feeding.getSchedule`, `/trpc/feeding.update`                                                     | `user:{userId}:feeding`             |
| Nutrition Plans   | `/nutrition-plans`    | NutritionPlans.tsx     | `/trpc/nutrition.getPlans`, `/trpc/nutrition.create`                                                    | N/A                                 |
| Nutrition Logs    | `/nutrition-logs`     | NutritionLogs.tsx      | `/trpc/nutrition.getLogs`, `/trpc/nutrition.log`                                                        | N/A                                 |
| Weather           | `/weather`            | Weather.tsx            | `/trpc/weather.getCurrent`, `/trpc/weather.getForecast`                                                 | `user:{userId}:weather`             |
| Documents         | `/documents`          | Documents.tsx          | `/trpc/documents.getAll`, `/trpc/documents.upload`, `/trpc/documents.delete`                            | `user:{userId}:documents`           |
| AI Chat           | `/ai-chat`            | AIChat.tsx             | `/trpc/ai.chat`, `/trpc/ai.getHistory`                                                                  | `user:{userId}:ai`                  |
| Billing           | `/billing`            | BillingPage.tsx        | `/trpc/billing.getStatus`, `/trpc/billing.createPortal`, `/api/billing/checkout`, `/api/billing/portal` | `user:{userId}:billing`             |
| Settings          | `/settings`           | Settings.tsx           | `/trpc/user.updateProfile`, `/trpc/user.updatePreferences`                                              | N/A                                 |
| Analytics         | `/analytics`          | Analytics.tsx          | `/trpc/analytics.get`                                                                                   | N/A                                 |
| Reports           | `/reports`            | Reports.tsx            | `/trpc/reports.generate`, `/trpc/reports.export`                                                        | N/A                                 |
| Tags              | `/tags`               | Tags.tsx               | `/trpc/tags.getAll`, `/trpc/tags.create`, `/trpc/tags.delete`                                           | N/A                                 |
| Stable Management | `/stable`             | Stable.tsx             | `/trpc/stable.getInfo`, `/trpc/stable.update`                                                           | N/A                                 |

## Admin Routes (Admin Only)

| Nav Item    | Route    | Component | Backend Endpoints                                                                                            | Realtime Channel |
| ----------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| Admin Panel | `/admin` | Admin.tsx | `/trpc/admin.getAllUsers`, `/trpc/admin.updateUser`, `/trpc/admin.suspendUser`, `/trpc/admin.generateApiKey` | `admin:panel`    |

## Public API Endpoints (No Nav)

| Endpoint                | Purpose                | Auth Required | Rate Limited    |
| ----------------------- | ---------------------- | ------------- | --------------- |
| `/api/health`           | Health check           | No            | Yes (60/min)    |
| `/api/health/ping`      | Simple ping            | No            | Yes (60/min)    |
| `/api/version`          | Build info             | No            | Yes (60/min)    |
| `/build`                | Cached build info      | No            | Yes (60/min)    |
| `/api/oauth/status`     | OAuth config status    | No            | No              |
| `/api/oauth/callback`   | OAuth callback         | No            | No              |
| `/api/auth/login`       | Email/password login   | No            | Yes (100/15min) |
| `/api/auth/signup`      | User registration      | No            | Yes (100/15min) |
| `/api/auth/logout`      | User logout            | Yes           | No              |
| `/api/billing/plans`    | Get all pricing plans  | No            | Yes (100/15min) |
| `/api/billing/checkout` | Create Stripe checkout | Yes           | Yes (100/15min) |
| `/api/billing/portal`   | Stripe customer portal | Yes           | Yes (100/15min) |
| `/api/webhooks/stripe`  | Stripe webhooks        | No (signed)   | No              |
| `/api/realtime/events`  | SSE event stream       | Yes           | No              |
| `/api/realtime/stats`   | SSE statistics         | Yes (Admin)   | No              |

## Realtime Channels (SSE)

| Channel Pattern          | Purpose                                       | Subscribers                |
| ------------------------ | --------------------------------------------- | -------------------------- |
| `user:{userId}`          | Global user events (reminders, notifications) | Individual user            |
| `user:{userId}:horses`   | Horse CRUD operations                         | Individual user            |
| `user:{userId}:health`   | Health record updates                         | Individual user            |
| `user:{userId}:training` | Training log updates                          | Individual user            |
| `user:{userId}:tasks`    | Task updates                                  | Individual user            |
| `user:{userId}:calendar` | Calendar event changes                        | Individual user            |
| `user:{userId}:billing`  | Subscription status changes                   | Individual user            |
| `horse:{horseId}`        | Specific horse updates                        | Horse owner + shared users |
| `admin:panel`            | Admin notifications                           | All admin users            |

## Authentication Flow

```
1. User lands on marketing page (/)
2. Click "Get Started" or "Log In"
3. Redirected to /login or /register
4. On success:
   - POST /api/auth/login or /api/auth/signup
   - Cookie set with JWT
   - Redirect to /dashboard
5. Protected routes:
   - Check JWT via context (ctx.user)
   - If missing → 401 redirect to /login
   - If trial expired → 402 show upgrade modal
   - If suspended → 403 show suspension message
```

## Subscription Check Flow

```
1. Every protected API call passes through trialLockMiddleware
2. Middleware checks:
   - User authenticated? (if not, pass through - handled by auth)
   - Trial status?
     - If trial + not expired → allow
     - If trial + expired → 402 Payment Required
   - Subscription status?
     - active → allow
     - overdue/expired → 402 Payment Required
     - cancelled + within grace period → allow
     - cancelled + past grace → 402 Payment Required
   - Suspended? → 403 Forbidden
3. Client receives 402:
   - Show upgrade modal
   - Disable all actions
   - Redirect to /pricing
```

## Data Flow Examples

### Example 1: Creating a Horse

```
1. User clicks "Add Horse" button in /horses
2. Navigate to /horses/new (HorseForm.tsx)
3. Fill form and submit
4. Client calls: mutation trpc.horses.create
5. Server:
   - Check auth (protectedProcedure)
   - Check trial lock (trialLockMiddleware)
   - Validate data
   - Insert into DB
   - Emit SSE event to user:{userId}:horses
6. Response returned to client
7. Client redirects to /horses/:id
8. Other connected clients receive SSE and refresh
```

### Example 2: Trial Expiration

```
1. User's trial ends (7 days from createdAt)
2. User tries to access /health
3. Client loads, makes API call: trpc.health.getAll
4. Server:
   - Check auth ✓
   - Check trial lock:
     - subscriptionStatus = "trial"
     - createdAt + 7 days < now
     - BLOCK → return 402
5. Client receives 402:
   - Show modal: "Trial ended, upgrade now"
   - Display pricing options
   - Disable all CRUD actions
6. User clicks "Upgrade"
7. Redirected to /pricing
8. User selects plan
9. trpc.billing.createCheckout → Stripe
10. Payment success → webhook → status = "active"
11. Trial lock lifted automatically
```

## Notes

- All TRPC routes automatically prefixed with `/api/trpc/`
- All protected routes require JWT cookie
- Trial lock middleware applied to ALL /api and /trpc routes (except auth, billing, health)
- SSE connections require authentication
- Stripe webhooks use signature verification (not JWT)
- Admin routes require both `role=admin` AND unlocked admin session

## Future Additions

When adding new features:

1. Add route to this matrix
2. Document backend endpoints
3. Add realtime channel if needed
4. Update rate limiting if needed
5. Test trial lock behavior
6. Update admin visibility if needed
