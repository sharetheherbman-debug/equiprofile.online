import { describe, expect, it } from "vitest";
import { LESSON_PATHWAYS, LESSON_UNITS } from "./lessonContent";
import {
  auditAcademyCurriculum,
  calculateKnowledgeCheckScore,
  getCurriculumFacts,
  resolveCanonicalLesson,
} from "./academy/curriculumIntegrity";

describe("EquiProfile Academy curriculum integrity", () => {
  it("audits every current pathway and lesson without structural errors", () => {
    const report = auditAcademyCurriculum(
      LESSON_PATHWAYS,
      LESSON_UNITS,
      "test-run",
    );

    expect(report.summary.pathways).toBe(15);
    expect(report.summary.lessons).toBe(LESSON_UNITS.length);
    expect(report.summary.knowledgeChecks).toBeGreaterThan(0);
    expect(report.summary.errors, JSON.stringify(report.issues, null, 2)).toBe(
      0,
    );
  });

  it("derives pathway and level totals from the live source curriculum", () => {
    const facts = getCurriculumFacts(LESSON_PATHWAYS, LESSON_UNITS);

    expect(facts.orderedPathwaySlugs).toHaveLength(15);
    expect(facts.totalLessons).toBe(LESSON_UNITS.length);
    expect(
      Object.values(facts.lessonsByPathway).reduce(
        (sum, count) => sum + count,
        0,
      ),
    ).toBe(LESSON_UNITS.length);
    expect(
      Object.values(facts.lessonsByLevel).reduce(
        (sum, count) => sum + count,
        0,
      ),
    ).toBe(LESSON_UNITS.length);
  });

  it("resolves canonical lesson metadata from the trusted curriculum", () => {
    const sourceLesson = LESSON_UNITS[0];
    expect(sourceLesson).toBeDefined();

    const resolved = resolveCanonicalLesson(LESSON_UNITS, sourceLesson.slug);
    expect(resolved).toEqual(sourceLesson);
    expect(
      resolveCanonicalLesson(LESSON_UNITS, "not-a-real-lesson"),
    ).toBeNull();
  });

  it("calculates knowledge-check scores from server-held answer keys", () => {
    const lesson = LESSON_UNITS.find((unit) => unit.knowledgeCheck.length > 0);
    expect(lesson).toBeDefined();
    if (!lesson) return;

    const correctAnswers = lesson.knowledgeCheck.map(
      (question) => question.correctIndex,
    );
    const result = calculateKnowledgeCheckScore(lesson, correctAnswers);

    expect(result.total).toBe(lesson.knowledgeCheck.length);
    expect(result.correct).toBe(lesson.knowledgeCheck.length);
    expect(result.score).toBe(100);
  });

  it("rejects incomplete knowledge-check answer sets", () => {
    const lesson = LESSON_UNITS.find((unit) => unit.knowledgeCheck.length > 0);
    expect(lesson).toBeDefined();
    if (!lesson) return;

    expect(() => calculateKnowledgeCheckScore(lesson, [])).toThrow(
      /Expected .* knowledge-check answers/,
    );
  });
});
