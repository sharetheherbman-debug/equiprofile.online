# EquiProfile Academy Architecture

## Status

This document describes the controlled migration of the former education product to canonical **EquiProfile Academy** terminology. It is deliberately compatibility-first: the canonical Academy modules, routing, build artifacts, and customer-facing terminology now use Academy names; only expressly documented route and persisted-data compatibility values remain.

## Existing architecture reused

EquiProfile is a two-frontend application sharing one backend and shared client code:

- Management frontend: `client/management/`
- Education frontend: `client/academy/`
- Shared UI/pages/hooks: `client/src/`
- Shared server/API/auth: `server/`
- Drizzle schema and migrations: `drizzle/`

The education frontend builds using the canonical `VITE_SITE=academy` target and is served from the Academy hostname. LEGACY_COMPAT_ONLY school host and route handling is isolated to explicitly labelled compatibility boundaries.

## Branding boundary

Customer-facing product name:

- **EquiProfile Academy**

Legacy/internal compatibility names that may remain during this phase:

- `school_owner`, `school_10`, `school_20`, `school_50`, and `school_enterprise` historical stored values
- the LEGACY_COMPAT_ONLY `/school*` route family and school hostname
- the LEGACY_COMPAT_ONLY `school` tRPC namespace for existing integrations

No canonical frontend, router, build, or public module retains a pre-Academy implementation identifier.

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

The idempotent, versioned curriculum pipeline validates source data, upserts lessons by stable slug, reconciles retired source lessons without deleting learner history, and records sync audit data before serving Academy content.

## AI Tutor

The existing AI Tutor already uses the server-side AI abstraction and records usage. It must continue to do so. Browser API keys or a second direct provider integration are prohibited.

The Academy Tutor resolves trusted lesson, pathway, competency, and learner-level context server-side. It retains veterinary/emergency escalation boundaries, makes no unsupported accreditation claim, and cannot create or infer lesson completion or competency sign-off.

## Completion integrity

`completeLesson` resolves the canonical lesson and answer key server-side, derives pathway/level from the trusted record, scores submitted knowledge checks on the server, and records completion provenance idempotently.

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
