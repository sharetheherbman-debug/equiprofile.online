# EquiProfile Academy Curriculum Audit

## Audit status

**In progress — not approved as complete.**

The existing curriculum is substantial and must be preserved. The audit has confirmed that `server/lessonContent.ts` defines the structured lesson source used by the lesson engine, including pathways, lesson levels, objectives, detailed content, safety notes, practical application, common mistakes, knowledge checks, AI Tutor prompts, and linked competencies.

At the current checkpoint the source declares **15 learning pathways**. Reusable audit tooling and a Vitest structural contract have now been added, but neither has been executed successfully in this environment yet, so the curriculum is not being declared structurally clean.

Audit tooling added:

- `server/academy/curriculumIntegrity.ts`
- `server/academy.curriculum.test.ts`
- `scripts/audit-academy-curriculum.ts`

The audit command supports human-readable output by default and machine-readable JSON with `--json`.

## Confirmed strengths

- Existing lesson content is real structured content, not a placeholder shell.
- Four progression levels are represented: beginner, developing, intermediate, advanced.
- Lessons support knowledge-check questions and explanations.
- Lessons carry safety notes and practical application fields.
- Lessons can link to competency keys.
- The DB lesson engine already supports pathways, units and persisted completion.
- Teacher assignment, competency assessment and lesson review tables already exist.
- Curriculum facts can now be derived from the source through `getCurriculumFacts()` instead of maintaining another hard-coded total map.
- Canonical lesson lookup and server-held knowledge-check scoring helpers now exist in `curriculumIntegrity.ts` ready to be wired into the student API.

## Confirmed defects / risks

### 1. Accreditation/standards wording must be corrected

The source header and the current AI Tutor policy contain BHS/Pony Club wording. The public Academy marketing pages have been corrected so they no longer make those claims, but source-level wording still requires removal/review. Unless a verified commercial/accreditation relationship exists, Academy copy must describe the material as original EquiProfile educational content informed by generally accepted equestrian knowledge. No official accreditation should be implied.

**Status:** public marketing corrected; source content/AI policy still open.

### 2. Completion metadata is client-trusted

The lesson completion mutation currently receives `lessonSlug`, `pathwaySlug`, `level`, and optional `score` from the browser. This permits inconsistent metadata and means quiz scores are not yet a trusted server-derived completion fact.

Required correction:

- look up the canonical published lesson server-side by slug
- derive pathway and level server-side
- verify progression/access rules server-side
- calculate/verify quiz result from server-held answer data
- make repeat completion idempotent

`resolveCanonicalLesson()` and `calculateKnowledgeCheckScore()` now provide reusable trusted-source helpers, but the existing `studentRouter.completeLesson` mutation has not yet been rewired to them.

**Status:** open; acceptance blocker.

### 3. Progress intelligence has stale hard-coded pathway totals

The progress-intelligence endpoint has a fixed map for only six pathways even though the curriculum source now declares fifteen. This can undercount total learning and misstate completion/readiness.

Required correction: derive published pathway/lesson totals from the current validated curriculum/DB. `getCurriculumFacts()` now provides the source-derived totals needed for that replacement.

**Status:** open; acceptance blocker.

### 4. Student UI also contains a separate hard-coded topic map

`StudentDashboard.tsx` contains a `LEVEL_PATHWAY_ITEMS` map with a manually maintained list of topic slugs by level. This is another independent source of learning-progress truth and can drift from `LESSON_UNITS` or DB-published curriculum.

Required correction: the student progress UI must consume the validated curriculum/progress API rather than maintain its own lesson/topic inventory.

**Status:** open; acceptance blocker for coherent progress reporting.

### 5. Seed-on-empty is not a complete content pipeline

Current lesson/pathway seeding occurs only when the corresponding table is empty. That does not safely reconcile newly added or corrected curriculum records into an already populated database.

Required correction: slug-keyed, validated, idempotent import/upsert with an audit report and no duplicate creation.

**Status:** open.

### 6. AI Tutor is not yet lesson-aware

The Tutor uses the approved server-side LLM abstraction and already logs/meters usage, but its request contract currently contains question/history rather than a trusted current lesson/pathway/competency context.

Required correction: resolve lesson context server-side and include only authorised educational context in the Tutor prompt.

**Status:** open.

### 7. Legacy marketing/supporting documents still need evidence review

The public Academy marketing pages no longer present unsupported testimonial/adoption/accreditation claims found during the first audit. Older `docs/school-marketing/` materials still need a separate evidence/branding review before they are reused externally.

**Status:** open for legacy supporting documents.

## Coverage checks implemented by the structural audit

The reusable audit currently checks:

- duplicate pathway slugs
- duplicate lesson slugs
- pathway sort-order collisions (warning)
- valid pathway references
- allowed lesson levels
- required title/category/content
- non-empty objectives
- non-empty key points
- safety-note presence
- practical-application presence
- common-mistakes presence
- knowledge-check presence
- knowledge-check option integrity
- `correctIndex` range
- answer-explanation presence
- AI Tutor prompt presence
- non-empty linked competency references
- placeholder-style wording
- BHS/Pony Club wording that requires accreditation review
- dynamic counts by level and pathway

## Coverage checks still required or needing deeper review

The final audit also needs:

- linked competency keys verified against an authoritative competency catalogue, not only checked as non-empty
- duplicate/near-duplicate lesson-title/content review
- lesson-depth and safety-quality review beyond simple field presence
- whether every lesson is reachable through API/UI
- whether quiz UI is functional
- whether completion persists and cannot be forged
- whether student/teacher role rules gate each relevant action correctly
- whether current DB records reconcile idempotently with the source curriculum

## Curriculum scope review

The 15 current pathways provide meaningful coverage of horse care, rider foundations, yard safety, horse behaviour/welfare, tack/equipment, developing rider skills, jumping foundations, horse health/first response, stable management, competition, rider fitness/mindset, coaching, handling/groundwork, nutrition/feeding, and welfare/ethics.

The final audit still needs to compare individual lesson depth against the required Academy scope for seasonal care, biosecurity, vaccination concepts, dental/farrier/parasite care, senior/youngstock nutrition, ownership/insurance/transport, safeguarding/risk assessment, emergency preparation and other specified topics. A pathway title alone is not evidence that those topics are adequately taught.

## Definition of audit complete

This audit is complete only when:

1. the machine-readable audit has been executed against every pathway/unit;
2. all structural errors are zero or explicitly waived with rationale;
3. competency references are verified against the authoritative catalogue;
4. unsafe/unsupported medical or accreditation claims are corrected;
5. the UI reachability of every published lesson is checked;
6. quiz/completion/progress behaviour is tested using server-trusted facts;
7. the student UI no longer maintains an independent drifting curriculum inventory;
8. remaining content gaps are listed lesson-by-lesson rather than hidden behind pathway totals.
