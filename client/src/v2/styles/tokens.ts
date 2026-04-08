/**
 * EquiProfile V2 Design System — Tokens & Primitives
 *
 * Calm luxury palette: deep slate, soft charcoal, muted indigo accent.
 * Shared across Website V2, Standard Dashboard V2, Stable Dashboard V2.
 */

/* ─── Color Tokens ─────────────────────────────────────────────── */

export const v2Colors = {
  /* Backgrounds */
  pageBg: "bg-[#f7f8fa]",           // soft warm grey
  pageBgDark: "dark:bg-[#0f1219]",  // deep slate-charcoal
  surfaceBg: "bg-white",
  surfaceBgDark: "dark:bg-[#181d27]",
  elevatedBg: "bg-[#f0f2f5]",
  elevatedBgDark: "dark:bg-[#1e2433]",

  /* Borders */
  border: "border-[#e4e7ec]",
  borderDark: "dark:border-[#2a3040]",

  /* Text */
  textPrimary: "text-[#1a1d24]",
  textPrimaryDark: "dark:text-[#e8eaef]",
  textSecondary: "text-[#5c6370]",
  textSecondaryDark: "dark:text-[#9ca3b0]",
  textMuted: "text-[#8b919e]",
  textMutedDark: "dark:text-[#6b7280]",

  /* Accent — muted indigo */
  accent: "text-[#4f5fd6]",
  accentBg: "bg-[#4f5fd6]",
  accentBgHover: "hover:bg-[#4350b8]",
  accentSoft: "bg-[#eef0fb]",
  accentSoftDark: "dark:bg-[#252a40]",

  /* Status — restrained */
  success: "text-[#2d8a56]",
  successBg: "bg-[#ecf7f0]",
  warning: "text-[#b58a1b]",
  warningBg: "bg-[#fdf8ea]",
  danger: "text-[#c53d3d]",
  dangerBg: "bg-[#fcedef]",
  info: "text-[#3b7dd8]",
  infoBg: "bg-[#edf4fc]",
} as const;

/* ─── Spacing Scale ────────────────────────────────────────────── */

export const v2Spacing = {
  sectionY: "py-16 md:py-24",
  sectionX: "px-5 md:px-8 lg:px-12",
  containerMax: "max-w-6xl mx-auto",
  containerWide: "max-w-7xl mx-auto",
  cardPadding: "p-5 md:p-6",
  cardGap: "gap-4 md:gap-6",
  stackGap: "space-y-3 md:space-y-4",
} as const;

/* ─── Typography Classes ───────────────────────────────────────── */

export const v2Type = {
  h1: "font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight",
  h2: "font-serif text-2xl md:text-3xl font-semibold tracking-tight",
  h3: "font-serif text-xl md:text-2xl font-medium tracking-tight",
  h4: "font-sans text-lg font-semibold",
  body: "font-sans text-base leading-relaxed",
  bodySmall: "font-sans text-sm leading-relaxed",
  caption: "font-sans text-xs tracking-wide uppercase",
  label: "font-sans text-sm font-medium",
} as const;

/* ─── Card Variants ────────────────────────────────────────────── */

export const v2Card = {
  base: "rounded-xl border bg-white dark:bg-[#181d27] border-[#e4e7ec] dark:border-[#2a3040] shadow-sm",
  elevated: "rounded-xl border bg-white dark:bg-[#181d27] border-[#e4e7ec] dark:border-[#2a3040] shadow-md",
  interactive: "rounded-xl border bg-white dark:bg-[#181d27] border-[#e4e7ec] dark:border-[#2a3040] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
  flat: "rounded-xl bg-[#f0f2f5] dark:bg-[#1e2433] border-0",
} as const;

/* ─── Button Variants ──────────────────────────────────────────── */

export const v2Button = {
  primary: "bg-[#4f5fd6] hover:bg-[#4350b8] text-white font-medium rounded-lg px-5 py-2.5 transition-colors duration-150 shadow-sm",
  secondary: "bg-[#f0f2f5] dark:bg-[#1e2433] hover:bg-[#e4e7ec] dark:hover:bg-[#2a3040] text-[#1a1d24] dark:text-[#e8eaef] font-medium rounded-lg px-5 py-2.5 transition-colors duration-150",
  ghost: "hover:bg-[#f0f2f5] dark:hover:bg-[#1e2433] text-[#5c6370] dark:text-[#9ca3b0] font-medium rounded-lg px-4 py-2 transition-colors duration-150",
  outline: "border border-[#e4e7ec] dark:border-[#2a3040] hover:bg-[#f7f8fa] dark:hover:bg-[#1e2433] text-[#1a1d24] dark:text-[#e8eaef] font-medium rounded-lg px-5 py-2.5 transition-colors duration-150",
} as const;

/* ─── Badge Variants ───────────────────────────────────────────── */

export const v2Badge = {
  default: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#f0f2f5] dark:bg-[#1e2433] text-[#5c6370] dark:text-[#9ca3b0]",
  accent: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#eef0fb] dark:bg-[#252a40] text-[#4f5fd6]",
  success: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#ecf7f0] text-[#2d8a56]",
  warning: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#fdf8ea] text-[#b58a1b]",
  danger: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#fcedef] text-[#c53d3d]",
} as const;

/* ─── Section Header ───────────────────────────────────────────── */

export const v2Section = {
  header: "flex flex-col items-center text-center",
  overline: "font-sans text-xs tracking-[0.15em] uppercase text-[#4f5fd6] font-semibold mb-3",
  title: "font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#1a1d24] dark:text-[#e8eaef]",
  subtitle: "font-sans text-base text-[#5c6370] dark:text-[#9ca3b0] max-w-2xl mt-3 leading-relaxed",
} as const;

/* ─── Empty State ──────────────────────────────────────────────── */

export const v2EmptyState = {
  container: "flex flex-col items-center justify-center py-16 text-center",
  icon: "w-12 h-12 text-[#8b919e] dark:text-[#6b7280] mb-4",
  title: "font-sans text-lg font-medium text-[#1a1d24] dark:text-[#e8eaef] mb-1",
  description: "font-sans text-sm text-[#5c6370] dark:text-[#9ca3b0] max-w-sm",
} as const;
