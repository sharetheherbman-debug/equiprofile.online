# EquiProfile - Plug-and-Play Deployment Guide

**Platform:** Webdock VPS  
**Last Updated:** January 3, 2026  
**Version:** 1.0.0

---

## Overview

This guide provides step-by-step instructions for deploying EquiProfile on a Webdock VPS with minimal configuration. The application supports feature flags that allow you to start with basic functionality and enable billing/uploads later.

## Prerequisites

- Webdock VPS (minimum 2GB RAM, 2 CPU cores)
- Ubuntu 22.04 LTS or later
- Domain name configured with DNS pointing to your VPS
- SSH access to your server
- MySQL 8.0+ database

---

## Quick Start (5 Minutes)

### 1. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### 2. Setup MySQL Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/equiprofile
sudo chown $USER:$USER /var/www/equiprofile

# Clone repository
cd /var/www/equiprofile
git clone https://github.com/amarktainetwork-blip/Equiprofile.online .

# Install dependencies
pnpm install
```

### 4. Configure Environment (Minimal)

Create `.env` file with minimal configuration:

```bash
cat > .env << 'EOF'
# Core Configuration (Required)
DATABASE_URL=mysql://equiprofile:your_secure_password_here@localhost:3306/equiprofile
JWT_SECRET=your_jwt_secret_generate_with_openssl_rand_base64_32
ADMIN_UNLOCK_PASSWORD=your_secure_admin_password

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

# Feature Flags (Start Disabled)
ENABLE_STRIPE=false
ENABLE_UPLOADS=false
EOF
```

### 5. Run Preflight Check

```bash
# Validate environment
./scripts/preflight.sh
```

### 6. Build and Deploy

```bash
# Run database migrations
pnpm db:push

# Build application
pnpm build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### 7. Setup Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/equiprofile
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and start:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Verify Deployment

```bash
# Check application status
pm2 status

# View logs
pm2 logs equiprofile

# Test health endpoint
curl http://localhost:3000/api/system/health
```

---

## Configuration Scenarios

### Scenario 1: Minimal (No Billing, No Uploads) - DEFAULT

**Use Case:** Internal testing, MVP launch, proof of concept

**`.env` Configuration:**

```env
DATABASE_URL=mysql://equiprofile:password@localhost:3306/equiprofile
JWT_SECRET=your_jwt_secret_here
ADMIN_UNLOCK_PASSWORD=your_admin_password
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

ENABLE_STRIPE=false
ENABLE_UPLOADS=false
```

**Features Available:**

- ✅ User authentication
- ✅ Horse profiles
- ✅ Health records
- ✅ Training sessions
- ✅ Feeding plans
- ✅ Calendar/events
- ✅ AI chat
- ❌ Billing/subscriptions (disabled)
- ❌ Document uploads (disabled)

**Deployment Command:**

```bash
./scripts/preflight.sh && pnpm build && pm2 restart equiprofile
```

---

### Scenario 2: With Stripe Only

**Use Case:** Enable billing/subscriptions, no document storage yet

**Additional Configuration:**

```env
# ... (all from Scenario 1) ...

ENABLE_STRIPE=true
ENABLE_UPLOADS=false

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx
```

**Features Added:**

- ✅ Subscription billing
- ✅ Payment processing
- ✅ Customer portal
- ❌ Document uploads (still disabled)

**Setup Steps:**

1. Create Stripe account at https://stripe.com
2. Get API keys from https://dashboard.stripe.com/apikeys
3. Create products/prices in Stripe dashboard
4. Setup webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Add webhook secret to `.env`
6. Restart application

**Deployment Command:**

```bash
./scripts/preflight.sh && pnpm build && pm2 restart equiprofile
```

---

### Scenario 3: With Uploads Only

**Use Case:** Enable document storage, no billing yet

**Additional Configuration:**

```env
# ... (all from Scenario 1) ...

ENABLE_STRIPE=false
ENABLE_UPLOADS=true

# Storage Configuration
BUILT_IN_FORGE_API_URL=https://your-storage-api.com
BUILT_IN_FORGE_API_KEY=your_storage_api_key
```

**Features Added:**

- ✅ Document uploads
- ✅ File storage
- ❌ Billing (still disabled)

**Setup Steps:**

1. Setup storage API endpoint
2. Generate API key
3. Add credentials to `.env`
4. Restart application

**Deployment Command:**

```bash
./scripts/preflight.sh && pnpm build && pm2 restart equiprofile
```

---

### Scenario 4: Full Featured

**Use Case:** Production deployment with all features

**Complete Configuration:**

```env
# Core Configuration
DATABASE_URL=mysql://equiprofile:password@localhost:3306/equiprofile
JWT_SECRET=your_jwt_secret_here
ADMIN_UNLOCK_PASSWORD=your_admin_password
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
OWNER_OPEN_ID=your_oauth_openid

# Feature Flags
ENABLE_STRIPE=true
ENABLE_UPLOADS=true

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# Storage
BUILT_IN_FORGE_API_URL=https://your-storage-api.com
BUILT_IN_FORGE_API_KEY=your_storage_api_key

# Optional Features
OPENAI_API_KEY=sk-xxxxx
COOKIE_DOMAIN=yourdomain.com
COOKIE_SECURE=true
```

