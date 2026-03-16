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
} as const;

/** Convert pence amount to formatted GBP string (e.g. 1000 → "10.00") */
export function penceToGBP(pence: number): string {
  return (pence / 100).toFixed(2);
}
