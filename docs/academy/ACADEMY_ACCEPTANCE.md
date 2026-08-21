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
- [x] Public Academy marketing pages audited/rebranded.
- [ ] Onboarding product references audited/rebranded.
- [ ] Student/teacher/owner dashboard product references audited/rebranded.
- [ ] Transactional email product references audited/rebranded.
- [x] Academy has dedicated PWA manifest/metadata without replacing the Management manifest.
- [x] Academy has a canonical sitemap and shared robots metadata advertises both Management and Academy sitemaps.
- [x] Management footer cross-link points to the canonical Academy route.
- [x] Genuine English uses of “riding school” are preserved where they describe a real-world organisation.

## Curriculum and lesson engine

- [x] Existing lesson engine identified and preserved.
- [x] Existing source curriculum identified and preserved.
- [x] Existing pathway/unit/completion DB tables identified.
- [x] Existing competency/teacher-assignment/review tables identified.
- [x] Machine-readable all-lesson coverage report generated and reviewed.
- [ ] Human-readable all-lesson coverage review completed.
- [x] Unique slugs validated for all pathways/lessons in automated validation.
- [x] Every lesson references a valid pathway in automated validation.
- [x] Every linked competency is validated against the competency catalogue.
- [x] Every knowledge check has valid answer indices and explanations in automated validation.
- [ ] Placeholder/shallow content audit completed.
- [x] Unsupported BHS/Pony Club accreditation/standards claims corrected throughout source content and Tutor prompts.
- [x] Medical/veterinary safety language reviewed in Academy source and Tutor policy.
- [x] Idempotent source-curriculum import/upsert implemented.
- [ ] Every published lesson is reachable through API and UI.

## Student experience

- [ ] Academy dashboard acceptance tested.
- [ ] Learning pathways display correctly.
- [ ] Lesson catalogue search/filter acceptance tested.
- [ ] Lesson detail displays all required content.
- [ ] Resume/progress persistence tested.
- [x] Quiz scoring is server-trusted.
- [x] Incorrect-answer explanations are returned from canonical lesson data.
- [x] Completion cannot be fabricated by browser metadata.
- [x] Competency linkage is returned from canonical lesson data.
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
- [x] Tutor receives trusted current lesson context.
- [x] Tutor receives pathway/competency context where authorised.
- [x] Unsupported accreditation/standards wording removed from the Tutor system prompt.
- [x] Emergency/health-risk boundary has dedicated regression coverage.
- [ ] Reading-level adaptation tested.
- [ ] Guided questioning/quiz behaviour tested.
- [x] Tutor policy prevents creating or implying course completion.

## Integrity defects that block “done”

- [x] `completeLesson` derives lesson/pathway/level from server data rather than trusting the client.
- [x] Quiz score is calculated or verified from server-held answer data.
- [x] Progress totals are derived from the current published curriculum instead of a client-side hard-coded map.
- [x] Content seeding/import safely reconciles an existing partially populated DB.

## Automated validation

- [x] Academy canonical/legacy route regression test added.
- [x] Curriculum structural audit test added and executed successfully.
- [x] `npm run preflight` passes on the validated continuation head.
- [x] `npm run check` passes on the validated continuation head.
- [x] `npm test` passes on the validated continuation head.
- [ ] `npm run format:check` passes on branch head; repository-wide historical format debt remains.
- [x] `npm run build` passes on the validated continuation head.
- [ ] UI smoke test passes on branch head.

Do not mark unchecked automated items complete until the command or CI job actually ran successfully against the relevant commit.

## Production

- [x] Work isolated on `feature/equiprofile-academy-commerce`.
- [x] Draft PR used for review.
- [x] No production deployment performed.
- [x] No production database migration performed.
- [x] No merge to `main` performed.
