# Production Deployment Checklist - EquiProfile v2.0

**Target Environment:** VPS Production Server  
**Date:** January 1, 2026  
**Version:** 2.0.0

---

## Pre-Deployment Checklist

### 1. Code Review ✅

- [x] All security fixes implemented
- [x] TypeScript compilation successful
- [x] No critical vulnerabilities in dependencies
- [x] Code committed to version control
- [x] Pull request reviewed and approved

### 2. Environment Variables

- [ ] All required variables documented
- [ ] Production values prepared (not in version control)
- [ ] Secure password generated for `ADMIN_UNLOCK_PASSWORD`
- [ ] AWS credentials validated
- [ ] Stripe keys validated (test vs. live)
- [ ] Database connection string prepared

---

## Required Environment Variables

### Critical (Application will NOT start without these)

```bash
# Database
DATABASE_URL=mysql://username:password@host:3306/database_name

# Security & Authentication
JWT_SECRET=<generate-secure-64-char-random-string>
ADMIN_UNLOCK_PASSWORD=<strong-password-16+-chars>

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=equiprofile-production
AWS_REGION=eu-west-2
```

See full deployment instructions in this file for complete setup guide.

---

## Success Criteria

**Deployment is successful when:**

- [ ] Application starts without errors
- [ ] All environment health checks pass (System tab in Admin Panel)
- [ ] Admin unlock flow works correctly
- [ ] API key management functional
- [ ] Database queries executing
- [ ] HTTPS certificate valid
- [ ] PM2 shows application as "online"
- [ ] No critical errors in logs (first hour)
- [ ] External services (Stripe, AWS, Email) functional
- [ ] Monitoring and backups configured

---

For complete deployment steps, see the comprehensive guide in the full version of this file in the repository.
