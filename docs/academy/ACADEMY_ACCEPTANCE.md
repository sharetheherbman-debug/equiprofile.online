# EquiProfile Academy Acceptance

**Branch:** `feature/equiprofile-academy-commerce`  
**Review vehicle:** draft PR #44  
**Status:** Internal Academy implementation and disposable-environment acceptance are complete for the evidenced paths below. This branch remains **review-only**: it has not been merged or deployed. Production DNS, live payment/provider configuration and real-device validation are deliberately out of scope for the disposable acceptance environment.

> This is an evidence-based checklist. A checked item has been supported by an automated audit, a focused regression test, or a documented local browser run. Unchecked items are intentionally retained where no equivalent evidence has yet been collected.

## 1. Branding, compatibility and architecture

| Check                                                                  | Status         | Evidence                                                                                                                                                                                                |
| ---------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical Academy public routes, navigation, footer and metadata exist | Complete       | Canonical `/academy/*` entry, Academy header/footer and Academy metadata are in the renamed Academy build.                                                                                              |
| Legacy School routes are retained only as compatibility aliases        | Complete       | Canonical `academy` tRPC namespace and `academy.*` client/server paths; legacy `school` aliases are labelled `LEGACY_COMPAT_ONLY`.                                                                      |
| Product naming is complete in in-scope application code                | Complete       | `npx tsx scripts/audit-academy-naming.ts --json` reports **0 invalid School remnants**. Genuine English “riding school” descriptions and retained database compatibility values are excluded by policy. |
| Academy visual family is aligned with EquiProfile                      | Complete       | Academy uses the navy/gold palette, premium card/CTA treatment and serif headings shared by the EquiProfile family.                                                                                     |
| Management remains compatible                                          | Complete       | Management route exposure includes Academy role routes; shared-code regression remains part of the final suite.                                                                                         |
| Management and Marketing repositories were modified                    | Not applicable | No changes were made to the separate Management or Marketing repositories.                                                                                                                              |

## 2. Curriculum, factual quality and safety

| Check                                                                    | Status            | Evidence                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing lesson engine, curriculum and progression tables were preserved | Complete          | The existing source remains `server/lessonContent.ts`, with additive quality extensions and retained completion/competency tables.                                                                                                |
| Published curriculum structure is valid                                  | Complete          | Structural audit reports **15 pathways, 105 lessons, 334 knowledge checks, 198 competency references, 0 errors, 0 warnings**.                                                                                                     |
| Every lesson meets the production quality gate                           | Complete          | `LESSON_QUALITY_AUDIT.md` and `lesson-quality-audit.json`: **105/105 production ready**, zero shallow records, zero placeholders and zero semantic duplicates.                                                                    |
| Human-readable quality review exists                                     | Complete          | `docs/academy/LESSON_QUALITY_AUDIT.md` contains the per-lesson review record.                                                                                                                                                     |
| Factual and safety review is complete                                    | Complete          | `LESSON_FACT_CHECK.md` plus factual/safety audit: **105/105 passed**, zero unresolved issues. High-risk lessons have professional escalation boundaries.                                                                          |
| Unsupported accreditation wording is absent                              | Complete          | Academy curriculum and Tutor prompts exclude unsupported BHS/Pony Club accreditation or standards claims; audit coverage is recorded in the curriculum tests and factual guard.                                                   |
| Lesson UI and server-trusted completion work                             | Complete          | Disposable browser run rendered **Parts of the Horse** with full content and five knowledge checks; server-scored completion returned **5/5** and persisted `lessonCompletion` with server-derived fields and curriculum version. |
| Every lesson has been clicked manually in browser                        | Not yet evidenced | The structural/API audit covers all lessons; a manual click-through of all 105 is not a necessary release gate and has not been claimed.                                                                                          |

## 3. Disposable authenticated Academy acceptance

The acceptance database is a local MariaDB schema named `equiprofile_acceptance`, populated only by the fail-closed `scripts/seed-disposable-acceptance.ts`. The seed refuses any non-local host or database name lacking `acceptance`, requires `DISPOSABLE_ACCEPTANCE=1`, and creates no provider payment, supplier credential or production data.

