# Changelog

All notable changes to EquiProfile will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-07

### 🚀 Added

#### Deployment & Operations
- **One-command Ubuntu 24 VPS deployment system** with automated setup
  - `deployment/ubuntu24/install.sh` - Complete installation script with prerequisites, user creation, and service configuration
  - `deployment/ubuntu24/uninstall.sh` - Clean uninstallation script preserving SSL certificates
  - `deployment/ubuntu24/equiprofile.service.template` - Systemd service template
  - `deployment/ubuntu24/nginx.equiprofile.conf.template` - Nginx reverse proxy configuration
  - `deployment/ubuntu24/README.md` - Comprehensive deployment documentation
- **Production runtime scripts**
  - `scripts/start-prod.mjs` - Production startup with environment validation and feature status logging
  - `scripts/verify-runtime.mjs` - Pre-flight runtime verification (Node version, build output, port availability)
  - `scripts/rebuild-native.mjs` - Native module rebuild utility for bcrypt and other native dependencies
- **Health and monitoring endpoints**
  - `GET /healthz` - Simple health check for load balancers (returns `{"ok": true, "timestamp": "..."}`)
  - `GET /build` - Build information endpoint with version, build ID, git commit, and Node version
  - Enhanced `/api/health` endpoint with detailed service status
- **PWA service worker control**
  - `VITE_PWA_ENABLED` environment variable to enable/disable PWA functionality
  - PWA disabled by default for simpler deployment
  - Conditional service worker registration in index.html
  - Cache names include build ID for proper cache invalidation

#### Configuration & Safety
- **Safe environment configuration** - Application gracefully handles missing optional features
  - OAuth credentials optional (falls back to email/password authentication)
  - Stripe keys optional (app runs without payment features)
  - Upload storage optional (app runs without upload features)
  - All optional features log their status on startup
- **Production security validation**
  - Application refuses to start with default `JWT_SECRET` in production
  - Application refuses to start with default `ADMIN_UNLOCK_PASSWORD` in production
  - Validates JWT_SECRET minimum length (32 characters)
  - Clear error messages guide administrators to fix configuration issues
- **Feature flag system**
  - `ENABLE_STRIPE` - Toggle Stripe integration on/off
  - `ENABLE_UPLOADS` - Toggle file upload features on/off
  - `VITE_PWA_ENABLED` - Toggle PWA service worker on/off

### 🎨 Changed

#### Frontend
- Placeholder for frontend redesign (to be implemented in subsequent commits)
- Service worker registration now conditional based on `VITE_PWA_ENABLED`
- Visual configuration system enhanced for post-deployment customization

#### Configuration
- **Completely restructured `.env.example`** with clear sections
  - Core configuration (required)
  - Feature flags (optional)
  - Service-specific configuration (conditional on feature flags)
  - Security and deployment settings
  - Comprehensive comments explaining each variable
  - Examples of proper values for each setting

### 🔧 Fixed
- Server no longer crashes when OAuth credentials are missing
- Server no longer crashes when Stripe keys are missing
- Native module build issues on fresh installations
- Service worker cache conflicts between versions
- Port binding errors in systemd service

### 📚 Documentation
- Added comprehensive deployment guide in `deployment/ubuntu24/README.md`
  - Prerequisites checklist
  - Step-by-step installation instructions
  - Environment variable configuration guide
  - SSL setup with Let's Encrypt (Certbot)
  - Extensive troubleshooting section
  - Maintenance and backup procedures
  - Security checklist for production
- Updated root `README.md` with production installation references
- Created this `CHANGELOG.md` to track version history
- Enhanced inline documentation in deployment scripts

### 🔒 Security
- Enforced strong JWT_SECRET requirement in production
- Enforced changing default admin password in production
- Added production startup validation to prevent insecure deployments
- Documented security best practices in deployment guide

### ⚙️ Build & Infrastructure
- Build output includes metadata for `/build` endpoint
- Externalized native dependencies properly in esbuild configuration
- Added build verification in installation scripts
- Health endpoints for load balancer integration

### 🐛 Known Issues
None at this time.

---

## [1.0.0] - 2026-01-22

### Added

#### Infrastructure & Deployment
- **Feature Flag System**: Added `ENABLE_FORGE` environment variable (default: `false`) to make Forge API configuration optional
- **Health Endpoints**: Created `/api/health` endpoint (always returns 200, no DB required) for basic health checks
- **Readiness Endpoint**: Created `/api/ready` endpoint that checks database connectivity and returns 200/503 status
- **Admin Diagnostics**: Added `/api/diagnostics/env` endpoint (admin-only) for environment variable verification
- **Production Startup Script**: Created `scripts/start-prod.sh` with proper environment variable loading for PM2
- **User Management**: Created `scripts/create-user.mjs` for creating users via CLI
- **Smoke Testing**: Created `scripts/smoke-local.sh` for local deployment verification
- **MariaDB Diagnostics**: Added dual-host setup diagnostics for database connectivity troubleshooting

