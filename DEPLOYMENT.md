# EquiProfile Production Deployment Guide

Complete guide to deploying EquiProfile on Ubuntu 24.04 VPS (optimized for Webdock) with Nginx + systemd.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 24.04 LTS (or 22.04 LTS)
- **RAM**: 2GB minimum (4GB recommended for builds)
- **Disk**: 10GB available
- **CPU**: 1 core minimum (2 cores recommended)

### Software Requirements

- **Node.js**: v20.x or higher (LTS)
- **npm**: v10.x or higher
- **Nginx**: Latest stable
- **MySQL**: 8.0+ (or MariaDB 10.6+)
- **Certbot**: For SSL certificates
- **Git**: For deployment automation

### Domain Requirements

- Domain name pointing to your server IP
- DNS A records configured:
  - `equiprofile.online` → `your-server-ip`
  - `www.equiprofile.online` → `your-server-ip`

---

## Quick Start

Deploy EquiProfile in under 20 minutes on a fresh Webdock VPS:

```bash
# 1. Clone repository to deployment directory
sudo mkdir -p /var/equiprofile
cd /var/equiprofile
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app

# 2. Create environment file
sudo cp .env.example .env
sudo nano .env
# REQUIRED: Set these variables:
#   DATABASE_URL=mysql://user:password@localhost:3306/equiprofile
#   JWT_SECRET=<generate-random-64-char-string>
#   ADMIN_UNLOCK_PASSWORD=<secure-password>
#   BASE_URL=https://equiprofile.online

# 3. Run deployment script
sudo bash ops/deploy.sh --domain equiprofile.online

# 4. Verify deployment
sudo bash ops/verify.sh --domain equiprofile.online
```

Your EquiProfile instance is now running at `https://equiprofile.online`!

---

## Detailed Installation

### Step 1: Server Preparation

#### 1.1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2. Install Node.js 20.x LTS

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x or higher
npm --version   # Should be v10.x or higher
```

#### 1.3. Install Required Packages

```bash
sudo apt install -y nginx mysql-server git curl certbot python3-certbot-nginx
```

#### 1.4. Configure MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql
```

```sql
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Deploy Application

#### 2.1. Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/equiprofile
cd /var/equiprofile

# Clone repository
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app
```

#### 2.2. Configure Environment

```bash
# Copy example environment file
sudo cp .env.example .env

# Edit environment file
sudo nano .env
```

**Required environment variables:**

```bash
# Database
DATABASE_URL=mysql://equiprofile:your_password@localhost:3306/equiprofile

# Authentication
JWT_SECRET=<generate-with: openssl rand -hex 32>
ADMIN_UNLOCK_PASSWORD=<secure-password>

# Application
BASE_URL=https://equiprofile.online
NODE_ENV=production

# PWA (leave OFF for production)
VITE_PWA_ENABLED=false
ENABLE_PWA=false

# Optional: Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@equiprofile.online
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=EquiProfile <noreply@equiprofile.online>

# Optional: Stripe (for billing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: OAuth (for external auth)
OAUTH_SERVER_URL=https://auth.example.com
APP_ID=equiprofile
APP_SECRET=<oauth-app-secret>
```

#### 2.3. Run Deployment Script

```bash
# Full deployment with SSL
sudo bash ops/deploy.sh --domain equiprofile.online

# Or specify custom options
sudo bash ops/deploy.sh \
  --domain equiprofile.online \
  --root /var/equiprofile/app \
  --user www-data \
  --port 3000
```

The deployment script will:
1. ✓ Run pre-flight checks
2. ✓ Install Node.js and dependencies
3. ✓ Setup deployment directory
4. ✓ Set proper ownership
5. ✓ Stop old services
6. ✓ Install dependencies (npm ci)
7. ✓ Build application
8. ✓ Configure systemd service
9. ✓ Configure nginx with SSL
10. ✓ Setup log rotation
11. ✓ Start application
12. ✓ Run health checks

### Step 3: Verify Deployment

```bash
# Run verification script
sudo bash ops/verify.sh --domain equiprofile.online
```

