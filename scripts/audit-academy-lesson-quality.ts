import fs from "node:fs";
import path from "node:path";
import { LESSON_PATHWAYS, LESSON_UNITS } from "../server/lessonContent";

const MIN_WORDS = 500;
const MIN_OBJECTIVES = 3;
const MIN_KEY_POINTS = 4;
const MIN_QUESTIONS = 3;
const MIN_COMMON_MISTAKES = 2;
const MIN_TUTOR_PROMPTS = 2;
const PLACEHOLDER = /\b(todo|tbd|placeholder|lorem ipsum|coming soon)\b/i;

type DuplicateSimilarityStatus = "NO_SIMILARITY_FLAG" | "REVIEW_REQUIRED";
type StructuralStatus = "STRUCTURALLY_READY" | "REQUIRES_EXPANSION";

type LessonQualityRow = {
  slug: string;
  title: string;
  pathway: string;
  level: string;
  wordCount: number;
  objectivesCount: number;
  keyPointsCount: number;
  knowledgeCheckCount: number;
  commonMistakesCount: number;
  aiTutorPromptCount: number;
  competencyRefs: number;
  safetyEvidenceStatus: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT";
  factualEvidenceStatus: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT";
  duplicateSimilarityStatus: DuplicateSimilarityStatus;
  structuralStatus: StructuralStatus;
  notes: string;
};

function plainText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[>#*_~\[\]()|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value: string): number {
  return (
    plainText(value).match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0
  );
}

function tokenSet(value: string): Set<string> {
  const ignored = new Set([
    "with",
    "that",
    "this",
    "from",
    "your",
    "horse",
    "lesson",
    "will",
    "when",
    "have",
    "their",
    "they",
    "about",
  ]);
  return new Set(
    plainText(value)
      .toLowerCase()
      .match(/[a-z]{4,}/g)
      ?.filter((token) => !ignored.has(token)) ?? [],
  );
}

function jaccard(left: Set<string>, right: Set<string>): number {
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : overlap / union;
}

const pathwayTitle = new Map(
  LESSON_PATHWAYS.map((pathway) => [pathway.slug, pathway.title]),
);
const textBySlug = new Map(
  LESSON_UNITS.map((lesson) => [
    lesson.slug,
    [
      lesson.title,
      lesson.content,
      ...lesson.objectives,
      ...lesson.keyPoints,
    ].join("\n"),
  ]),
);
const tokenSets = new Map(
  [...textBySlug.entries()].map(([slug, content]) => [slug, tokenSet(content)]),
);

