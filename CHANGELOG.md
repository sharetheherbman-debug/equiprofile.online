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

## [1.0.0] - Previous Release

### Features
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

---

## Upgrade Guide

### Upgrading from 1.x to 2.0

#### Breaking Changes
None. Version 2.0 is fully backward compatible with 1.x configurations.

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

## Version History

- **2.0.0** (2026-01-07) - Production deployment system, enhanced safety, PWA control
- **1.0.0** (Previous) - Initial release with core features

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
