import { LESSON_UNITS } from "../server/lessonContent";

const VETERINARY_RISK =
  /\b(colic|laminitis|wound|vital signs?|first aid|vaccin|worm|parasite|nutrition|supplement|dental|farrier)\b/i;
const REGULATORY_RISK = /\b(transport|insurance|competition rules?|legal)\b/i;
const SAFEGUARDING_RISK = /\bsafeguarding\b/i;
const VETERINARY_BOUNDARY =
  /\b(vet(?:erinarian|erinary)?|qualified professional|farrier|dental (?:technician|professional)|SQP|RAMA)\b/i;
const REGULATORY_BOUNDARY =
  /\b(official (?:guidance|rules?|body)|insurer|current requirements|professional transporter)\b/i;
const SAFEGUARDING_BOUNDARY =
  /\b(safeguarding lead|designated safeguarding|emergency services|reporting route|police)\b/i;
const PROHIBITED_ACCREDITATION = /\b(BHS|Pony Club)\b/i;
const UNSAFE_TREATMENT =
  /\b(?:administer|give|prescribe|self[- ]treat)\s+(?:your|the|a)?\s*(?:horse|pony)?\s*(?:a )?(?:dose|medication|painkiller|drug|treatment)\b|\b(?:dosage|dose of)\s+\d/i;
const MATERIAL_NUMBER_OR_RULE =
  /\b\d+(?:[.,]\d+)?\s*(?:m|metres?|cm|mm|kg|g|ml|litres?|bpm|°c|degrees?|hours?|days?|weeks?|months?|years?|strides?)\b|\b(?:must|required|legal|law|rule)\b/i;

type Topic = "VETERINARY" | "REGULATORY" | "SAFEGUARDING";
type SafetyControlStatus = "CLEAR" | "FLAGS_REQUIRING_CORRECTION";
type FactualEvidenceStatus =
  | "NOT_MATERIAL_FACT_CHECK_REQUIRED"
  | "AUTHORITATIVE_EVIDENCE_REQUIRED";

type LessonFactRow = {
  slug: string;
  title: string;
  riskTopics: Topic[];
  safetyControlStatus: SafetyControlStatus;
  factualEvidenceStatus: FactualEvidenceStatus;
  materialNumberOrRuleDetected: boolean;
  flags: string[];
  scopeNote: string;
};

function fullLessonText(lesson: (typeof LESSON_UNITS)[number]): string {
  return [
    lesson.title,
    lesson.content,
    lesson.safetyNote,
    lesson.practicalApplication,
    ...lesson.objectives,
    ...lesson.keyPoints,
    ...lesson.commonMistakes,
    ...lesson.knowledgeCheck.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation,
    ]),
    ...lesson.aiTutorPrompts,
  ].join("\n");
}

const rows: LessonFactRow[] = LESSON_UNITS.map((lesson) => {
  const searchable = fullLessonText(lesson);
  const flags: string[] = [];
  const riskTopics: Topic[] = [];
  const veterinaryRisk = VETERINARY_RISK.test(searchable);
  const regulatoryRisk = REGULATORY_RISK.test(searchable);
  const safeguardingRisk = SAFEGUARDING_RISK.test(searchable);
  if (veterinaryRisk) riskTopics.push("VETERINARY");
  if (regulatoryRisk) riskTopics.push("REGULATORY");
  if (safeguardingRisk) riskTopics.push("SAFEGUARDING");

  if (PROHIBITED_ACCREDITATION.test(searchable)) {
    flags.push("unsupported external accreditation reference");
  }
  const copyWithoutNegativeSafetyWarnings = searchable.replace(
    /\b(?:do not|don't|never|avoid|not to)\b[^.\n]{0,90}\b(?:administer|give|prescribe|self[- ]treat)[^.\n]*/gi,
    "",
  );
  if (UNSAFE_TREATMENT.test(copyWithoutNegativeSafetyWarnings)) {
    flags.push("affirmative medication, dosage, or self-treatment instruction");
  }
  if (veterinaryRisk && !VETERINARY_BOUNDARY.test(searchable)) {
    flags.push(
      "veterinary-risk lesson lacks a professional escalation boundary",
    );
  }
  if (regulatoryRisk && !REGULATORY_BOUNDARY.test(searchable)) {
    flags.push(
      "regulatory-risk lesson lacks a current official/professional boundary",
    );
  }
  if (safeguardingRisk && !SAFEGUARDING_BOUNDARY.test(searchable)) {
    flags.push("safeguarding lesson lacks a reporting-route boundary");
  }

  const materialNumberOrRuleDetected = MATERIAL_NUMBER_OR_RULE.test(searchable);
  return {
    slug: lesson.slug,
    title: lesson.title,
    riskTopics,
    safetyControlStatus:
      flags.length === 0 ? "CLEAR" : "FLAGS_REQUIRING_CORRECTION",
    factualEvidenceStatus:
      riskTopics.length > 0 || materialNumberOrRuleDetected
        ? "AUTHORITATIVE_EVIDENCE_REQUIRED"
        : "NOT_MATERIAL_FACT_CHECK_REQUIRED",
    materialNumberOrRuleDetected,
    flags,
    scopeNote:
      "Automated guard only: CLEAR means no configured unsafe-language or missing-boundary pattern was detected. It does not establish factual correctness, legal compliance, clinical safety, endorsement, or human acceptance.",
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  scope:
    "Pattern guard for prohibited accreditation, affirmative treatment/dosage language and required escalation boundaries. This report does not fact-check lessons; use the per-lesson factual evidence register for source-backed review.",
  summary: {
    lessonsAssessed: rows.length,
    lessonsWithSafetyControlFlags: rows.filter(
      (row) => row.safetyControlStatus === "FLAGS_REQUIRING_CORRECTION",
    ).length,
    lessonsRequiringAuthoritativeEvidence: rows.filter(
      (row) => row.factualEvidenceStatus === "AUTHORITATIVE_EVIDENCE_REQUIRED",
    ).length,
    lessonsWithoutMaterialFactEvidenceRequirement: rows.filter(
      (row) => row.factualEvidenceStatus === "NOT_MATERIAL_FACT_CHECK_REQUIRED",
    ).length,
  },
  lessons: rows,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("EquiProfile Academy safety-control and factual-evidence guard");
  console.log(JSON.stringify(report.summary, null, 2));
  for (const row of rows.filter(
    (row) => row.safetyControlStatus === "FLAGS_REQUIRING_CORRECTION",
  )) {
    console.log(`[FLAG] ${row.slug}: ${row.flags.join("; ")}`);
  }
}

if (report.summary.lessonsWithSafetyControlFlags > 0) process.exitCode = 1;
