/**
 * UI Version Configuration
 *
 * Controls which frontend experience is active (V1 legacy or V2 redesign).
 * Safe, reversible toggle — legacy is never removed.
 *
 * Priority order:
 *   1. localStorage override (per-user preview: "equiprofile-ui-version")
 *   2. Environment variable (deploy-time default: VITE_UI_VERSION)
 *   3. Fallback to "v1"
 */

export type UIVersion = "v1" | "v2";

const STORAGE_KEY = "equiprofile-ui-version";

/** Read the active UI version */
export function getUIVersion(): UIVersion {
  // 1. Per-user localStorage override (set via admin toggle or URL param)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "v1" || stored === "v2") return stored;
  } catch {
    // SSR / storage unavailable — fall through
  }

  // 2. Build-time env var (set in .env or deployment config)
  const envVersion = import.meta.env.VITE_UI_VERSION;
  if (envVersion === "v2") return "v2";

  // 3. Default to legacy
  return "v1";
}

/** Set UI version (persists to localStorage) */
export function setUIVersion(version: UIVersion): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // ignore storage errors
  }
}

/** Clear override (revert to env/default) */
export function clearUIVersionOverride(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

/** Check if user is currently on V2 */
export function isV2(): boolean {
  return getUIVersion() === "v2";
}
