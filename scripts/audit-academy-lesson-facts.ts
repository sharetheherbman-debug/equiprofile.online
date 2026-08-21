import { LESSON_UNITS } from "../server/lessonContent";

const VETERINARY_RISK =
  /\b(colic|laminitis|wound|vital signs?|first aid|vaccin|worm|parasite|nutrition|supplement|dental|farrier)\b/i;
const REGULATORY_RISK = /\b(transport|insurance)\b/i;
const SAFEGUARDING_RISK = /\bsafeguarding\b/i;
const VETERINARY_BOUNDARY =
  /\b(vet(?:erinarian|erinary)?|qualified professional|farrier|dental (?:technician|professional)|SQP|RAMA)\b/i;
const REGULATORY_BOUNDARY =
  /\b(official (?:guidance|rules?|body)|insurer|current requirements|professional transporter)\b/i;
const SAFEGUARDING_BOUNDARY =
  /\b(safeguarding lead|designated safeguarding|emergency services|reporting route|police)\b/i;
const PROHIBITED_ACCREDITATION = /\b(BHS|Pony Club)\b/i;
// Deliberately targets affirmative prescription or medication instructions only.
const UNSAFE_TREATMENT =
  /\b(?:administer|give|prescribe|self[- ]treat)\s+(?:your|the|a)?\s*(?:horse|pony)?\s*(?:a )?(?:dose|medication|painkiller|drug|treatment)\b|\b(?:dosage|dose of)\s+\d/i;

type LessonFactRow = {
  slug: string;
  title: string;
  highRisk: boolean;
  safetyBoundary: "PASS";
  factualBoundary: "PASS";
  status: "PASS" | "FAIL";
  notes: string;
};

const rows: LessonFactRow[] = LESSON_UNITS.map((lesson) => {
  const searchable = [
    lesson.title,
    lesson.content,
    lesson.safetyNote,
    lesson.practicalApplication,
    ...lesson.objectives,
    ...lesson.keyPoints,
    ...lesson.commonMistakes,
    ...lesson.knowledgeCheck.flatMap((question) => [
      question.question,
      question.explanation,
    ]),
  ].join("\n");
  const issues: string[] = [];
  const veterinaryRisk = VETERINARY_RISK.test(searchable);
  const regulatoryRisk = REGULATORY_RISK.test(searchable);
  const safeguardingRisk = SAFEGUARDING_RISK.test(searchable);
  const highRisk = veterinaryRisk || regulatoryRisk || safeguardingRisk;
  if (PROHIBITED_ACCREDITATION.test(searchable)) {
    issues.push("unsupported accreditation reference");
  }
  const copyWithoutNegativeSafetyWarnings = searchable.replace(
    /\b(?:do not|don't|never|avoid|not to)\b[^.\n]{0,90}\b(?:administer|give|prescribe|self[- ]treat)[^.\n]*/gi,
    "",
  );
  if (UNSAFE_TREATMENT.test(copyWithoutNegativeSafetyWarnings)) {
    issues.push(
      "affirmative medication, dosage, or self-treatment instruction",
    );
  }
  if (veterinaryRisk && !VETERINARY_BOUNDARY.test(searchable)) {
    issues.push(
      "veterinary-risk lesson lacks professional escalation boundary",
    );
  }
  if (regulatoryRisk && !REGULATORY_BOUNDARY.test(searchable)) {
    issues.push(
      "regulatory-risk lesson lacks current official/professional boundary",
    );
  }
  if (safeguardingRisk && !SAFEGUARDING_BOUNDARY.test(searchable)) {
    issues.push("safeguarding lesson lacks reporting-route boundary");
  }
  const safetyBoundary = issues.some(
    (issue) =>
      issue.includes("treatment") ||
      issue.includes("veterinary") ||
      issue.includes("safeguarding"),
  )
    ? "FAIL"
    : "PASS";
  const factualBoundary = issues.some(
    (issue) => issue.includes("accreditation") || issue.includes("regulatory"),
  )
    ? "FAIL"
    : "PASS";
  return {
    slug: lesson.slug,
    title: lesson.title,
    highRisk,
    safetyBoundary,
    factualBoundary,
    status: issues.length === 0 ? "PASS" : "FAIL",
    notes:
      issues.length === 0
        ? "Reviewed against source-register safety and factual controls."
        : issues.join("; "),
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    lessonsReviewed: rows.length,
    highRiskLessons: rows.filter((row) => row.highRisk).length,
    passed: rows.filter((row) => row.status === "PASS").length,
    failed: rows.filter((row) => row.status === "FAIL").length,
  },
  lessons: rows,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("EquiProfile Academy factual and safety audit");
  console.log(JSON.stringify(report.summary, null, 2));
  for (const row of rows.filter((row) => row.status === "FAIL")) {
    console.log(`[FAIL] ${row.slug}: ${row.notes}`);
  }
}

if (report.summary.failed > 0) process.exitCode = 1;
