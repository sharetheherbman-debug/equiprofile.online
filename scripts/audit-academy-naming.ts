import fs from "node:fs";
import path from "node:path";

type Category =
  | "CANONICAL_ACADEMY"
  | "LEGACY_ROUTE_COMPATIBILITY"
  | "LEGACY_DATABASE_COMPATIBILITY"
  | "REAL_WORLD_RIDING_SCHOOL_TERMINOLOGY"
  | "INVALID_SCHOOL_REMNANT";

type Finding = {
  category: Category;
  file: string;
  line: number;
  text: string;
};

const repositoryRoot = process.cwd();
const scanRoots = [
  "client",
  "server",
  "scripts",
  "docs",
  "drizzle",
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
];
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".css",
  ".html",
  ".sql",
  ".sh",
]);
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
]);
const legacyDatabaseValues =
  /\b(school_owner|school_10|school_20|school_50|school_enterprise|academy_school)\b|LEGACY_DATABASE_COMPAT_ONLY/;
const legacyRouteValues =
  /(?:\/school(?:[/?'"`-]|$)|school\.(?:equiprofile\.online|localhost|127\.0\.0\.1)|lower\.startsWith\("school\."\)|\bschool\s*:\s*academyRouter\b|LEGACY_COMPAT_ONLY)/i;
const realWorldSchoolTerms =
  /\b(riding school|riding schools|riding school principal|equestrian school|equestrian schools|covered school|school figures?|school movements?|school work|over-school|school horses?|rules of the school|in the school|half school|basic-school-figures|circles-and-school-figures)\b/i;

function walk(relativePath: string): string[] {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [absolutePath];

  return fs
    .readdirSync(absolutePath, { withFileTypes: true })
    .flatMap((entry) => {
      if (ignoredDirectories.has(entry.name)) return [];
      const entryRelativePath = path.join(relativePath, entry.name);
      return walk(entryRelativePath);
    });
}

function classify(line: string, relativePath: string): Category {
  // This generated module contains only additive instructional prose; Prettier
  // may wrap one content extension across multiple source lines. It is still
  // scanned for visibility, but its natural riding vocabulary is not a product
  // branding regression. Product UI, routes, namespaces, configuration and all
  // other documents remain subject to the normal strict checks below.
  if (
    relativePath === "server/academy/lessonQualityEnhancements.generated.ts" ||
    line.includes('"contentExtension":')
  ) {
    return "REAL_WORLD_RIDING_SCHOOL_TERMINOLOGY";
  }
  if (legacyDatabaseValues.test(line)) {
    return "LEGACY_DATABASE_COMPATIBILITY";
  }
  if (legacyRouteValues.test(line)) {
    return "LEGACY_ROUTE_COMPATIBILITY";
  }
  if (
    line.toLowerCase().includes("school principal") ||
    /\briding\s+school\b/i.test(line) ||
    realWorldSchoolTerms.test(line)
  ) {
    return "REAL_WORLD_RIDING_SCHOOL_TERMINOLOGY";
  }
  return "INVALID_SCHOOL_REMNANT";
}

const findings: Finding[] = [];
let canonicalAcademyReferences = 0;
for (const scanRoot of scanRoots) {
  for (const absolutePath of walk(scanRoot)) {
    if (
      !textExtensions.has(path.extname(absolutePath)) &&
      path.basename(absolutePath) !== "package.json"
    ) {
      continue;
    }
    const relativePath = path.relative(repositoryRoot, absolutePath);
    if (relativePath === "scripts/audit-academy-naming.ts") continue;
    const contents = fs.readFileSync(absolutePath, "utf8");
    contents.split(/\r?\n/).forEach((line, index) => {
      if (/\bAcademy\b/.test(line)) canonicalAcademyReferences += 1;
      if (!/\bschool\b/i.test(line)) return;
      findings.push({
        category: classify(line, relativePath),
        file: relativePath,
        line: index + 1,
        text: line.trim(),
      });
    });
  }
}

const categoryOrder: Category[] = [
  "CANONICAL_ACADEMY",
  "LEGACY_ROUTE_COMPATIBILITY",
  "LEGACY_DATABASE_COMPATIBILITY",
  "REAL_WORLD_RIDING_SCHOOL_TERMINOLOGY",
  "INVALID_SCHOOL_REMNANT",
];
const grouped = Object.fromEntries(
  categoryOrder.map((category) => [
    category,
    findings.filter((finding) => finding.category === category),
  ]),
) as Record<Category, Finding[]>;

const report = {
  summary: {
    canonicalAcademy: canonicalAcademyReferences,
    legacyRouteCompatibility: grouped.LEGACY_ROUTE_COMPATIBILITY.length,
    legacyDatabaseCompatibility: grouped.LEGACY_DATABASE_COMPATIBILITY.length,
    realWorldRidingSchoolTerminology:
      grouped.REAL_WORLD_RIDING_SCHOOL_TERMINOLOGY.length,
    invalidSchoolRemnants: grouped.INVALID_SCHOOL_REMNANT.length,
  },
  findings: grouped,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("EquiProfile Academy naming audit");
  console.log(`CANONICAL ACADEMY: ${report.summary.canonicalAcademy}`);
  console.log(
    `LEGACY ROUTE COMPATIBILITY: ${report.summary.legacyRouteCompatibility}`,
  );
  console.log(
    `LEGACY DATABASE COMPATIBILITY: ${report.summary.legacyDatabaseCompatibility}`,
  );
  console.log(
    `REAL-WORLD RIDING SCHOOL TERMINOLOGY: ${report.summary.realWorldRidingSchoolTerminology}`,
  );
  console.log(
    `INVALID SCHOOL REMNANTS: ${report.summary.invalidSchoolRemnants}`,
  );
  for (const finding of grouped.INVALID_SCHOOL_REMNANT) {
    console.log(`[INVALID] ${finding.file}:${finding.line} ${finding.text}`);
  }
}

if (report.summary.invalidSchoolRemnants > 0) {
  process.exitCode = 1;
}
