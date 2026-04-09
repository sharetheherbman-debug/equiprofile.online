/**
 * UI Version Configuration
 *
 * Controls which frontend experience is active (V1 legacy or V2 redesign).
 * The version is chosen at deploy / install time via the VITE_UI_VERSION
 * environment variable. There is no runtime toggle for end users.
 *
 * Set in .env before building:
 *   VITE_UI_VERSION=v1   → legacy frontend (default)
 *   VITE_UI_VERSION=v2   → redesigned frontend
 */

export type UIVersion = "v1" | "v2";

/** Read the active UI version (deploy-time only) */
export function getUIVersion(): UIVersion {
  const envVersion = import.meta.env.VITE_UI_VERSION;
  if (envVersion === "v2") return "v2";
  return "v1";
}

/** Check if the deployed version is V2 */
export function isV2(): boolean {
  return getUIVersion() === "v2";
}
