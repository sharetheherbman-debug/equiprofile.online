# EquiProfile - Professional Horse Management Platform

![EquiProfile](https://img.shields.io/badge/status-production-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue) <!-- Update when package.json version changes -->

> **A comprehensive, modern web application for equestrian professionals to manage horses' health records, training schedules, feeding plans, and more.**

---

## 📖 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [Production Deployment](#-production-deployment)
  - [One-Command Deployment](#one-command-deployment)
  - [Manual Deployment Steps](#manual-deployment-steps)
  - [Nginx Configuration](#nginx-configuration)
- [Configuration](#-configuration)
- [Build Structure](#-build-structure)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📋 Prerequisites

### Required Software

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **pnpm** 10.x or higher
  ```bash
  # Install pnpm globally
  npm install -g pnpm
  
  # Or using corepack (recommended)
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

### Database (Choose One)

- **SQLite** (default, no setup required) - Good for development
- **MySQL 8.0+** (recommended for production)
  ```bash
  # Ubuntu/Debian
  sudo apt-get install mysql-server
  
  # Create database
  mysql -u root -p -e "CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```

### Production Server Requirements

- **Ubuntu 22.04 LTS or 24.04 LTS** (or similar Linux distribution)
- **Nginx** (for reverse proxy and SSL termination)
  ```bash
  sudo apt-get install nginx
  ```
- **Certbot** (for SSL certificates)
  ```bash
  sudo apt-get install certbot python3-certbot-nginx
  ```
- **Domain name** pointed to your server IP

### Required Environment Variables

**CRITICAL: Must be changed in production!**

Generate secure secrets:
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Admin password (use a strong password manager)
openssl rand -base64 16
```

---

## 🚀 Quick Start (Local Development)

Get EquiProfile running locally in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online

# 2. Install dependencies with frozen lockfile
bash scripts/install.sh
# Or: pnpm install --frozen-lockfile

# 3. Copy environment configuration
cp .env.example .env

# 4. Edit .env file with your configuration
# CRITICAL: Change JWT_SECRET and ADMIN_UNLOCK_PASSWORD!
nano .env

# 5. Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

> **Note**: The default configuration uses SQLite for easy local development. For production, configure MySQL in your `.env` file.

---

## 🚢 Production Deployment

EquiProfile includes a **plug-and-play production deployment system** for Ubuntu 24.04 VPS (optimized for Webdock).

### One-Command Deployment

Deploy to production in under 20 minutes:

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Clone to deployment directory
sudo mkdir -p /var/equiprofile
cd /var/equiprofile
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app

# 3. Configure environment
sudo cp .env.example .env
sudo nano .env
# REQUIRED: Set DATABASE_URL, JWT_SECRET, ADMIN_UNLOCK_PASSWORD, BASE_URL

# 4. Deploy with SSH-disconnect-safe mode
sudo bash ops/deploy.sh --unit --domain equiprofile.online

# 5. Monitor deployment
tail -f /var/equiprofile/_ops/deploy_*.log

# 6. Verify after deployment completes
sudo bash ops/verify.sh --domain equiprofile.online
```

**Features:**
- ✅ **Idempotent & deterministic** - safe to run multiple times
- ✅ **SSH disconnect-safe** - continues running if connection drops
- ✅ **Git-based** - fetch/checkout/reset for clean deploys
- ✅ **Build verification** - validates all outputs before restart
- ✅ **Health checks** - confirms API responds before exit
- ✅ **PWA blocked** - service worker and manifest return 404
- ✅ **Full logs** - everything logged to `/var/equiprofile/_ops/`

### Prerequisites

**Server requirements:**
- Ubuntu 24.04 LTS (or 22.04 LTS)
- Node.js 20.x or higher
- 2GB RAM minimum (4GB recommended)
- 10GB disk space
- Domain name pointed to server IP

**Required environment variables:**
```bash
DATABASE_URL=mysql://user:password@localhost:3306/equiprofile
JWT_SECRET=<generate-with-openssl-rand-hex-32>
ADMIN_UNLOCK_PASSWORD=<secure-password>
BASE_URL=https://equiprofile.online
NODE_ENV=production

# PWA disabled by default (recommended for production)
VITE_PWA_ENABLED=false
ENABLE_PWA=false
```

### Deployment Workflow

The deployment script performs these steps automatically:

1. **Pre-flight checks** - validates system requirements
2. **Git operations** - fetch/checkout/reset to target branch
3. **Clean install** - `npm ci` for reproducible builds
4. **Build** - clean dist, build with verification
5. **Configure services** - updates nginx + systemd if needed
6. **Restart** - stops old service, starts new one
7. **Health checks** - verifies endpoints respond
8. **PWA verification** - confirms service worker blocked

### Updating Production

To deploy latest changes:

```bash
# Update to latest main branch (SSH-safe)
sudo bash ops/deploy.sh --unit --domain equiprofile.online main

# Or deploy specific branch
sudo bash ops/deploy.sh --unit --domain equiprofile.online develop

# View deployment log
tail -f $(ls -t /var/equiprofile/_ops/deploy_*.log | head -1)
```

### Verification

After any deployment, run the verification script:

```bash
sudo bash ops/verify.sh --domain equiprofile.online
```

Checks performed:
- ✓ Git SHA and build SHA
- ✓ Service status (single service, no duplicates)
- ✓ Health endpoints (200 OK)
- ✓ Nginx listening on 80/443
- ✓ PWA files return 404
- ✓ Build SHA in HTML meta tag

### Troubleshooting & Recovery

If anything goes wrong:

```bash
# View service logs
journalctl -u equiprofile -n 100 --no-pager

# View deployment logs
ls -lt /var/equiprofile/_ops/deploy_*.log | head -1 | xargs tail -200

# Restore nginx config from repo
sudo cp ops/nginx/equiprofile.webdock.conf /etc/nginx/sites-available/equiprofile
sudo nginx -t && sudo systemctl reload nginx

# Restore systemd service from repo
sudo cp ops/systemd/equiprofile.service /etc/systemd/system/equiprofile.service
sudo systemctl daemon-reload && sudo systemctl restart equiprofile
```

👉 **See [DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide.  
👉 **See [RECOVERY.md](RECOVERY.md)** for detailed recovery procedures.

---

## ⚙️ Configuration

### Prerequisites

- **Node.js** 22.x or higher ([Download](https://nodejs.org/))
- **pnpm** 10.x or higher (`npm install -g pnpm`)
- **Database** (choose one):
  - SQLite (default, no setup required)
  - MySQL 8.0+ (recommended for production)
- **Optional Services**:
  - AWS S3 or compatible storage (for file uploads)
  - OpenAI API key (for AI weather analysis)
  - Stripe account (for billing features)

### Standard Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
   cd Equiprofile.online
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment** (see [Configuration](#-configuration))
   ```bash
   cp .env.default .env
   nano .env  # Edit with your settings
   ```

4. **Setup database** (if using MySQL)
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # Run migrations
   pnpm db:push
   ```

5. **Build the application**
   ```bash
   pnpm build
   ```

6. **Start the server**
   ```bash
   pnpm start
   ```

### Docker Installation

```bash
# Using Docker Compose
docker-compose up -d

# Or using Docker directly
docker build -t equiprofile .
docker run -p 3000:3000 --env-file .env equiprofile
```

---

## ⚙️ Configuration

### Environment Variables

All configuration is done through environment variables in the `.env` file. Start with `.env.default` and customize for your needs.

#### Core Configuration (Required)

```env
# Database Connection
# SQLite (development): sqlite:./data/equiprofile.db
# MySQL (production): mysql://username:password@host:port/database
DATABASE_URL=sqlite:./data/equiprofile.db

# JWT Secret for token signing (CRITICAL - CHANGE IN PRODUCTION!)
# Generate with: openssl rand -base64 32
JWT_SECRET=your_secure_jwt_secret_here_min_32_chars

# Admin Unlock Password (CRITICAL - CHANGE IN PRODUCTION!)
# Used to unlock admin panel features
ADMIN_UNLOCK_PASSWORD=your_secure_admin_password

# Application Environment
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
```

> **🔒 SECURITY WARNING**: The application will **refuse to start** in production if `JWT_SECRET` or `ADMIN_UNLOCK_PASSWORD` are still set to default values!

#### Feature Flags (Optional)

```env
# Enable/disable optional features
ENABLE_STRIPE=false        # Set to 'true' to enable billing
ENABLE_UPLOADS=false       # Set to 'true' to enable file uploads
```

#### Stripe Configuration (if ENABLE_STRIPE=true)

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx
```

#### Upload/Storage Configuration (if ENABLE_UPLOADS=true)

```env
# Built-in Forge Storage API
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# OR AWS S3 (legacy)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=equiprofile-uploads
```

#### OAuth Configuration (Optional)

```env
# OAuth Server URL (leave empty to disable OAuth)
OAUTH_SERVER_URL=https://oauth.example.com

# OAuth Application ID
VITE_APP_ID=your_app_id

# Owner OpenID (gets automatic admin access)
OWNER_OPEN_ID=user_openid_here
```

#### Additional Optional Features

```env
# OpenAI for AI features
OPENAI_API_KEY=sk-xxxxx

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@equiprofile.online

# Contact Form Configuration
CONTACT_TO_EMAIL=support@equiprofile.com  # Where contact form submissions are sent

# Frontend Configuration
VITE_WHATSAPP_NUMBER=+44xxxxxxxxxx  # WhatsApp number for support (optional)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cookie Security
COOKIE_DOMAIN=.equiprofile.online
COOKIE_SECURE=true
```

#### Nginx Configuration for Server-Sent Events (SSE)

For real-time features (LiveBadge, dashboard updates), configure Nginx to support SSE:

```nginx
# In your Nginx site configuration
location /events {
    proxy_pass http://localhost:3000;
    
    # SSE-specific settings
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    
    # Standard proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeout settings
    proxy_read_timeout 86400;  # 24 hours
}

# Also apply to legacy endpoint
location /api/realtime/events {
    proxy_pass http://localhost:3000;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

---

## 🏗️ Build Structure

Understanding the build output structure is critical for deployment:

### Directory Structure

```
Equiprofile.online/
├── client/                    # Frontend source (React + Vite)
│   ├── src/                   # React application source
│   ├── public/                # Public static assets
│   │   ├── service-worker.js  # PWA service worker (versioned)
│   │   ├── manifest.json      # PWA manifest
│   │   └── assets/            # Static images, icons
│   └── index.html             # HTML entry point (NO inline scripts)
│
├── server/                    # Backend source (Express + tRPC)
│   ├── _core/                 # Core server files
│   │   ├── index.ts           # Main server entry point
│   │   ├── vite.ts            # Static file serving logic
│   │   └── ...                # Other core modules
│   └── ...                    # API routers and business logic
│
├── dist/                      # BUILD OUTPUT (generated by `pnpm build`)
│   ├── index.js               # Bundled server (from esbuild)
│   └── public/                # Bundled client (from Vite)
│       ├── index.html         # SPA entry point (NO CACHE)
│       ├── service-worker.js  # Service worker (NO CACHE)
│       ├── manifest.json      # PWA manifest
│       └── assets/            # Hashed static assets (IMMUTABLE CACHE)
│           ├── index-[hash].js
│           ├── index-[hash].css
│           └── ...
│
├── scripts/                   # Deployment scripts
│   ├── install.sh             # Install dependencies (frozen lockfile)
│   ├── build.sh               # Build for production
│   ├── deploy.sh              # Orchestrate install + build
│   └── update-sw-version.js   # Update service worker version
│
└── deployment/                # Deployment configurations
    ├── nginx/                 # Nginx configurations
    │   ├── equiprofile.conf         # Proxy-all (RECOMMENDED)
    │   ├── equiprofile-static.conf  # Nginx serves static
    │   └── archive/                 # Old configs (deprecated)
    └── systemd/               # systemd service files
        └── equiprofile.service
```

### Build Process Details

**Client Build (Vite):**
```bash
# Input: client/
# Output: dist/public/
# Process:
#   1. Update service worker version from package.json
#   2. Bundle React app with code splitting
#   3. Hash all assets for cache busting
#   4. Copy public/ folder (service-worker.js, manifest.json, etc.)
#   5. Generate index.html with hashed script/style links
```

**Server Build (esbuild):**
```bash
# Input: server/_core/index.ts
# Output: dist/index.js
# Process:
#   1. Bundle all server code into single file
#   2. Mark dependencies as external (requires node_modules at runtime)
#   3. Minify for production
#   4. Generate source maps (optional)
```

### Runtime Dependencies

**IMPORTANT**: The server build uses `--packages=external`, which means:
- ✅ All dependencies in `package.json` must be available at runtime
- ✅ You must deploy `node_modules/` OR run `pnpm install --prod --frozen-lockfile` on server
- ✅ `pnpm-lock.yaml` ensures identical dependency versions

**Alternative** (not recommended): Remove `--packages=external` to bundle all dependencies into `dist/index.js`, but this increases build size and complexity.

### Cache Strategy

| File/Path | Cache-Control | Rationale |
|-----------|---------------|-----------|
| `index.html` | `no-store, no-cache, must-revalidate` | Always fetch latest SPA entry point |
| `service-worker.js` | `no-store, no-cache, must-revalidate` | Force service worker updates on deployment |
| `/assets/*` | `public, max-age=31536000, immutable` | Hashed filenames = immutable content |
| Other static files | `public, max-age=86400` | Moderate caching for non-hashed assets |

**Why this matters:**
- ❌ Caching `index.html` = users stuck on old versions
- ❌ Caching `service-worker.js` = service worker never updates
- ✅ Caching `/assets/*` = blazing fast repeat visits (content never changes due to hashing)

### Service Worker Versioning

The service worker is automatically versioned during build:

1. `scripts/update-sw-version.js` reads `package.json` version
2. Updates `CACHE_VERSION` constant in `client/public/service-worker.js`
3. Vite plugin copies versioned service worker to `dist/public/`
4. Version change forces cache invalidation in users' browsers

**To deploy a new version:**
```bash
# Bump version in package.json
npm version patch  # or minor, major

# Build (service worker version auto-updated)
bash scripts/build.sh

# Deploy and restart
# Users' browsers will detect new service worker version
# Old caches are automatically cleaned up
```

---

## 🚀 Deployment

### Quick Deployment (Bundled Dependencies)

The recommended approach bundles all dependencies into the production build, eliminating the need for `node_modules` in production:

```bash
# Build the application (dependencies are bundled)
pnpm build

# Copy dist/ to your server
scp -r dist/ user@server:/var/www/equiprofile/

# Copy .env file
scp .env user@server:/var/www/equiprofile/

# On the server, start the application
cd /var/www/equiprofile
NODE_ENV=production node dist/index.js
```

> **✅ Advantage**: No need to run `pnpm install` on the server!

### Alternative: External Dependencies

If you prefer keeping dependencies external (uses less disk space but requires `node_modules`):

1. Build with external packages:
   ```bash
   # Temporarily edit package.json build script to add --packages=external
   pnpm build
   ```

2. On server:
   ```bash
   pnpm install --prod --frozen-lockfile
   NODE_ENV=production node dist/index.js
   ```

### Production Server Setup (VPS/Cloud)

#### 1. Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL (if using)
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

#### 2. Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/equiprofile
sudo chown -R $USER:$USER /var/www/equiprofile

# Deploy application files
cd /var/www/equiprofile
# Transfer dist/ and .env files here

# Create data directory (for SQLite or uploads)
mkdir -p data
```

#### 3. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name equiprofile

# Enable startup script
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs equiprofile
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/equiprofile`:

```nginx
server {
    listen 80;
    server_name equiprofile.online www.equiprofile.online;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Serve static files from dist/public
    location /assets/ {
        alias /var/www/equiprofile/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## 📦 Offline/Air-Gapped Deployment

For environments without internet access (air-gapped, secure networks, etc.):

### Method 1: Bundled Dependencies (Recommended)

The default build bundles all dependencies, making offline deployment simple:

```bash
# On a machine with internet:
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online
pnpm install
pnpm build

# Create deployment package
tar -czf equiprofile-offline.tar.gz dist/ .env.default

# Transfer to air-gapped server
scp equiprofile-offline.tar.gz user@secure-server:/tmp/

# On the air-gapped server:
cd /var/www/equiprofile
tar -xzf /tmp/equiprofile-offline.tar.gz
cp .env.default .env
nano .env  # Configure for your environment

# Start (no npm/pnpm needed!)
NODE_ENV=production node dist/index.js
```

### Method 2: Pack Dependencies

If you need to use the external dependencies approach:

```bash
# On machine with internet:
pnpm install --frozen-lockfile
pnpm build

# Create offline bundle with node_modules
tar -czf equiprofile-full.tar.gz dist/ node_modules/ package.json pnpm-lock.yaml .env.default

# Transfer and extract on air-gapped server
# No pnpm install needed - node_modules included!
```

### Method 3: Internal NPM Registry

For organizations with internal npm registries:

```bash
# Configure .npmrc on air-gapped server
registry=https://internal-registry.company.com/

# Then deploy normally
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

### Offline Deployment Checklist

- [ ] Build application with dependencies bundled
- [ ] Package `dist/` directory
- [ ] Include `.env.default` as template
- [ ] Transfer to secure server
- [ ] Configure `.env` with production values
- [ ] Verify database is accessible
- [ ] Start application
- [ ] Test all features work

---

## 🎨 Updating Visuals Post-Deployment

You can update your EquiProfile deployment's visual appearance without rebuilding the application!

### Quick Visual Updates

#### 1. Update Colors and Styles

Edit `/var/www/equiprofile/dist/public/theme-override.css`:

```bash
nano /var/www/equiprofile/dist/public/theme-override.css
```

Example customizations:

```css
:root {
  /* Change primary brand color */
  --primary: 220 90% 56%;           /* Blue theme */
  --primary-foreground: 0 0% 100%;
  
  /* Or use your brand colors */
  --primary: 142 71% 45%;           /* Green theme */
}

/* Custom button style */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom header */
header {
  background: #1a202c;
}
```

**Changes take effect immediately** - just reload the page!

#### 2. Update Branding Configuration

Edit `/var/www/equiprofile/dist/public/visual-config.json`:

```bash
nano /var/www/equiprofile/dist/public/visual-config.json
```

Example configuration:

```json
{
  "branding": {
    "siteName": "MyEquineApp",
    "tagline": "Professional Horse Care",
    "description": "Your custom description"
  },
  
  "colors": {
    "primary": "#2563eb",
    "secondary": "#7c3aed"
  },
  
  "logos": {
    "header": "/images/my-logo.png",
    "footer": "/images/my-logo-white.png"
  },
  
  "hero": {
    "title": "Your Custom Title",
    "subtitle": "Your custom subtitle",
    "backgroundGradient": "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
  }
}
```

**Changes take effect on page reload** - no rebuild needed!

#### 3. Replace Images and Logos

Simply replace files in `/var/www/equiprofile/dist/public/images/`:

```bash
# Upload your custom logo
scp my-logo.png user@server:/var/www/equiprofile/dist/public/images/logo.png

# Upload custom hero background
scp hero-bg.jpg user@server:/var/www/equiprofile/dist/public/images/hero-bg.jpg
```

### Advanced Visual Customization

#### Custom Fonts

Add to `theme-override.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

:root {
  --font-sans: 'Poppins', sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

#### Custom Components

Override specific component styles:

```css
/* Customize cards */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Customize navigation */
nav {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* Customize buttons */
button.primary {
  background: #667eea;
  border-radius: 8px;
  padding: 12px 24px;
}
```

### Visual Update Workflow

```bash
# 1. Edit theme or config files
nano /var/www/equiprofile/dist/public/theme-override.css
nano /var/www/equiprofile/dist/public/visual-config.json

# 2. No restart needed! Just refresh browser
# Changes are visible immediately

# 3. Test in browser
# Open https://yourdomain.com and verify changes

# 4. Backup your customizations
cp dist/public/theme-override.css backups/theme-override-$(date +%Y%m%d).css
cp dist/public/visual-config.json backups/visual-config-$(date +%Y%m%d).json
```

---

## 🔒 Security

### Security Best Practices

#### Critical Security Requirements

1. **Change Default Secrets** ⚠️
   
   The application **will not start** in production with default secrets:
   
   ```bash
   # Generate secure JWT secret
   openssl rand -base64 32
   
   # Use a strong admin password (min 12 characters)
   # Include uppercase, lowercase, numbers, and symbols
   ```

2. **Use HTTPS in Production** ⚠️
   
   Always use SSL/TLS encryption:
   
   ```bash
   # Get free SSL certificate from Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Keep Dependencies Updated**
   
   ```bash
   # Check for updates
   pnpm outdated
   
   # Update dependencies
   pnpm update
   
   # Audit for vulnerabilities
   pnpm audit
   ```

4. **Configure Firewall**
   
   ```bash
   # Allow only necessary ports
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

### Authentication & Authorization

- **Email/Password Authentication** - bcrypt hashing with salting
- **OAuth 2.0 Support** - Optional integration with external providers
- **Session-based Authentication** - HTTP-only cookies
- **Role-Based Access Control** - User and Admin roles
- **Admin Panel** - Protected by unlock password

### Data Protection

- **Encryption in Transit** - TLS 1.2+ required
- **Encryption at Rest** - Database supports encryption
- **Input Validation** - All inputs validated with Zod schemas
- **SQL Injection Prevention** - Drizzle ORM with parameterized queries
- **XSS Protection** - React's built-in escaping
- **CSRF Protection** - Automatic token validation

### Rate Limiting

- **Public endpoints**: 100 requests per 15 minutes
- **Authenticated endpoints**: 1000 requests per 15 minutes
- **File uploads**: 50 requests per hour
- **AI endpoints**: 20 requests per hour

### Security Headers

Recommended Nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Reporting Security Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@equiprofile.online
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

### Security Checklist for Production

- [ ] Changed `JWT_SECRET` from default
- [ ] Changed `ADMIN_UNLOCK_PASSWORD` from default
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database using encrypted connections
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Error monitoring configured
- [ ] Backup system tested
- [ ] Dependencies updated to latest secure versions
- [ ] Fail2ban configured for SSH protection
- [ ] Regular security updates scheduled

---

## 📚 API Documentation

### API Overview

EquiProfile uses tRPC for type-safe API communication.

**Base URL**: 
- Development: `http://localhost:3000/api/trpc`
- Production: `https://yourdomain.com/api/trpc`

**Authentication**: Session-based with HTTP-only cookies

### Key API Routers

#### System Router (`system.*`)

- `system.status` - Get system health status

#### Auth Router (`auth.*`)

- `auth.me` - Get current authenticated user
- `auth.logout` - Logout current user
- `auth.register` - Register new user (email/password)
- `auth.login` - Login with email/password

#### User Router (`user.*`)

- `user.getProfile` - Get user profile
- `user.updateProfile` - Update user profile
- `user.getSubscriptionStatus` - Get subscription details
- `user.getDashboardStats` - Get dashboard statistics

#### Horses Router (`horses.*`)

- `horses.list` - List all user's horses
- `horses.get` - Get specific horse details
- `horses.create` - Create new horse profile
- `horses.update` - Update horse profile
- `horses.delete` - Delete horse profile

#### Health Router (`health.*`)

- `health.list` - List health records for a horse
- `health.create` - Create health record
- `health.update` - Update health record
- `health.delete` - Delete health record

#### Training Router (`training.*`)

- `training.list` - List training sessions
- `training.create` - Create training session
- `training.update` - Update training session
- `training.delete` - Delete training session

#### Feeding Router (`feeding.*`)

- `feeding.list` - List feeding plans
- `feeding.create` - Create feeding plan
- `feeding.update` - Update feeding plan
- `feeding.delete` - Delete feeding plan

#### Admin Router (`admin.*`) - Requires Admin Role

- `admin.listUsers` - List all users
- `admin.suspendUser` - Suspend user account
- `admin.getSystemStats` - Get system statistics
- `admin.getActivityLogs` - Get activity logs

### Example API Usage

```typescript
// Using tRPC client
import { trpc } from '@/lib/trpc';

// Query example
const { data: horses } = trpc.horses.list.useQuery();

// Mutation example
const createHorse = trpc.horses.create.useMutation({
  onSuccess: () => {
    console.log('Horse created successfully!');
  }
});

createHorse.mutate({
  name: 'Thunder',
  breed: 'Thoroughbred',
  age: 5,
  discipline: 'Show Jumping'
});
```

For complete API documentation, see the auto-generated TypeScript types in `shared/schema.ts`.

---

## 👨‍💻 Development

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development server (with hot reload)
pnpm dev

# Run type checking
pnpm check

# Format code
pnpm format

# Run tests
pnpm test
```

### Project Structure

```
Equiprofile.online/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── main.tsx       # Application entry point
│   ├── public/            # Static assets
│   └── index.html         # HTML template
│
├── server/                # Backend Node.js application
│   ├── _core/             # Core server setup
│   │   ├── index.ts       # Server entry point
│   │   └── env.ts         # Environment configuration
│   ├── routers/           # tRPC API routers
│   ├── services/          # Business logic services
│   └── middleware/        # Authentication & validation
│
├── shared/                # Shared code (client & server)
│   ├── schema.ts          # Zod validation schemas
│   └── types.ts           # TypeScript types
│
├── drizzle/               # Database schema and migrations
├── scripts/               # Build and deployment scripts
├── dist/                  # Production build output
└── package.json           # Dependencies and scripts
```

### Technology Stack

**Frontend**:
- React 19 - UI framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Wouter - Routing
- tRPC - Type-safe API client
- TanStack Query - Data fetching

**Backend**:
- Node.js - Runtime
- Express - Web framework
- tRPC - Type-safe API
- Drizzle ORM - Database
- Jose - JWT handling
- bcrypt - Password hashing

**Database**:
- SQLite (development)
- MySQL (production)

**Build Tools**:
- Vite - Frontend bundler
- esbuild - Backend bundler
- TypeScript - Compiler

### Development Scripts

```bash
# Development
pnpm dev                   # Start dev server with hot reload

# Building
pnpm build                 # Build for production
pnpm build:sw              # Update service worker version

# Testing
pnpm test                  # Run all tests
pnpm test -- health        # Run specific test file

# Code Quality
pnpm check                 # TypeScript type checking
pnpm format                # Format code with Prettier

# Database
pnpm db:push               # Push schema changes to database
```

### Adding New Features

1. **Create database schema** in `drizzle/schema.ts`
2. **Create tRPC router** in `server/routers/`
3. **Create frontend pages** in `client/src/pages/`
4. **Add routes** to `client/src/App.tsx`
5. **Write tests** in `server/*.test.ts`

### Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- horses.test.ts

# Watch mode
pnpm test --watch
```

Tests use Vitest and follow the pattern:
- Unit tests for business logic
- Integration tests for API endpoints
- Mock external services

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with default config
- **Linting**: ESLint for code quality
- **Commits**: Conventional commits recommended

---

## 🛠️ Operational Scripts

EquiProfile includes several utility scripts for deployment, testing, and user management.

### Health & Smoke Tests

Test that your deployment is working correctly:

```bash
# Run smoke tests (tests health, ready, and build endpoints)
bash scripts/smoke-local.sh

# Test specific endpoints
curl http://localhost:3000/api/health   # Liveness check (always 200)
curl http://localhost:3000/api/ready    # Readiness check (200 if DB connected)
curl http://localhost:3000/build        # Build info
```

### User Management

Create users from the command line (useful for initial setup or scripts):

```bash
# Create a new user
node scripts/create-user.mjs \
  --email admin@equiprofile.online \
  --password "your-secure-password" \
  --name "Admin User"

# Output: "created" or "already exists"
# Exit code: 0 on success, 1 on error
```

**Notes:**
- Password is hashed with bcrypt (same as register endpoint)
- Requires `DATABASE_URL` environment variable
- Safe to run multiple times (idempotent)

### Production Startup

Start the application with proper environment loading:

```bash
# PM2 method (recommended)
pm2 start ecosystem.config.js --env production

# Direct method (uses scripts/start-prod.sh)
bash scripts/start-prod.sh

# The script automatically:
# - Loads .env file
# - Exports all environment variables
# - Starts node dist/index.js
```

---

## 🔧 Troubleshooting

### Common Deployment Issues

#### Issue 1: Old Design Still Showing After Deployment

**Symptoms:**
- Users see old design/features after deployment
- Changes don't appear even after hard refresh
- Service worker serves stale content

**Solutions:**

1. **Clear browser cache and service worker:**
   ```bash
   # In browser DevTools (F12):
   # 1. Application tab → Service Workers → Unregister
   # 2. Application tab → Clear Storage → Clear site data
   # 3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   ```

2. **Verify service worker version updated:**
   ```bash
   # Check service-worker.js has new version
   curl https://yourdomain.com/service-worker.js | grep CACHE_VERSION
   
   # Should match package.json version
   cat package.json | grep version
   ```

3. **Ensure proper cache headers:**
   ```bash
   # Check index.html headers (should be no-cache)
   curl -I https://yourdomain.com/
   # Should see: Cache-Control: no-store, no-cache, must-revalidate
   
   # Check service-worker.js headers (should be no-cache)
   curl -I https://yourdomain.com/service-worker.js
   # Should see: Cache-Control: no-store, no-cache, must-revalidate
   ```

4. **Force version bump:**
   ```bash
   # Bump version in package.json
   npm version patch
   
   # Rebuild (service worker version auto-updates)
   bash scripts/build.sh
   
   # Restart server
   sudo systemctl restart equiprofile
   ```

#### Issue 2: CSS/JS Returning HTML (MIME Type Error)

**Symptoms:**
- Browser console shows: "Refused to apply style because its MIME type ('text/html') is not a supported stylesheet MIME type"
- Assets return HTML (index.html) instead of actual files
- White screen or broken styles

**Root Cause:** SPA fallback incorrectly serving index.html for asset requests

**Solutions:**

1. **Check build output exists:**
   ```bash
   # Verify dist/public/ contains assets
   ls -la dist/public/
   ls -la dist/public/assets/
   
   # Verify index.js exists
   ls -la dist/index.js
   ```

2. **Verify server static path in production:**
   ```javascript
   // In server/_core/vite.ts, check distPath:
   // Should be: path.resolve(import.meta.dirname, "public")
   // NOT: path.resolve(import.meta.dirname, "../..", "dist", "public")
   ```

3. **Check Nginx configuration:**
   ```bash
   # If using nginx static serving, verify root path
   grep "root" /etc/nginx/sites-available/equiprofile
   # Should point to correct dist/public directory
   
   # Test nginx config
   sudo nginx -t
   ```

4. **Use recommended proxy-all nginx config:**
   ```bash
   # Switch to simpler config (avoids path issues)
   sudo cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/equiprofile
   sudo nginx -t && sudo systemctl reload nginx
   ```

#### Issue 3: CSP Blocking Inline Scripts (White Screen)

**Symptoms:**
- White screen after deployment
- Browser console shows CSP errors: "Refused to execute inline script"
- Application loads in development but not production

**Root Cause:** Content Security Policy blocks inline scripts

**Solution:**

✅ **This should NOT happen** - `client/index.html` contains NO inline scripts!

Verify:
```bash
# Check index.html for inline scripts
grep "<script" client/index.html
# Should ONLY show: <script type="module" src="/src/main.tsx"></script>

# Check built index.html
grep "<script" dist/public/index.html
# Should ONLY show external scripts with src="..."
```

If you see inline scripts:
1. Move script content to separate `.js` file
2. Reference with `<script src="/path/to/file.js"></script>`
3. Rebuild application

#### Issue 4: Multiple/Conflicting Nginx Configs

**Symptoms:**
- Nginx serves wrong configuration
- Changes to nginx config don't take effect
- Multiple server blocks listening on same port

**Solutions:**

1. **Check active nginx configs:**
   ```bash
   # List enabled sites
   ls -la /etc/nginx/sites-enabled/
   
   # Check for conflicting server blocks
   sudo nginx -T | grep "server_name"
   ```

2. **Remove conflicting configs:**
   ```bash
   # Remove old symlinks
   sudo rm /etc/nginx/sites-enabled/default
   sudo rm /etc/nginx/sites-enabled/nginx-*
   
   # Keep only canonical config
   sudo ln -sf /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/equiprofile
   
   # Test and reload
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Use canonical configuration:**
   ```bash
   # Copy recommended config
   sudo cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/equiprofile
   
   # Edit domain name
   sudo nano /etc/nginx/sites-available/equiprofile
   # Replace YOUR_DOMAIN_HERE with actual domain
   
   # Test and reload
   sudo nginx -t && sudo systemctl reload nginx
   ```

#### Issue 5: Build/Runtime Module Errors

**Symptoms:**
- Error: "Cannot find module 'some-package'"
- Application builds but crashes at runtime
- Missing dependencies errors

**Root Cause:** `--packages=external` requires dependencies at runtime

**Solutions:**

1. **Install production dependencies on server:**
   ```bash
   # Install with frozen lockfile
   pnpm install --prod --frozen-lockfile
   
   # Verify node_modules exists
   ls -la node_modules/
   ```

2. **Rebuild native modules if needed:**
   ```bash
   # For bcrypt, esbuild, etc.
   pnpm rebuild
   ```

3. **Verify package.json and pnpm-lock.yaml are present:**
   ```bash
   ls -la package.json pnpm-lock.yaml
   # Both must be deployed to production server
   ```

### Common Runtime Errors

#### Application Refuses to Start

**Error: "JWT_SECRET is still set to default value"**

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Add to .env file
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

**Error: "Database connection failed"**

```bash
# For MySQL: Test connection
mysql -u username -p -h localhost equiprofile

# Check DATABASE_URL format
# Correct: mysql://username:password@localhost:3306/equiprofile
# Incorrect: mysql://username@localhost/equiprofile (missing password/port)

# For SQLite: Check data directory exists
mkdir -p data/
chmod 755 data/
```

**Error: "Port 3000 already in use"**

```bash
# Find process using port
lsof -i :3000

# Kill the process (replace PID)
kill -9 <PID>

# Or change port in .env
echo "PORT=3001" >> .env
```

#### 502 Bad Gateway (Nginx)

```bash
# Check if application is running
sudo systemctl status equiprofile

# Check application logs
sudo journalctl -u equiprofile -n 50 --no-pager

# Restart application
sudo systemctl restart equiprofile

# Verify application responds locally
curl http://127.0.0.1:3000/healthz

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force renewal (if near expiry)
sudo certbot renew --force-renewal

# Test renewal process
sudo certbot renew --dry-run
```

### Performance Issues

#### Slow Initial Page Load

1. **Enable compression in Nginx:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   gzip_min_length 1000;
   ```

2. **Verify assets are cached:**
   ```bash
   # Check /assets/* headers
   curl -I https://yourdomain.com/assets/index-[hash].js
   # Should see: Cache-Control: public, max-age=31536000, immutable
   ```

3. **Check service worker is active:**
   ```bash
   # In browser DevTools → Application → Service Workers
   # Should show "activated and is running"
   ```

#### High Memory Usage

```bash
# Check Node.js memory usage
pm2 monit

# Increase memory limit if needed
NODE_OPTIONS="--max-old-space-size=2048" node dist/index.js

# Check for memory leaks
pm2 logs --lines 100 | grep "heap"
```

### Development Issues

#### Hot Module Reload Not Working

```bash
# Check Vite is running in dev mode
NODE_ENV=development pnpm dev

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
pnpm dev
```

#### TypeScript Errors

```bash
# Run type checking
pnpm check

# Clear TypeScript build info
rm -rf *.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules/
pnpm install --frozen-lockfile
```

### Getting Help

If issues persist:

1. **Check logs:**
   ```bash
   # Application logs
   sudo journalctl -u equiprofile -n 100 --no-pager
   
   # Nginx access log
   sudo tail -f /var/log/nginx/equiprofile-access.log
   
   # Nginx error log
   sudo tail -f /var/log/nginx/equiprofile-error.log
   ```

2. **Run health checks:**
   ```bash
   # Local health check
   curl http://127.0.0.1:3000/healthz
   
   # Public health check
   curl https://yourdomain.com/healthz
   
   # Build info
   curl https://yourdomain.com/build
   ```

3. **Verify configuration:**
   ```bash
   # Check environment variables
   grep -v "^#" .env | grep -v "^$"
   
   # Test Nginx config
   sudo nginx -t
   
   # Check service status
   sudo systemctl status equiprofile
   ```

4. **Report issues:**
   - GitHub Issues: [amarktainetwork-blip/Equiprofile.online/issues](https://github.com/amarktainetwork-blip/Equiprofile.online/issues)
   - Include logs, error messages, and configuration (redact sensitive data!)

---

**File Upload Errors**

```bash
# Check uploads directory exists and is writable
mkdir -p /var/www/equiprofile/uploads
chmod 755 /var/www/equiprofile/uploads

# Check AWS S3 credentials (if using S3)
# Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env

# Check file size limits in Nginx
# Edit /etc/nginx/nginx.conf and add:
client_max_body_size 20M;
```

#### Performance Issues

**Slow page loads**

```bash
# Enable production mode
NODE_ENV=production node dist/index.js

# Check database indexes
# Review slow query logs

# Enable Nginx caching
# Add to Nginx config:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
```

**High memory usage**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js

# Monitor with PM2
pm2 monit

# Check for memory leaks
node --inspect dist/index.js
```

#### Database Issues

**Migration Errors**

```bash
# Reset database (CAUTION: Deletes all data!)
rm data/equiprofile.db
pnpm db:push

# For MySQL, recreate database:
mysql -u root -p -e "DROP DATABASE equiprofile; CREATE DATABASE equiprofile;"
pnpm db:push
```

**Connection Pool Exhausted**

```bash
# Increase connection pool size in drizzle.config.ts
# Or restart the application
pm2 restart equiprofile
```

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/amarktainetwork-blip/Equiprofile.online/issues)
- **Documentation**: Check docs/ folder for detailed guides
- **Community**: Join our Discord server (link in repo)
- **Email Support**: support@equiprofile.online

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=* NODE_ENV=development pnpm dev

# Or for specific modules
DEBUG=trpc:* pnpm dev
```

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/trpc/system.status

# Should return:
# {"status":"ok","version":"1.0.0"}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Write tests** for new features
5. **Run tests**: `pnpm test`
6. **Format code**: `pnpm format`
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Keep PRs focused and small

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Website**: https://equiprofile.online
- **Email**: support@equiprofile.online
- **Security**: security@equiprofile.online
- **GitHub**: https://github.com/amarktainetwork-blip/Equiprofile.online

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

<p align="center">Made with ❤️ for the equestrian community</p>
<p align="center">© 2024 EquiProfile. All rights reserved.</p>
