/**
 * EquiProfile Pricing Constants
 * Single source of truth for all pricing values.
 * Used by both server and client as hard-coded fallback defaults.
 *
 * Currency: GBP (£)
 * Amounts stored in pence (smallest GBP unit).
 */

export const DEFAULT_PRICING = {
  currency: "gbp" as const,
  /** Student plan */
  student: {
    monthly: {
      amount: 800, // £8.00
      display: "£8",
    },
    yearly: {
      amount: 8000, // £80.00
      display: "£80",
    },
  },
  /** Individual / Pro plan */
  individual: {
    monthly: {
      amount: 1000, // £10.00
      display: "£10",
    },
    yearly: {
      amount: 10000, // £100.00
      display: "£100",
    },
  },
  /** Stable plan */
  stable: {
    monthly: {
      amount: 3000, // £30.00
      display: "£30",
    },
    yearly: {
      amount: 30000, // £300.00
      display: "£300",
    },
  },
  /** School plans — seat-based pricing */
  school: {
    school_10: {
      monthly: { amount: 4900, display: "£49" },
      yearly: { amount: 49000, display: "£490" },
    },
    school_20: {
      monthly: { amount: 8900, display: "£89" },
      yearly: { amount: 89000, display: "£890" },
    },
    school_50: {
      monthly: { amount: 19900, display: "£199" },
      yearly: { amount: 199000, display: "£1,990" },
    },
  },
} as const;

/** School / Organisation pricing tiers (seat-based) */
export const SCHOOL_PRICING = {
  currency: "gbp" as const,
  tiers: [
    {
      id: "school_10" as const,
      label: "Small School",
      maxStudents: 10,
      monthly: { amount: 4900, display: "£49" },
      yearly: { amount: 49000, display: "£490" },
    },
    {
      id: "school_20" as const,
      label: "Medium School",
      maxStudents: 20,
      monthly: { amount: 8900, display: "£89" },
      yearly: { amount: 89000, display: "£890" },
    },
    {
      id: "school_50" as const,
      label: "Large School",
      maxStudents: 50,
      monthly: { amount: 19900, display: "£199" },
      yearly: { amount: 199000, display: "£1,990" },
    },
    {
      id: "school_enterprise" as const,
      label: "Enterprise",
      maxStudents: null, // 50+, contact for pricing
      monthly: null,
      yearly: null,
    },
  ],
} as const;

/** Free trial duration in days — applies to ALL plans (individual, student, and school). */
export const FREE_TRIAL_DAYS = 7;

/** Duration in days before an organization invite link expires. */
export const INVITE_EXPIRY_DAYS = 7;

/** Convert pence amount to formatted GBP string (e.g. 1000 → "10.00") */
export function penceToGBP(pence: number): string {
  return (pence / 100).toFixed(2);
}
