import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const readRepoFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const marketingPages = [
  "client/src/pages/school/Home.tsx",
  "client/src/pages/school/Features.tsx",
  "client/src/pages/school/Pricing.tsx",
  "client/src/pages/school/About.tsx",
  "client/src/pages/school/Contact.tsx",
];

describe("EquiProfile Academy route compatibility", () => {
  const routerSource = readRepoFile("client/school/src/SchoolApp.tsx");

  it.each([
    "/academy",
    "/academy/features",
    "/academy/pricing",
    "/academy/about",
    "/academy/contact",
  ])("keeps canonical Academy public route %s", (route) => {
    expect(routerSource).toContain(`path=\"${route}\"`);
  });

  it.each([
    "/school",
    "/school/features",
    "/school/pricing",
    "/school/about",
    "/school/contact",
  ])("keeps legacy School alias %s", (route) => {
    expect(routerSource).toContain(`path=\"${route}\"`);
  });

  it.each(["/", "/features", "/pricing", "/about", "/contact"])(
    "keeps historical root route %s",
    (route) => {
      expect(routerSource).toContain(`path=\"${route}\"`);
    },
  );

  it("provides Academy dashboard without removing school-dashboard compatibility", () => {
    expect(routerSource).toContain('path="/academy-dashboard"');
    expect(routerSource).toContain('path="/school-dashboard"');
  });
});

describe("EquiProfile Academy public branding contract", () => {
  it("uses Academy branding in navigation, footer and document metadata", () => {
    const navbar = readRepoFile("client/src/components/school/SchoolNavbar.tsx");
    const footer = readRepoFile("client/src/components/school/SchoolFooter.tsx");
    const html = readRepoFile("client/school/index.html");

    expect(navbar).toContain("Academy");
    expect(footer).toContain("EquiProfile Academy");
    expect(html).toContain("EquiProfile Academy — Premium Equestrian Learning Platform");
  });

  it("uses Academy paths for customer-facing navigation", () => {
    const navbar = readRepoFile("client/src/components/school/SchoolNavbar.tsx");
    const footer = readRepoFile("client/src/components/school/SchoolFooter.tsx");

    for (const route of [
      "/academy/features",
      "/academy/pricing",
      "/academy/about",
      "/academy/contact",
    ]) {
      expect(navbar + footer).toContain(route);
    }
  });

  it.each(marketingPages)("does not present the old product name in %s", (file) => {
    expect(readRepoFile(file)).not.toContain("EquiProfile School");
  });

  it.each(marketingPages)("does not claim BHS or Pony Club alignment in %s", (file) => {
    expect(readRepoFile(file)).not.toMatch(/\bBHS\b|Pony Club/);
  });

  it.each(marketingPages)("does not retain the conflicting 14-day trial copy in %s", (file) => {
    expect(readRepoFile(file)).not.toMatch(/14[- ]day/i);
  });

  it("derives public trial copy from the shared trial constant", () => {
    const pricing = readRepoFile("client/src/pages/school/Pricing.tsx");
    const contact = readRepoFile("client/src/pages/school/Contact.tsx");

    expect(pricing).toContain("FREE_TRIAL_DAYS");
    expect(contact).toContain("FREE_TRIAL_DAYS");
  });
});

describe("Academy owner compatibility contract", () => {
  const ownerDashboard = readRepoFile("client/src/pages/SchoolDashboard.tsx");

  it("presents the Academy product name to Academy owners", () => {
    expect(ownerDashboard).toContain("Welcome to EquiProfile Academy");
    expect(ownerDashboard).toContain("Academy Dashboard");
    expect(ownerDashboard).toContain('"Academy Owner"');
    expect(ownerDashboard).not.toContain("Welcome to School Management");
    expect(ownerDashboard).not.toContain("School Dashboard");
  });

  it("preserves internal school API and role identifiers", () => {
    expect(ownerDashboard).toContain("trpc.school.createOrganization");
    expect(ownerDashboard).toContain("trpc.school.inviteMember");
    expect(ownerDashboard).toContain('m.role === "school_owner"');
  });

  it("preserves real-world Riding School terminology as an organisation type", () => {
    expect(ownerDashboard).toContain('label: "Riding School"');
    expect(ownerDashboard).toContain('value: "riding_school"');
  });
});
