import { LESSON_PATHWAYS, LESSON_UNITS } from "../server/lessonContent";
import { auditAcademyCurriculum } from "../server/academy/curriculumIntegrity";

const report = auditAcademyCurriculum(LESSON_PATHWAYS, LESSON_UNITS);
const wantsJson = process.argv.includes("--json");

if (wantsJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const { summary } = report;
  console.log("EquiProfile Academy curriculum audit");
  console.log(`Pathways: ${summary.pathways}`);
  console.log(`Lessons: ${summary.lessons}`);
  console.log(`Knowledge checks: ${summary.knowledgeChecks}`);
  console.log(`Linked competency references: ${summary.linkedCompetencyReferences}`);
  console.log(`Errors: ${summary.errors}`);
  console.log(`Warnings: ${summary.warnings}`);
  console.log("");

  for (const entry of report.issues) {
    console.log(
      `[${entry.severity.toUpperCase()}] ${entry.code} ${entry.location}: ${entry.message}`,
    );
  }
}

if (report.summary.errors > 0) {
  process.exitCode = 1;
}
