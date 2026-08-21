# EquiProfile Academy Curriculum Audit

## Final audit result

> **Status: structural audit passed on 21 August 2026.** The machine-readable command `npx tsx scripts/audit-academy-curriculum.ts --json` reported **0 errors and 0 warnings** across the complete source curriculum.

| Measure                                                 |            Result |
| ------------------------------------------------------- | ----------------: |
| Published source pathways                               |                15 |
| Lessons                                                 |               105 |
| Beginner / developing / intermediate / advanced lessons | 32 / 30 / 24 / 19 |
| Knowledge-check questions                               |               280 |
| Linked competency references                            |               198 |
| Duplicate lesson or pathway slugs                       |                 0 |
| Unsupported BHS/Pony Club wording found by audit        |                 0 |

The curriculum covers horse care, rider foundations, yard safety, horse behaviour and welfare, tack and equipment, developing rider skills, polework and jumping foundations, horse health and first response, stable management, competition preparation, rider fitness and mindset, coaching skills, handling and groundwork, nutrition and feeding, and equine welfare and ethics. Each audited lesson carries structured objectives, substantive content, key points, safety notes, practical application, common mistakes, knowledge checks with explanations, AI Tutor prompts, and competency references.

## Completed integrity work

| Requirement                    | Completed implementation                                                                                                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled curriculum pipeline | `server/academy/curriculumPipeline.ts` validates the source, performs slug-keyed idempotent upserts, records sync runs, retains historic learner completions, and derives deterministic next-lesson order.                                          |
| Additive data safety           | Migration `0021_academy_curriculum_integrity.sql` adds curriculum/version/provenance fields and sync audit records without dropping or resetting education data.                                                                                    |
| Trusted completion             | `student.completeLesson` resolves the published lesson server-side, ignores deprecated browser pathway/level/score claims, validates selected answers against server-held keys, calculates the score server-side, and uses a stable completion key. |
| Dynamic progress               | Catalogue locking, unlocked levels, recommendations, pathway totals, completion percentages, and competency totals derive from published database curriculum rather than a hard-coded inventory.                                                    |
| Student UX                     | Quiz-bearing lessons require submitted answers before completion; the client sends answer selections only and refreshes live progress after completion.                                                                                             |
| Academy roles                  | Invite acceptance validates the signed-in account email before granting the invited role, avoids duplicate memberships, and completes Academy activation without replacing an existing paid plan.                                                   |
| Accreditation claims           | Historical source-level BHS/Pony Club references and duplicated health lesson slug were corrected. Academy content is represented as original EquiProfile educational material, not an accredited or official replacement programme.                |

## Validation evidence

The complete repository suite passed after the final changes: `npm run preflight`, `npm run check`, `npm test` (**14 files, 134 tests**), `npm run build:management`, `npm run build:school`, `npm run build:shop`, `npm run build:server`, and `npm run build`. The aggregate build also produced isolated Management, Academy and Shop artifacts. `npm run format:check` remains red because the repository has broad pre-existing formatting drift; no whole-repository formatter rewrite was made in this scoped feature change.

## Operational safeguards still required before production activation

This code intentionally does not run a production migration, reset a curriculum, deploy an Academy, or activate a supplier. Before production activation, an operator must apply the additive migrations through the approved deployment process, review generated curriculum sync records, verify current permissions with real accounts, and complete normal browser/mobile acceptance tests. Existing source material remains educational information and must not substitute for veterinarian, farrier, safeguarding, or other appropriately qualified professional advice.

## Machine-readable audit

Run the following command from the repository root:

```bash
npx tsx scripts/audit-academy-curriculum.ts --json
```

The command emits pathway/lesson totals, level distribution, knowledge-check and competency-reference counts, and every structural issue in JSON form. It returns a non-zero exit status if structural errors are present.