**All Features Enabled:**

- ✅ User authentication
- ✅ Complete horse management
- ✅ Billing/subscriptions
- ✅ Document uploads
- ✅ AI features
- ✅ All functionality

**Deployment Command:**

```bash
./scripts/preflight.sh && pnpm build && pm2 restart equiprofile
```

---

## Upgrading Between Configurations

### From Minimal to With Stripe

```bash
# 1. Stop application
pm2 stop equiprofile

# 2. Update .env file
nano .env
# Add:
# ENABLE_STRIPE=true
# STRIPE_SECRET_KEY=...
# STRIPE_WEBHOOK_SECRET=...

# 3. Validate configuration
./scripts/preflight.sh

# 4. Restart application
pm2 restart equiprofile

# 5. Verify billing is enabled
curl http://localhost:3000/api/system/getFeatureFlags
# Should show: { "enableStripe": true, "enableUploads": false }
```

### From Minimal to With Uploads

```bash
# 1. Stop application
pm2 stop equiprofile

# 2. Update .env file
nano .env
# Add:
# ENABLE_UPLOADS=true
# BUILT_IN_FORGE_API_URL=...
# BUILT_IN_FORGE_API_KEY=...

# 3. Validate configuration
./scripts/preflight.sh

# 4. Restart application
pm2 restart equiprofile

# 5. Verify uploads are enabled
curl http://localhost:3000/api/system/getFeatureFlags
# Should show: { "enableStripe": false, "enableUploads": true }
```

---

## Troubleshooting

### Application Won't Start

**Check environment variables:**

```bash
./scripts/preflight.sh
```

**View logs:**

```bash
pm2 logs equiprofile
```

**Common Issues:**

- ❌ Missing required environment variables → Run preflight script
- ❌ Database connection failed → Check DATABASE_URL
- ❌ Port 3000 already in use → Change PORT in .env
- ❌ Admin password is default → Change ADMIN_UNLOCK_PASSWORD

### Feature Not Working

**Check feature flags:**

```bash
curl http://localhost:3000/api/system/getFeatureFlags
```

**Verify environment:**

```bash
# In admin panel (after unlocking admin mode)
# Navigate to: Admin → System → Environment Health
```

**Common Issues:**

- ❌ Billing disabled → Set `ENABLE_STRIPE=true` and add Stripe vars
- ❌ Uploads disabled → Set `ENABLE_UPLOADS=true` and add storage vars
- ❌ Feature enabled but credentials missing → Check preflight output

### Database Migration Errors

```bash
# Reset and re-run migrations
cd /var/www/equiprofile
pnpm db:push
```

### PM2 Process Crashed

```bash
# View error logs
pm2 logs equiprofile --err

# Restart process
pm2 restart equiprofile

# Delete and recreate process
pm2 delete equiprofile
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## Maintenance Commands

### Update Application

```bash
cd /var/www/equiprofile
git pull origin main
pnpm install
./scripts/preflight.sh
pnpm db:push
pnpm build
pm2 restart equiprofile
```

### View Logs

```bash
# All logs
pm2 logs equiprofile

# Error logs only
pm2 logs equiprofile --err

# Last 100 lines
pm2 logs equiprofile --lines 100
```

### Backup Database

```bash
# Create backup
mysqldump -u equiprofile -p equiprofile > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u equiprofile -p equiprofile < backup_20260103_120000.sql
```

### Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Check process status
pm2 status
```

---

## Production Checklist

Before going live, verify:

- [ ] Preflight script passes: `./scripts/preflight.sh`
- [ ] Admin password changed from default
- [ ] SSL certificate installed (HTTPS working)
- [ ] Database backups configured
- [ ] PM2 configured to start on boot: `pm2 startup`
- [ ] Nginx reverse proxy configured (optional)
- [ ] Feature flags set correctly for your needs
- [ ] Health endpoint accessible: `/api/system/health`
- [ ] Stripe webhook configured (if ENABLE_STRIPE=true)
- [ ] Storage API working (if ENABLE_UPLOADS=true)
- [ ] Firewall configured (ports 80, 443, 3306)

---

## Scaling Options

### Single Instance (Default)

```bash
pm2 start ecosystem.config.js --env production
```

### Multiple Instances

```bash
# Set instance count via environment variable
PM2_INSTANCES=4 pm2 start ecosystem.config.js --env production
```

### Auto-Scaling

```bash
# Use all CPU cores
PM2_INSTANCES=max pm2 start ecosystem.config.js --env production
```

---

## Support

**Documentation:** https://github.com/amarktainetwork-blip/Equiprofile.online  
**Issues:** https://github.com/amarktainetwork-blip/Equiprofile.online/issues  
**Email:** support@equiprofile.online

---

**Happy Deploying! 🚀**