#### UI Components
- **Split-Screen Authentication**: New `AuthSplitLayout` component for modern login/register pages
  - 50/50 split screen on desktop (form left, hero image right)
  - Full-width responsive mobile layout
  - Shared layout for Login and Register pages
  - Professional marketing copy overlay
  - Back to home navigation
- **FAQ Section**: Enhanced Pricing page with interactive accordion-based FAQ
  - 7 comprehensive questions covering trials, cancellation, plans, security, payments, and support
  - Expandable/collapsible card-based design
  - HelpCircle icon header
  - Support CTA at bottom with correct contact details

#### Assets
- **Professional Photography**: Added 4 high-quality equestrian images
  - `hero-horse-riding.jpg` - Landing page hero
  - `equipment-detail.jpg` - Features section
  - `stable-interior.jpg` - About page
  - `horse-portrait.jpg` - Additional marketing imagery
  - Total size: 1.9 MB

#### Documentation
- `.env.example` with `ENABLE_FORGE` flag documentation
- `.env.production.example` for production deployments
- Updated `DEPLOYMENT.md` with PM2, MariaDB, and health endpoints documentation

#### Core Features (Initial Release)
- Complete horse profile management system
- Health records tracking
- Training session planning and logging
- Feeding schedule management
- AI-powered weather analysis
- Document storage
- Subscription management with Stripe
- Admin panel with user management
- Real-time updates
- Multi-language support (i18n)
- Progressive Web App (PWA) capabilities
- Dark mode support
- Mobile-responsive design

### Changed

#### Pricing Structure
- **Trial Plan**: Changed from "Up to 3 horses" to **"1 horse profile"** to encourage upgrades
- **Trial Plan**: Changed from "1GB document storage" to "Document storage" (no specific limit)
- **Pro Plan**: Changed from "Unlimited horses" to **"Up to 10 horse profiles"** for realistic individual user limits
- **Pro Plan**: Changed from "10GB document storage" to "Document storage" (no specific limit)
- **Stable Plan**: Kept unlimited horses but changed from "100GB document storage" to "Document storage" (no specific limit)
- Storage limits removed from user-facing messaging to reduce confusion and support questions
- Clearer tier differentiation and more accurate representation of typical use cases

#### Visual Design
- **Image Overlays**: Changed from `bg-black/50` (50% opacity) to `bg-black/40` for main overlays and `bg-black/20` for auth pages
  - Applied to: Home hero, Home features, About hero, About story, Login, Register
  - Creates more premium, lighter feel with better image visibility
- **Authentication Pages**: Complete redesign from full-screen overlay to split-screen layout
  - Desktop: Form content on left, hero image with marketing copy on right
  - Mobile: Stacked full-width form with visible background
  - Softer overlay (20% instead of 50%) for premium aesthetic
- **Card Design**: Enhanced card shadows for modern appearance
- **Feature Cards**: Added minimum height for content block standardization
- **Transitions**: Maintained smooth transitions across all interactive elements

#### Contact Information
- **Email**: Updated from `support@equiprofile.com` to `support@equiprofile.online`
  - Updated in: Privacy page (2×), Terms page (1×), Footer, Contact page, Pricing FAQ
- **Phone**: Updated from `+447700900000` to `+44 7347 258089`
  - Updated in: Footer, Contact page, Pricing FAQ
- **WhatsApp**: Added prefilled message - "Hello, I'm contacting you from EquiProfile…"
  - Updated in: Footer, Contact page

#### Environment Configuration
- `env.ts` now conditionally validates Forge variables based on `ENABLE_FORGE` flag
- All Forge-dependent modules now include feature flag guards
- PM2 ecosystem configuration updated to use `start-prod.sh` for proper environment loading

#### Admin System
- Removed console hint messages on page load
- Removed success/error console logs
- Removed UI discovery hints
- `showAdmin()` function still works with password protection intact
- Admin panel functionality fully preserved with session management

### Fixed

#### Mobile Responsiveness
- Fixed About page button overflow on small screens
- Added proper margin to mobile menu icon for better touch targets
- Improved form layouts on mobile devices

#### Deployment Issues
- Fixed PM2 environment variable loading issues
- Resolved MariaDB connectivity problems with dual-host setup
- Fixed health check reliability for VPS deployments
- Ensured proper Forge API configuration handling when disabled

