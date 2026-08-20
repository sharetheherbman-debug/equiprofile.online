import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const readRepoFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

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
});
