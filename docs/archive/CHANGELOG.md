# Changelog

All notable changes to EquiProfile will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated service worker cache versioning system
  - Created `scripts/update-sw-version.js` to sync SW version with package.json
  - Added `build:sw` npm script that runs before build
  - Service worker cache version now automatically updates on every build
- Compiled distribution directory (`dist/`) now included in version control
  - Contains complete built frontend (`dist/public/`) and backend (`dist/index.js`)
  - Application can run without build step in offline/air-gapped environments
  - Enables plug-and-play deployment from repository
- Docker Compose environment variable layering
  - Added `.env.default` fallback support in docker-compose.yml
  - Defaults loaded first, then overlaid with custom `.env` values
  - Can run `docker-compose up` without creating `.env` file
- Non-interactive installation script
  - `deployment/install.sh` now runs fully automated without user prompts
  - Domain automatically extracted from `BASE_URL` in .env
  - Falls back to 'localhost' with warning if `BASE_URL` not set
- Comprehensive service worker documentation in QUICKSTART.md
  - Explains caching strategy and version management
  - Troubleshooting guide for stale content issues
  - Best practices for cache management in development and production

### Changed
- Updated `.gitignore` to include exceptions for `dist/index.js` and `dist/public/`
- Modified build script to run service worker version update before Vite build
- Enhanced docker-compose.yml with dual env_file configuration
- Improved README.md with detailed Docker environment variable documentation
- Made `deployment/install.sh` fully non-interactive for CI/CD pipelines

### Fixed
- Corrected syntax errors in `client/src/pages/Pricing.tsx` (duplicate component definition)
- Fixed broken JSX structure in `client/src/components/DashboardLayout.tsx`
- Updated toast API usage in Pricing.tsx to use sonner instead of shadcn/ui toast
- Fixed import paths for trpc in Pricing.tsx

## [1.0.0] - 2024-01-07

### Added
- Initial production release of EquiProfile
- Complete horse management platform with:
  - Horse profile management with breed, age, discipline tracking
  - Health records system with vaccination and vet visit tracking
  - Training scheduler with session planning and progress tracking
  - Feeding plans and nutrition management
  - AI-powered weather analysis for riding recommendations
  - Document storage with secure cloud backup
  - Subscription management with 7-day free trial
- Admin dashboard with:
  - User management and account suspension
  - System analytics and monitoring
  - Settings configuration
  - Activity logging
  - Automated daily backups
- Security features:
  - OAuth authentication support
  - JWT-based session management
  - Role-based access control (Admin/User)
  - Rate limiting on API endpoints
  - Input validation and sanitization
  - Helmet.js security headers
- Docker support:
  - Dockerfile for containerized deployment
  - docker-compose.yml with MySQL 8.0 database
  - Volume persistence for data and uploads
  - Health checks for service dependencies
- Development infrastructure:
  - SQLite as default database for easy local development
  - `.env.default` with sensible development defaults
  - `.nvmrc` for Node.js version management (v22)
  - `start.sh` script for quick local setup
  - Comprehensive test suite with 34+ passing tests
- Documentation:
  - README.md with complete setup instructions
  - API.md with endpoint documentation
  - DEPLOYMENT.md with production deployment guide
  - SECURITY.md with security best practices
  - CONTRIBUTING.md with contribution guidelines
  - QUICKSTART.md for rapid onboarding
- Deployment tools:
  - `deployment/install.sh` - Ubuntu VPS installation script
  - `deployment/doctor.sh` - System health check utility
  - `deployment/update.sh` - Zero-downtime update script
  - `deployment/env-check.sh` - Environment validation
  - nginx configuration templates
  - systemd service definitions
- Build and development tools:
  - Vite for frontend bundling with hot module replacement
  - esbuild for fast backend compilation
  - TypeScript for type safety
  - Tailwind CSS with custom design system
  - Prettier for code formatting
  - Vitest for unit testing
  - Drizzle ORM for database operations

### Database
- MySQL 8.0 as default production database
- SQLite support for development and testing
- Complete schema with migrations for:
  - Users and authentication
  - Horse profiles and metadata
  - Health records and medical history
  - Training sessions and logs
  - Feeding plans and schedules
  - Documents and file references
  - Subscriptions and billing
  - Admin audit logs

### API
- tRPC-based type-safe API with procedures for:
  - Authentication (login, logout, session management)
  - User management (profile, settings, subscription)
  - Horse operations (CRUD, search, filtering)
  - Health records (vaccinations, vet visits, medications)
  - Training (sessions, plans, progress tracking)
  - Feeding (schedules, nutrition plans)
  - Documents (upload, download, delete)
  - Admin (user management, analytics, system config)
- Stripe integration for subscription billing
- OpenAI integration for AI weather analysis
- AWS S3/Forge API for file storage

### Frontend
- Modern React 19 with TypeScript
- Wouter for lightweight routing
- TanStack Query for server state management
- shadcn/ui component library with Radix UI primitives
- Responsive design with mobile-first approach
- Progressive Web App (PWA) with service worker
- Dark mode support with theme toggle
- Internationalization ready (i18next)
- Charts and data visualization (Recharts)
- PDF generation (jsPDF) for reports
- QR code generation for horse profiles

### Performance
- Code splitting with dynamic imports
- Service worker caching for offline support
- Asset optimization and compression
- Lazy loading of routes and components
- Database query optimization with indexes
- Rate limiting to prevent abuse

### Compatibility
- Node.js 22.x or higher
- Modern browsers (Chrome, Firefox, Safari, Edge)
- MySQL 8.0+ or SQLite 3.35+
- Ubuntu 20.04/24.04 for production deployment
- Docker 20.10+ and Docker Compose 2.0+

[Unreleased]: https://github.com/amarktainetwork-blip/Equiprofile.online/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/amarktainetwork-blip/Equiprofile.online/releases/tag/v1.0.0