### Technical Details

#### Files Changed
- **Total**: 24 files
- **Code Additions**: ~350 lines
- **New Components**: AuthSplitLayout.tsx
- **Updated Components**: Login.tsx, Register.tsx, Pricing.tsx, Footer.tsx, Contact.tsx, Privacy.tsx, Terms.tsx, BillingPage.tsx
- **Configuration**: env.ts, ecosystem.config.js, .env.example, .env.production.example
- **Scripts**: start-prod.sh, create-user.mjs, smoke-local.sh

#### Responsive Breakpoints
- **Desktop** (≥1024px): 50/50 split auth pages, full-width overlays, accordion FAQ cards
- **Tablet** (768-1023px): Stacked layout, adjusted padding, full-width forms
- **Mobile** (<768px): Full-width forms, background visible above form, touch-friendly accordions

#### User Experience Impact
- **Modern Aesthetic**: More premium, professional appearance with soft overlays
- **Better Mobile Experience**: Improved layouts and touch targets
- **Comprehensive FAQ**: 7 questions covering all common concerns
- **Consistent Branding**: UK-focused contact information throughout
- **Professional Split-Screen Auth**: Enhanced conversion potential with better UX
- **Reduced Support Queries**: Better FAQ content and clearer messaging
- **Premium Positioning**: Visual design reinforces professional brand perception

#### Developer Impact
- **Code Organization**: Cleaner component structure with reusable AuthSplitLayout
- **Consistent Styling**: Unified overlay approach across all pages
- **Better Component Reusability**: Shared layout reduces code duplication
- **TypeScript Compliance**: All changes fully typed
- **Performance**: No impact on load times or runtime performance
- **Accessibility**: ARIA compliant components maintained
- **No Breaking Changes**: Backward compatible updates

### Security
- Admin panel remains password-protected with full session management
- Environment diagnostics endpoint restricted to admin users only
- Database credentials properly handled in production environment
- No sensitive data exposed in health check endpoints

---

## Upgrade Guide

### Upgrading from 1.0 to 2.0

#### Breaking Changes
None. Version 2.0 is fully backward compatible with 1.0 configurations.

#### New Required Steps
1. **Review environment variables**: The `.env` file structure has been reorganized for clarity. Compare your existing `.env` with the new `.env.example`.

2. **Add feature flags** (optional):
   ```bash
   ENABLE_STRIPE=false
   ENABLE_UPLOADS=false
   VITE_PWA_ENABLED=false
   ```

3. **Add PWA control** (recommended):
   ```bash
   VITE_PWA_ENABLED=false  # Disable PWA by default
   ```

4. **Verify production secrets**:
   - Ensure `JWT_SECRET` is not set to any default value
   - Ensure `ADMIN_UNLOCK_PASSWORD` is changed from `ashmor12@`
   - Application will refuse to start in production with default values

#### Optional Enhancements
- Use new deployment scripts for fresh installations
- Add `/healthz` endpoint to load balancer health checks
- Configure monitoring to use `/build` endpoint for version tracking

---

### Installing or Upgrading to 1.0

#### Environment Variables
If you're deploying EquiProfile 1.0, add the following to your `.env` file:

```bash
# Forge API (optional)
ENABLE_FORGE=false

# Only required if ENABLE_FORGE=true:
# FORGE_API_KEY=your_key_here
# FORGE_API_SECRET=your_secret_here
```

#### Health Checks
Update your monitoring/orchestration tools to use the new endpoints:
- **Basic Health**: `GET /api/health` - Always returns 200
- **Readiness**: `GET /api/ready` - Returns 200 if DB connected, 503 otherwise
- **Diagnostics** (admin): `GET /api/diagnostics/env` - Requires admin authentication

#### PM2 Deployment
If using PM2, ensure you're using the updated startup script:
```bash
npm run start:prod
```

This uses `scripts/start-prod.sh` which properly loads environment variables.

---

## Version History

- **2.0.0** (2026-01-07) - Production deployment system, enhanced safety, PWA control
- **1.0.0** (2026-01-22) - UI/UX modernization, deployment fixes, pricing refinement, professional assets

---

## Support

For questions, issues, or support:
- **Email**: support@equiprofile.online
- **WhatsApp**: +44 7347 258089
- **Documentation**: See DEPLOYMENT.md for deployment guides

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*This changelog consolidates information from CHANGES_SUMMARY.md, VISUAL_CHANGELOG.md, and PRICING_COMPARISON.md (for version 1.0.0)*