Verification checks:
- ✓ Service status
- ✓ Health endpoints
- ✓ Frontend assets
- ✓ Nginx configuration
- ✓ Port bindings
- ✓ PWA blocking (service-worker.js and manifest.json return 404)
- ✓ Build SHA verification
- ✓ SSL/HTTPS status

---

## Deployment

### Updating to Latest Version

```bash
cd /var/equiprofile/app

# Deploy latest from main branch
sudo bash ops/deploy.sh --domain equiprofile.online main

# Or deploy from specific branch
sudo bash ops/deploy.sh --domain equiprofile.online develop
```

### Deployment Logs

All deployment logs are saved to `/var/equiprofile/_ops/deploy_YYYYMMDD_HHMMSS.log`

```bash
# View latest deployment log
ls -lt /var/equiprofile/_ops/deploy_*.log | head -1 | xargs cat

# Follow deployment in real-time (in another terminal)
tail -f /var/equiprofile/_ops/deploy_*.log
```

### SSH-Disconnect-Safe Deployment

To run deployment that continues even if SSH disconnects:

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

### Manual Verification Steps

```bash
# 1. Check service status
systemctl status equiprofile

# 2. Check application logs
journalctl -u equiprofile -f

# 3. Check nginx logs
tail -f /var/log/nginx/equiprofile-error.log

# 4. Test health endpoint
curl http://127.0.0.1:3000/api/health
curl https://equiprofile.online/api/health

# 5. Check version/build info
curl http://127.0.0.1:3000/api/version

# 6. Verify PWA blocking
curl -I https://equiprofile.online/service-worker.js  # Should return 404
curl -I https://equiprofile.online/manifest.json      # Should return 404

# 7. Check listening ports
ss -tlnp | grep -E ':(80|443|3000)'
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service logs
journalctl -u equiprofile -n 100 --no-pager

# Check if port is already in use
lsof -i :3000

# Verify environment file
sudo cat /var/equiprofile/app/.env | grep -v PASSWORD

# Try manual start for debugging
cd /var/equiprofile/app
sudo -u www-data node dist/index.js
```

### Build Fails

```bash
# Check Node.js version
node --version  # Must be v20.x or higher

# Clean rebuild
cd /var/equiprofile/app
sudo rm -rf dist node_modules
sudo -u www-data npm ci
sudo -u www-data npm run build

# Check for disk space
df -h

# Check for memory
free -h
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u equiprofile -p -e "SELECT 1;"

# Check DATABASE_URL format
# mysql://username:password@localhost:3306/database_name

# Verify MySQL is running
systemctl status mysql
```

### SSL/HTTPS Issues

```bash
# Check SSL certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test nginx configuration
sudo nginx -t

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### PWA Caching Issues

If users report seeing old versions:

```bash
# 1. Verify PWA is blocked at nginx level
curl -I https://equiprofile.online/service-worker.js
# Must return 404

# 2. Check nginx config
sudo cat /etc/nginx/sites-enabled/equiprofile | grep -A 2 "service-worker"

# 3. Verify index.html cache headers
curl -I https://equiprofile.online/ | grep Cache-Control
# Should show: no-store

# 4. Clear browser cache and hard refresh
# Users: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor application logs: `journalctl -u equiprofile --since "1 hour ago"`
- Check disk space: `df -h`

#### Weekly
- Review access logs: `tail -100 /var/log/nginx/equiprofile-access.log`
- Check for updates: `cd /var/equiprofile/app && git fetch`

#### Monthly
- Update system packages: `sudo apt update && sudo apt upgrade`
- Rotate old deployment logs: `find /var/equiprofile/_ops -name "deploy_*.log" -mtime +30 -delete`

### Backup

```bash
# Backup database
mysqldump -u equiprofile -p equiprofile > /backup/equiprofile_$(date +%Y%m%d).sql

# Backup environment file
sudo cp /var/equiprofile/app/.env /backup/.env_$(date +%Y%m%d)

# Backup uploaded files (if any)
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /var/equiprofile/app/uploads
```

### Monitoring

```bash
# Check application health
watch -n 5 'curl -s http://127.0.0.1:3000/api/health | jq'

# Monitor resource usage
htop

# Check nginx status
systemctl status nginx

# Check application status
systemctl status equiprofile
```

### Useful Commands

