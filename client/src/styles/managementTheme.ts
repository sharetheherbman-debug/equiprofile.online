import type { CSSProperties } from "react";

/**
 * Management marketing site — shared theme constants.
 *
 * ALL management pages import colour tokens and Tailwind class strings from
 * here.  One change in this file propagates to every page that imports it.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The management frontend uses Tailwind inline classes.  Without a shared
 * constants file, every page carries its own hardcoded hex values, meaning
 * a colour update requires hunting down every occurrence manually.  This file
 * is the single source of truth.
 *
 * TAILWIND v4 SCANNING NOTE
 * --------------------------
 * Tailwind v4 scans source files for *complete* class-name strings.  All
 * class strings exported below are written as full literals so the scanner
 * includes them in the CSS bundle.  Do NOT build class names by string
 * concatenation — write them out in full.
 *
 * HERO SYSTEM — SINGLE SOURCE OF TRUTH
 * --------------------------------------
 * Inner-page heroes (Features, Pricing, About, Contact) use the shared
 * MgmtHero component:
 *   client/src/components/management/MgmtHero.tsx
 *
 * The Home page deliberately keeps its own full-screen hero (96vh with CTAs).
 * mgmtHeroFade / mgmtHeroFadeAlt below are kept for backward compatibility
 * but future pages should use MgmtHero instead of these exports directly.
 */

// ── Colour hex values ────────────────────────────────────────────────────────

/** Primary dark section background — aligned with the school/academy site */
export const EP_DARK = "#1e3a5f";
/** Deep dark used as the start of CTA gradients and hero overlays */
export const EP_DARK_DEEP = "#0f2238";
/** Mid-dark used in hero overlay midpoints */
export const EP_DARK_MID = "#162d4a";
/** CTA gradient endpoint */
export const EP_DARK_CTA_END = "#11253e";
/** Brand gold accent */
export const EP_GOLD = "#c5a55a";
/** Brand teal accent */
export const EP_TEAL = "#1a7a6d";
/** Brand blue */
export const EP_BLUE = "#2e6da4";
/** Brand blue light */
export const EP_BLUE_LIGHT = "#4a9eca";
/** Main body text / darkest background */
export const EP_TEXT = "#0f1d2e";
/** Primary light section background */
export const EP_SECTION_LIGHT = "#f8f9fb";
/** Alt light section background (Contact form area) */
export const EP_SECTION_ALT = "#f0f4f8";

// ── Tailwind class strings ────────────────────────────────────────────────────

/** Dark section background used for showcase, feature grids, origin stories */
export const mgmtDarkSection = "bg-[#1e3a5f]";

/** CTA section gradient — applied to all page-ending CTA dark banners */
export const mgmtCtaGradient =
  "bg-gradient-to-br from-[#0f2238] via-[#1e3a5f] to-[#11253e]";

/** Hero image overlay — warm dark gradient layered over photo backgrounds */
export const mgmtHeroOverlay =
  "absolute inset-0 bg-gradient-to-b from-[#0f2238]/70 via-[#1e3a5f]/60 to-[#162d4a]/80";

/**
 * Hero fade into the light section (#f8f9fb).
 * Place as the last child of the hero section (absolute positioned).
 *
 * @deprecated — MgmtHero now uses fadeVariant="none" by default.
 * Kept for backward compatibility if re-enabled.
 */
export const mgmtHeroFade =
  "absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#f8f9fb]/35 to-[#f8f9fb]";

/**
 * Hero fade into the alt light section (#f0f4f8) — Contact page.
 * Place as the last child of the hero section (absolute positioned).
 *
 * @deprecated — MgmtHero now uses fadeVariant="none" by default.
 * Kept for backward compatibility if re-enabled.
 */
export const mgmtHeroFadeAlt =
  "absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#f0f4f8]/50 to-[#f0f4f8]";

/** Subtle dot-grid pattern used inside CTA sections */
export const mgmtDotPattern: CSSProperties = {
  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
