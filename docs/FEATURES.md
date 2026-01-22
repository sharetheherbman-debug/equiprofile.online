# EquiProfile - Features Guide

**Last Updated**: 2026-01-22

This comprehensive guide documents all features implemented in EquiProfile, their status, and how to enable optional functionality.

---

## 📋 Table of Contents

1. [Core Features (Always Available)](#core-features-always-available)
2. [Optional Features (Enabled via Configuration)](#optional-features-enabled-via-configuration)
3. [Feature Flags](#feature-flags)
4. [What Works Out-of-the-Box](#what-works-out-of-the-box)
5. [Feature Status Matrix](#feature-status-matrix)
6. [Configuration Guide](#configuration-guide)

---

## Core Features (Always Available)

These features work immediately after deployment with minimal configuration (DATABASE_URL, JWT_SECRET, and ADMIN_UNLOCK_PASSWORD required).

### 🔐 Authentication & Security

**Status**: ✅ Production Ready

- User registration and login
- JWT-based authentication with secure token management
- Password reset functionality
- Session management
- Admin unlock system (via `showAdmin()` console command - hidden from UI)
- Rate limiting (100 requests per 15 minutes)
- Request ID tracking for debugging
- Security headers (Helmet middleware)
- Content Security Policy (CSP)
- Trust proxy support for reverse proxies (Nginx)
- HTTPS/SSL ready

### 🐴 Horse Management

**Status**: ✅ Production Ready

- Create and manage horse profiles
- Horse information tracking (breed, age, color, etc.)
- Support for multiple horses per user
- Real-time updates across UI
- Profile photo support (when uploads enabled)

### 📊 Training & Logs

**Status**: ✅ Production Ready

- Training session logging
- Activity type tracking
- Duration and intensity recording
- Notes and observations
- Historical training data
- Real-time query invalidation after updates

### 🏥 Health Records

**Status**: ✅ Production Ready

- Comprehensive health tracking
- Medical history
- Vaccination records
- Veterinary visit logs
- Health alerts and reminders

### 📅 Scheduling & Appointments

**Status**: ✅ Production Ready

- Event scheduling
- Appointment management
- Calendar integration
- Automatic reminders
- Multi-horse scheduling support

### 🌦️ Weather Analysis

**Status**: ✅ Production Ready

**Location**: `server/routers.ts` (lines 1439-1532), `client/src/pages/Weather.tsx`

- Manual weather input with AI-powered analysis
- Riding safety recommendations
- Weather history tracking
- UK-friendly units (Celsius, km/h)
- AI-generated riding condition assessments
- Weather log history

**How it works**:
- Users manually input current weather conditions
- AI analyzes conditions for riding safety
- Provides recommendations and warnings
- Stores weather history for reference

**Optional Enhancement**: Can be upgraded with automatic UK weather API integration (OpenWeatherMap UK, Met Office)

### 💼 Admin Panel

**Status**: ✅ Production Ready

**Location**: `client/src/pages/Admin.tsx`

- User management
- System configuration viewing
- Environment health monitoring
- API key management (secure storage)
- Feature flag controls
- Settings management interface
- Database status monitoring

**Access**:
1. Login as admin user
2. Open browser console
3. Run `showAdmin()`
4. Navigate to `/admin`

**Features**:
- Environment variables status display
- API key management with encryption support
- System health dashboard (auto-refresh every 30s)
- Feature flags (ENABLE_STRIPE, ENABLE_UPLOADS)
- Comprehensive settings vault UI

### 📈 Database & Performance

**Status**: ✅ Production Ready

- MySQL/MariaDB support
- Connection pooling for performance
- Transaction support
- Migration system (Drizzle ORM)
- Automatic schema updates
- Query optimization

### 🔄 Real-Time Features

**Status**: ✅ Production Ready

- tRPC for type-safe API calls
- Query invalidation after mutations
- Optimistic UI updates
- Real-time data synchronization
- SSE (Server-Sent Events) support built-in
- Instant UI refresh across all modules

### 🏥 Health Monitoring

**Status**: ✅ Production Ready

**Available Endpoints**:
- `/api/health` - Detailed health status with all service checks
- `/healthz` - Simple health check (200 OK)
- `/api/health/ping` - Basic ping endpoint

**Monitors**:
- Database connection status
- Stripe configuration status (when enabled)
- OAuth configuration status
- Application version information
- Service availability

### 🎨 Modern UI/UX

**Status**: ✅ Production Ready

- 50/50 split-screen authentication pages (Login/Register)
- Responsive design across all devices
- Professional equine-themed design
- Modern accordion-based FAQ on pricing page
- Unified soft-dark overlays (bg-black/20)
- Mobile-optimized layouts
- Consistent design language throughout

### 📞 Contact Information

**Status**: ✅ Standardized

All pages consistently show:
- Email: support@equiprofile.online
- Phone: +44 7347 258089
- WhatsApp: Prefilled message ("Hello, I'm contacting you from EquiProfile…")

---

## Optional Features (Enabled via Configuration)

These features are fully implemented but require additional configuration to enable.

### 💳 Stripe Billing Integration

**Status**: ✅ Fully Implemented, Disabled by Default

**Enable**: Set `ENABLE_STRIPE=true` in `.env`

**Required Environment Variables**:
```bash
ENABLE_STRIPE=true
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_... # Optional
STRIPE_YEARLY_PRICE_ID=price_...  # Optional
```

**Features When Enabled**:
- Full checkout flow
- Subscription management
- Customer Portal access
- Webhook processing with signature verification
- Idempotency for duplicate events
- Complete subscription lifecycle management
- Event handling:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed
- Server-side plan validation
- Payment success notifications
- Trial period management
- Comprehensive error handling and logging

**Security**:
- Webhook signature verification
- Server-side validation
- Secure key storage
- PCI compliance ready

### 📧 Email/SMTP System

**Status**: ✅ Fully Implemented, Optional

**Enable**: Configure SMTP_* variables in `.env`

**Required Environment Variables**:
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=support@equiprofile.online  # Optional, defaults to SMTP_USER
```

**Features When Configured**:
- Welcome emails on user signup
- Password reset emails with secure tokens
- Payment success notifications
- Trial expiry warnings
- Subscription update notifications
- Graceful degradation if not configured (app works without emails)

**Email Templates**:
- Professional HTML templates
- Plain text fallbacks
- Branded design
- Mobile-responsive

### 📁 File Uploads & Storage

**Status**: ✅ Implemented with Forge API Integration

**Enable**: Set `ENABLE_UPLOADS=true` in `.env`

**Current Implementation** (Forge API):
```bash
ENABLE_UPLOADS=true
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your-api-key
```

**Location**: `server/storage.ts`

**Supports**:
- Horse profile photos
- Document uploads
- Health record attachments
- Training log media
- Secure file handling
- UUID-based naming
- File type validation

**Alternative Storage Options**:
- Current: Forge API integration (S3-compatible)
- Possible: Local filesystem storage (can be added)
- Possible: AWS S3 direct integration

---

## Feature Flags

EquiProfile uses feature flags to control optional functionality. All flags default to `false` for safety.

### Available Flags

| Flag | Default | Purpose | Requires |
|------|---------|---------|----------|
| `ENABLE_STRIPE` | `false` | Enable Stripe billing | Stripe keys, webhook secret |
| `ENABLE_UPLOADS` | `false` | Enable file uploads | Forge API URL & key or S3 config |

### How to Use Feature Flags

1. **In `.env` file**:
   ```bash
   ENABLE_STRIPE=true
   ENABLE_UPLOADS=true
   ```

2. **Check in Admin Panel**:
   - Login as admin
   - Use `showAdmin()` in console
   - Navigate to `/admin`
   - View Settings tab for current flag status

3. **Runtime Behavior**:
   - Flags are checked at startup
   - Missing required env vars will log warnings
   - Features gracefully degrade when disabled

---

## What Works Out-of-the-Box

With only basic environment variables configured (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_UNLOCK_PASSWORD`), you get:

### ✅ Full User Experience
- User registration and login
- Complete horse profile management
- Training log creation and tracking
- Health record management
- Appointment scheduling
- Weather analysis (manual input + AI)
- All frontend features fully functional

### ✅ Admin Functionality
- Admin user access
- `showAdmin()` console command
- Full admin panel at `/admin`
- User management
- System monitoring
- Settings configuration

### ✅ Security & Performance
- Rate limiting active
- Security headers enabled
- Request logging
- Error handling
- Database connection pooling
- Real-time updates

### ✅ Production Environment
- Health check endpoints
- SSL/HTTPS ready
- Reverse proxy support
- Request ID tracking
- Environment validation
- Graceful error handling

---

## Feature Status Matrix

| Feature | Status | Requires Config | Optional | Notes |
|---------|--------|----------------|----------|-------|
| User Authentication | ✅ Ready | JWT_SECRET | No | Core feature |
| Horse Management | ✅ Ready | DATABASE_URL | No | Core feature |
| Training Logs | ✅ Ready | DATABASE_URL | No | Core feature |
| Health Records | ✅ Ready | DATABASE_URL | No | Core feature |
| Scheduling | ✅ Ready | DATABASE_URL | No | Core feature |
| Weather Analysis | ✅ Ready | None | No | AI-powered, manual input |
| Admin Panel | ✅ Ready | ADMIN_UNLOCK_PASSWORD | No | Hidden by default |
| Stripe Billing | ✅ Ready | STRIPE_* vars | Yes | Enable with flag |
| Email/SMTP | ✅ Ready | SMTP_* vars | Yes | Graceful degradation |
| File Uploads | ✅ Ready | Forge API config | Yes | Enable with flag |
| Health Monitoring | ✅ Ready | None | No | Always active |
| Real-time Updates | ✅ Ready | None | No | tRPC built-in |
| Rate Limiting | ✅ Ready | None | No | 100 req/15min |
| Security Headers | ✅ Ready | None | No | Helmet middleware |

---

## Configuration Guide

### Minimum Required (Core Features)

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/equiprofile

# Authentication
JWT_SECRET=your-secure-random-string-min-32-chars

# Admin Access
ADMIN_UNLOCK_PASSWORD=your-secure-admin-password
```

### Recommended Production Setup

```bash
# === REQUIRED ===
DATABASE_URL=mysql://user:password@localhost:3306/equiprofile
JWT_SECRET=your-secure-random-string-min-32-chars
ADMIN_UNLOCK_PASSWORD=your-secure-admin-password
NODE_ENV=production

# === OPTIONAL: BILLING ===
ENABLE_STRIPE=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# === OPTIONAL: EMAIL ===
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=support@equiprofile.online

# === OPTIONAL: FILE UPLOADS ===
ENABLE_UPLOADS=true
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your-forge-api-key

# === OPTIONAL: AI FEATURES ===
OPENAI_API_KEY=sk-...  # For enhanced weather analysis
```

### Full Feature Set

Add all optional configurations above to enable:
- ✅ Stripe subscription billing
- ✅ Email notifications
- ✅ File uploads and storage
- ✅ Enhanced AI analysis

---

## Deployment Checklist

### Before First Deployment

- [ ] Set `DATABASE_URL` for your MySQL/MariaDB instance
- [ ] Generate secure `JWT_SECRET` (min 32 characters)
- [ ] Set `ADMIN_UNLOCK_PASSWORD` for admin access
- [ ] Run database migrations: `pnpm run db:push`
- [ ] Test build: `pnpm run build`
- [ ] Verify health endpoint: `curl http://localhost:5000/healthz`

### Optional Feature Enablement

- [ ] Configure Stripe if accepting payments
- [ ] Configure SMTP if sending emails
- [ ] Configure file storage if allowing uploads
- [ ] Set up SSL certificate (certbot recommended)
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging

### Production Readiness

- [ ] Environment validation passes
- [ ] Health checks return 200 OK
- [ ] Database connection successful
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting active
- [ ] Admin access tested
- [ ] User registration flow tested
- [ ] Core features tested (horses, training, health, scheduling)

---

## Feature Enhancement Roadmap

These enhancements are possible but not required for production:

### Potential Additions

1. **Automated Weather Fetching**
   - UK weather API integration (Met Office, OpenWeatherMap UK)
   - Automatic location-based weather
   - Forecasting and alerts

2. **Advanced Logging**
   - Winston integration for structured logs
   - Log aggregation support
   - Audit trail for admin actions

3. **Local File Storage Alternative**
   - Filesystem-based upload storage
   - Alternative to Forge API/S3
   - Configurable storage backends

4. **Enhanced Real-time Features**
   - WebSocket support
   - Live collaboration features
   - Instant notifications

5. **Mobile App Integration**
   - API optimization for mobile
   - Push notification support
   - Offline capability

---

## Getting Help

### Documentation
- Main README: `README.md`
- Deployment Guide: `DEPLOYMENT.md`
- Quick Deploy: `QUICK_DEPLOY.md`

### Support
- Email: support@equiprofile.online
- Phone: +44 7347 258089
- WhatsApp: Available with prefilled message

### Admin Access
1. Login with admin credentials
2. Open browser console (F12)
3. Type `showAdmin()`
4. Visit `/admin` route

---

## Summary

EquiProfile is **production-ready** with:

- ✅ **100% of core features** implemented and working
- ✅ **Zero configuration needed** for basic functionality (only DB + JWT + Admin password)
- ✅ **Optional features ready** when you need them (Stripe, Email, Uploads)
- ✅ **Feature flags** for safe, gradual feature enablement
- ✅ **Production hardened** with security, monitoring, and error handling
- ✅ **Modern UI/UX** with responsive design and professional styling

**No features are waiting to be implemented** - everything documented here works today.

Deploy with confidence! 🚀