const rows: LessonQualityRow[] = LESSON_UNITS.map((lesson) => {
  const notes: string[] = [];
  const words = wordCount(lesson.content);
  if (words < MIN_WORDS) {
    notes.push(`content below ${MIN_WORDS} meaningful-word baseline`);
  }
  if (lesson.objectives.length < MIN_OBJECTIVES)
    notes.push("fewer than 3 objectives");
  if (lesson.keyPoints.length < MIN_KEY_POINTS)
    notes.push("fewer than 4 key points");
  if (lesson.knowledgeCheck.length < MIN_QUESTIONS) {
    notes.push("fewer than 3 knowledge checks");
  }
  if (lesson.commonMistakes.length < MIN_COMMON_MISTAKES) {
    notes.push("fewer than 2 common mistakes");
  }
  if (lesson.aiTutorPrompts.length < MIN_TUTOR_PROMPTS) {
    notes.push("fewer than 2 Tutor prompts");
  }
  if (
    PLACEHOLDER.test(
      [lesson.content, ...lesson.objectives, ...lesson.keyPoints].join("\n"),
    )
  ) {
    notes.push("placeholder wording detected");
  }

  const currentTokens = tokenSets.get(lesson.slug) ?? new Set<string>();
  const possibleDuplicate = [...tokenSets.entries()].some(
    ([otherSlug, otherTokens]) =>
      otherSlug !== lesson.slug && jaccard(currentTokens, otherTokens) >= 0.92,
  );
  if (possibleDuplicate)
    notes.push("semantic similarity threshold requires review");

  return {
    slug: lesson.slug,
    title: lesson.title,
    pathway: pathwayTitle.get(lesson.pathwaySlug) ?? lesson.pathwaySlug,
    level: lesson.level,
    wordCount: words,
    objectivesCount: lesson.objectives.length,
    keyPointsCount: lesson.keyPoints.length,
    knowledgeCheckCount: lesson.knowledgeCheck.length,
    commonMistakesCount: lesson.commonMistakes.length,
    aiTutorPromptCount: lesson.aiTutorPrompts.length,
    competencyRefs: lesson.linkedCompetencies.length,
    safetyEvidenceStatus: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT",
    factualEvidenceStatus: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT",
    duplicateSimilarityStatus: possibleDuplicate
      ? "REVIEW_REQUIRED"
      : "NO_SIMILARITY_FLAG",
    structuralStatus:
      notes.length === 0 ? "STRUCTURALLY_READY" : "REQUIRES_EXPANSION",
    notes:
      notes.length === 0
        ? "Observable structural thresholds met; factual and safety evidence are tracked separately."
        : notes.join("; "),
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  scope:
    "Structural completeness and lexical-similarity audit only. This report does not verify facts, safety, clinical advice, legal rules, numerical claims, or human editorial acceptance.",
  standards: {
    meaningfulWordBaseline: MIN_WORDS,
    objectives: MIN_OBJECTIVES,
    keyPoints: MIN_KEY_POINTS,
    knowledgeChecks: MIN_QUESTIONS,
    commonMistakes: MIN_COMMON_MISTAKES,
    aiTutorPrompts: MIN_TUTOR_PROMPTS,
    duplicateJaccardThreshold: 0.92,
  },
  summary: {
    lessonsAssessed: rows.length,
    lessonsStructurallyReady: rows.filter(
      (row) => row.structuralStatus === "STRUCTURALLY_READY",
    ).length,
    placeholderLessons: rows.filter((row) => row.notes.includes("placeholder"))
      .length,
    shallowLessons: rows.filter((row) => row.wordCount < MIN_WORDS).length,
    similarityReviewRequired: rows.filter(
      (row) => row.duplicateSimilarityStatus === "REVIEW_REQUIRED",
    ).length,
    safetyEvidence: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT",
    factualEvidence: "NOT_ASSESSED_BY_STRUCTURAL_AUDIT",
  },
  lessons: rows,
};

function renderMarkdown() {
  const lines = [
    "# EquiProfile Academy Lesson Structural Quality Audit",
    "",
    "> This generated report verifies observable lesson structure only. It does **not** establish factual correctness, safety approval, clinical or legal accuracy, accreditation, or human editorial acceptance. Those matters require the separate lesson evidence register and documented review.",
    "",
    "## Summary",
    "",
    "| Metric | Result |",
    "|---|---:|",
    `| Lessons structurally assessed | ${report.summary.lessonsAssessed} / ${rows.length} |`,
    `| Lessons structurally ready | ${report.summary.lessonsStructurallyReady} / ${rows.length} |`,
    `| Placeholder lessons | ${report.summary.placeholderLessons} |`,
    `| Shallow lessons | ${report.summary.shallowLessons} |`,
    `| Similarity reviews required | ${report.summary.similarityReviewRequired} |`,
    `| Safety evidence | ${report.summary.safetyEvidence} |`,
    `| Factual evidence | ${report.summary.factualEvidence} |`,
    "",
    "## Lesson-by-lesson structural record",
    "",
    "| Slug | Title | Pathway | Level | Words | Objectives | Key points | Checks | Common mistakes | Tutor prompts | Competencies | Safety evidence | Factual evidence | Duplicate status | Structural status | Notes |",
    "|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${row.slug} | ${row.title.replace(/\|/g, "/")} | ${row.pathway.replace(/\|/g, "/")} | ${row.level} | ${row.wordCount} | ${row.objectivesCount} | ${row.keyPointsCount} | ${row.knowledgeCheckCount} | ${row.commonMistakesCount} | ${row.aiTutorPromptCount} | ${row.competencyRefs} | ${row.safetyEvidenceStatus} | ${row.factualEvidenceStatus} | ${row.duplicateSimilarityStatus} | ${row.structuralStatus} | ${row.notes.replace(/\|/g, "/")} |`,
    ),
  ];
  return `${lines.join("\n")}\n`;
}

if (process.argv.includes("--write")) {
  const docsDirectory = path.join(process.cwd(), "docs", "academy");
  fs.mkdirSync(docsDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(docsDirectory, "lesson-quality-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(docsDirectory, "LESSON_QUALITY_AUDIT.md"),
    renderMarkdown(),
  );
}

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("EquiProfile Academy lesson structural quality audit");
  console.log(JSON.stringify(report.summary, null, 2));
}

if (report.summary.lessonsStructurallyReady !== LESSON_UNITS.length) {
  process.exitCode = 1;
}
