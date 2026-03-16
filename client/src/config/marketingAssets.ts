/**
 * Marketing Assets Configuration
 * Single source of truth for all marketing site asset paths
 *
 * All assets are stored in /assets/marketing/ with organized subfolders:
 * - brand/: Logos and brand assets
 * - hero/: Hero section images and video
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
 *   <img src={marketingAssets.heroVideo} />
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
    video: `${MARKETING_BASE}/hero/LANDINGPAGEV2.mp4`,
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
    video: `/videos/LoginFinal2.mp4`,
  },

  // ========================================
  // Dashboard
  // ========================================
  dashboard: {
    preview: `${MARKETING_BASE}/dashboard/dashboard-preview.svg`,
  },
} as const;

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
  totalVideos: 2,
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
  },
};
