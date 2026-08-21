import fs from "node:fs";
import path from "node:path";

const registerPath = path.join(
  process.cwd(),
  "docs",
  "academy",
  "lesson-factual-evidence-register.json",
);

if (!fs.existsSync(registerPath)) {
  throw new Error(
    "Missing lesson-factual-evidence-register.json. Run generate-academy-factual-evidence.ts first.",
  );
}

const register = JSON.parse(fs.readFileSync(registerPath, "utf8")) as {
  lessons: Array<{
    lessonSlug: string;
    claimTopics: string[];
    riskClass: string;
    sources: Array<{
      organisation: string;
      title: string;
      url: string;
      checkedAt: string;
    }>;
    sourceCheckDate: string;
    whatWasVerified: string;
    lessonChangeMade: string;
    reviewStatus: string;
  }>;
};

const requiredStrings = [
  "lessonSlug",
  "riskClass",
  "sourceCheckDate",
  "whatWasVerified",
  "lessonChangeMade",
] as const;
const issues: string[] = [];
for (const row of register.lessons) {
  for (const key of requiredStrings) {
    if (!row[key] || !String(row[key]).trim()) {
      issues.push(`${row.lessonSlug}: missing ${key}`);
    }
  }
  if (!row.claimTopics.length)
    issues.push(`${row.lessonSlug}: missing claim topic`);
  if (
    row.reviewStatus !== "NOT_MATERIAL_FACT_CHECK_REQUIRED" &&
    row.sources.some(
      (source) =>
        !source.organisation ||
        !source.title ||
        !source.url.startsWith("https://") ||
        !source.checkedAt,
    )
  ) {
    issues.push(`${row.lessonSlug}: incomplete source record`);
  }
}

const statusCounts = Object.fromEntries(
  [...new Set(register.lessons.map((row) => row.reviewStatus))].map(
    (status) => [
      status,
      register.lessons.filter((row) => row.reviewStatus === status).length,
    ],
  ),
);
const unresolved = register.lessons.filter(
  (row) => row.reviewStatus === "SOURCE_MAPPED_REQUIRES_SPECIFIC_CLAIM_REVIEW",
);
const report = {
  generatedAt: new Date().toISOString(),
  scope:
    "Evidence-register completeness audit. It does not fact-check content or convert source mapping into factual acceptance.",
  lessonsRegistered: register.lessons.length,
  statusCounts,
  unresolvedSpecificClaimReviews: unresolved.length,
  registerIssues: issues,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("EquiProfile Academy factual-evidence audit");
  console.log(JSON.stringify(report, null, 2));
}

if (
  register.lessons.length !== 105 ||
  issues.length > 0 ||
  unresolved.length > 0
) {
  process.exitCode = 1;
}
