# Pricing Changes Comparison

## Before vs After

### Trial Plan (Free 7-day trial)

| Before | After |
|--------|-------|
| ❌ "Up to 3 horses" | ✅ **"1 horse profile"** |
| ❌ "1GB document storage" | ✅ "Document storage" (no limit) |
| ✅ Basic health records | ✅ Basic health records |
| ✅ Training session logging | ✅ Training session logging |
| ✅ Email support | ✅ Email support |

**Key Changes:**
- More restrictive horse limit (1 instead of 3) to encourage upgrade
- Removed specific storage limit

---

### Pro Plan (Monthly £7.99 / Yearly £79.90)

| Before | After |
|--------|-------|
| ❌ "Unlimited horses" | ✅ **"Up to 10 horse profiles"** |
| ❌ "10GB document storage" | ✅ "Document storage" (no limit) |
| ✅ Complete health tracking | ✅ Complete health tracking |
| ✅ Advanced training logs | ✅ Advanced training logs |
| ✅ Competition results | ✅ Competition results |
| ✅ AI weather analysis (50/day) | ✅ AI weather analysis (50/day) |
| ✅ Email reminders | ✅ Email reminders |
| ✅ Mobile app access | ✅ Mobile app access |
| ✅ Export to CSV/PDF | ✅ Export to CSV/PDF |

**Key Changes:**
- Changed from "Unlimited" to specific limit of 10 horses
- Removed specific storage limit
- More realistic expectation for individual users

---

### Stable Plan (Monthly £24.99 / Yearly £249)

| Before | After |
|--------|-------|
| ❌ "Unlimited horses" | ✅ **"Unlimited horse profiles"** |
| ❌ "100GB document storage" | ✅ "Document storage" (no limit) |
| ✅ Unlimited team members | ✅ Unlimited team members |
| ✅ Role-based permissions | ✅ Role-based permissions |
| ✅ Stable management | ✅ Stable management |
| ✅ Unlimited AI weather | ✅ Unlimited AI weather |
| ✅ Advanced analytics | ✅ Advanced analytics |
| ✅ Priority email support | ✅ Priority email support |
| ✅ Phone support | ✅ Phone support |
| ✅ Dedicated account manager (yearly) | ✅ Dedicated account manager (yearly) |

**Key Changes:**
- Kept unlimited horses (appropriate for professional stables)
- Removed specific storage limit
- Consistent with professional tier expectations

---

## Rationale for Changes

### Why Remove Storage Limits?
- Users don't need to know about technical storage capacity
- Cleaner messaging focused on features
- Reduces support questions about storage
- Maintains flexibility for backend changes

### Why Change Horse Limits?
- **Trial (1 horse)**: Encourages users to try the platform with their primary horse
- **Pro (10 horses)**: Realistic limit for individual owners/small operations
- **Stable (unlimited)**: Appropriate for professional stables managing many horses

### Benefits of New Structure
- ✅ Clearer differentiation between tiers
- ✅ More accurate representation of typical use cases
- ✅ Better upgrade path from trial → pro → stable
- ✅ Reduced confusion about storage vs features
- ✅ Aligns with actual product capabilities

---

## Files Updated

- `client/src/pages/Pricing.tsx` - Main pricing page
- `client/src/pages/BillingPage.tsx` - User billing dashboard

Both files now have consistent messaging about horse limits and no storage promises.
