# Feature Flags Architecture

## Overview

EquiProfile uses environment-based feature flags to enable plug-and-play deployment without requiring external services initially.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Variables                         │
├─────────────────────────────────────────────────────────────────┤
│  ENABLE_STRIPE=false   │  ENABLE_UPLOADS=false                  │
│  (default)             │  (default)                             │
└──────────┬─────────────┴─────────────┬───────────────────────────┘
           │                           │
           v                           v
┌──────────────────────┐    ┌──────────────────────┐
│   Stripe Feature     │    │   Upload Feature     │
│   (Disabled)         │    │   (Disabled)         │
├──────────────────────┤    ├──────────────────────┤
│ • No payment gateway │    │ • No file storage    │
│ • No subscriptions   │    │ • No document uploads│
│ • Billing UI hidden  │    │ • Upload UI hidden   │
└──────────────────────┘    └──────────────────────┘

                   Minimal Deployment
                   ─────────────────
                   DATABASE_URL
                   JWT_SECRET
                   ADMIN_UNLOCK_PASSWORD
                   
                   ✅ App starts successfully
                   ✅ Core features work
                   ✅ No payment processor needed
                   ✅ No file storage needed
```

## Feature Flag Flow

### 1. Startup Validation

```
┌─────────────────────────────────────┐
│     Application Startup             │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  server/_core/env.ts                │
│  • Read ENABLE_STRIPE env var       │
│  • Read ENABLE_UPLOADS env var      │
│  • Parse as boolean                 │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  Conditional Validation             │
│                                     │
│  if (ENABLE_STRIPE === true)        │
│    ├─ Require STRIPE_SECRET_KEY     │
│    └─ Require STRIPE_WEBHOOK_SECRET │
│                                     │
│  if (ENABLE_UPLOADS === true)       │
│    ├─ Require FORGE_API_URL         │
│    └─ Require FORGE_API_KEY         │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  Missing required vars?             │
├─────────────────────────────────────┤
│  YES: Exit with error message       │
│  NO:  Continue startup              │
└─────────────────────────────────────┘
```

### 2. Request Flow - Billing

```
Client Request
     │
     v
┌─────────────────────────────────────┐
│  POST /api/billing/createCheckout   │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  server/routers.ts                  │
│  billing.createCheckout procedure   │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  Check ENV.enableStripe             │
├─────────────────────────────────────┤
│  if (false):                        │
│    throw TRPCError({                │
│      code: 'PRECONDITION_FAILED',   │
│      message: 'Billing is disabled' │
│    })                               │
└───────────────┬─────────────────────┘
                │
                v (if enabled)
┌─────────────────────────────────────┐
│  server/stripe.ts                   │
│  createCheckoutSession()            │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  checkStripeEnabled()               │
├─────────────────────────────────────┤
│  if (!ENV.enableStripe):            │
│    throw error                      │
└───────────────┬─────────────────────┘
                │
                v (if enabled)
┌─────────────────────────────────────┐
│  Initialize Stripe SDK              │
│  Create checkout session            │
│  Return session URL                 │
└─────────────────────────────────────┘
```

### 3. Request Flow - Uploads

```
Client Request
     │
     v
┌─────────────────────────────────────┐
│  POST /api/documents/upload         │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  server/routers.ts                  │
│  documents.upload procedure         │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  Check ENV.enableUploads            │
├─────────────────────────────────────┤
│  if (false):                        │
│    throw TRPCError({                │
│      code: 'PRECONDITION_FAILED',   │
│      message: 'Uploads are disabled'│
│    })                               │
└───────────────┬─────────────────────┘
                │
                v (if enabled)
┌─────────────────────────────────────┐
│  server/storage.ts                  │
│  storagePut()                       │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────────────────┐
│  getStorageConfig()                 │
├─────────────────────────────────────┤
│  if (!ENV.enableUploads):           │
│    throw error with instructions    │
└───────────────┬─────────────────────┘
                │
                v (if enabled)
