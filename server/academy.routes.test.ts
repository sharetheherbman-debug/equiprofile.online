import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const readRepoFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const marketingPages = [
  "client/src/pages/academy/Home.tsx",
  "client/src/pages/academy/Features.tsx",
  "client/src/pages/academy/Pricing.tsx",
  "client/src/pages/academy/About.tsx",
  "client/src/pages/academy/Contact.tsx",
];

describe("EquiProfile Academy route compatibility", () => {
  const routerSource = readRepoFile("client/academy/src/AcademyApp.tsx");

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
  ])("keeps LEGACY_COMPAT_ONLY School alias %s", (route) => {
    expect(routerSource).toContain(`path=\"${route}\"`);
  });

  it.each(["/", "/features", "/pricing", "/about", "/contact"])(
    "keeps historical root route %s",
    (route) => {
      expect(routerSource).toContain(`path=\"${route}\"`);
    },
  );

  it("provides Academy dashboard with LEGACY_COMPAT_ONLY school-dashboard compatibility", () => {
    expect(routerSource).toContain('path="/academy-dashboard"');
    expect(routerSource).toContain('path="/school-dashboard"');
  });
});

describe("EquiProfile Academy public branding contract", () => {
  it("uses Academy branding in navigation, footer and document metadata", () => {
    const navbar = readRepoFile(
      "client/src/components/academy/AcademyNavbar.tsx",
    );
    const footer = readRepoFile(
      "client/src/components/academy/AcademyFooter.tsx",
    );
    const html = readRepoFile("client/academy/index.html");

    expect(navbar).toContain("Academy");
    expect(footer).toContain("EquiProfile Academy");
    expect(html).toContain(
      "EquiProfile Academy — Premium Equestrian Learning Platform",
    );
  });

  it("uses Academy paths for customer-facing navigation", () => {
    const navbar = readRepoFile(
      "client/src/components/academy/AcademyNavbar.tsx",
    );
    const footer = readRepoFile(
      "client/src/components/academy/AcademyFooter.tsx",
    );

    for (const route of [
      "/academy/features",
      "/academy/pricing",
      "/academy/about",
      "/academy/contact",
    ]) {
      expect(navbar + footer).toContain(route);
    }
  });

  it.each(marketingPages)(
    "does not present the old product name in %s",
    (file) => {
      expect(readRepoFile(file)).not.toContain("EquiProfile School"); // LEGACY_COMPAT_ONLY regression sentinel
    },
  );

  it.each(marketingPages)(
    "does not claim BHS or Pony Club alignment in %s",
    (file) => {
      expect(readRepoFile(file)).not.toMatch(/\bBHS\b|Pony Club/);
    },
  );

  it.each(marketingPages)(
    "does not retain the conflicting 14-day trial copy in %s",
    (file) => {
      expect(readRepoFile(file)).not.toMatch(/14[- ]day/i);
    },
  );

  it("derives public trial copy from the shared trial constant", () => {
    const pricing = readRepoFile("client/src/pages/academy/Pricing.tsx");
    const contact = readRepoFile("client/src/pages/academy/Contact.tsx");

    expect(pricing).toContain("FREE_TRIAL_DAYS");
    expect(contact).toContain("FREE_TRIAL_DAYS");
  });
});

describe("Academy owner compatibility contract", () => {
  const ownerDashboard = readRepoFile("client/src/pages/AcademyDashboard.tsx");

  it("presents the Academy product name to Academy owners", () => {
    expect(ownerDashboard).toContain("Welcome to EquiProfile Academy");
    expect(ownerDashboard).toContain("Academy Dashboard");
    expect(ownerDashboard).toContain('"Academy Owner"');
    expect(ownerDashboard).not.toContain("Welcome to School Management"); // LEGACY_COMPAT_ONLY regression sentinel
    expect(ownerDashboard).not.toContain("School Dashboard"); // LEGACY_COMPAT_ONLY regression sentinel
  });

  it("uses canonical Academy APIs while retaining legacy compatibility", () => {
    expect(ownerDashboard).toContain("trpc.academy.createOrganization");
    expect(ownerDashboard).toContain("trpc.academy.inviteMember");
    expect(ownerDashboard).toContain('m.role === "school_owner"');
  });

  it("preserves real-world Riding School terminology as an organisation type", () => {
    expect(ownerDashboard).toContain('label: "Riding School"');
    expect(ownerDashboard).toContain('value: "riding_school"');
  });
});
