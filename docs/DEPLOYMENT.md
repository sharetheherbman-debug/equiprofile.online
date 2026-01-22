# EquiProfile Production Deployment Guide

Complete guide to deploying EquiProfile on Ubuntu 24.04 VPS (optimized for Webdock) with Nginx, SSL, and systemd/PM2 process management.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Environment Configuration](#environment-configuration)
- [Nginx Setup](#nginx-setup)
- [SSL Configuration](#ssl-configuration)
- [Deployment Options](#deployment-options)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)
- [Security](#security)
- [Support](#support)

---

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 24.04 LTS (or 22.04 LTS)
- **RAM**: 2GB minimum (4GB recommended for builds)
- **Disk**: 10GB available
- **CPU**: 1 core minimum (2 cores recommended)
- **Domain**: DNS A records configured pointing to server IP

### Software Requirements

- **Node.js**: v20.x or higher (LTS)
- **npm**: v10.x or higher
- **Nginx**: Latest stable
- **MySQL**: 8.0+ (or MariaDB 10.6+)
- **Certbot**: For SSL certificates (Let's Encrypt)
- **Git**: For deployment automation

### Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node --version  # Should be v20.x or higher
npm --version   # Should be v10.x or higher

# Install required packages
sudo apt install -y nginx mysql-server git curl certbot python3-certbot-nginx

# Install PM2 (alternative to systemd)
npm install -g pm2
```

---

## Quick Start

Deploy EquiProfile in under 20 minutes on a fresh Webdock VPS:

### One-Command Deployment

```bash
# 1. Clone repository
sudo mkdir -p /var/equiprofile
cd /var/equiprofile
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app

# 2. Run automated deployment
sudo bash ops/deploy.sh --domain equiprofile.online
```

### Manual Quick Setup

```bash
# 1. Create database
sudo mysql <<EOF
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password';
CREATE USER 'equiprofile'@'127.0.0.1' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
EOF

# 2. Configure environment
sudo cp .env.example .env
sudo nano .env
# Set DATABASE_URL, JWT_SECRET, ADMIN_UNLOCK_PASSWORD, BASE_URL

# 3. Run deployment script
sudo bash ops/deploy.sh --domain equiprofile.online

# 4. Verify deployment
sudo bash ops/verify.sh --domain equiprofile.online
```

Your EquiProfile instance is now running at `https://equiprofile.online`!

---

## Detailed Installation

### Step 1: Database Setup

#### 1.1. Secure MySQL Installation

```bash
# Run security setup
sudo mysql_secure_installation
```

Follow prompts:
- Set root password: **Yes**
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

#### 1.2. Create Database and User

```bash
sudo mysql
```

```sql
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password';
CREATE USER 'equiprofile'@'127.0.0.1' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

> **Important**: Create users for BOTH `localhost` and `127.0.0.1` to avoid "Access denied" errors. Node.js may connect via TCP (`127.0.0.1`) even when using `localhost` in the connection string.

### Step 2: Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/equiprofile
cd /var/equiprofile

# Clone repository
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app
```

### Step 3: Pre-flight Checks

Run system validation before deploying:

```bash
bash ops/preflight.sh
```

This checks:
- ✅ OS version (Ubuntu 24.04 or 22.04)
- ✅ Node.js version (≥20.x)
- ✅ Port availability (3000, 80, 443)
- ✅ Disk space (≥5GB)
- ✅ RAM (≥2GB)
- ✅ nginx installed
- ✅ MySQL/MariaDB installed
- ✅ certbot installed

Fix any critical issues before proceeding.

### Step 4: Build Application

```bash
# Install dependencies
npm ci --production

# Build for production
npm run build
```

If build fails due to memory constraints:

```bash
# Create swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Build with increased memory
NODE_OPTIONS=--max_old_space_size=2048 npm run build
```

---

## Environment Configuration

### Create Environment File

```bash
# Copy example file
sudo cp .env.example .env
sudo nano .env
```

### Required Configuration

```bash
# Application
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
BASE_URL=https://equiprofile.online

# Database
DATABASE_URL=mysql://equiprofile:your_password@localhost:3306/equiprofile

# Security (MUST CHANGE!)
JWT_SECRET=<run: openssl rand -base64 32>
ADMIN_UNLOCK_PASSWORD=<secure-password>

# Feature Flags (default: false)
ENABLE_STRIPE=false
ENABLE_UPLOADS=false
ENABLE_FORGE=false
ENABLE_PWA=false

# PWA (keep disabled in production)
VITE_PWA_ENABLED=false
```

### Generate Secure Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

⚠️ **CRITICAL**: The application will refuse to start in production if you don't change JWT_SECRET and ADMIN_UNLOCK_PASSWORD from defaults!

### Optional Features

#### Email Notifications

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@equiprofile.online
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=EquiProfile <noreply@equiprofile.online>
```

#### Stripe Billing (if ENABLE_STRIPE=true)

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

#### File Uploads (if ENABLE_UPLOADS=true)

```bash
# Using Built-in Forge API
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# OR using AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=equiprofile-uploads
```

#### OAuth Integration

```bash
OAUTH_SERVER_URL=https://auth.example.com
APP_ID=equiprofile
APP_SECRET=<oauth-app-secret>
```

---

## Nginx Setup

### Automated Setup

The deployment script automatically configures Nginx. To do it manually:

### Manual Nginx Configuration

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/equiprofile
```

Paste the following configuration:

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name equiprofile.online www.equiprofile.online;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name equiprofile.online www.equiprofile.online;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static files - proper 404 handling
    location / {
        root /var/equiprofile/app/dist/public;
        try_files $uri $uri/ /index.html;
        
        # Cache control for index.html - always fresh
        location = /index.html {
            add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
            expires -1;
        }
        
        # Hashed assets - cache for 1 year (immutable)
        location ~* ^/assets/.*\.[a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            add_header Cache-Control "public, max-age=31536000, immutable" always;
            expires 1y;
        }
        
        # Service worker - always fresh (disabled by default)
        location = /service-worker.js {
            add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
            return 404;
        }
        
        # PWA manifest (disabled by default)
        location = /manifest.json {
            return 404;
        }
        
        # Theme override - short cache
        location = /theme-override.css {
            add_header Cache-Control "public, max-age=3600" always;
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Logs
    access_log /var/log/nginx/equiprofile-access.log;
    error_log /var/log/nginx/equiprofile-error.log;
}
```

### Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Nginx Management Commands

```bash
# Test configuration
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/equiprofile-access.log
sudo tail -f /var/log/nginx/equiprofile-error.log
```

---

## SSL Configuration

### Automated SSL with Certbot

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

Follow prompts:
1. Enter email address for urgent renewal notices
2. Agree to Let's Encrypt Terms of Service
3. Choose whether to redirect HTTP to HTTPS (recommended: **Yes**)

Certbot will:
- ✅ Obtain SSL certificate
- ✅ Configure Nginx for HTTPS
- ✅ Setup automatic renewal (via systemd timer)

### Verify SSL Status

```bash
# Check certificate status
sudo certbot certificates

# Test renewal process
sudo certbot renew --dry-run
```

### Manual Renewal

```bash
# Renew all certificates
sudo certbot renew

# Renew specific domain
sudo certbot certonly --nginx -d equiprofile.online -d www.equiprofile.online
```

### Auto-Renewal

Certbot automatically installs a systemd timer for renewal:

```bash
# Check timer status
sudo systemctl status certbot.timer

# View next renewal time
sudo certbot renew --dry-run
```

---

## Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Full deployment with SSL
sudo bash ops/deploy.sh --domain equiprofile.online

# Custom options
sudo bash ops/deploy.sh \
  --domain equiprofile.online \
  --root /var/equiprofile/app \
  --user www-data \
  --port 3000
```

**Command Options:**
- `--domain DOMAIN` - Your domain name (required for SSL)
- `--root PATH` - Installation directory (default: `/var/equiprofile/app`)
- `--user USER` - System user to run service (default: `www-data`)
- `--port PORT` - Backend port (default: `3000`)
- `--no-ssl` - Skip SSL setup (HTTP-only mode)
- `--resume` - Resume failed deployment

**What the script does:**
1. ✅ Validates Node.js and dependencies
2. ✅ Sets up deployment directory
3. ✅ Sets ownership and permissions
4. ✅ Stops old services and clears port conflicts
5. ✅ Installs dependencies (`npm ci`)
6. ✅ Builds application
7. ✅ Configures systemd service
8. ✅ Configures nginx with proper cache headers
9. ✅ Sets up log rotation
10. ✅ Starts service
11. ✅ Runs health checks
12. ✅ Configures SSL with Let's Encrypt

### Option 2: systemd Service

The deployment script creates a systemd service at `/etc/systemd/system/equiprofile.service`:

```ini
[Unit]
Description=EquiProfile Application
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/equiprofile/app
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security hardening
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
NoNewPrivileges=true
ReadWritePaths=/var/equiprofile/app

# Resource limits
LimitNOFILE=65536
LimitNPROC=512

# Environment
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/equiprofile/app/.env

[Install]
WantedBy=multi-user.target
```

#### systemd Management

```bash
# Start service
sudo systemctl start equiprofile

# Stop service
sudo systemctl stop equiprofile

# Restart service
sudo systemctl restart equiprofile

# Check status
sudo systemctl status equiprofile

# Enable auto-start on boot
sudo systemctl enable equiprofile

# View logs
sudo journalctl -u equiprofile -f

# View recent errors
sudo journalctl -u equiprofile -n 100 --no-pager
```

### Option 3: PM2 Process Manager

PM2 is an alternative to systemd with additional features like monitoring and clustering.

#### Install PM2

```bash
sudo npm install -g pm2
```

#### Deploy with PM2

```bash
cd /var/equiprofile/app

# Install and build
npm ci
npm run build

# Create log directory
sudo mkdir -p /var/log/equiprofile
sudo chown -R $USER:$USER /var/log/equiprofile

# Start with PM2 (reads ecosystem.config.js)
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save

# Generate startup script
pm2 startup
# Follow the instructions printed
```

#### PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs equiprofile
pm2 logs equiprofile --lines 100

# Restart
pm2 restart equiprofile

# Stop
pm2 stop equiprofile

# Delete from PM2
pm2 delete equiprofile

# Reload (zero-downtime restart)
pm2 reload equiprofile

# Monitor
pm2 monit
```

### Updating Application

```bash
cd /var/equiprofile/app

# Pull latest code
sudo git pull origin main

# Deploy latest version (systemd)
sudo bash ops/deploy.sh --domain equiprofile.online main

# Or for PM2
npm ci
npm run build
pm2 restart equiprofile

# Or deploy specific branch
sudo bash ops/deploy.sh --domain equiprofile.online develop
```

### Deployment Logs

All deployment logs are saved to `/var/equiprofile/_ops/deploy_YYYYMMDD_HHMMSS.log`

```bash
# View latest deployment log
ls -lt /var/equiprofile/_ops/deploy_*.log | head -1 | xargs cat

# Follow deployment in real-time
tail -f /var/equiprofile/_ops/deploy_*.log
```

### SSH-Disconnect-Safe Deployment

Run deployment that continues even if SSH disconnects:

```bash
# Option 1: Use screen
screen -S deploy
sudo bash ops/deploy.sh --domain equiprofile.online
# Press Ctrl+A then D to detach
# Reattach with: screen -r deploy

# Option 2: Use nohup
nohup sudo bash ops/deploy.sh --domain equiprofile.online > /tmp/deploy.log 2>&1 &
tail -f /tmp/deploy.log
```

---

## Verification

### Automated Verification

```bash
# Run full verification
sudo bash ops/verify.sh --domain equiprofile.online
```

Checks:
- ✅ Service status
- ✅ Health endpoints
- ✅ Frontend assets
- ✅ Nginx configuration
- ✅ Port bindings
- ✅ PWA blocking (service-worker.js and manifest.json return 404)
- ✅ Build SHA verification
- ✅ SSL/HTTPS status

### Manual Verification

```bash
# 1. Check service status (systemd)
systemctl status equiprofile

# Or for PM2
pm2 status

# 2. Check application logs
sudo journalctl -u equiprofile -n 50
# Or: pm2 logs equiprofile --lines 50

# 3. Check nginx logs
tail -f /var/log/nginx/equiprofile-error.log

# 4. Test health endpoints
curl http://127.0.0.1:3000/api/health
# Expected: {"status":"ok",...}

curl http://127.0.0.1:3000/api/ready
# Expected: {"status":"ready","database":"connected"}

curl https://equiprofile.online/api/health
curl https://equiprofile.online/api/ready

# 5. Check version/build info
curl http://127.0.0.1:3000/api/version

# 6. Verify PWA blocking
curl -I https://equiprofile.online/service-worker.js
# Expected: 404 Not Found

curl -I https://equiprofile.online/manifest.json
# Expected: 404 Not Found

# 7. Check listening ports
ss -tlnp | grep -E ':(80|443|3000)'

# 8. Verify SSL certificate
curl -I https://equiprofile.online | grep -i strict-transport
```

### Browser Verification

1. **Landing Page**: `https://equiprofile.online`
2. **Login Page**: `https://equiprofile.online/login`
3. **Register**: `https://equiprofile.online/register`
4. **Pricing**: `https://equiprofile.online/pricing`
5. **Contact**: Check footer shows: +44 7347 258089
6. **Email**: Verify support@equiprofile.online displayed
7. **Auth Pages**: Verify 50/50 split layout
8. **Overlays**: Check soft overlays (bg-black/20)

---

## Troubleshooting

### Pre-Deployment Issues

#### Node.js Version Too Old

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port
sudo bash ops/deploy.sh --domain equiprofile.online --port 3001
```

#### Insufficient Disk Space

```bash
# Check disk usage
df -h

# Clean up
sudo apt-get autoremove
sudo apt-get clean

# Remove old logs
sudo journalctl --vacuum-time=7d
```

### Build Issues

#### Out of Memory

```bash
# Create swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Build with increased memory
NODE_OPTIONS=--max_old_space_size=2048 npm run build
```

#### Dependency Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Check for syntax errors
npm run check

# View full error output
npm run build 2>&1 | tee build.log
```

### Runtime Issues

#### Service Won't Start

```bash
# Check logs
sudo journalctl -u equiprofile -n 100 --no-pager

# Check if port is in use
lsof -i :3000

# Verify environment file
sudo cat /var/equiprofile/app/.env | grep -v PASSWORD

# Try manual start for debugging
cd /var/equiprofile/app
sudo -u www-data node dist/index.js
```

#### Database Connection Issues

```bash
# Test MySQL connection
mysql -u equiprofile -p -e "SELECT 1;"

# Verify DATABASE_URL format
# mysql://username:password@localhost:3306/database_name

# Check MySQL is running
systemctl status mysql

# Test connection from app
cd /var/equiprofile/app
node -e "const mysql = require('mysql2'); const conn = mysql.createConnection(process.env.DATABASE_URL); conn.connect(err => { if(err) console.error(err); else console.log('OK'); conn.end(); });"
```

#### 502 Bad Gateway

```bash
# Check if service is running
sudo systemctl status equiprofile

# If not running, start it
sudo systemctl start equiprofile

# Check backend health
curl http://127.0.0.1:3000/api/health

# Check nginx proxy configuration
grep proxy_pass /etc/nginx/sites-available/equiprofile

# View backend logs
sudo journalctl -u equiprofile -n 100

# Check nginx error log
sudo tail -f /var/log/nginx/equiprofile-error.log
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Renew certificate
sudo certbot renew

# Re-run certbot
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online

# Check nginx configuration
sudo nginx -t
grep ssl_certificate /etc/nginx/sites-available/equiprofile
```

#### Old UI Still Showing (Cache Issues)

```bash
# 1. Verify PWA is blocked
curl -I https://equiprofile.online/service-worker.js
# Must return 404

# 2. Check nginx config
sudo cat /etc/nginx/sites-enabled/equiprofile | grep -A 2 "service-worker"

# 3. Verify index.html cache headers
curl -I https://equiprofile.online/ | grep Cache-Control
# Should show: no-store, no-cache, must-revalidate

# 4. Clear browser cache
# Users: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 5. Check build version
curl https://equiprofile.online/ | grep "assets/index-"
# Should show hashed assets like: /assets/index-abc123.js
```

#### Service Worker Issues

If service worker is causing problems:

```bash
# 1. Verify PWA is disabled
grep ENABLE_PWA /var/equiprofile/app/.env
# Should show: ENABLE_PWA=false

# 2. Rebuild without service worker
cd /var/equiprofile/app
sudo -u www-data ENABLE_PWA=false npm run build
sudo systemctl restart equiprofile

# 3. Users should unregister old service workers
# DevTools → Application → Service Workers → Unregister
# DevTools → Application → Clear Storage → Clear site data
```

#### Missing Static Files (404)

```bash
# Verify build output exists
ls -la /var/equiprofile/app/dist/public/
ls -la /var/equiprofile/app/dist/public/assets/

# Rebuild if needed
cd /var/equiprofile/app
sudo -u www-data npm run build
sudo systemctl restart equiprofile

# Check nginx root path
grep root /etc/nginx/sites-available/equiprofile
```

---

## Maintenance

### Regular Tasks

#### Daily
```bash
# Monitor application logs
journalctl -u equiprofile --since "1 hour ago"

# Check disk space
df -h

# Check memory usage
free -h
```

#### Weekly
```bash
# Review access logs
tail -100 /var/log/nginx/equiprofile-access.log

# Check for updates
cd /var/equiprofile/app
git fetch
git log HEAD..origin/main --oneline

# Check certificate expiry
sudo certbot certificates
```

#### Monthly
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /var/equiprofile/app
npm audit
npm update

# Rotate old deployment logs
find /var/equiprofile/_ops -name "deploy_*.log" -mtime +30 -delete

# Review and rotate application logs
sudo journalctl --vacuum-time=30d
```

### Backup

#### Database Backup

```bash
# MySQL backup
mysqldump -u equiprofile -p equiprofile > /backup/equiprofile_$(date +%Y%m%d).sql

# Automated backup script
sudo nano /usr/local/bin/backup-equiprofile.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/equiprofile"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u equiprofile -p'YOUR_PASSWORD' equiprofile | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads (if enabled)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/equiprofile/app uploads/ 2>/dev/null

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-equiprofile.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-equiprofile.sh") | crontab -
```

#### Restore Database

```bash
# Restore from backup
mysql -u equiprofile -p equiprofile < /backup/equiprofile_20260122.sql

# Or from gzipped backup
gunzip < /backup/equiprofile_20260122.sql.gz | mysql -u equiprofile -p equiprofile
```

#### Backup Environment File

```bash
# Backup .env file
sudo cp /var/equiprofile/app/.env /backup/.env_$(date +%Y%m%d)

# Secure the backup
sudo chmod 600 /backup/.env_*
```

### Monitoring

#### Real-time Monitoring

```bash
# Application health
watch -n 5 'curl -s http://127.0.0.1:3000/api/health | jq'

# Resource usage
htop

# PM2 monitoring
pm2 monit

# Nginx status
systemctl status nginx

# Application status
systemctl status equiprofile
```

#### Log Management

```bash
# View recent logs
journalctl -u equiprofile -n 50

# Follow logs in real-time
journalctl -u equiprofile -f

# View logs since specific time
journalctl -u equiprofile --since "2 hours ago"

# View logs by priority
journalctl -u equiprofile -p err

# Clear old logs
sudo journalctl --vacuum-time=7d
```

#### Performance Tuning

For high-traffic deployments:

**1. Increase Nginx worker processes:**
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
```

**2. Enable database connection pooling:**
```bash
# .env
DATABASE_POOL_SIZE=10
```

**3. Increase Node.js memory:**
```bash
# Edit /etc/systemd/system/equiprofile.service
Environment="NODE_OPTIONS=--max_old_space_size=4096"

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart equiprofile
```

**4. Setup PM2 log rotation:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Updates and Upgrades

#### Application Updates

```bash
# Pull latest code
cd /var/equiprofile/app
sudo git pull origin main

# Deploy update
sudo bash ops/deploy.sh --domain equiprofile.online --resume

# Or for PM2
npm ci
npm run build
pm2 restart equiprofile
```

#### System Updates

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

#### Node.js Updates

```bash
# Check current version
node --version

# Update to latest LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Rebuild application
cd /var/equiprofile/app
npm ci
npm run build
sudo systemctl restart equiprofile
```

---

## Security

### Security Best Practices

1. **Keep secrets secure**
   - Never commit `.env` to version control
   - Use strong, randomly generated passwords
   - Rotate credentials regularly

2. **Use strong passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   
   # Generate JWT secret
   openssl rand -hex 64
   ```

3. **Keep system updated**
   ```bash
   # Regular updates
   sudo apt update && sudo apt upgrade -y
   
   # Security updates only
   sudo apt-get update && sudo apt-get upgrade -y --only-upgrade
   ```

4. **Monitor logs for suspicious activity**
   ```bash
   # Check for failed login attempts
   journalctl -u equiprofile | grep -i "failed\|error\|unauthorized"
   
   # Monitor nginx access logs
   sudo tail -f /var/log/nginx/equiprofile-access.log
   ```

5. **Use HTTPS only**
   - Always run with valid SSL certificates
   - Enable HSTS headers
   - Redirect all HTTP to HTTPS

6. **Restrict database access**
   ```sql
   -- Database user should only access equiprofile DB
   REVOKE ALL PRIVILEGES ON *.* FROM 'equiprofile'@'localhost';
   GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
   FLUSH PRIVILEGES;
   ```

7. **Regular backups**
   - Automate database backups
   - Store backups off-server
   - Test restore procedures

8. **Configure firewall**
   ```bash
   # Install UFW
   sudo apt-get install -y ufw
   
   # Allow SSH, HTTP, HTTPS
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Enable firewall
   sudo ufw enable
   
   # Check status
   sudo ufw status
   ```

### SSH Hardening

```bash
# Disable password authentication (use SSH keys only)
sudo nano /etc/ssh/sshd_config
```

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

### Security Headers

Nginx configuration includes security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Application Security

- Admin access requires unlock password
- JWT tokens for authentication
- CSRF protection enabled
- SQL injection protection (parameterized queries)
- XSS protection (input sanitization)

---

## Support

### Documentation

- **GitHub**: [amarktainetwork-blip/Equiprofile.online](https://github.com/amarktainetwork-blip/Equiprofile.online)
- **Issues**: [GitHub Issues](https://github.com/amarktainetwork-blip/Equiprofile.online/issues)
- **Recovery Guide**: See `RECOVERY.md` in repository root

### Contact

- **Email**: support@equiprofile.online
- **Phone**: +44 7347 258089

### Getting Help

1. **Check logs first**
   ```bash
   sudo journalctl -u equiprofile -n 100 --no-pager
   ```

2. **Run verification**
   ```bash
   bash ops/verify.sh --domain equiprofile.online
   ```

3. **Open GitHub issue** with:
   - OS version: `lsb_release -a`
   - Node.js version: `node --version`
   - Error messages from logs
   - Steps to reproduce

### Useful Commands Reference

```bash
# Deployment
sudo bash ops/deploy.sh --domain equiprofile.online

# Verification
bash ops/verify.sh --domain equiprofile.online

# Pre-flight checks
bash ops/preflight.sh

# Service management (systemd)
sudo systemctl start|stop|restart|status equiprofile

# Service management (PM2)
pm2 start|stop|restart|status equiprofile

# View logs (systemd)
sudo journalctl -u equiprofile -f

# View logs (PM2)
pm2 logs equiprofile

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Database
mysql -u equiprofile -p equiprofile

# Health check
curl http://127.0.0.1:3000/api/health
```

---

## Advanced Configuration

### Custom Port

```bash
# Deploy on different port
sudo bash ops/deploy.sh --domain equiprofile.online --port 3001

# Update .env
sudo nano /var/equiprofile/app/.env
# Set PORT=3001
```

### Multiple Environments

```bash
# Production
sudo bash ops/deploy.sh \
  --domain equiprofile.online \
  --root /var/equiprofile/prod \
  main

# Staging
sudo bash ops/deploy.sh \
  --domain staging.equiprofile.online \
  --root /var/equiprofile/staging \
  --port 3001 \
  develop
```

### Resource Limits (systemd)

Edit systemd service to add resource limits:

```bash
sudo nano /etc/systemd/system/equiprofile.service
```

Add under `[Service]`:
```ini
LimitNOFILE=65536
LimitNPROC=512
MemoryMax=2G
CPUQuota=200%
```

Reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart equiprofile
```

### Log Rotation

Logs are automatically rotated at `/etc/logrotate.d/equiprofile`:

```
/var/log/equiprofile/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    postrotate
        systemctl reload equiprofile
    endscript
}
```

Test rotation:
```bash
# Test
sudo logrotate -d /etc/logrotate.d/equiprofile

# Force rotation
sudo logrotate -f /etc/logrotate.d/equiprofile
```

---

## Next Steps

After successful deployment:

1. ✅ Create admin account at `https://equiprofile.online/register`
2. ✅ Access admin panel using `showAdmin()` in browser console
3. ✅ Set up database backups
4. ✅ Configure email notifications (optional)
5. ✅ Enable billing if needed (ENABLE_STRIPE=true)
6. ✅ Customize branding with `/theme-override.css`
7. ✅ Set up monitoring and alerts
8. ✅ Review security checklist
9. ✅ Test all critical workflows
10. ✅ Document any custom configurations

---

**Congratulations! Your EquiProfile instance is now running in production.** 🎉

For ongoing maintenance and updates, refer to the [Maintenance](#maintenance) section of this guide.