```bash
# Restart application
sudo systemctl restart equiprofile

# Reload nginx (without downtime)
sudo systemctl reload nginx

# View recent logs
journalctl -u equiprofile -n 50

# Follow logs in real-time
journalctl -u equiprofile -f

# Check deployed version
curl http://127.0.0.1:3000/api/version

# Run verification
sudo bash /var/equiprofile/app/ops/verify.sh --domain equiprofile.online
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
sudo bash ops/deploy.sh --domain equiprofile.online --root /var/equiprofile/prod main

# Staging
sudo bash ops/deploy.sh --domain staging.equiprofile.online --root /var/equiprofile/staging --port 3001 develop
```

### Resource Limits

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

Then reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart equiprofile
```

---

## Security Best Practices

1. **Keep secrets secure**: Never commit `.env` to version control
2. **Use strong passwords**: Generate with `openssl rand -hex 32`
3. **Keep system updated**: Regular `apt update && apt upgrade`
4. **Monitor logs**: Check for suspicious activity
5. **Use HTTPS only**: Always run with SSL certificates
6. **Restrict database access**: Database user should only access equiprofile DB
7. **Regular backups**: Automate database and config backups
8. **Firewall**: Use `ufw` to restrict ports
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/amarktainetwork-blip/Equiprofile.online/issues
- Documentation: See `docs/` directory
- Deployment Recovery: See `RECOVERY.md`

---

## License

MIT License - See LICENSE file for details

# Option 2: Use corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version  # Should be v10.x or higher
```

#### 1.4. Install Nginx

```bash
sudo apt-get install -y nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
nginx -v
```

#### 1.5. Install Certbot (for SSL)

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

#### 1.6. Install MySQL (Optional)

For production deployments, MySQL is recommended:

```bash
sudo apt-get install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql <<EOF
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EOF
```

For small deployments, SQLite works fine (no installation required).

### Step 2: Clone Repository

```bash
# Clone to home directory or /opt
cd /opt
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online
```

### Step 3: Configure Environment

#### 3.1. Create .env File

```bash
cp .env.example .env
nano .env
```

#### 3.2. Required Configuration

Update these critical values:

```env
# Application
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
BASE_URL=https://your-domain.com

# Database (choose one)
# MySQL:
DATABASE_URL=mysql://equiprofile:your_db_password@localhost:3306/equiprofile
# SQLite:
# DATABASE_URL=sqlite:./data/equiprofile.db

# Security (MUST CHANGE!)
JWT_SECRET=<run: openssl rand -base64 32>
ADMIN_UNLOCK_PASSWORD=<your_secure_admin_password>

# Feature flags
ENABLE_STRIPE=false    # Set to true only if you need billing
ENABLE_UPLOADS=false   # Set to true only if you need file uploads
ENABLE_PWA=false       # Set to true only if you want offline support
```

#### 3.3. Generate Secure Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

⚠️ **CRITICAL**: The application will refuse to start in production if you don't change JWT_SECRET and ADMIN_UNLOCK_PASSWORD from defaults!

#### 3.4. Optional Features

**Stripe Billing** (if ENABLE_STRIPE=true):
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx
```

**File Uploads** (if ENABLE_UPLOADS=true):
```env
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your_forge_api_key
# OR use AWS S3:
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=equiprofile-uploads
```

**Email Notifications** (optional):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@equiprofile.online
```

### Step 4: Run Pre-flight Checks

Before deploying, verify your system is ready:

```bash
bash ops/preflight.sh
```

This checks:
- ✅ OS version (Ubuntu 24.04 or 22.04)
- ✅ Node.js version (≥20.x)
- ✅ pnpm version (≥10.x)
- ✅ Port availability (3000, 80, 443)
- ✅ Disk space (≥5GB)
- ✅ RAM (≥2GB)
- ✅ nginx installed
- ✅ MySQL/MariaDB (optional)
- ✅ certbot installed

Fix any critical issues before proceeding.

### Step 5: Deploy

Run the automated deployment script:

