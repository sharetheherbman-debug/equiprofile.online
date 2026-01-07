# EquiProfile Deployment Guide

Complete deployment instructions for EquiProfile on a VPS (Virtual Private Server) or cloud infrastructure.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Process Management](#process-management)
9. [Deployment Script](#deployment-script)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying EquiProfile, ensure you have:

- **Server**: VPS or cloud instance running Ubuntu 20.04+ or Debian 11+
- **Domain**: Domain name pointed to your server's IP address
- **System Requirements**:
  - Node.js 18.x or higher
  - MySQL 8.0 or higher
  - Nginx
  - 2GB RAM minimum (4GB recommended)
  - 20GB storage minimum

---

## Frontend Deployment

### 1. Install Node.js and npm

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/equiprofile
sudo chown -R $USER:$USER /var/www/equiprofile

# Clone repository
cd /var/www/equiprofile
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git .
```

### 3. Configure Environment Variables

```bash
# Create environment file
cp client/.env.example client/.env

# Edit environment variables (optional - defaults work for production)
nano client/.env
```

**Client Environment Variables** (`client/.env`):

```env
# Stripe Public Key (if using Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# API Base URL (leave empty for same-origin requests)
VITE_API_BASE_URL=

# OAuth Configuration (if using external OAuth)
VITE_OAUTH_PORTAL_URL=
VITE_APP_ID=

# Analytics (Optional - won't break if missing)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Environment
VITE_ENV=production
```

### 4. Build Frontend

```bash
cd /var/www/equiprofile

# Install dependencies (use legacy-peer-deps to avoid conflicts)
npm install --legacy-peer-deps

# Build production assets
npm run build

# Verify build output
ls -la dist/public/
```

The build creates:
- `/var/www/equiprofile/dist/public/` - Frontend static files
- `/var/www/equiprofile/dist/index.js` - Backend server bundle

---

## Backend Deployment

### 1. Configure Server Environment

```bash
# Copy server environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Server Environment Variables** (`.env`):

```env
# Database Configuration
DATABASE_URL=mysql://equiprofile:YOUR_DB_PASSWORD@localhost:3306/equiprofile

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_JWT_SECRET_HERE

# Admin Configuration
ADMIN_UNLOCK_PASSWORD=CHANGE_THIS_IN_PRODUCTION

# Base URL
BASE_URL=https://equiprofile.online

# Port (optional, defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=production

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_xxxxx

# AWS S3 (if using for file storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=

# OAuth Portal (if using external auth)
OAUTH_PORTAL_URL=
APP_ID=
APP_SECRET=
```

⚠️ **Security Notes**:
- Always use strong, unique passwords and secrets
- Never commit `.env` files to version control
- Store backup copies of secrets securely

---

## Database Setup

### 1. Install MySQL

```bash
sudo apt update
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

### 2. Create Database and User

```bash
# Login to MySQL
sudo mysql

# Create database
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user with strong password
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';

# Grant privileges
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 3. Run Database Migrations

```bash
cd /var/www/equiprofile

# Run Drizzle migrations
npm run db:push
```

---

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Create Nginx Configuration

Create `/etc/nginx/sites-available/equiprofile`:

```bash
sudo nano /etc/nginx/sites-available/equiprofile
```

**Nginx Configuration**:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name equiprofile.online www.equiprofile.online;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name equiprofile.online www.equiprofile.online;

    # SSL Configuration (Let's Encrypt will add these)
    # ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;

    # Root directory for static files
    root /var/www/equiprofile/dist/public;
    index index.html;

    # Logging
    access_log /var/log/nginx/equiprofile_access.log;
    error_log /var/log/nginx/equiprofile_error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all other routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (this will automatically update your Nginx config)
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online

# Test automatic renewal
sudo certbot renew --dry-run
```

Certificates auto-renew. Verify by checking:

```bash
sudo systemctl status certbot.timer
```

---

## Process Management

Use systemd to manage the Node.js backend process.

### 1. Create systemd Service

Create `/etc/systemd/system/equiprofile.service`:

```bash
sudo nano /etc/systemd/system/equiprofile.service
```

**Service Configuration**:

```ini
[Unit]
Description=EquiProfile Backend Server
Documentation=https://github.com/amarktainetwork-blip/Equiprofile.online
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/equiprofile
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/equiprofile/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=equiprofile

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable equiprofile

# Start service
sudo systemctl start equiprofile

# Check status
sudo systemctl status equiprofile

# View logs
sudo journalctl -u equiprofile -f
```

### 3. Service Management Commands

```bash
# Start service
sudo systemctl start equiprofile

# Stop service
sudo systemctl stop equiprofile

# Restart service
sudo systemctl restart equiprofile

# View logs (follow mode)
sudo journalctl -u equiprofile -f

# View recent logs (last 50 lines)
sudo journalctl -u equiprofile -n 50

# Check service status
sudo systemctl status equiprofile
```

---

## Deployment Script

Create a deployment script for easy updates:

**`scripts/deploy.sh`**:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying EquiProfile..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd /var/www/equiprofile

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Build frontend and backend
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Copy built files
echo -e "${YELLOW}📋 Deploying frontend...${NC}"
sudo rm -rf /var/www/equiprofile/dist_backup
sudo mv /var/www/equiprofile/dist /var/www/equiprofile/dist_backup || true
sudo cp -r ./dist /var/www/equiprofile/
sudo chown -R www-data:www-data /var/www/equiprofile/dist

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run db:push

# Restart backend service
echo -e "${YELLOW}🔄 Restarting backend service...${NC}"
sudo systemctl restart equiprofile

# Reload Nginx
echo -e "${YELLOW}🌐 Reloading Nginx...${NC}"
sudo systemctl reload nginx

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 3
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Deployment complete! Application is running.${NC}"
else
    echo -e "${RED}❌ Warning: Health check failed. Check logs.${NC}"
    sudo journalctl -u equiprofile -n 20
fi

echo -e "${GREEN}🎉 Deployment finished!${NC}"
```

Make it executable:

```bash
chmod +x scripts/deploy.sh
```

Run deployment:

```bash
./scripts/deploy.sh
```

---

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Blank Page in Production

**Issue**: Application shows blank page

**Solutions**:

1. Check browser console for errors (F12)
2. Verify Nginx is serving files:
   ```bash
   ls -la /var/www/equiprofile/dist/public/
   ```
3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```
4. Verify environment variables are set correctly

### API Calls Fail (CORS/Network Errors)

**Issue**: API requests return 502 or CORS errors

**Solutions**:

1. Verify backend is running:
   ```bash
   sudo systemctl status equiprofile
   ```

2. Check backend logs:
   ```bash
   sudo journalctl -u equiprofile -n 50
   ```

3. Test API directly:
   ```bash
   curl http://localhost:3000/api/health
   ```

4. Verify Nginx proxy configuration is correct

### Database Connection Fails

**Issue**: Backend can't connect to database

**Solutions**:

1. Verify DATABASE_URL in `.env`
2. Check MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

3. Test connection manually:
   ```bash
   mysql -u equiprofile -p equiprofile
   ```

4. Check MySQL error logs:
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```

### Service Won't Start

**Issue**: systemd service fails to start

**Solutions**:

1. Check service logs:
   ```bash
   sudo journalctl -u equiprofile -n 50
   ```

2. Verify file permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/equiprofile
   ```

3. Test running manually:
   ```bash
   cd /var/www/equiprofile
   NODE_ENV=production node dist/index.js
   ```

### SSL Certificate Issues

**Issue**: SSL certificate warnings or errors

**Solutions**:

1. Verify certificate:
   ```bash
   sudo certbot certificates
   ```

2. Test renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

3. Check Nginx SSL configuration

### High Memory Usage

**Issue**: Server running out of memory

**Solutions**:

1. Check process memory:
   ```bash
   ps aux | grep node
   ```

2. Restart service to free memory:
   ```bash
   sudo systemctl restart equiprofile
   ```

3. Consider upgrading server or implementing memory limits in systemd service

---

## Monitoring and Maintenance

### Log Rotation

Ensure logs don't fill up disk:

```bash
# View current logs
sudo journalctl --disk-usage

# Clean old logs (keep last 7 days)
sudo journalctl --vacuum-time=7d
```

### Backups

**Database Backup Script** (`scripts/backup-db.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/equiprofile"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u equiprofile -p equiprofile > $BACKUP_DIR/equiprofile_$DATE.sql
gzip $BACKUP_DIR/equiprofile_$DATE.sql

# Keep last 7 days only
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/equiprofile_$DATE.sql.gz"
```

Set up daily backups with cron:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/equiprofile/scripts/backup-db.sh
```

### Security Updates

Keep system and dependencies updated:

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Node.js dependencies (review changes first)
npm outdated
npm update
```

---

## Support

For issues or questions:

- **GitHub**: https://github.com/amarktainetwork-blip/Equiprofile.online/issues
- **Email**: support@equiprofile.online
- **Documentation**: Check README.md in repository

---

**Last Updated**: January 2026
