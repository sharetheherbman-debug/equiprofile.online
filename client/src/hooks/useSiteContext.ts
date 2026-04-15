/**
 * Site Context Hook — Domain-aware site detection
 *
 * Detects whether the current browser is on:
 *   - equiprofile.online → "management"
 *   - school.equiprofile.online → "school"
 *
 * Used by App.tsx and layout components to render the correct
 * public marketing experience while sharing one SPA build.
 */

export type SiteMode = "management" | "school";

/** School subdomain patterns (production + local dev) */
const SCHOOL_PATTERNS = [
  "school.equiprofile.online",
  "school.localhost",
  "school.127.0.0.1",
];

/**
 * Determine which site experience to render based on the current hostname.
 * In development you can test school mode by visiting school.localhost:5173.
 */
export function getSiteMode(): SiteMode {
  if (typeof window === "undefined") return "management";

  const hostname = window.location.hostname.toLowerCase();

  // Check if hostname starts with "school." or exactly matches a known school pattern
  if (hostname.startsWith("school.") || SCHOOL_PATTERNS.some((p) => hostname === p || hostname.startsWith(p + ":"))) {
    return "school";
  }

  return "management";
}

/** React hook for site context */
export function useSiteContext() {
  const mode = getSiteMode();

  return {
    mode,
    isSchool: mode === "school",
    isManagement: mode === "management",
    /** Full brand name for the current site */
    siteName: mode === "school" ? "EquiProfile School" : "EquiProfile",
    /** Short tagline */
    siteTagline:
      mode === "school"
        ? "Premium Equestrian Learning Platform"
        : "Professional Horse Management Platform",
    /** The other site's URL for cross-linking */
    otherSiteUrl:
      mode === "school"
        ? "https://equiprofile.online"
        : "https://school.equiprofile.online",
    otherSiteName: mode === "school" ? "EquiProfile Management" : "EquiProfile School",
  };
}
