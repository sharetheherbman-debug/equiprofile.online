# EquiProfile Academy Architecture

## Status

This document describes the safe migration of the existing EquiProfile School product to the customer-facing **EquiProfile Academy** brand. It is deliberately compatibility-first: the existing education application, authentication, roles, lesson engine, databases, and `school`-named build internals remain in place unless a later reviewed migration proves a rename is safe.

## Existing architecture reused

EquiProfile is a two-frontend application sharing one backend and shared client code:

- Management frontend: `client/management/`
- Education frontend: `client/school/`
- Shared UI/pages/hooks: `client/src/`
- Shared server/API/auth: `server/`
- Drizzle schema and migrations: `drizzle/`

The education frontend currently builds using the internal `VITE_SITE=school` target and is served for the school hostname. Those identifiers are implementation details and are not being destructively renamed during the Academy rebrand.

## Branding boundary

Customer-facing product name:

- **EquiProfile Academy**

Legacy/internal compatibility names that may remain during this phase:

- `client/school/`
- `SchoolApp`
- `SchoolNavbar`, `SchoolFooter`, `SchoolLayout`
- `SchoolDashboard`
- `school_owner` and other stable persisted identifiers
- the current school-hostname deployment target

A later infrastructure/domain migration may rename those internals, but it must be a separate compatibility-reviewed change.

## Route contract

Canonical public Academy routes:

- `/academy`
- `/academy/features`
- `/academy/pricing`
- `/academy/about`
- `/academy/contact`

Compatibility aliases retained:

- `/school`
- `/school/features`
- `/school/pricing`
- `/school/about`
- `/school/contact`
- historical root routes `/`, `/features`, `/pricing`, `/about`, `/contact`

Application dashboard compatibility:

- canonical: `/academy-dashboard`
- legacy: `/school-dashboard`

The compatibility contract is covered by `server/academy.routes.test.ts`.

## Lesson engine

Existing education data is reused rather than rebuilt:

- `server/lessonContent.ts` is the source curriculum currently used for initial seeding.
- `lessonPathways` stores pathway metadata.
- `lessonUnits` stores lesson content.
- `lessonCompletion` stores student completion.
- `studentCompetencies` stores competency assessment.
- `teacherLessonAssignments` stores teacher-to-student/group lesson assignment.
- `lessonReviews` stores teacher feedback on completed lessons.

### Required content pipeline direction

The target pipeline is:

`source curriculum -> validation -> idempotent import/seed -> DB records -> API -> browser`

The current seed-on-empty behaviour is not yet sufficient for partially populated or evolving production datasets. It must be replaced or wrapped with an idempotent, slug-keyed import/upsert process before Academy content is considered complete.

## AI Tutor

The existing AI Tutor already uses the server-side AI abstraction and records usage. It must continue to do so. Browser API keys or a second direct provider integration are prohibited.

Outstanding Academy requirements:

- accept/resolve current lesson context
- accept/resolve pathway and competency context
- derive trusted lesson facts server-side
- retain veterinary/emergency safety boundaries
- avoid implying accreditation
- never create or infer lesson completion from AI conversation

## Completion integrity

`completeLesson` currently accepts lesson metadata and optional score from the client. Before Academy completion can be trusted, the server must resolve the canonical lesson from its own data and derive pathway/level from that record. Quiz scores must be computed or verified against server-held answer data rather than trusted from the browser.

## Progress intelligence

Progress calculations must derive totals from the live/published curriculum. Hard-coded pathway totals are not an acceptable source of truth as the curriculum evolves.

## Compatibility and migration rules

- No destructive renames for branding.
- No production DB resets or destructive migrations.
- Existing users and saved links remain valid.
- Additive migrations only.
- Persisted role/plan values may keep legacy identifiers while UI labels say Academy.
- All future route/name migrations require regression tests before old aliases are removed.

## Store boundary

The future EquiProfile Store should reuse EquiProfile auth, design system, notifications, AI abstraction and security conventions, but Store orders/payments must remain distinct from EquiProfile SaaS subscription billing.

## Production status

This architecture is being implemented only on `feature/equiprofile-academy-commerce` in draft PR #44. No deployment or production database change is part of this work phase.
