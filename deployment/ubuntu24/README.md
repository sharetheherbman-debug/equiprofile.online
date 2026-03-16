# EquiProfile Ubuntu 24.04 Deployment Guide

Complete guide for deploying EquiProfile on a fresh Ubuntu 24.04 VPS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Installation](#quick-installation)
- [Environment Variables](#environment-variables)
- [SSL Setup](#ssl-setup)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Prerequisites

Before installing EquiProfile, ensure your VPS meets these requirements:

### System Requirements

- **OS**: Ubuntu 24.04 LTS (fresh installation recommended)
- **RAM**: Minimum 1GB, recommended 2GB+
- **Disk**: Minimum 10GB free space
- **CPU**: 1 core minimum, 2+ cores recommended
- **Network**: Public IP address and domain name (for production)

### Access Requirements

- Root or sudo access to the server
- SSH access to the server
- Domain name pointing to server IP (optional for initial setup)

### Firewall Ports

Ensure these ports are open:

- **22**: SSH (for management)
- **80**: HTTP (for web traffic)
- **443**: HTTPS (for SSL/TLS)

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Quick Installation

### Step 1: Connect to Your VPS

```bash
ssh root@your-server-ip
```

### Step 2: Download Installation Script

```bash
# Clone the repository
git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
cd Equiprofile.online/deployment/ubuntu24

# Make scripts executable
chmod +x install.sh uninstall.sh
```

### Step 3: Run Installation

```bash
sudo ./install.sh
```

The script will:

1. ✅ Install Node.js LTS, pnpm, and nginx
2. ✅ Create system user 'equiprofile'
3. ✅ Setup application directory
4. ✅ Copy application files
5. ✅ Prompt for environment configuration
6. ✅ Install dependencies and build
7. ✅ Install systemd service
8. ✅ Configure nginx
9. ✅ Verify installation

**Note**: The script will pause at Step 5 to allow you to configure `.env` file. See [Environment Variables](#environment-variables) section below.

### Step 4: Verify Installation

```bash
# Check service status
systemctl status equiprofile

# Check application logs
journalctl -u equiprofile -n 50

# Test health endpoint
curl http://localhost:3000/healthz

# Test in browser
curl http://your-server-ip
```

---

## Environment Variables

When the installation script pauses, you'll need to configure `/var/equiprofile/app/.env`.

### Required Variables (Core)

These **must** be configured for the application to start:

```bash
# Database Connection
DATABASE_URL=mysql://username:password@localhost:3306/equiprofile

# Security - CRITICAL: Generate secure values!
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_UNLOCK_PASSWORD=your_secure_admin_password_here

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
```

#### Generating Secure Secrets

```bash
# Generate JWT secret (copy output to .env)
openssl rand -base64 32

# Generate strong password
openssl rand -base64 24
```

### Optional Features

Enable these features by setting environment variables:

#### Stripe Payments (Optional)

```bash
ENABLE_STRIPE=true
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx
```

Get credentials from: https://dashboard.stripe.com/apikeys

#### File Uploads (Optional)

```bash
ENABLE_UPLOADS=true
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

#### OAuth Login (Optional)

```bash
OAUTH_SERVER_URL=https://oauth.example.com
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=admin_user_openid
```

#### PWA Service Worker (Optional)

```bash
VITE_PWA_ENABLED=false  # Set to 'true' to enable
```

### Configuration Example

```bash
# Edit environment file
nano /var/equiprofile/app/.env

# Minimal production configuration:
NODE_ENV=production
PORT=3000
BASE_URL=https://equiprofile.example.com
DATABASE_URL=mysql://equiprofile:SecurePass123@localhost:3306/equiprofile
JWT_SECRET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
ADMIN_UNLOCK_PASSWORD=MySecureAdminPassword2024!
ENABLE_STRIPE=false
ENABLE_UPLOADS=false
VITE_PWA_ENABLED=false
```

### After Configuring .env

```bash
# Restart application to apply changes
systemctl restart equiprofile

# Verify it started successfully
systemctl status equiprofile
```

---

## SSL Setup

Enable HTTPS with Let's Encrypt (free SSL certificates):

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:

- Enter email address (for renewal notifications)
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: yes)

### Step 3: Verify SSL

```bash
# Test your SSL setup
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

### Step 4: Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

SSL certificates will auto-renew before expiration.

---

## Troubleshooting

### Installation Issues

#### Script fails with "Permission denied"

```bash
# Ensure script is executable
chmod +x install.sh
sudo ./install.sh
```

#### "Node.js not found" after installation

```bash
# Verify Node.js installation
node --version
npm --version

# If not found, install manually:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs
```

#### Build fails with "pnpm command not found"

```bash
# Install pnpm globally
npm install -g pnpm
```

### Runtime Issues

#### Service won't start

```bash
# Check service logs
journalctl -u equiprofile -n 100

# Common issues:
# 1. Check .env file exists and is configured
ls -la /var/equiprofile/app/.env

# 2. Check database connection
mysql -u username -p -h localhost database_name

# 3. Check port not already in use
lsof -i :3000
```

#### Application returns 502 Bad Gateway

```bash
# Check if service is running
systemctl status equiprofile

# Check nginx logs
tail -f /var/log/nginx/error.log

# Restart services
systemctl restart equiprofile
systemctl restart nginx
```

#### Database connection fails

```bash
# Verify MySQL is running
systemctl status mysql

# Create database if missing
mysql -u root -p
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

#### "JWT_SECRET is still set to default value" error

```bash
# Generate new secret
openssl rand -base64 32

# Update .env
nano /var/equiprofile/app/.env
# Set JWT_SECRET=<generated value>

# Restart
systemctl restart equiprofile
```

### Performance Issues

#### High memory usage

```bash
# Check memory usage
free -m
pm2 monit  # If using PM2

# Increase Node.js memory limit in service file
sudo nano /etc/systemd/system/equiprofile.service
# Add: Environment=NODE_OPTIONS="--max-old-space-size=2048"
sudo systemctl daemon-reload
sudo systemctl restart equiprofile
```

#### Slow page loads

```bash
# Enable Gzip compression in nginx
sudo nano /etc/nginx/nginx.conf
# Uncomment: gzip on;

# Enable proxy caching
# Add to nginx site config:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
```

### Checking Logs

```bash
# Application logs
journalctl -u equiprofile -f

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# Installation log
cat /var/log/equiprofile-install.log
```

---

## Maintenance

### Service Management

```bash
# Check status
systemctl status equiprofile

# Start service
systemctl start equiprofile

# Stop service
systemctl stop equiprofile

# Restart service
systemctl restart equiprofile

# View logs
journalctl -u equiprofile -f

# View last 100 lines
journalctl -u equiprofile -n 100
```

### Updating Application

```bash
# Navigate to application directory
cd /var/equiprofile/app

# Pull latest changes
sudo -u www-data git pull

# Install dependencies
sudo -u www-data pnpm install --frozen-lockfile

# Rebuild
sudo -u www-data pnpm build

# Restart service
systemctl restart equiprofile
```

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-equiprofile << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/equiprofile"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u username -p'password' equiprofile > $BACKUP_DIR/db-$DATE.sql
gzip $BACKUP_DIR/db-$DATE.sql

# Backup uploads (if enabled)
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz /var/equiprofile/app/uploads 2>/dev/null

# Keep last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-equiprofile

# Schedule daily backup (run at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-equiprofile
```

### Monitoring

```bash
# Check disk space
df -h

# Check memory
free -m

# Check CPU usage
top

# Check service uptime
systemctl status equiprofile | grep Active
```

### Uninstalling

To completely remove EquiProfile:

```bash
cd /path/to/Equiprofile.online/deployment/ubuntu24
sudo ./uninstall.sh
```

This will:

- Stop and remove the service
- Remove nginx configuration
- Delete application directory
- Preserve SSL certificates

---

## Advanced Configuration

### Custom Port

```bash
# Edit .env
nano /var/equiprofile/app/.env
# Change: PORT=3001

# Update nginx config
sudo nano /etc/nginx/sites-available/equiprofile
# Update proxy_pass port

# Restart services
systemctl restart equiprofile
systemctl reload nginx
```

### Multiple Domains

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/equiprofile
# Add domains: server_name domain1.com domain2.com;

# Get SSL for both
sudo certbot --nginx -d domain1.com -d domain2.com

# Reload nginx
systemctl reload nginx
```

### Behind Load Balancer

```bash
# Edit .env
COOKIE_SECURE=true
COOKIE_DOMAIN=.yourdomain.com

# Ensure trust proxy is enabled (already set in code)
```

---

## Getting Help

- **GitHub Issues**: https://github.com/amarktainetwork-blip/Equiprofile.online/issues
- **Documentation**: https://github.com/amarktainetwork-blip/Equiprofile.online
- **Email**: support@equiprofile.online

---

## Security Checklist

Before going to production:

- [ ] Changed `JWT_SECRET` from default
- [ ] Changed `ADMIN_UNLOCK_PASSWORD` from default
- [ ] Configured SSL/HTTPS with Let's Encrypt
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] Database uses strong password
- [ ] Regular backups scheduled
- [ ] `NODE_ENV=production` in .env
- [ ] Security updates enabled: `sudo apt install unattended-upgrades`

---

**Last Updated**: January 2026  
**Version**: 2.0.0