┌─────────────────────────────────────┐
│  Upload to storage API              │
│  Return file URL                    │
└─────────────────────────────────────┘
```

## Deployment Scenarios

### Scenario 1: Minimal (Both Disabled)

```
┌─────────────────────────────────────────────────┐
│              Minimal Deployment                 │
├─────────────────────────────────────────────────┤
│  ENABLE_STRIPE=false                            │
│  ENABLE_UPLOADS=false                           │
│                                                 │
│  Required Vars (3):                             │
│  • DATABASE_URL                                 │
│  • JWT_SECRET                                   │
│  • ADMIN_UNLOCK_PASSWORD                        │
├─────────────────────────────────────────────────┤
│  ✅ User authentication                         │
│  ✅ Horse profiles                              │
│  ✅ Health records                              │
│  ✅ Training sessions                           │
│  ✅ Calendar/events                             │
│  ❌ Billing (disabled)                          │
│  ❌ Uploads (disabled)                          │
└─────────────────────────────────────────────────┘
```

### Scenario 2: With Stripe Only

```
┌─────────────────────────────────────────────────┐
│         Deployment with Billing                 │
├─────────────────────────────────────────────────┤
│  ENABLE_STRIPE=true  ✅                         │
│  ENABLE_UPLOADS=false                           │
│                                                 │
│  Required Vars (5):                             │
│  • DATABASE_URL                                 │
│  • JWT_SECRET                                   │
│  • ADMIN_UNLOCK_PASSWORD                        │
│  • STRIPE_SECRET_KEY                            │
│  • STRIPE_WEBHOOK_SECRET                        │
├─────────────────────────────────────────────────┤
│  ✅ All core features                           │
│  ✅ Billing/subscriptions ⭐                    │
│  ✅ Payment processing                          │
│  ❌ Uploads (still disabled)                    │
└─────────────────────────────────────────────────┘
```

### Scenario 3: With Uploads Only

```
┌─────────────────────────────────────────────────┐
│       Deployment with File Storage              │
├─────────────────────────────────────────────────┤
│  ENABLE_STRIPE=false                            │
│  ENABLE_UPLOADS=true  ✅                        │
│                                                 │
│  Required Vars (5):                             │
│  • DATABASE_URL                                 │
│  • JWT_SECRET                                   │
│  • ADMIN_UNLOCK_PASSWORD                        │
│  • BUILT_IN_FORGE_API_URL                       │
│  • BUILT_IN_FORGE_API_KEY                       │
├─────────────────────────────────────────────────┤
│  ✅ All core features                           │
│  ✅ Document uploads ⭐                         │
│  ✅ File storage                                │
│  ❌ Billing (still disabled)                    │
└─────────────────────────────────────────────────┘
```

### Scenario 4: Full Featured

```
┌─────────────────────────────────────────────────┐
│           Full Production Deployment            │
├─────────────────────────────────────────────────┤
│  ENABLE_STRIPE=true   ✅                        │
│  ENABLE_UPLOADS=true  ✅                        │
│                                                 │
│  Required Vars (7):                             │
│  • DATABASE_URL                                 │
│  • JWT_SECRET                                   │
│  • ADMIN_UNLOCK_PASSWORD                        │
│  • STRIPE_SECRET_KEY                            │
│  • STRIPE_WEBHOOK_SECRET                        │
│  • BUILT_IN_FORGE_API_URL                       │
│  • BUILT_IN_FORGE_API_KEY                       │
├─────────────────────────────────────────────────┤
│  ✅ All core features                           │
│  ✅ Billing/subscriptions ⭐                    │
│  ✅ Document uploads ⭐                         │
│  ✅ Complete functionality                      │
└─────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│           Layer 1: Environment                  │
│  • Feature flags read from env vars only        │
│  • No hardcoded defaults in production          │
└───────────────┬─────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────┐
│          Layer 2: Startup Validation            │
│  • Conditional requirement checks               │
│  • Exit on missing required vars                │
│  • Prevent default admin password               │
└───────────────┬─────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────┐
│           Layer 3: Module Guards                │
│  • stripe.ts: checkStripeEnabled()              │
│  • storage.ts: getStorageConfig()               │
│  • Throw errors when disabled                   │
└───────────────┬─────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────┐
│           Layer 4: Router Guards                │
│  • billing router: Check ENV.enableStripe       │
│  • documents router: Check ENV.enableUploads    │
│  • Throw TRPCError with PRECONDITION_FAILED     │
└───────────────┬─────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────┐
│          Layer 5: Client Detection              │
│  • Public getFeatureFlags endpoint              │
│  • UI can conditionally show/hide features      │
│  • Graceful degradation on client side          │
└─────────────────────────────────────────────────┘
```

## Upgrade Path

```
Step 1: Deploy Minimal
┌─────────────────────┐
│  ENABLE_STRIPE=false│
│  ENABLE_UPLOADS=false│
└──────────┬──────────┘
           │
           v
     Test & Verify
           │
           v
┌──────────────────────┐
│  Add Stripe Creds    │
│  ENABLE_STRIPE=true  │
└──────────┬───────────┘
           │
           v
     Restart App
           │
           v
     Test Billing
           │
           v
┌──────────────────────┐
│  Add Storage Creds   │
│  ENABLE_UPLOADS=true │
└──────────┬───────────┘
           │
           v
     Restart App
           │
           v
  Full Featured ✅
```

## Benefits

1. **Faster Initial Deployment**
   - Start with just 3 environment variables
   - No need to setup payment processor initially
   - No need to setup file storage initially

2. **Incremental Feature Enablement**
   - Enable billing when ready to monetize
   - Enable uploads when storage is configured
   - Test each feature independently

3. **Simplified Testing**
   - Test core functionality without external dependencies
   - Easier to setup development environments
   - Faster CI/CD pipelines

4. **Cost Optimization**
   - Only pay for services you're using
   - Start free, add paid services later
   - Scale infrastructure as needed

5. **Security**
   - Multiple validation layers
   - Clear error messages
   - Fail-fast on misconfiguration
   - Audit trail in logs

---

**Last Updated:** 2026-01-03  
**Version:** 1.0.0