```bash
sudo bash ops/deploy.sh \
  --domain your-domain.com \
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

1. ✅ Validates Node.js and pnpm
2. ✅ Sets up deployment directory
3. ✅ Sets ownership and permissions
4. ✅ Stops old services and clears port conflicts
5. ✅ Installs dependencies (`pnpm install --frozen-lockfile`)
6. ✅ Builds application (with memory-safe flags)
7. ✅ Configures systemd service
8. ✅ Configures nginx with proper cache headers
9. ✅ Sets up log rotation
10. ✅ Starts service
11. ✅ Runs health checks
12. ✅ Configures SSL with Let's Encrypt (if domain provided)

The deployment takes 5-10 minutes depending on server specs.

### Step 6: Verify Deployment

```bash
bash ops/verify.sh --domain your-domain.com
```

This checks:
- ✅ Only ONE service running (no duplicates)
- ✅ Health endpoints return 200
- ✅ Frontend serves hashed assets
- ✅ nginx listens on ports 80 and 443
- ✅ Service bound to correct port (no auto-switching)
- ✅ Service worker disabled by default

If all checks pass, you're done! 🎉

### Step 7: Access Your Application

Your EquiProfile instance is now available at:

- **HTTPS**: `https://your-domain.com`
- **API Health**: `https://your-domain.com/api/health`
- **Backend**: `http://127.0.0.1:3000` (local only)

---

## Configuration

### Nginx Configuration

The deployment automatically configures nginx at `/etc/nginx/sites-available/equiprofile`.

**Key features:**

- ✅ HTTP to HTTPS redirect
- ✅ SSL termination
- ✅ Static file serving with proper 404 handling
- ✅ API proxying to backend
- ✅ Correct cache headers:
  - `index.html`: no-cache (always fresh)
  - `/assets/*`: immutable, 1-year cache (hashed files)
  - `service-worker.js`: no-cache (force updates)
  - `/theme-override.css`: 1-hour cache
- ✅ Security headers
- ✅ WebSocket support

**Manual nginx commands:**

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/equiprofile-access.log
sudo tail -f /var/log/nginx/equiprofile-error.log
```

### Systemd Service

The service is installed at `/etc/systemd/system/equiprofile.service`.

**Service management:**

```bash
# Start service
sudo systemctl start equiprofile

# Stop service
sudo systemctl stop equiprofile

# Restart service
sudo systemctl restart equiprofile

# Check status
sudo systemctl status equiprofile

# View logs
sudo journalctl -u equiprofile -f

# View recent errors
sudo journalctl -u equiprofile -n 100 --no-pager
```

**Service features:**

- ✅ Runs as non-root user (www-data)
- ✅ Auto-restart on failure
- ✅ Logs to journald
- ✅ Security hardening (PrivateTmp, ProtectSystem, etc.)
- ✅ Resource limits

### Log Rotation

Logs are automatically rotated at `/etc/logrotate.d/equiprofile`:

- Rotated daily
- Keep 14 days of logs
- Compressed after rotation
- Reload service after rotation

**Manual log rotation:**

```bash
# Test rotation
sudo logrotate -d /etc/logrotate.d/equiprofile

# Force rotation
sudo logrotate -f /etc/logrotate.d/equiprofile
```

---

## Troubleshooting

### Deployment Issues

#### Pre-flight Checks Fail

**Problem**: `ops/preflight.sh` reports errors

**Solutions**:

1. **Node.js version too old**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **pnpm not installed**:
   ```bash
   npm install -g pnpm@latest
   ```

3. **Port already in use**:
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   sudo kill -9 <PID>
   
   # Or change port
   sudo bash ops/deploy.sh --domain your-domain.com --port 3001
   ```

4. **Insufficient disk space**:
   ```bash
   # Check disk usage
   df -h
   
   # Clean up if needed
   sudo apt-get autoremove
   sudo apt-get clean
   ```

#### Build Fails

**Problem**: Build fails during `pnpm build`

**Solutions**:

