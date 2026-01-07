# Feature Flags Implementation - Audit Report

**Date:** January 3, 2026  
**Version:** 1.0.0  
**Author:** Development Team  
**Status:** Completed

---

## Executive Summary

This audit report documents the implementation of feature flags for plug-and-play deployment of EquiProfile on VPS environments. The implementation enables deployment without Stripe billing or file upload features initially, with the ability to enable them later via environment variables.

## Changes Overview

### 1. Environment Configuration (`server/_core/env.ts`)

**Changes Made:**
- Added `ENABLE_STRIPE` feature flag (default: `false`)
- Added `ENABLE_UPLOADS` feature flag (default: `false`)
- Modified production validation to conditionally require variables based on flags
- Exported `enableStripe` and `enableUploads` on ENV object

**Security Considerations:**
- Feature flags are read from environment variables only
- Production mode enforces that `ADMIN_UNLOCK_PASSWORD` is not the default value
- Core variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_UNLOCK_PASSWORD`) are always required in production
- Conditional variables are only required when their respective feature is enabled

**Required Variables by Configuration:**

| Configuration | Required Variables |
|--------------|-------------------|
| **Minimal (no features)** | `DATABASE_URL`, `JWT_SECRET`, `ADMIN_UNLOCK_PASSWORD` |
| **With Stripe** | Above + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **With Uploads** | Minimal + `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` |
| **Full Featured** | All of the above |

### 2. Stripe Integration (`server/stripe.ts`)

**Changes Made:**
- Added `checkStripeEnabled()` guard function
- Modified `getStripe()` to check feature flag before initialization
- Updated `createCheckoutSession()` to throw `PRECONDITION_FAILED` error when disabled
- Updated `createPortalSession()` to throw `PRECONDITION_FAILED` error when disabled

**Security Considerations:**
- Stripe SDK is only initialized when feature is enabled
- All Stripe operations fail fast with clear error messages when disabled
- No Stripe API calls are made at import time
- Error responses use standard tRPC error codes

### 3. Billing Router (`server/routers.ts`)

**Changes Made:**
- Updated `billing.getPricing` to return disabled state when `ENABLE_STRIPE=false`
- Added feature flag checks to `billing.createCheckout`
- Added feature flag checks to `billing.createPortal`
- Modified responses to include `enabled` flag in pricing data

**Behavior When Disabled:**
- `getPricing` returns: `{ enabled: false, message: 'Billing is disabled', monthly: null, yearly: null }`
- `createCheckout` throws: `TRPCError` with `code: 'PRECONDITION_FAILED'`
- `createPortal` throws: `TRPCError` with `code: 'PRECONDITION_FAILED'`

### 4. Documents Router (`server/routers.ts`)

**Changes Made:**
- Updated `documents.upload` to check `ENABLE_UPLOADS` flag
- Document listing endpoints remain functional (read-only)
- Upload operations throw `PRECONDITION_FAILED` error when disabled

**Behavior When Disabled:**
- `documents.list` - ✅ Works (read existing documents)
- `documents.listByHorse` - ✅ Works (read existing documents)
- `documents.upload` - ❌ Throws error
- `documents.delete` - ✅ Works (delete existing documents)

### 5. Storage Module (`server/storage.ts`)

**Changes Made:**
- Added feature flag check in `getStorageConfig()`
- Throws descriptive error when uploads are disabled
- Error message includes instructions for enabling the feature

**Security Considerations:**
- Storage credentials are only validated when feature is enabled
- Clear error messages help with troubleshooting
- No storage API calls are made when feature is disabled

### 6. System Router (`server/_core/systemRouter.ts`)

**Changes Made:**
- Added `getFeatureFlags` public procedure
- Returns current state of `enableStripe` and `enableUploads`

**Public Endpoint:**
```typescript
system.getFeatureFlags() → { enableStripe: boolean, enableUploads: boolean }
```

### 7. Admin Health Check (`server/routers.ts`)

**Changes Made:**
- Updated `admin.getEnvHealth` to mark variables as conditional
- Added `featureFlags` section to health check response
- Variables now include `conditional` flag and `requiredWhen` description

### 8. Environment Configuration (`.env.example`)

**Changes Made:**
- Reorganized into clear sections: Core, Feature Flags, Stripe, Uploads, Optional
- Added inline documentation for each section
- Commented out optional variables
- Added examples for different deployment scenarios

### 9. PM2 Configuration (`ecosystem.config.js`)

**Changes Made:**
- Changed default instances from `2` to `1`
- Added support for `PM2_INSTANCES` environment variable override

### 10. Preflight Validation Script (`scripts/preflight.sh`)

**New Script Created:**
- Validates environment variables before deployment
- Checks conditional variables based on feature flags
- Color-coded output (green/yellow/red)
- Returns appropriate exit codes

## Security Analysis

### Threat Model

**1. Feature Flag Bypass Attempts**
- **Risk:** Attacker tries to access disabled features
- **Mitigation:** Server-side validation at multiple layers
- **Residual Risk:** Low

**2. Missing Environment Variables**
- **Risk:** Application starts with incomplete configuration
- **Mitigation:** Production validation exits immediately if required vars are missing
- **Residual Risk:** Very Low

**3. Default Admin Password in Production**
- **Risk:** Admin access with known default password
- **Mitigation:** Production validation checks for default password and exits
- **Residual Risk:** Low

### Security Best Practices Applied

✅ **Defense in Depth:** Multiple validation layers (env, module, router)  
✅ **Fail Secure:** Application exits rather than starting with missing config  
✅ **Explicit Configuration:** Feature flags are opt-in (default disabled)  
✅ **Clear Error Messages:** Errors indicate what's missing and why  
✅ **Audit Trail:** Admin health check shows feature status  

## Recommendations

### For Deployment

1. **Always run preflight script before deployment**
2. **Start with minimal configuration (both flags false)**
3. **Enable features incrementally**
4. **Monitor logs for feature-disabled errors**

### For Security

1. **Rotate credentials regularly (90 days)**
2. **Use different values per environment**
3. **Monitor admin health check endpoint**
4. **Alert on feature flag changes**

## Conclusion

The feature flags implementation successfully enables plug-and-play deployment with minimal configuration while maintaining security through multiple validation layers.

**Status:** Ready for production deployment

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-03
