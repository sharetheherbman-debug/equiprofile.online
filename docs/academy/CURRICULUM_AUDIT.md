# EquiProfile Academy Curriculum Audit

## Audit status

**In progress — not approved as complete.**

The existing curriculum is substantial and must be preserved. The audit has confirmed that `server/lessonContent.ts` defines the structured lesson source used by the lesson engine, including pathways, lesson levels, objectives, detailed content, safety notes, practical application, common mistakes, knowledge checks, AI Tutor prompts, and linked competencies.

At the current checkpoint the source declares **15 learning pathways**. A full lesson-by-lesson machine-generated coverage report is still required before this file can be marked complete.

## Confirmed strengths

- Existing lesson content is real structured content, not a placeholder shell.
- Four progression levels are represented: beginner, developing, intermediate, advanced.
- Lessons support knowledge-check questions and explanations.
- Lessons carry safety notes and practical application fields.
- Lessons can link to competency keys.
- The DB lesson engine already supports pathways, units and persisted completion.
- Teacher assignment, competency assessment and lesson review tables already exist.

## Confirmed defects / risks

### 1. Accreditation/standards wording must be corrected

The source header and customer-facing marketing contain statements that the content is based on, aligned with, or meets BHS/Pony Club standards. Unless a verified commercial/accreditation relationship exists, Academy copy must instead describe the material as original EquiProfile educational content informed by generally accepted equestrian knowledge. No official accreditation should be implied.

**Status:** open.

### 2. Completion metadata is client-trusted

The lesson completion mutation currently receives `lessonSlug`, `pathwaySlug`, `level`, and optional `score` from the browser. This permits inconsistent metadata and means quiz scores are not yet a trusted server-derived completion fact.

Required correction:

- look up the canonical published lesson server-side by slug
- derive pathway and level server-side
- verify progression/access rules server-side
- calculate/verify quiz result from server-held answer data
- make repeat completion idempotent

**Status:** open; acceptance blocker.

### 3. Progress intelligence has stale hard-coded pathway totals

The progress-intelligence endpoint has a fixed map for only six pathways even though the curriculum source now declares fifteen. This can undercount total learning and misstate completion/readiness.

Required correction: derive published pathway/lesson totals from the current validated curriculum/DB.

**Status:** open; acceptance blocker.

### 4. Seed-on-empty is not a complete content pipeline

Current lesson/pathway seeding occurs only when the corresponding table is empty. That does not safely reconcile newly added or corrected curriculum records into an already populated database.

Required correction: slug-keyed, validated, idempotent import/upsert with an audit report and no duplicate creation.

**Status:** open.

### 5. AI Tutor is not yet lesson-aware

The Tutor uses the approved server-side LLM abstraction and already logs/meters usage, but its request contract currently contains question/history rather than a trusted current lesson/pathway/competency context.

Required correction: resolve lesson context server-side and include only authorised educational context in the Tutor prompt.

**Status:** open.

### 6. Marketing claims need evidence review

Existing marketing includes testimonial-style quotations and product claims. They must not be presented as real customer evidence unless provenance/permission can be verified. Unsupported accreditation, outcome or customer claims should be removed or clearly replaced before release.

**Status:** open.

## Coverage checks still required for every lesson

The final machine-readable audit must report at least:

- unique lesson slug
- valid pathway slug
- valid level
- non-empty title/category
- objectives count and empty-objective detection
- detailed-content presence/length
- key-points presence
- safety-note presence and safety-risk review flag
- practical-application presence
- common-mistakes presence
- knowledge-check count
- each question has usable options
- `correctIndex` is in range
- answer explanation is present
- AI Tutor prompts presence
- linked competency keys and whether each key exists
- duplicate title/near-duplicate review
- display/sort-order collisions
- whether lesson is reachable through API/UI
- whether quiz UI is functional
- whether completion persists

## Curriculum scope review

The 15 current pathways provide meaningful coverage of horse care, rider foundations, yard safety, horse behaviour/welfare, tack/equipment, developing rider skills, jumping foundations, horse health/first response, stable management, competition, rider fitness/mindset, coaching, handling/groundwork, nutrition/feeding, and welfare/ethics.

The final audit still needs to compare individual lesson depth against the required Academy scope for seasonal care, biosecurity, vaccination concepts, dental/farrier/parasite care, senior/youngstock nutrition, ownership/insurance/transport, safeguarding/risk assessment, emergency preparation and other specified topics. A pathway title alone is not evidence that those topics are adequately taught.

## Definition of audit complete

This audit is complete only when:

1. a machine-readable report has been generated from every pathway/unit;
2. all structural errors are zero or explicitly waived with rationale;
3. competency references are verified;
4. unsafe/unsupported medical or accreditation claims are corrected;
5. the UI reachability of every published lesson is checked;
6. quiz/completion/progress behaviour is tested;
7. remaining content gaps are listed lesson-by-lesson rather than hidden behind pathway totals.
