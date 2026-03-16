# EquiProfile Website Master Documentation

**Single Source of Truth** for the EquiProfile website deployment, assets, and configuration.

---

## 📋 Table of Contents

- [Asset Inventory](#asset-inventory)
- [Page Structure](#page-structure)
- [Routes & Navigation](#routes--navigation)
- [Build & Deployment](#build--deployment)
- [Environment Variables](#environment-variables)
- [Version Verification](#version-verification)
- [Nginx Configuration](#nginx-configuration)

---

## 🎨 Asset Inventory

### Total Assets

- **26 Images** (15 original + 11 created placeholders)
- **1 Video** (hero.mp4)

### Asset Locations

All assets are canonicalized in: **`client/public/assets/marketing/`**

#### Brand Assets (6 images)

```
/assets/marketing/brand/
├── logo-full.svg          # Full EquiProfile logo with text
├── logo-icon.svg          # Icon-only version (EP)
├── horse-1.svg            # Horse illustration #1
├── horse-2.svg            # Horse illustration #2
├── horse-3.svg            # Horse illustration #3
└── horse-4.svg            # Horse illustration #4
```

#### Hero Section (2 images + 1 video)

```
/assets/marketing/hero/
├── hero.mp4               # Hero background video (10-15s loop)
├── hero-horse.jpg         # Hero fallback image (241KB)
└── hero-stable.jpg        # Alternative hero image (69KB)
```

#### Landing Page (3 images)

```
/assets/marketing/landing/
├── training.jpg           # Training session photo (199KB)
├── riding-lesson.jpg      # Riding lesson photo (108KB)
└── stable.jpg             # Stable facility photo (125KB)
```

#### About Page (3 images)

```
/assets/marketing/about/
├── mission.svg            # Our mission illustration
├── team.svg               # Team illustration
└── values.svg             # Values illustration
```

#### Features (6 icons)

```
/assets/marketing/features/
├── icon-analytics.svg     # Analytics feature icon
├── icon-automation.svg    # Automation feature icon
├── icon-integrations.svg  # Integrations feature icon
├── icon-security.svg      # Security feature icon
├── icon-speed.svg         # Speed/performance icon
└── icon-support.svg       # Support feature icon
```

#### Pricing (3 images)

```
/assets/marketing/pricing/
├── plan-basic.svg         # Basic plan illustration
├── plan-pro.svg           # Pro plan illustration
└── plan-enterprise.svg    # Enterprise/Stable plan illustration
```

#### Contact Page (1 image)

```
/assets/marketing/contact/
└── contact-hero.svg       # Contact page hero image
```

#### Auth Pages (1 image)

```
/assets/marketing/auth/
└── auth-bg.svg            # Login/Register background gradient
```

#### Dashboard (1 image)

```
/assets/marketing/dashboard/
└── dashboard-preview.svg  # Dashboard preview/screenshot
```

### Asset Configuration File

**Location**: `client/src/config/marketingAssets.ts`

This is the **single source of truth** for all asset paths. All components import from this file:

```typescript
import { marketingAssets } from '@/config/marketingAssets';

// Usage examples:
<img src={marketingAssets.hero.video} />
<img src={marketingAssets.brand.logoFull} />
<img src={marketingAssets.features.iconAnalytics} />
```

---

## 📄 Page Structure

### Marketing Pages (Public - Dark Glass Design)

#### 1. Landing Page (`/`)

- **File**: `client/src/pages/Home.tsx`
- **Assets Used**:
  - Video: `hero.video` (full-screen background with black overlay)
  - Images: `hero.heroHorse`, `landing.*` (all 3)
  - Icons: All 6 feature icons
- **Features**:
  - Full-screen hero with video background
  - Black transparent overlay (bg-black/60)
  - Animated stats section
  - 6 feature cards with gradient backgrounds
  - Testimonials carousel
  - CTA sections with gradient buttons
- **Animations**: Framer Motion fade/slide-in, hover effects

#### 2. Features Page (`/features`)

- **File**: `client/src/pages/Features.tsx`
- **Assets Used**: All 6 feature icons
- **Features**:
  - Grid layout (1/2/3 columns responsive)
  - Card hover glow effects (scale 1.05x)
  - Scroll reveal animations
  - Dark glass cards with backdrop-blur

#### 3. Pricing Page (`/pricing`)

- **File**: `client/src/pages/Pricing.tsx`
- **Assets Used**: `pricing.*` (all 3 plan images)
- **Pricing**:
  - **Basic Plan**: £10/month or £100/year
  - **Stable Plan**: £30/month or £300/year
- **Features**:
  - Monthly/Yearly toggle with gradient
  - Card hover lift effect
  - Gradient borders on hover
  - Stripe integration ready

#### 4. About Page (`/about`)

- **File**: `client/src/pages/About.tsx`
- **Assets Used**: `about.*` (mission, team, values)
- **Features**:
  - Mission, vision, values sections
  - Fade-in animations on scroll
  - Dark glass cards
  - Team showcase

#### 5. Contact Page (`/contact`)

- **File**: `client/src/pages/Contact.tsx`
- **Assets Used**: `contact.hero`
- **Features**:
  - Contact form with validation
  - Dark glass styling
  - Animated submit button
  - Email integration ready

#### 6. Login Page (`/login`)

- **File**: `client/src/pages/auth/Login.tsx`
- **Assets Used**: `auth.background`
- **Features**:
  - Dark glass form card
  - Framer Motion animations
  - OAuth + email/password support

#### 7. Register Page (`/register`)

- **File**: `client/src/pages/auth/Register.tsx`
- **Assets Used**: `auth.background`
- **Features**:
  - Multi-step registration
  - Staggered field animations
  - Form validation

### Dashboard Pages (Protected - 31 Pages)

#### Core Dashboard (`/dashboard`)

- **File**: `client/src/pages/Dashboard.tsx`
- **Features**: 12 module categories with 31+ total pages
  1. **Horses** (3): All Horses, Add Horse, Pedigree
  2. **Health** (7): Health Hub, Vaccinations, Dental, Hoof, Deworming, Treatments, X-Rays
  3. **Training** (3): Training Log, Templates, Lessons
  4. **Nutrition** (3): Feeding Plans, Nutrition Plans, Nutrition Logs
  5. **Schedule** (3): Calendar, Appointments, Tasks
  6. **AI Tools** (2): AI Assistant, Weather
  7. **Documents** (1): Document Vault
  8. **Breeding** (1): Breeding Manager
  9. **Stable** (4): Stable Management, Contacts, Client Portal, Messages
  10. **Financial** (1): Billing & Subscriptions
  11. **Reports** (3): Analytics, Reports, Tags
  12. **Settings** (2): Settings, Admin Panel

---

## 🗺️ Routes & Navigation

### Public Routes

```
/                    → Home (Landing)
/features            → Features
/pricing             → Pricing
/about               → About
/contact             → Contact
/login               → Login
/register            → Register
/forgot-password     → Forgot Password
/reset-password      → Reset Password
/terms               → Terms of Service
/privacy             → Privacy Policy
```

### Protected Routes (Require Authentication)

```
/dashboard           → Dashboard Hub
/horses              → Horse List
/horses/new          → Add New Horse
/horses/:id          → Horse Detail
/horses/:id/edit     → Edit Horse
/health              → Health Records Hub
/vaccinations        → Vaccinations
/dental              → Dental Care
/hoofcare            → Hoof Care
/dewormings          → Deworming Records
/treatments          → Treatments
/xrays               → X-Ray Records
/training            → Training Sessions
/training-templates  → Training Templates
/lessons             → Lesson Scheduling
/feeding             → Feeding Plans
/nutrition-plans     → Nutrition Plans
/nutrition-logs      → Nutrition Logs
/calendar            → Calendar View
/appointments        → Appointments
/tasks               → Task Management
/breeding            → Breeding Management
/pedigree            → Pedigree Trees
/weather             → Weather & Conditions
/documents           → Document Vault
/contacts            → Contacts Management
/stable              → Stable Management
/messages            → Internal Messaging
/analytics           → Analytics Dashboard
/reports             → Reports Generator
/tags                → Tag Management
/ai-chat             → AI Assistant
/client-portal       → Client Portal
/settings            → User Settings
/billing             → Billing & Subscriptions
/admin               → Admin Panel (admin only)
```

### API Routes

```
GET  /api/health              → Health check
GET  /api/health/ping         → Simple ping
GET  /api/version             → Build info (SHA, version, timestamp)
GET  /build.txt               → Build fingerprint file
POST /api/auth/*              → Authentication endpoints
POST /api/billing/*           → Stripe billing endpoints
*    /api/trpc/*              → tRPC API endpoints
*    /api/v1/*                → REST API v1
GET  /api/realtime/subscribe  → SSE real-time updates
```

---

## 🚀 Build & Deployment

### Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL 8+
- Git

### Build Steps (Ubuntu VPS)

#### 1. Install Dependencies

```bash
# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm@10

# Clone repository
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online

# Install dependencies
pnpm install --frozen-lockfile
```

#### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env

# Required variables:
# - DATABASE_URL
# - JWT_SECRET (generate: openssl rand -base64 32)
# - ADMIN_UNLOCK_PASSWORD (MUST be changed from default)
```

#### 3. Build Application

```bash
# Clean previous build
pnpm clean

# Run build (includes fingerprinting)
pnpm build

# Output:
# - dist/index.js          → Server bundle
# - dist/public/           → Client static files
# - dist/public/build.txt  → Build fingerprint
```

#### 4. Setup Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/equiprofile.service
```

```ini
[Unit]
Description=EquiProfile Node.js Application
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/equiprofile
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=equiprofile

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable equiprofile
sudo systemctl start equiprofile

# Check status
sudo systemctl status equiprofile
```

#### 5. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/equiprofile
```

```nginx
server {
    listen 80;
    server_name equiprofile.online www.equiprofile.online;

    # Redirect HTTP to HTTPS (after SSL setup)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name equiprofile.online www.equiprofile.online;

    # SSL Certificate (use certbot)
    ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

#### 6. Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check build version
curl http://localhost:3000/build.txt

# Check from external
curl https://equiprofile.online/api/health
```

---

## 🔐 Environment Variables

### Required (Core Functionality)

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/equiprofile

# Security
JWT_SECRET=                # Generate: openssl rand -base64 32
ADMIN_UNLOCK_PASSWORD=     # MUST be strong password in production

# Application
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
BASE_URL=https://equiprofile.online
```

### Optional (Enhanced Features)

```bash
# Feature Flags
ENABLE_STRIPE=false        # Set to 'true' to enable billing
ENABLE_UPLOADS=false       # Set to 'true' to enable document uploads
ENABLE_PWA=false           # Set to 'true' for offline support

# Stripe (if ENABLE_STRIPE=true)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# Document Storage (if ENABLE_UPLOADS=true)
BUILT_IN_FORGE_API_URL=https://your-api.com
BUILT_IN_FORGE_API_KEY=your_key

# OAuth (Optional)
OAUTH_SERVER_URL=          # OAuth server URL
VITE_APP_ID=               # OAuth client ID
OWNER_OPEN_ID=             # Auto-admin OpenID

# AI Features (Optional)
OPENAI_API_KEY=sk-xxxxx    # For AI chat assistant

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@equiprofile.online

# Security
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Per IP
COOKIE_DOMAIN=equiprofile.online
COOKIE_SECURE=true
```

---

## 🔍 Version Verification

### Build Fingerprint

Every build creates a fingerprint with:

- **BUILD_SHA**: Git commit short hash
- **BUILD_TIME**: ISO 8601 timestamp
- **VERSION**: From package.json

### Verification Methods

#### 1. Check build.txt File

```bash
curl https://equipprofile.online/build.txt
```

Output:

```
BUILD_SHA=7f67b8b
BUILD_TIME=2026-02-08T10:15:23Z
VERSION=1.0.0
```

#### 2. Check API Endpoint

```bash
curl https://equiprofile.online/api/version
```

Output:

```json
{
  "version": "1.0.0",
  "sha": "7f67b8b",
  "buildTime": "2026-02-08T10:15:23Z"
}
```

#### 3. Check HTML Meta Tag

```bash
curl -s https://equiprofile.online | grep x-build-sha
```

Output:

```html
<meta name="x-build-sha" content="7f67b8b" />
```

#### 4. Check Footer (Visible on Website)

The footer displays build info automatically:

```
v1.0.0 • Build 7f67b8b • 2/8/2026
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary: Indigo-500 to Cyan-500 gradient --accent: Blue-400 to Cyan-400
  /* Backgrounds */ --bg-dark: #000000 (black)
  --bg-glass: rgba(255, 255, 255, 0.05) with backdrop-blur-md
  --bg-gradient: from-indigo-950/30 via-black to-cyan-950/30 /* Text */
  --text-primary: White (#ffffff) --text-secondary: Gray-300
  --text-muted: Gray-400;
```

### Design Principles

1. **Dark Glass Morphism**: Semi-transparent cards with backdrop blur
2. **Smooth Animations**: Framer Motion for all transitions
3. **Gradient Accents**: Indigo-to-cyan gradients for CTAs and highlights
4. **Mobile-First**: Responsive from 320px to 4K
5. **Performance**: Lazy loading, code splitting, optimized assets

---

## 📝 Maintenance

### Update Deployment

```bash
# Pull latest changes
cd /var/www/equiprofile
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Restart service
sudo systemctl restart equiprofile

# Verify
curl http://localhost:3000/api/health
curl http://localhost:3000/build.txt
```

### Monitor Logs

```bash
# Application logs
sudo journalctl -u equiprofile -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backups

```bash
# Backup
mysqldump -u equiprofile -p equiprofile > backup_$(date +%Y%m%d).sql

# Restore
mysql -u equiprofile -p equiprofile < backup_20260208.sql
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
pnpm clean
rm -rf node_modules dist
pnpm install
pnpm build
```

### Service Won't Start

```bash
# Check logs
sudo journalctl -u equiprofile -n 50

# Common issues:
# 1. Database not running
sudo systemctl status mysql

# 2. Port already in use
sudo lsof -i :3000

# 3. Environment variables missing
sudo nano /etc/systemd/system/equiprofile.service
```

### Assets Not Loading

```bash
# Check permissions
sudo chown -R www-data:www-data /var/www/equiprofile/dist

# Verify static files exist
ls -la /var/www/equiprofile/dist/public/assets/
```

---

## 📞 Support

- **Repository**: https://github.com/amarktainetwork-blip/Equiprofile.online
- **Built by**: Amarktai Network
- **License**: MIT

---

**Last Updated**: 2026-02-08
**Documentation Version**: 1.0.0