1. **Out of memory**:
   ```bash
   # The deploy script already sets NODE_OPTIONS=--max_old_space_size=2048
   # If still failing, increase swap:
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Dependency errors**:
   ```bash
   # Clean install
   rm -rf node_modules
   pnpm install --frozen-lockfile
   ```

3. **TypeScript errors**:
   ```bash
   # Check for syntax errors
   pnpm check
   ```

#### Service Won't Start

**Problem**: `systemctl start equiprofile` fails

**Solutions**:

1. **Check logs**:
   ```bash
   sudo journalctl -u equiprofile -n 50 --no-pager
   ```

2. **Port conflict**:
   ```bash
   # Application now fails clearly if port is in use (no auto-switching)
   lsof -i :3000
   sudo systemctl stop equiprofile
   sudo systemctl start equiprofile
   ```

3. **Environment variables**:
   ```bash
   # Verify .env file exists
   ls -la /var/equiprofile/app/.env
   
   # Check critical variables
   grep JWT_SECRET /var/equiprofile/app/.env
   grep DATABASE_URL /var/equiprofile/app/.env
   ```

4. **Database connection**:
   ```bash
   # Test MySQL connection
   mysql -u equiprofile -p equiprofile
   
   # Or check SQLite database
   ls -la /var/equiprofile/app/data/equiprofile.db
   ```

### Runtime Issues

#### 502 Bad Gateway

**Problem**: Nginx returns 502 error

**Solutions**:

1. **Check if service is running**:
   ```bash
   sudo systemctl status equiprofile
   
   # If not running
   sudo systemctl start equiprofile
   ```

2. **Check backend health**:
   ```bash
   curl http://127.0.0.1:3000/api/health
   ```

3. **Check nginx proxy configuration**:
   ```bash
   # Verify proxy_pass points to correct port
   grep proxy_pass /etc/nginx/sites-available/equiprofile
   ```

4. **View backend logs**:
   ```bash
   sudo journalctl -u equiprofile -n 100
   ```

#### SSL Certificate Issues

**Problem**: SSL certificate errors or HTTPS not working

**Solutions**:

1. **Check certificate status**:
   ```bash
   sudo certbot certificates
   ```

2. **Renew certificate**:
   ```bash
   sudo certbot renew --dry-run  # Test
   sudo certbot renew             # Actually renew
   ```

3. **Re-run certbot**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

4. **Check nginx configuration**:
   ```bash
   sudo nginx -t
   grep ssl_certificate /etc/nginx/sites-available/equiprofile
   ```

#### Old UI Still Showing

**Problem**: Users see old design after deployment

**Solutions**:

1. **Clear service worker** (if PWA was previously enabled):
   ```bash
   # In browser DevTools (F12):
   # Application → Service Workers → Unregister
   # Application → Clear Storage → Clear site data
   # Hard refresh: Ctrl+Shift+R
   ```

2. **Verify cache headers**:
   ```bash
   curl -I https://your-domain.com/
   # Should show: Cache-Control: no-store, no-cache, must-revalidate
   ```

3. **Check build version**:
   ```bash
   curl https://your-domain.com/ | grep "assets/index-"
   # Should show hashed assets like: /assets/index-abc123.js
   ```

#### Missing Static Files (404)

**Problem**: CSS/JS files return 404

**This is correct behavior!** The nginx configuration now properly returns 404 for missing static files instead of serving HTML with 200 status.

If legitimate files are missing:

1. **Verify build output**:
   ```bash
   ls -la /var/equiprofile/app/dist/public/
   ls -la /var/equiprofile/app/dist/public/assets/
   ```

2. **Rebuild if needed**:
   ```bash
   cd /var/equiprofile/app
   sudo -u www-data pnpm build
   sudo systemctl restart equiprofile
   ```

#### Service Worker Issues

**Problem**: Service worker causing issues

By default, service worker is **disabled**. If you previously had PWA enabled:

1. **Verify PWA is disabled**:
   ```bash
   grep ENABLE_PWA /var/equiprofile/app/.env
   # Should show: ENABLE_PWA=false or be commented out
   ```

2. **Rebuild without service worker**:
   ```bash
   cd /var/equiprofile/app
   sudo -u www-data ENABLE_PWA=false pnpm build
   sudo systemctl restart equiprofile
   ```

3. **Users should unregister old service workers**:
   - DevTools → Application → Service Workers → Unregister

### Health Check Commands

Use these commands to verify system health:

```bash
# Check all services
bash ops/healthcheck.sh --domain your-domain.com

# Run full verification
bash ops/verify.sh --domain your-domain.com

# Manual health checks
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/health/ping
curl https://your-domain.com/api/health

