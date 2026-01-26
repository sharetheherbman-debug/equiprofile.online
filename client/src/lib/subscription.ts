/**
 * Subscription utility functions
 * Helper functions to check user subscription status and plan access
 */

export type SubscriptionPlan = 'monthly' | 'yearly' | 'stable_monthly' | 'stable_yearly';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'overdue' | 'expired';

/**
 * Check if user has a stable-tier subscription plan
 * @param plan The user's subscription plan
 * @returns true if user has stable_monthly or stable_yearly plan
 */
export function hasStablePlan(plan?: SubscriptionPlan | null): boolean {
  return plan === 'stable_monthly' || plan === 'stable_yearly';
}

/**
 * Check if user has an active subscription (trial or paid)
 * @param status The user's subscription status
 * @param trialEndsAt The trial expiration date (if on trial)
 * @returns true if user has active access
 */
export function hasActiveSubscription(
  status?: SubscriptionStatus | null,
  trialEndsAt?: Date | string | null
): boolean {
  if (!status) return false;
  
  if (status === 'active') return true;
  
  if (status === 'trial') {
    if (!trialEndsAt) return true; // No expiry set = active trial
    const expiryDate = typeof trialEndsAt === 'string' ? new Date(trialEndsAt) : trialEndsAt;
    return expiryDate > new Date();
  }
  
  return false;
}

/**
 * Get user-friendly plan name
 * @param plan The subscription plan
 * @returns Human-readable plan name
 */
export function getPlanDisplayName(plan?: SubscriptionPlan | null): string {
  switch (plan) {
    case 'monthly':
      return 'Pro Monthly';
    case 'yearly':
      return 'Pro Yearly';
    case 'stable_monthly':
      return 'Stable Monthly';
    case 'stable_yearly':
      return 'Stable Yearly';
    default:
      return 'Free Trial';
  }
}

/**
 * Get plan pricing
 * @param plan The subscription plan
 * @returns Price information
 */
export function getPlanPricing(plan: SubscriptionPlan): { amount: number; interval: string; currency: string } {
  switch (plan) {
    case 'monthly':
      return { amount: 1000, interval: 'month', currency: 'GBP' }; // £10.00
    case 'yearly':
      return { amount: 10000, interval: 'year', currency: 'GBP' }; // £100.00
    case 'stable_monthly':
      return { amount: 3500, interval: 'month', currency: 'GBP' }; // £35.00
    case 'stable_yearly':
      return { amount: 30000, interval: 'year', currency: 'GBP' }; // £300.00
  }
}

/**
 * Format price in pence to readable format
 * @param amountInPence Price in pence
 * @param currency Currency code (default: GBP)
 * @returns Formatted price string
 */
export function formatPrice(amountInPence: number, currency: string = 'GBP'): string {
  const amount = amountInPence / 100;
  
  if (currency === 'GBP') {
    return `£${amount.toFixed(2)}`;
  }
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
