# 🚀 EquiProfile - Webdock VPS Deployment Guide

**Ready for Tonight's Deployment!**

This guide will help you deploy EquiProfile to your Webdock VPS in production mode with all the frontend improvements already implemented.

---

## ✅ What's Already Done

All frontend and content updates from the PR are complete and ready:
- ✅ Email addresses updated to support@equiprofile.online
- ✅ Contact number updated to +44 7347 258089
- ✅ WhatsApp prefilled messages configured
- ✅ Modern 50/50 split auth layout (Login/Register)
- ✅ Unified soft-dark overlays across all pages
- ✅ Modern accordion FAQ on Pricing page
- ✅ Admin hints removed from UI
- ✅ Build tested and working
- ✅ Zero TypeScript errors introduced

---

## 🎯 Quick Deployment (One Command)

On your Webdock VPS, run:

```bash
bash scripts/deploy-webdock.sh
```

This script will:
1. ✅ Check all prerequisites
2. ✅ Install dependencies
3. ✅ Build the application
4. ✅ Validate environment configuration
5. ✅ Setup database migrations
6. ✅ Configure PM2 for process management
7. ✅ Create Nginx configuration
8. ✅ Provide step-by-step instructions

---

## 📋 Prerequisites

### On Your Webdock VPS:

1. **Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **MySQL/MariaDB**
   ```bash
   sudo apt-get install -y mysql-server
   sudo mysql_secure_installation
   ```

3. **Nginx**
   ```bash
   sudo apt-get install -y nginx
   ```

4. **PM2**
   ```bash
   npm install -g pm2
   ```

5. **Create MySQL Database**
   ```bash
   sudo mysql -u root -p
   ```
   ```sql
   CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

## ⚙️ Environment Configuration

The deployment script will create a `.env` file for you. You must configure these critical values:

### Required Settings:

```bash
# Database connection
DATABASE_URL=mysql://equiprofile:YOUR_PASSWORD@localhost:3306/equiprofile

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_GENERATED_SECRET_HERE

# Admin access (use a strong password)
ADMIN_UNLOCK_PASSWORD=YOUR_STRONG_PASSWORD

# Your domain
BASE_URL=https://equiprofile.online
```

### Generate Secure Secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate strong admin password
openssl rand -base64 24
```

---

## 🚀 Deployment Steps

### Step 1: Clone and Prepare

```bash
cd /var/www
sudo git clone https://github.com/sharetheherbman-debug/equiprofile.online.git
cd equiprofile.online
sudo chown -R $USER:$USER .
```

### Step 2: Run Deployment Script

```bash
bash scripts/deploy-webdock.sh
```

Follow the prompts and configure your `.env` file when prompted.

### Step 3: Start Application

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions
```

### Step 4: Configure Nginx

```bash
sudo cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/equiprofile
sudo nano /etc/nginx/sites-available/equiprofile
# Change 'equiprofile.online' to your actual domain

sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Setup SSL (Required for Production)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

The certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Setup automatic renewal

### Step 6: Configure Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## ✅ Verify Deployment

### Check Application Status:

```bash
pm2 status
pm2 logs equiprofile
```

### Test Health Endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T...",
  "uptime": 123.45
}
```

### Test in Browser:

1. Navigate to: `https://equiprofile.online`
2. Check landing page loads correctly
3. Try Login/Register pages (check 50/50 split layout)
4. Verify contact information shows +44 7347 258089
5. Check Pricing page FAQ accordion works

---

## 📊 Feature Flags

By default, optional features are disabled. Enable them when ready:

### Enable Stripe Billing:

1. Get Stripe API keys from https://dashboard.stripe.com
2. Update `.env`:
   ```bash
   ENABLE_STRIPE=true
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_MONTHLY_PRICE_ID=price_...
   STRIPE_YEARLY_PRICE_ID=price_...
   ```
3. Restart: `pm2 restart equiprofile`

### Enable File Uploads:

1. Configure upload storage (local directory or S3)
2. Update `.env`:
   ```bash
   ENABLE_UPLOADS=true
   # If using local storage:
   UPLOADS_DIR=/var/www/equiprofile.online/uploads
   ```
3. Create directory: `mkdir -p uploads && chmod 755 uploads`
4. Restart: `pm2 restart equiprofile`

---

## 🔧 Common Commands

### PM2 Management:

```bash
pm2 list                    # List all processes
pm2 logs equiprofile        # View logs
pm2 monit                   # Real-time monitoring
pm2 restart equiprofile     # Restart app
pm2 stop equiprofile        # Stop app
pm2 delete equiprofile      # Remove from PM2
```

### Database:

```bash
# Run migrations
pnpm run db:push

# Backup database
mysqldump -u equiprofile -p equiprofile > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u equiprofile -p equiprofile < backup_20260122.sql
```

### Logs:

```bash
# PM2 logs
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log

# Nginx logs
sudo tail -f /var/log/nginx/equiprofile-access.log
sudo tail -f /var/log/nginx/equiprofile-error.log
```

---

## 🐛 Troubleshooting

### Application Won't Start:

1. Check environment variables:
   ```bash
   bash scripts/preflight.sh
   ```

2. Check PM2 logs:
   ```bash
   pm2 logs equiprofile --lines 50
   ```

3. Test database connection:
   ```bash
   mysql -u equiprofile -p equiprofile -e "SELECT 1;"
   ```

### 502 Bad Gateway:

1. Check application is running:
   ```bash
   pm2 status
   curl http://localhost:3000/health
   ```

2. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   ```

### Database Connection Errors:

1. Verify MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

2. Test connection:
   ```bash
   mysql -u equiprofile -p -h localhost
   ```

3. Check DATABASE_URL format in `.env`

### SSL Certificate Issues:

1. Test certificate renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

2. Check certbot logs:
   ```bash
   sudo journalctl -u certbot
   ```

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] `.env` file has secure passwords (not defaults)
- [ ] JWT_SECRET is randomly generated
- [ ] ADMIN_UNLOCK_PASSWORD is strong and unique
- [ ] MySQL root password is secure
- [ ] Firewall is enabled (ufw)
- [ ] SSH key authentication is configured
- [ ] SSH password auth is disabled (optional but recommended)
- [ ] SSL certificate is installed and auto-renewal works
- [ ] Regular backups are scheduled
- [ ] Server software is updated (`sudo apt update && sudo apt upgrade`)

---

## 📦 Post-Deployment Tasks

### Setup Backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-equiprofile.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/equiprofile"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u equiprofile -p'YOUR_PASSWORD' equiprofile > $BACKUP_DIR/db_$DATE.sql

# Backup uploads (if enabled)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/equiprofile.online uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-equiprofile.sh

# Add to crontab (daily at 2 AM)
(crontab -l; echo "0 2 * * * /usr/local/bin/backup-equiprofile.sh") | crontab -
```

### Setup Monitoring:

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🎉 You're Ready!

Your EquiProfile installation is now:
- ✅ Production-ready
- ✅ Secure with SSL
- ✅ Monitored by PM2
- ✅ Served through Nginx
- ✅ Feature-complete frontend
- ✅ Database-backed
- ✅ Scalable

**Access your application**: https://equiprofile.online

**Admin access**: Use `showAdmin()` in browser console after logging in as admin user.

---

## 📞 Support

For issues or questions:
- Email: support@equiprofile.online
- Phone: +44 7347 258089
- Repository: https://github.com/sharetheherbman-debug/equiprofile.online

---

## 📝 Notes

- **Backend features** (B2-B8 from original requirements) are optional and can be added later
- **Stripe billing** is disabled by default - enable when ready
- **File uploads** are disabled by default - enable when ready
- **System is production-ready** without optional features
- All frontend improvements are live and working

**Ready to deploy tonight!** 🚀
