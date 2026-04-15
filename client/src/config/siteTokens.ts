/**
 * Site Design Tokens
 *
 * Centralised colour and design token definitions for both sites.
 * These are used by layout components, navbars, footers, and marketing pages
 * to maintain distinct brand identities.
 */

export const managementTokens = {
  // Primary palette
  navy: "#0f1d2e",
  navyLight: "#1a3152",
  blue: "#2e6da4",
  blueLight: "#4a8ec7",
  teal: "#1a7a6d",
  tealLight: "#2aa396",

  // Surfaces
  surface: "#f8f9fb",
  surfaceWarm: "#faf8f5",
  card: "#ffffff",

  // Text
  text: "#0f1d2e",
  textSecondary: "#4a5568",
  textMuted: "#718096",

  // Borders
  border: "#e2e8f0",
  borderLight: "#edf2f7",

  // Accents
  gold: "#c5a55a",
  goldLight: "#d4bb7a",

  // Gradients
  heroGradient: "linear-gradient(135deg, #0f1d2e 0%, #1a3a5c 40%, #2e6da4 100%)",
  navGradient: "linear-gradient(180deg, #0f1d2e 0%, #152640 100%)",
  accentGradient: "linear-gradient(135deg, #2e6da4 0%, #1a7a6d 100%)",
  cardGlow: "0 8px 32px rgba(46, 109, 164, 0.12)",
} as const;

export const schoolTokens = {
  // Primary palette
  blue: "#1e4d8c",
  blueLight: "#2563a8",
  green: "#2d6a4f",
  greenLight: "#3a8d6b",
  sky: "#3b82f6",
  skyLight: "#60a5fa",

  // Surfaces
  surface: "#f0f4f8",
  surfaceWarm: "#f5f7fa",
  card: "#ffffff",

  // Text
  text: "#1e293b",
  textSecondary: "#475569",
  textMuted: "#64748b",

  // Borders
  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  // Accents
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  emerald: "#10b981",

  // Gradients
  heroGradient: "linear-gradient(135deg, #1e3a5f 0%, #1e4d8c 40%, #2d6a4f 100%)",
  navGradient: "linear-gradient(180deg, #1e3a5f 0%, #1a3152 100%)",
  accentGradient: "linear-gradient(135deg, #1e4d8c 0%, #2d6a4f 100%)",
  cardGlow: "0 8px 32px rgba(30, 77, 140, 0.12)",
} as const;