| Persona or route                                             | Status            | Evidence                                                                                                                                |
| ------------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public Academy home                                          | Pass              | Full browser DOM (5,038 px) rendered navigation, hero, pathways and calls to action.                                                    |
| Student registration and local verification                  | Pass              | Local token flow completed without SMTP.                                                                                                |
| Student dashboard and recommendation                         | Pass              | Dashboard rendered live recommendation **Basic Tack Identification** with current progress.                                             |
| Lesson detail and knowledge checks                           | Pass              | Full lesson content, five checks and Tutor prompts rendered in the disposable browser.                                                  |
| Server-scored completion/progress persistence                | Pass              | Browser completion scored 5/5; database record contains `completionKey`, `quizCorrect=5`, `quizTotal=5` and `curriculumVersion=2026.1`. |
| Academy owner dashboard                                      | Pass              | Organisation name, plan, seat counts, member list and invitation form rendered.                                                         |
| Teacher invitation and acceptance                            | Pass              | Owner invitation increased pending invites from 0 to 1. Email-matched teacher acceptance redirected to the Instructor Portal.           |
| Student/teacher feedback, assignments, groups and scheduling | Not yet evidenced | These supported workflows require their own role-specific content/assignment acceptance fixture and are not represented as complete.    |
| Owner curriculum administration and activity reporting       | Not yet evidenced | Owner membership and invitation paths are evidenced; no claim is made for every administrative surface.                                 |

## 4. Tutor and integrity controls

| Check                                                           | Status            | Evidence                                                                                                                                           |
| --------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tutor uses the existing server-side AI abstraction              | Complete          | Academy Tutor follows the shared server-side AI boundary; browser code holds no provider key.                                                      |
| Tutor usage, daily limit and current-lesson context exist       | Complete          | Existing Tutor policy/integrity coverage and course context wiring retained.                                                                       |
| Veterinary/emergency and course-completion boundaries exist     | Complete          | Dedicated Tutor policy regression coverage; Tutor cannot create or imply course completion.                                                        |
| Reading-level adaptation and guided questioning browser session | Not yet evidenced | Requires a provider-enabled disposable Tutor session; it is not asserted from source alone.                                                        |
| Client cannot fabricate completion facts                        | Complete          | `completeLesson` derives published lesson/pathway facts and score from server-held data; disposable persistence run confirmed server-owned values. |

## 5. Migration and local environment integrity

| Check                                                                      | Status   | Evidence                                                                                                                                  |
| -------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh migration chain applies from empty schema                            | Complete | Disposable reset applied **28/28** registered migrations.                                                                                 |
| Commerce tables are present after fresh migration                          | Complete | All 27 Commerce lifecycle/foundation tables were created on fresh install.                                                                |
| Academy organisation, membership and invitation tables are migration-owned | Complete | Additive `0026_academy_organization_foundation` creates `organizations`, `organizationMembers` and `organizationInvites`.                 |
| Supplier onboarding state is migration-owned                               | Complete | Additive `0027_commerce_supplier_onboarding` adds separate onboarding status and notes, without treating a status as supplier activation. |
| Migration changes are destructive                                          | No       | Migrations are additive (`CREATE ... IF NOT EXISTS`, additive columns/indexes); no production migration or reset has been run.            |

## 6. Remaining acceptance and external dependencies

| Item                                                                                                     | Category            | State                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px mobile browser pass for Academy home, student dashboard, catalogue, pathway and lesson detail     | Internal acceptance | Complete. Built disposable bundle captured at 390 × 844; evidence in `docs/academy/acceptance-mobile/` and `disposable-browser-notes.md`.                                                |
| 768 × 1024 tablet browser pass for Academy home, student dashboard, catalogue, pathway and lesson detail | Internal acceptance | Complete. Built disposable bundle evidence is retained in `docs/academy/acceptance-tablet/` and `disposable-browser-notes.md`.                                                           |
| Full branch test/build/preflight/audit/format run                                                        | Internal acceptance | Complete. `npm run check`, `npm run preflight`, `npm test` (19 files / 149 tests), the four Academy audits, `npm run build`, and PR-scoped Prettier all passed on the commit-ready tree. |

| Live SMTP verification | External environment | Not exercised; local verification token flow was used intentionally. |
| Live Stripe payments or webhooks | External environment | Not exercised; Store payments are disabled in disposable acceptance and no charge was created. |
| Production DNS/TLS/CORS/CDN verification | External environment | Not touched; no production deployment occurred. |
| Real supplier credentials and agreements | External commercial dependency | Blocked until Avasam/Stable Environment/Equetech approvals described in the Supplier Onboarding Pack. |
| Real-device mobile network/PWA installation | External/device validation | Not exercised in the sandbox. |

## 7. Final safety and repository guardrails

- [x] Work is isolated on `feature/equiprofile-academy-commerce`.
- [x] Draft PR #44 is the sole review vehicle.
- [x] No merge to `main` has been performed.
- [x] No production deployment, production database migration, VPS/DNS change or live supplier activation has been performed.
- [x] No live payment, customer order, real supplier catalogue or supplier credential was created.
- [x] Separate Management and Marketing repositories remain untouched.

Detailed browser evidence is retained in `docs/academy/disposable-browser-notes.md`. Curriculum quality and factual evidence is retained in the Academy audit files listed above.
