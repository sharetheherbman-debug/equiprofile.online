# Stripe Integration Guide

## Overview

EquiProfile.online uses Stripe for subscription management with a 7-day free trial, monthly (£7.99/month) and yearly (£79.90/year) plans.

## Setup Instructions

### 1. Stripe Account Configuration

1. Create a Stripe account at https://stripe.com
2. Navigate to **Developers** → **API Keys**
3. Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for production)
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 2. Create Products and Prices

#### Monthly Subscription

1. Go to **Products** → **Add Product**
2. Name: "EquiProfile Monthly"
3. Description: "Monthly subscription to EquiProfile"
4. Pricing: £7.99 GBP, Recurring, Monthly
5. Copy the **Price ID** (starts with `price_`)

#### Yearly Subscription

1. Create another product: "EquiProfile Yearly"
2. Pricing: £79.90 GBP, Recurring, Yearly
3. Copy the **Price ID**

### 3. Configure Environment Variables

Add to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx_monthly
STRIPE_YEARLY_PRICE_ID=price_xxxxx_yearly
```

Add to `client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### 4. Setup Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://equiprofile.online/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## API Integration

### Backend Routes

#### Health Check

```bash
curl https://equiprofile.online/api/health
```

#### Webhook Handler

POST `/api/webhooks/stripe`

- Validates signature
- Processes subscription events
- Updates user database
- Implements idempotency

### tRPC Procedures

#### Get Pricing

```typescript
const pricing = await trpc.billing.getPricing.query();
// Returns: { monthly: { amount, currency, interval }, yearly: { ... } }
```

#### Create Checkout Session

```typescript
const checkout = await trpc.billing.createCheckout.mutate({
  plan: "monthly", // or 'yearly'
});
// Returns: { url: 'https://checkout.stripe.com/...' }
// Redirect user to checkout.url
```

#### Open Customer Portal

```typescript
const portal = await trpc.billing.createPortal.mutate();
// Returns: { url: 'https://billing.stripe.com/...' }
// Redirect user to portal.url
```

#### Get Subscription Status

```typescript
const status = await trpc.billing.getStatus.query();
/* Returns:
{
  status: 'trial' | 'active' | 'cancelled' | 'overdue' | 'expired',
  plan: 'monthly' | 'yearly',
  trialEndsAt: Date,
  subscriptionEndsAt: Date,
  lastPaymentAt: Date,
  hasActiveSubscription: boolean
}
*/
```

## Webhook Events

### checkout.session.completed

Triggered when a customer completes the checkout process.

**Actions:**

- Store `stripeCustomerId` in users table
- Store `stripeSubscriptionId` in users table
- Set `subscriptionStatus` to 'active'
- Set `lastPaymentAt` to current time

### customer.subscription.updated

Triggered when subscription details change.

**Actions:**

- Update `subscriptionStatus` based on Stripe status:
  - `active` → 'active'
  - `past_due` → 'overdue'
  - `canceled`/`unpaid` → 'cancelled'
  - `incomplete_expired` → 'expired'
- Update `subscriptionEndsAt` if `cancel_at` is set

### customer.subscription.deleted

Triggered when a subscription is permanently deleted.

**Actions:**

- Set `subscriptionStatus` to 'cancelled'
- Set `subscriptionEndsAt` to current time

### invoice.payment_succeeded

Triggered when a payment is successful.

**Actions:**

- Set `subscriptionStatus` to 'active'
- Update `lastPaymentAt`

### invoice.payment_failed

Triggered when a payment fails.

**Actions:**

- Set `subscriptionStatus` to 'overdue'

## Idempotency

All webhook events are tracked in the `stripeEvents` table to prevent duplicate processing:

```sql
CREATE TABLE stripeEvents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  eventId VARCHAR(255) UNIQUE NOT NULL,
  eventType VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload TEXT,
  error TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  processedAt TIMESTAMP
);
```

The webhook handler:

1. Checks if `eventId` already exists
2. If exists, returns cached response
3. If new, processes event and stores result

## Testing

### Test Mode

Use Stripe's test mode during development:

1. Use test API keys (`sk_test_...` and `pk_test_...`)
2. Use test webhooks endpoint
3. Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

### Webhook Testing

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

## Subscription Flow

### New User Trial

1. User signs up
2. `subscriptionStatus` = 'trial'
3. `trialEndsAt` = 7 days from now
4. User has full access during trial

### Trial Expiry

1. User tries to access protected feature
2. Middleware checks trial expiry
3. If expired, shows upgrade prompt
4. User redirected to pricing page

### Subscription Purchase

1. User clicks "Upgrade Now"
2. `createCheckout` creates Stripe session
3. User redirected to Stripe checkout
4. User completes payment
5. Webhook updates user status
6. User gets full access

### Subscription Management

1. User clicks "Manage Billing"
2. `createPortal` creates portal session
3. User redirected to Stripe portal
4. User can:
   - Update payment method
   - Change subscription plan
   - Cancel subscription
   - View invoices

## Security Considerations

### Webhook Security

- ✅ Signature verification using `stripe.webhooks.constructEvent()`
- ✅ Raw body parsing (must be before JSON parser)
- ✅ Secret key stored in environment variables
- ✅ HTTPS only in production

### API Security

- ✅ Rate limiting on all `/api` routes
- ✅ Authentication required for billing routes
- ✅ Helmet security headers
- ✅ Request ID tracking

### Data Protection

- ✅ Never store credit card details
- ✅ Use Stripe Customer IDs for references
- ✅ Secure webhook payload logging
- ✅ Idempotency prevents duplicate charges

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint URL in Stripe dashboard
2. Verify HTTPS is enabled
3. Check webhook logs in Stripe dashboard
4. Verify `STRIPE_WEBHOOK_SECRET` is correct

### Payment Not Updating Status

1. Check webhook events in `stripeEvents` table
2. Look for error messages in `error` column
3. Check server logs for webhook processing errors
4. Verify subscription ID in database matches Stripe

### Checkout Session Not Creating

1. Verify price IDs in environment variables
2. Check Stripe API key is correct
3. Ensure user has valid email
4. Check server logs for Stripe API errors

## Support

For Stripe-related issues:

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For EquiProfile issues:

- Check server logs
- Review webhook events in database
- Contact development team
