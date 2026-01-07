# EquiProfile - Professional Horse Management Platform

![EquiProfile](https://img.shields.io/badge/status-production-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)

> **A comprehensive, modern web application for equestrian professionals to manage horses' health records, training schedules, feeding plans, and more.**

---

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Production Installation (Ubuntu 24)](#-production-installation-ubuntu-24) ⭐ NEW
- [Features](#-features)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Offline/Air-Gapped Deployment](#-offlineair-gapped-deployment)
- [Updating Visuals](#-updating-visuals-post-deployment)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Quick Start

Get EquiProfile running in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online

# 2. Install dependencies
pnpm install

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

## 🚢 Fresh Install on Webdock / Ubuntu VPS

For production deployment on Ubuntu 22.04+ (Webdock, DigitalOcean, AWS, etc.):

### Prerequisites

- Ubuntu 22.04 LTS or 24.04 LTS
- Node.js 20+
- pnpm
- nginx
- MySQL 8.0+
- Domain name pointed to your server

### Installation Steps

```bash
# 1. Clone repository to deployment directory
sudo mkdir -p /var/www/equiprofile
sudo chown -R www-data:www-data /var/www/equiprofile
cd /var/www
sudo -u www-data git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git equiprofile
cd equiprofile

# 2. Copy and configure environment
sudo -u www-data cp .env.example .env
sudo nano .env

# 3. Run one-command deployment
sudo bash deployment/deploy.sh

# 4. Configure domain in Nginx config
sudo nano deployment/nginx-equiprofile.conf
# Replace YOUR_DOMAIN_HERE with your actual domain

# 5. Install Nginx configuration
sudo cp deployment/nginx-equiprofile.conf /etc/nginx/sites-available/equiprofile
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Setup SSL with Certbot
sudo certbot --nginx -d yourdomain.com

# 7. Verify installation
curl https://yourdomain.com/healthz
```

**Complete guide**: See [deployment/README_DEPLOY_WEBDOCK.md](deployment/README_DEPLOY_WEBDOCK.md)

### Critical Environment Variables

```env
# Database (MySQL for production)
DATABASE_URL=mysql://equiprofile:password@localhost:3306/equiprofile

# Security - MUST CHANGE IN PRODUCTION!
JWT_SECRET=<generate with: openssl rand -base64 32>
ADMIN_UNLOCK_PASSWORD=<your_secure_admin_password>

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
```

> **🔒 SECURITY WARNING**: The application will **refuse to start** in production if `JWT_SECRET` or `ADMIN_UNLOCK_PASSWORD` are still set to default values!

---

## 🌟 Features

### Core Features
- **Horse Profile Management** - Detailed profiles with breed, age, discipline, and photos
- **Health Records** - Track vaccinations, vet visits, medications, and medical history
- **Training Scheduler** - Plan and log training sessions with progress tracking
- **Feeding Plans** - Manage feeding schedules and nutrition information
- **AI Weather Analysis** - Get intelligent riding recommendations based on weather
- **Document Storage** - Secure storage for important documents
- **Subscription Management** - 7-day free trial, flexible monthly/yearly plans

### Admin Features
- **User Management** - View, suspend, and manage user accounts
- **System Analytics** - Monitor subscriptions, activity, and system health
- **Settings Management** - Configure system-wide settings
- **Activity Logs** - Track all system activities
- **Automated Backups** - Daily database and file backups

### Technical Features
- **Progressive Web App (PWA)** - Install on any device, works offline
- **Real-time Updates** - Live notifications and updates
- **Multi-language Support** - i18n ready (English, Spanish, more coming)
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Easy on the eyes, automatic or manual toggle
- **Accessibility** - WCAG 2.1 AA compliant

---

## 💻 Installation

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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cookie Security
COOKIE_DOMAIN=.equiprofile.online
COOKIE_SECURE=true
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

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Build Errors

**Error: `Cannot find package 'drizzle-orm'`**

```bash
# Solution: Dependencies weren't bundled properly
# Check your build script includes --bundle and doesn't have --packages=external
pnpm build
```

**Error: `bcrypt` build fails**

```bash
# Solution: Rebuild native modules
pnpm rebuild bcrypt

# Or use bcryptjs as fallback (pure JavaScript)
pnpm add bcryptjs
```

#### Runtime Errors

**Error: Application refuses to start with "JWT_SECRET is still set to default value"**

```bash
# Solution: Generate and set a secure JWT secret
openssl rand -base64 32

# Add to .env file:
JWT_SECRET=<generated_secret_here>
```

**Error: Database connection failed**

```bash
# For SQLite: Check data directory exists
mkdir -p data/

# For MySQL: Verify connection string
DATABASE_URL=mysql://username:password@localhost:3306/equiprofile

# Test MySQL connection
mysql -u username -p -h localhost equiprofile
```

**Error: Port 3000 already in use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm start
```

#### Deployment Issues

**502 Bad Gateway (Nginx)**

```bash
# Check if application is running
pm2 status

# Check application logs
pm2 logs equiprofile

# Restart application
pm2 restart equiprofile

# Check Nginx configuration
sudo nginx -t
```

**SSL Certificate Issues**

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

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
