/**
 * EquiProfile Design System
 * 
 * Modern, premium design tokens for a professional equine management platform.
 * Color palette uses vibrant blues and purples instead of brown tones.
 */

// ============================================================================
// COLOR PALETTE - Modern & Premium (NO BROWN)
// ============================================================================

export const colors = {
  // Primary: Vibrant Blue (Professional & Trustworthy)
  primary: {
    50: 'oklch(0.97 0.02 250)',
    100: 'oklch(0.93 0.05 250)',
    200: 'oklch(0.85 0.10 250)',
    300: 'oklch(0.75 0.15 250)',
    400: 'oklch(0.65 0.20 250)',
    500: 'oklch(0.55 0.25 250)', // Main primary color
    600: 'oklch(0.48 0.23 250)',
    700: 'oklch(0.40 0.20 250)',
    800: 'oklch(0.32 0.17 250)',
    900: 'oklch(0.25 0.14 250)',
  },

  // Secondary: Purple Accent (Premium & Modern)
  secondary: {
    50: 'oklch(0.97 0.02 280)',
    100: 'oklch(0.93 0.05 280)',
    200: 'oklch(0.85 0.10 280)',
    300: 'oklch(0.75 0.15 280)',
    400: 'oklch(0.65 0.18 280)',
    500: 'oklch(0.55 0.20 280)', // Main secondary color
    600: 'oklch(0.48 0.18 280)',
    700: 'oklch(0.40 0.16 280)',
    800: 'oklch(0.32 0.14 280)',
    900: 'oklch(0.25 0.12 280)',
  },

  // Accent: Teal (Fresh & Energetic)
  accent: {
    50: 'oklch(0.97 0.02 190)',
    100: 'oklch(0.93 0.05 190)',
    200: 'oklch(0.85 0.10 190)',
    300: 'oklch(0.75 0.15 190)',
    400: 'oklch(0.65 0.18 190)',
    500: 'oklch(0.55 0.20 190)', // Main accent color
    600: 'oklch(0.48 0.18 190)',
    700: 'oklch(0.40 0.16 190)',
    800: 'oklch(0.32 0.14 190)',
    900: 'oklch(0.25 0.12 190)',
  },

  // Success: Green
  success: {
    50: 'oklch(0.97 0.02 145)',
    100: 'oklch(0.93 0.05 145)',
    200: 'oklch(0.85 0.10 145)',
    300: 'oklch(0.75 0.15 145)',
    400: 'oklch(0.65 0.18 145)',
    500: 'oklch(0.55 0.20 145)',
    600: 'oklch(0.48 0.18 145)',
    700: 'oklch(0.40 0.16 145)',
    800: 'oklch(0.32 0.14 145)',
    900: 'oklch(0.25 0.12 145)',
  },

  // Warning: Amber
  warning: {
    50: 'oklch(0.97 0.02 70)',
    100: 'oklch(0.93 0.05 70)',
    200: 'oklch(0.85 0.12 70)',
    300: 'oklch(0.78 0.15 70)',
    400: 'oklch(0.70 0.18 70)',
    500: 'oklch(0.65 0.20 70)',
    600: 'oklch(0.58 0.18 70)',
    700: 'oklch(0.50 0.16 70)',
    800: 'oklch(0.42 0.14 70)',
    900: 'oklch(0.35 0.12 70)',
  },

  // Danger: Red
  danger: {
    50: 'oklch(0.97 0.02 25)',
    100: 'oklch(0.93 0.05 25)',
    200: 'oklch(0.85 0.12 25)',
    300: 'oklch(0.75 0.18 25)',
    400: 'oklch(0.65 0.22 25)',
    500: 'oklch(0.55 0.24 25)',
    600: 'oklch(0.48 0.22 25)',
    700: 'oklch(0.40 0.20 25)',
    800: 'oklch(0.32 0.18 25)',
    900: 'oklch(0.25 0.16 25)',
  },

  // Neutral: Gray (for text, borders, backgrounds)
  neutral: {
    50: 'oklch(0.99 0 0)',
    100: 'oklch(0.97 0 0)',
    200: 'oklch(0.93 0 0)',
    300: 'oklch(0.88 0 0)',
    400: 'oklch(0.75 0 0)',
    500: 'oklch(0.58 0 0)',
    600: 'oklch(0.45 0 0)',
    700: 'oklch(0.35 0 0)',
    800: 'oklch(0.25 0 0)',
    900: 'oklch(0.15 0 0)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    serif: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Font sizes (with line heights)
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px
    '5xl': { size: '3rem', lineHeight: '1' },         // 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },      // 60px
    '7xl': { size: '4.5rem', lineHeight: '1' },       // 72px
    '8xl': { size: '6rem', lineHeight: '1' },         // 96px
    '9xl': { size: '8rem', lineHeight: '1' },         // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SPACING SYSTEM (4px base)
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  button: {
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    padding: {
      sm: `${spacing[2]} ${spacing[4]}`,
      md: `${spacing[3]} ${spacing[6]}`,
      lg: `${spacing[4]} ${spacing[8]}`,
    },
    borderRadius: borderRadius.lg,
  },
  input: {
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    borderRadius: borderRadius.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    shadow: shadows.md,
  },
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
} as const;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  components,
  animations,
};
