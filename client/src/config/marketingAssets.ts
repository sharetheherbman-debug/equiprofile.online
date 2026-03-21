/**
 * Marketing Assets Configuration
 * Single source of truth for all marketing site asset paths
 *
 * All assets are stored in /assets/marketing/ with organized subfolders:
 * - brand/: Logos and brand assets
 * - hero/: Hero section images
 * - landing/: Landing page images
 * - about/: About page images
 * - features/: Feature section icons and images
 * - pricing/: Pricing page images
 * - contact/: Contact page images
 * - auth/: Authentication page backgrounds
 * - dashboard/: Dashboard preview images
 */

// Base path for all marketing assets
const MARKETING_BASE = "/assets/marketing";

/**
 * Marketing Assets Object
 * Import this object in any component that needs marketing assets
 *
 * Example usage:
 *   import { marketingAssets } from '@/config/marketingAssets';
 *   <img src={marketingAssets.hero.heroHorse} />
 */
export const marketingAssets = {
  // ========================================
  // Brand Assets
  // ========================================
  brand: {
    logoFull: `${MARKETING_BASE}/brand/logo-full.svg`,
    logoIcon: `${MARKETING_BASE}/brand/logo-icon.svg`,
    horseIllustration1: `${MARKETING_BASE}/brand/horse-1.svg`,
    horseIllustration2: `${MARKETING_BASE}/brand/horse-2.svg`,
    horseIllustration3: `${MARKETING_BASE}/brand/horse-3.svg`,
    horseIllustration4: `${MARKETING_BASE}/brand/horse-4.svg`,
  },

  // ========================================
  // Hero Section
  // ========================================
  hero: {
    heroHorse: `${MARKETING_BASE}/hero/hero-horse.jpg`,
    heroStable: `${MARKETING_BASE}/hero/hero-stable.jpg`,
  },

  // ========================================
  // Landing Page
  // ========================================
  landing: {
    training: `${MARKETING_BASE}/landing/training.jpg`,
    ridingLesson: `${MARKETING_BASE}/landing/riding-lesson.jpg`,
    stable: `${MARKETING_BASE}/landing/stable.jpg`,
  },

  // ========================================
  // About Page
  // ========================================
  about: {
    mission: `${MARKETING_BASE}/about/mission.svg`,
    team: `${MARKETING_BASE}/about/team.svg`,
    values: `${MARKETING_BASE}/about/values.svg`,
  },

  // ========================================
  // Features
  // ========================================
  features: {
    iconAnalytics: `${MARKETING_BASE}/features/icon-analytics.svg`,
    iconAutomation: `${MARKETING_BASE}/features/icon-automation.svg`,
    iconIntegrations: `${MARKETING_BASE}/features/icon-integrations.svg`,
    iconSecurity: `${MARKETING_BASE}/features/icon-security.svg`,
    iconSpeed: `${MARKETING_BASE}/features/icon-speed.svg`,
    iconSupport: `${MARKETING_BASE}/features/icon-support.svg`,
  },

  // ========================================
  // Pricing Page
  // ========================================
  pricing: {
    planBasic: `${MARKETING_BASE}/pricing/plan-basic.svg`,
    planPro: `${MARKETING_BASE}/pricing/plan-pro.svg`,
    planEnterprise: `${MARKETING_BASE}/pricing/plan-enterprise.svg`,
  },

  // ========================================
  // Contact Page
  // ========================================
  contact: {
    hero: `${MARKETING_BASE}/contact/contact-hero.svg`,
  },

  // ========================================
  // Auth Pages (Login/Register)
  // ========================================
  auth: {
    background: `${MARKETING_BASE}/auth/auth-bg.svg`,
  },

  // ========================================
  // Dashboard
  // ========================================
  dashboard: {
    preview: `${MARKETING_BASE}/dashboard/dashboard-preview.svg`,
  },

  // ========================================
  // Gallery (for sliders)
  // ========================================
  gallery: {
    image1: `/images/gallery/1.jpg`,
    image2: `/images/gallery/2.jpg`,
    image10: `/images/gallery/10.jpg`,
    image12: `/images/gallery/12.jpg`,
    image15: `/images/gallery/15.jpg`,
    image17: `/images/gallery/17.jpg`,
    image18: `/images/gallery/18.jpg`,
    image19: `/images/gallery/19.jpg`,
    image20: `/images/gallery/20.jpg`,
    image21: `/images/gallery/21.jpg`,
    image23: `/images/gallery/23.jpg`,
  },
} as const;

/** Slides for the landing page hero image slider */
export const heroSlides = [
  {
    image: marketingAssets.hero.heroHorse,
    title: "Professional Horse Management",
    subtitle:
      "Everything you need to keep your horses healthy and performing their best.",
  },
  {
    image: marketingAssets.hero.heroStable,
    title: "Your Stable, Organised",
    subtitle:
      "Health records, training logs, nutrition plans — all in one place.",
  },
  {
    image: marketingAssets.landing.training,
    title: "Training & Progress Tracking",
    subtitle: "Monitor every session, track trends, and celebrate progress.",
  },
  {
    image: marketingAssets.landing.ridingLesson,
    title: "Smarter Decisions, Happier Horses",
    subtitle:
      "AI-powered weather analysis and real-time riding recommendations.",
  },
  {
    image: marketingAssets.landing.stable,
    title: "Built for Professionals",
    subtitle:
      "From single-horse owners to multi-horse stables — scale as you grow.",
  },
];

/** Slides for the auth (login/register) image slider */
export const authSlides = [
  {
    image: `/images/gallery/1.jpg`,
    caption: "Track every detail of your horse's health",
  },
  {
    image: `/images/gallery/2.jpg`,
    caption: "Organised training logs and analytics",
  },
  {
    image: `/images/gallery/10.jpg`,
    caption: "Beautiful interface, powerful features",
  },
  {
    image: `/images/gallery/17.jpg`,
    caption: "Manage your stable with confidence",
  },
  {
    image: `/images/gallery/21.jpg`,
    caption: "Join thousands of equestrians",
  },
];

/**
 * Helper function to get all asset paths as an array
 * Useful for preloading or validation
 */
export function getAllAssetPaths(): string[] {
  const paths: string[] = [];

  function extractPaths(obj: Record<string, any>) {
    for (const value of Object.values(obj)) {
      if (typeof value === "string") {
        paths.push(value);
      } else if (typeof value === "object" && value !== null) {
        extractPaths(value);
      }
    }
  }

  extractPaths(marketingAssets);
  return paths;
}

/**
 * Asset inventory for documentation
 */
export const assetInventory = {
  totalImages: 26,
  totalVideos: 0,
  breakdown: {
    brand: 6,
    hero: 2,
    landing: 3,
    about: 3,
    features: 6,
    pricing: 3,
    contact: 1,
    auth: 1,
    dashboard: 1,
    gallery: 11,
  },
};