# Check logs
sudo journalctl -u equiprofile -n 50
sudo tail -f /var/log/nginx/equiprofile-error.log
```

---

## Maintenance

### Updating Application

To update to a new version:

```bash
cd /opt/Equiprofile.online
sudo git pull origin main
sudo bash ops/deploy.sh --domain your-domain.com --resume
```

The `--resume` flag safely updates without re-running SSL setup.

### Database Backups

**For MySQL**:

```bash
# Backup
mysqldump -u equiprofile -p equiprofile > backup-$(date +%Y%m%d).sql

# Restore
mysql -u equiprofile -p equiprofile < backup-20260109.sql
```

**For SQLite**:

```bash
# Backup
cp /var/equiprofile/app/data/equiprofile.db backup-$(date +%Y%m%d).db

# Restore
cp backup-20260109.db /var/equiprofile/app/data/equiprofile.db
sudo systemctl restart equiprofile
```

### Log Management

```bash
# View recent logs
sudo journalctl -u equiprofile -n 100

# Follow logs in real-time
sudo journalctl -u equiprofile -f

# View nginx access logs
sudo tail -f /var/log/nginx/equiprofile-access.log

# View nginx error logs
sudo tail -f /var/log/nginx/equiprofile-error.log

# Clear old logs manually
sudo journalctl --vacuum-time=7d
```

### Performance Tuning

**For high-traffic deployments**:

1. **Increase worker processes** in nginx:
   ```nginx
   # /etc/nginx/nginx.conf
   worker_processes auto;
   worker_connections 1024;
   ```

2. **Enable connection pooling** for MySQL:
   ```env
   # .env
   DATABASE_POOL_SIZE=10
   ```

3. **Increase Node.js memory**:
   ```bash
   # Edit /etc/systemd/system/equiprofile.service
   Environment="NODE_OPTIONS=--max_old_space_size=4096"
   sudo systemctl daemon-reload
   sudo systemctl restart equiprofile
   ```

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /var/equiprofile/app
pnpm update
pnpm audit

# Rebuild after updates
sudo bash ops/deploy.sh --domain your-domain.com --resume
```

### Monitoring

Set up basic monitoring:

```bash
# Install monitoring tools
sudo apt-get install -y htop iotop nethogs

# Monitor resources
htop

# Check disk usage
df -h

# Check memory
free -h

# Check network
sudo nethogs

# Set up automated monitoring (optional)
# Consider: Prometheus, Grafana, or Datadog
```

---

## Support

### Documentation

- **GitHub Repository**: [amarktainetwork-blip/Equiprofile.online](https://github.com/amarktainetwork-blip/Equiprofile.online)
- **Issues**: [GitHub Issues](https://github.com/amarktainetwork-blip/Equiprofile.online/issues)
- **README**: Project root README.md

### Getting Help

1. **Check logs first**:
   ```bash
   sudo journalctl -u equiprofile -n 100
   ```

2. **Run verification**:
   ```bash
   bash ops/verify.sh --domain your-domain.com
   ```

3. **Open an issue** on GitHub with:
   - OS version
   - Node.js version
   - Error messages from logs
   - Steps to reproduce

### Common Commands Reference

```bash
# Deployment
sudo bash ops/deploy.sh --domain your-domain.com

# Verification
bash ops/verify.sh --domain your-domain.com

# Health checks
bash ops/healthcheck.sh --domain your-domain.com

# Service management
sudo systemctl start|stop|restart|status equiprofile

# View logs
sudo journalctl -u equiprofile -f

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Database
mysql -u equiprofile -p equiprofile  # MySQL
sqlite3 /var/equiprofile/app/data/equiprofile.db  # SQLite
```

---

## Next Steps

After successful deployment:

1. ✅ Create admin account at `https://your-domain.com/register`
2. ✅ Set up database backups
3. ✅ Configure email notifications (optional)
4. ✅ Enable billing if needed (ENABLE_STRIPE=true)
5. ✅ Customize branding with `/theme-override.css`
6. ✅ Set up monitoring and alerts
7. ✅ Review security checklist in README.md

---

**Congratulations! Your EquiProfile instance is now running in production.** 🎉
