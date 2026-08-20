# EquiProfile Academy Acceptance

## Release gate

EquiProfile Academy is **not yet complete and must not be deployed from this branch**.

This checklist is the acceptance contract for completing the existing School product as EquiProfile Academy without breaking existing users or persisted data.

## Branding and compatibility

- [x] Canonical `/academy` public route exists.
- [x] Canonical `/academy/features` route exists.
- [x] Canonical `/academy/pricing` route exists.
- [x] Canonical `/academy/about` route exists.
- [x] Canonical `/academy/contact` route exists.
- [x] `/school` public aliases retained.
- [x] Historical root public routes retained.
- [x] `/academy-dashboard` introduced without removing `/school-dashboard`.
- [x] Public navbar uses Academy branding and canonical Academy paths.
- [x] Public footer uses Academy branding and canonical Academy paths.
- [x] Base HTML title/OG/Twitter/structured metadata use EquiProfile Academy.
- [ ] All marketing-page product references audited/rebranded.
- [ ] Onboarding product references audited/rebranded.
- [ ] Student/teacher/owner dashboard product references audited/rebranded.
- [ ] Transactional email product references audited/rebranded.
- [ ] PWA/manifest/service-worker product references audited/rebranded.
- [ ] Sitemap/SEO route inventory audited.
- [ ] Management cross-links use Academy product name where appropriate.
- [ ] Genuine English uses of “riding school” preserved where they describe a real-world organisation.

## Curriculum and lesson engine

- [x] Existing lesson engine identified and preserved.
- [x] Existing source curriculum identified and preserved.
- [x] Existing pathway/unit/completion DB tables identified.
- [x] Existing competency/teacher-assignment/review tables identified.
- [ ] Machine-readable all-lesson coverage report generated.
- [ ] Human-readable all-lesson coverage review completed.
- [ ] Unique slugs validated for all pathways/lessons.
- [ ] Every lesson references a valid pathway.
- [ ] Every linked competency is validated.
- [ ] Every knowledge check has valid answer indices and explanations.
- [ ] Placeholder/shallow content audit completed.
- [ ] Unsupported BHS/Pony Club accreditation/standards claims corrected.
- [ ] Medical/veterinary safety language reviewed.
- [ ] Idempotent source-curriculum import/upsert implemented.
- [ ] Every published lesson is reachable through API and UI.

## Student experience

- [ ] Academy dashboard acceptance tested.
- [ ] Learning pathways display correctly.
- [ ] Lesson catalogue search/filter acceptance tested.
- [ ] Lesson detail displays all required content.
- [ ] Resume/progress persistence tested.
- [ ] Quiz scoring is server-trusted.
- [ ] Incorrect-answer explanations display.
- [ ] Completion cannot be fabricated by browser metadata.
- [ ] Competency linkage works.
- [ ] Teacher feedback is visible.
- [ ] Assignments are visible and completable.
- [ ] Mobile responsiveness checked.

## Teacher / coach experience

- [ ] Assigned-student access tested.
- [ ] Group/cohort access tested where supported.
- [ ] Lesson planning tested.
- [ ] Lesson scheduling tested.
- [ ] Progress overview tested.
- [ ] Competency assessment tested.
- [ ] Student feedback/review tested.
- [ ] Assignment workflow tested.
- [ ] AI-assisted planning shows AI suggestion vs teacher approval.

## Academy owner/admin experience

- [ ] Students tested.
- [ ] Teachers tested.
- [ ] Enrolments tested.
- [ ] Curriculum/pathway administration tested.
- [ ] Scheduling tested.
- [ ] Completion/activity reporting tested.
- [ ] Roles/permissions tested with existing accounts.
- [ ] Academy settings/customer-facing labels audited.

## AI Tutor

- [x] Uses existing server-side AI abstraction.
- [x] Usage is logged/metered.
- [x] Daily usage limit exists.
- [x] General veterinary-diagnosis safety instruction exists.
- [ ] Tutor receives trusted current lesson context.
- [ ] Tutor receives pathway/competency context where authorised.
- [ ] Emergency/health-risk boundary has dedicated tests.
- [ ] Reading-level adaptation tested.
- [ ] Guided questioning/quiz behaviour tested.
- [ ] Tutor cannot create or imply course completion.

## Integrity defects that block “done”

- [ ] `completeLesson` derives lesson/pathway/level from server data rather than trusting the client.
- [ ] Quiz score is calculated or verified from server-held answer data.
- [ ] Progress totals are derived from the current published curriculum instead of a six-pathway hard-coded map.
- [ ] Content seeding/import safely reconciles an existing partially populated DB.

## Automated validation

- [x] Academy canonical/legacy route regression test added.
- [ ] `npm run preflight` passes on branch head.
- [ ] `npm run check` passes on branch head.
- [ ] `npm test` passes on branch head.
- [ ] `npm run format:check` passes on branch head.
- [ ] `npm run build` passes on branch head.
- [ ] UI smoke test passes on branch head.

Do not mark unchecked automated items complete until the command or CI job actually ran successfully against the relevant commit.

## Production

- [x] Work isolated on `feature/equiprofile-academy-commerce`.
- [x] Draft PR used for review.
- [x] No production deployment performed.
- [x] No production database migration performed.
- [x] No merge to `main` performed.
