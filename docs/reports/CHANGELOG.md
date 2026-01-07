# Changelog

All notable changes to EquiProfile.online will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-01

### Added - Production Ready Release

#### Payment System
- Full Stripe integration with subscription management
- 7-day free trial for new users
- Monthly subscription (£7.99/month)
- Yearly subscription (£79.90/year)
- Secure webhook handler with signature verification
- Idempotency tracking for webhook events
- Customer billing portal integration
- Automatic subscription status updates

#### Security
- Helmet middleware for HTTP security headers
- Rate limiting (100 requests per 15 minutes per IP)
- Request ID tracking for all API calls
- Comprehensive request/response logging
- Cookie security flags
- CSRF protection
- Input validation with Zod schemas
- Webhook signature verification

#### Database Schema
- `stables` table for multi-user team management
- `stableMembers` table for role-based access control
- `stableInvites` table for team invitations
- `events` table for calendar and scheduling
- `eventReminders` table for notifications
- `feedCosts` table for expense tracking
- `vaccinations` table for medical passport
- `dewormings` table for deworming schedule
- `shareLinks` table for shareable profiles
- `competitions` table for competition tracking
- `documentTags` table for document organization
- `stripeEvents` table for webhook idempotency

#### Infrastructure
- Health check endpoint (`/api/health`)
- Environment variable templates (`.env.example`)
- Production deployment documentation
- Automated backup script with 30-day retention
- PM2 process management configuration
- Nginx configuration templates
- SSL certificate setup guide

#### API Endpoints
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/health` - Health check endpoint
- tRPC `billing.getPricing` - Get pricing information
- tRPC `billing.createCheckout` - Create Stripe checkout session
- tRPC `billing.createPortal` - Access billing portal
- tRPC `billing.getStatus` - Get subscription status

#### Documentation
- Complete production audit report (`AUDIT.md`)
- Stripe integration guide (`STRIPE_INTEGRATION.md`)
- Security hardening report (`SECURITY.md`)
- Deployment checklist (`DEPLOYMENT_CHECKLIST.md`)
- API documentation
- Backup and recovery procedures

#### Developer Experience
- `.gitignore` file to prevent sensitive data commits
- TypeScript strict mode enabled
- Comprehensive error handling
- Request ID tracking for debugging
- Structured logging

### Changed

#### Database
- Enhanced `users` table with Stripe customer tracking
- Updated subscription status enum
- Added subscription plan tracking
- Added payment history fields

#### Middleware
- Reorganized middleware stack for security
- Enhanced error handling
- Improved logging format

#### Build Process
- Optimized production build
- Environment-specific configurations
- Type checking in CI/CD

### Security

#### Fixed
- ✅ Missing rate limiting
- ✅ Missing security headers
- ✅ Insufficient request logging
- ✅ Cookie security flags not set
- ✅ No webhook signature verification
- ✅ Missing input validation

#### Hardened
- ✅ Helmet security headers active
- ✅ Rate limiting implemented
- ✅ Request ID tracking
- ✅ Webhook idempotency
- ✅ Parameterized database queries
- ✅ HTTPS enforcement

### Performance
- Optimized database queries with indexes
- Reduced API response times
- Implemented query result caching
- Optimized Stripe API calls

### Testing
- All existing tests passing (7/7)
- Type checking with zero errors
- Webhook signature verification tested
- Subscription flow tested

---

## [0.1.0] - Initial Release

### Added
- User authentication via OAuth
- Horse profile management
- Health record tracking
- Training session scheduling
- Feeding plan management
- Document storage with S3
- AI-powered weather analysis
- Admin dashboard
- Landing page
- Basic subscription management

### Features
- Multi-horse support
- Document uploads
- Vet record tracking
- Training logs
- Weather recommendations
- User profile management
- Admin user controls
- Activity logging

---

## Upgrade Guide

### From 0.1.0 to 1.0.0

#### Database Migration

Run the migration to add new tables:

```bash
pnpm db:push
```

This will create:
- stables, stableMembers, stableInvites
- events, eventReminders
- feedCosts, vaccinations, dewormings
- shareLinks, competitions
- documentTags, stripeEvents

#### Environment Variables

Add new required variables to `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Add to `client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

#### Stripe Setup

1. Create Stripe account
2. Create monthly and yearly products
3. Configure webhook endpoint
4. Update environment variables
5. Restart application

#### Security Updates

The following security features are now active:
- Helmet headers (automatic)
- Rate limiting (automatic)
- Request logging (automatic)
- Webhook verification (automatic)

No code changes required for existing features.

#### Breaking Changes

None - This is a backward-compatible upgrade.

#### New Features Available

After upgrade, these features are database-ready:
- Stable/team management
- Event calendar
- Feed cost tracking
- Vaccination passport
- Competition tracking
- Shareable profiles

UI implementation coming in future releases.

---

## Future Roadmap

### Version 1.1.0 (Q1 2026)
- [ ] Modern UI redesign
- [ ] Pricing page implementation
- [ ] Billing management interface
- [ ] Stable/team management UI
- [ ] Calendar view for events

### Version 1.2.0 (Q2 2026)
- [ ] Mobile app (iOS/Android)
- [ ] Email notification system
- [ ] Advanced analytics dashboard
- [ ] Competition results visualization
- [ ] Medical passport printable view

### Version 1.3.0 (Q3 2026)
- [ ] Multi-language support
- [ ] Enhanced document search
- [ ] Batch operations
- [ ] CSV export for all data
- [ ] API for third-party integrations

### Version 2.0.0 (Q4 2026)
- [ ] White-label solution
- [ ] Multi-tenancy support
- [ ] Advanced permissions system
- [ ] Reporting engine
- [ ] Mobile-first redesign

---

## Support

For issues or questions:
- Documentation: `/docs` directory
- Bug reports: GitHub Issues
- Security issues: security@equiprofile.online
- General support: support@equiprofile.online
