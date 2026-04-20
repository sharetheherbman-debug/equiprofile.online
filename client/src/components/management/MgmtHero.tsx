/**
 * MgmtHero — Single source of truth for inner-page hero sections.
 *
 * USED BY: Features, Pricing, About, Contact management marketing pages.
 * NOT used by the Home page (which has its own full-screen hero with CTAs).
 * NOT used by PageBanner.tsx (which is for Terms, Privacy, Schools pages only).
 *
 * Props:
 *   imageSrc            — hero background image path
 *   imageAlt            — alt text for accessibility
 *   imageObjectPosition — "center" (default) | "top" | "bottom"
 *   eyebrow             — small badge text above the title
 *   eyebrowVariant      — "gold" (default) | "glass" (used by Contact)
 *   eyebrowIcon         — optional Lucide icon (glass variant only)
 *   title               — ReactNode — supports plain strings or JSX with
 *                         colored spans, line breaks, etc.
 *   subtitle            — supporting paragraph below the title
 *   minHeight           — Tailwind min-height classes (override default)
 *   fadeVariant         — "light" (→ #f8f9fb) | "alt-light" (→ #f0f4f8) | "none" (default)
 *
 * FADE NOTE
 * ---------
 * fadeVariant defaults to "none" — no bottom fade overlay is rendered.
 * The "light" and "alt-light" variants are available for opt-in use but
 * were removed from all pages because the h-64 fade obscured hero images.
 *
 * STYLING SOURCE OF TRUTH
 * -----------------------
 * - Overlay:   `.mgmt-hero-overlay` CSS class (index.css → @layer utilities)
 * - Colours:    EP_DARK / EP_GOLD palette from managementTheme.ts
 */

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// ── Fade class maps ────────────────────────────────────────────────────────────
// Complete Tailwind literal strings — never constructed by concatenation.
// "light"     fades into the standard light section (#f8f9fb)
// "alt-light" fades into the alt light section (#f0f4f8) — Contact page
const FADE_CLASS = {
  light:
    "absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#f8f9fb]/35 to-[#f8f9fb]",
  "alt-light":
    "absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#f0f4f8]/50 to-[#f0f4f8]",
} as const;

// ── Object-position map ────────────────────────────────────────────────────────
const OBJECT_POS = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MgmtHeroProps {
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: keyof typeof OBJECT_POS;
  eyebrow: string;
  /** "gold" — standard management badge (default). "glass" — frosted white pill (Contact). */
  eyebrowVariant?: "gold" | "glass";
  /** Optional icon shown to the left of eyebrow text (glass variant only). */
  EyebrowIcon?: LucideIcon;
  title: ReactNode;
  subtitle: ReactNode;
  /** Override the default min-height Tailwind classes. */
  minHeight?: string;
  /** Controls the bottom-fade treatment. Defaults to "none" — no fade. */
  fadeVariant?: keyof typeof FADE_CLASS | "none";
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MgmtHero({
  imageSrc,
  imageAlt,
  imageObjectPosition = "center",
  eyebrow,
  eyebrowVariant = "gold",
  EyebrowIcon,
  title,
  subtitle,
  minHeight = "min-h-[500px] md:min-h-[560px]",
  fadeVariant = "none",
}: MgmtHeroProps) {
  const objectPosClass = OBJECT_POS[imageObjectPosition];
  const fadeClass = fadeVariant !== "none" ? FADE_CLASS[fadeVariant] : null;

  const eyebrowEl =
    eyebrowVariant === "glass" ? (
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
        {EyebrowIcon && <EyebrowIcon className="w-4 h-4" />}
        {eyebrow}
      </div>
    ) : (
      <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-sm font-bold text-[#c5a55a] tracking-widest uppercase mb-5">
        {eyebrow}
      </div>
    );

  return (
    <section className={`relative ${minHeight} flex items-center overflow-hidden`}>
      {/* Background image */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className={`absolute inset-0 w-full h-full object-cover ${objectPosClass}`}
      />

      {/* Dark gradient overlay — sourced from .mgmt-hero-overlay in index.css */}
      <div className="mgmt-hero-overlay" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {eyebrowEl}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold font-serif text-white leading-tight max-w-4xl mx-auto">
            {title}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* Bottom fade — smooth 3-stop transition into the next section */}
      {fadeClass && <div className={fadeClass} />}
    </section>
  );
}
