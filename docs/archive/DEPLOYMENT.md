# EquiProfile Production Deployment Guide

## Overview

This guide covers deploying EquiProfile as a production-ready SaaS application with:
- **Email/Password Authentication** (with OAuth fallback)
- **7-Day Trial with Hard Paywall Enforcement**
- **Stripe Billing Integration** (monthly/yearly plans)
- **Gmail SMTP Transactional Emails**
- **Nginx Static File Serving**

---

## Prerequisites

- [ ] Node.js 22+ and pnpm installed
- [ ] MySQL 8.0+ database
- [ ] Domain name with DNS configured
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Server with minimum 2GB RAM
- [ ] Stripe account (for billing)
- [ ] Gmail account with App Password (for emails)

---

## Environment Variables

### Required Core Variables

Create a `.env` file in the project root:

```env
# ==========================================
# CORE CONFIGURATION (Always Required)
# ==========================================

# Database
DATABASE_URL=mysql://equiprofile:secure_password@localhost:3306/equiprofile

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Admin Unlock Password (MUST be changed from default!)
ADMIN_UNLOCK_PASSWORD=your_secure_admin_password

# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://equiprofile.online

# Owner Configuration (for admin access)
OWNER_OPEN_ID=your_owner_openid_if_using_oauth

# ==========================================
# FEATURE FLAGS
# ==========================================

# Enable Stripe billing (true/false)
ENABLE_STRIPE=true

# Enable document uploads (true/false)
ENABLE_UPLOADS=false

# ==========================================
# STRIPE CONFIGURATION (Required if ENABLE_STRIPE=true)
# ==========================================

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxx

# ==========================================
# SMTP EMAIL CONFIGURATION (Required)
# ==========================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="EquiProfile" <noreply@equiprofile.online>

# ==========================================
# OAUTH CONFIGURATION (Optional Fallback)
# ==========================================

# If using OAuth as secondary auth method:
# OAUTH_SERVER_URL=https://your-oauth-server.com
# VITE_APP_ID=your-app-id
# VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com

# ==========================================
# OPTIONAL FEATURES
# ==========================================

# OpenAI (for AI features)
# OPENAI_API_KEY=sk-xxxxx

# AWS S3 (for document uploads if ENABLE_UPLOADS=true)
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
# AWS_S3_BUCKET=equiprofile-production
# AWS_REGION=eu-west-2

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
COOKIE_SECURE=true
COOKIE_DOMAIN=equiprofile.online
```

---

## Installation Steps

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Approve build scripts
pnpm approve-builds
# Select all packages (a + Enter)
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations (this will create tables with new auth fields)
pnpm run db:push
```

### 3. Gmail SMTP Setup

To send transactional emails:

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
4. Use this password in `SMTP_PASS` environment variable

### 4. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create two products (Monthly and Yearly):
   - Monthly: £7.99/month
   - Yearly: £79.90/year
3. Copy the Price IDs to `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID`
4. Get your Secret Key from https://dashboard.stripe.com/apikeys
5. Set up webhook endpoint:
   - URL: `https://equiprofile.online/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Build Application

```bash
pnpm run build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### 6. Start Production Server

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Configure PM2 to start on system boot
pm2 startup

# Follow the command output instructions
```

#### Using systemd (Alternative)

Create `/etc/systemd/system/equiprofile.service`:

```ini
[Unit]
Description=EquiProfile Application
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/equiprofile
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable equiprofile
sudo systemctl start equiprofile
sudo systemctl status equiprofile
```

---

## Nginx Configuration

Create `/etc/nginx/sites-available/equiprofile.online`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name equiprofile.online www.equiprofile.online;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name equiprofile.online www.equiprofile.online;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/x-component;

    # Static Files
    root /var/www/equiprofile/dist/public;
    index index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # SPA Fallback - serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Max upload size
    client_max_body_size 50M;

    # Logs
    access_log /var/log/nginx/equiprofile_access.log;
    error_log /var/log/nginx/equiprofile_error.log;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/equiprofile.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online

# Auto-renewal is configured by default
# Test renewal:
sudo certbot renew --dry-run
```

---

## Feature Overview

### Authentication
- ✅ Email/password signup and login
- ✅ Password reset via email
- ✅ OAuth fallback (if configured)
- ✅ JWT-based sessions
- ✅ Secure HTTP-only cookies

### Trial & Subscription
- ✅ 7-day free trial for new users
- ✅ Trial expiration enforcement
- ✅ Trial countdown banner
- ✅ Hard paywall (blocks access after trial)
- ✅ Monthly (£7.99) and Yearly (£79.90) plans

### Billing (Stripe)
- ✅ Stripe Checkout integration
- ✅ Stripe Customer Portal
- ✅ Webhook handling for subscription events
- ✅ Automatic subscription activation
- ✅ Plan management (upgrade/cancel)

### Transactional Emails (Gmail SMTP)
- ✅ Welcome email on signup
- ✅ Trial reminder emails (2 days, 1 day, expired)
- ✅ Payment success email
- ✅ Password reset email
- ✅ Test email endpoint for admins

### UI/UX
- ✅ Terms of Service page
- ✅ Privacy Policy page
- ✅ Billing page with subscription management
- ✅ Trial status banner on all app pages
- ✅ Footer on all pages

---

## Testing the Deployment

### 1. Test Health Endpoint

```bash
curl https://equiprofile.online/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-05T...",
  "version": "1.0.0",
  "services": {
    "database": true,
    "stripe": true
  }
}
```

### 2. Test Email (Admin)

```bash
curl -X POST https://equiprofile.online/api/admin/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

### 3. Test Authentication

- Sign up at https://equiprofile.online/register
- Check welcome email in inbox
- Try logging in
- Test password reset

### 4. Test Stripe Checkout

- Log in and go to /billing
- Click "Choose Monthly" or "Choose Yearly"
- Complete Stripe checkout (use test card in test mode)
- Verify subscription activation
- Check payment success email

### 5. Test Trial Enforcement

- Create a new user account
- Note the 7-day trial banner
- Manually expire the trial (update database):
  ```sql
  UPDATE users SET trialEndsAt = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE email = 'test@example.com';
  ```
- Try accessing protected pages (should be blocked)
- Subscribe to reactivate access

---

## Monitoring & Maintenance

### Application Logs

```bash
# PM2 logs
pm2 logs equiprofile

# Nginx logs
sudo tail -f /var/log/nginx/equiprofile_access.log
sudo tail -f /var/log/nginx/equiprofile_error.log

# System logs
sudo journalctl -u equiprofile -f
```

### Database Monitoring

```bash
# Check database size
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'equiprofile' GROUP BY table_schema;"

# Check active connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Performance Monitoring

```bash
# PM2 monitoring
pm2 monit

# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top
```

---

## Backup Strategy

### Automated Backups

Create `/home/equiprofile/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/equiprofile/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="equiprofile_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u equiprofile -p'your_password' equiprofile | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "equiprofile_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

Make executable and add to cron:

```bash
chmod +x /home/equiprofile/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
0 2 * * * /home/equiprofile/backup.sh >> /var/log/equiprofile_backup.log 2>&1
```

### Manual Backup

```bash
# Full database backup
mysqldump -u equiprofile -p equiprofile > backup_$(date +%Y%m%d).sql

# Backup with compression
mysqldump -u equiprofile -p equiprofile | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup uploaded files (if using local storage)
tar -czf files_$(date +%Y%m%d).tar.gz /var/www/equiprofile/uploads
```

### Restore from Backup

```bash
# Restore database
mysql -u equiprofile -p equiprofile < backup_20260105.sql

# Restore compressed backup
gunzip < backup_20260105.sql.gz | mysql -u equiprofile -p equiprofile
```

---

## Trial Reminder Cron Job

To send trial reminder emails automatically, add a cron job:

Create `/home/equiprofile/send-trial-reminders.js`:

```javascript
const db = require('./dist/server/db');
const email = require('./dist/server/_core/email');

async function sendTrialReminders() {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const users = await db.getAllUsers();

  for (const user of users) {
    if (user.subscriptionStatus !== 'trial' || !user.trialEndsAt) continue;

    const trialEnd = new Date(user.trialEndsAt);
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

    if (daysLeft === 2 || daysLeft === 1 || daysLeft === 0) {
      await email.sendTrialReminderEmail(user, daysLeft);
      console.log(`Sent trial reminder to ${user.email} (${daysLeft} days left)`);
    }
  }
}

sendTrialReminders().then(() => process.exit(0)).catch(console.error);
```

Add to crontab (runs daily at 10 AM):

```bash
0 10 * * * cd /var/www/equiprofile && NODE_ENV=production node send-trial-reminders.js >> /var/log/trial_reminders.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
pm2 logs equiprofile

# Check environment variables
pm2 env 0

# Restart application
pm2 restart equiprofile

# Check port availability
sudo lsof -i :3000
```

#### 2. Database Connection Failed

```bash
# Test database connection
mysql -u equiprofile -p equiprofile -e "SELECT 1;"

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

#### 3. Emails Not Sending

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check logs for email errors
pm2 logs equiprofile | grep "\[Email\]"

# Verify Gmail App Password is correct
# Make sure 2FA is enabled on Gmail account
```

#### 4. Stripe Webhooks Not Working

```bash
# Check webhook secret in Stripe dashboard
# Verify webhook endpoint URL is correct
# Check webhook logs in Stripe dashboard

# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### 5. Static Files Not Loading

```bash
# Check nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/equiprofile/dist/public/

# Reload nginx
sudo systemctl reload nginx

# Check nginx error logs
sudo tail -f /var/log/nginx/equiprofile_error.log
```

---

## Security Checklist

- [ ] Changed default `ADMIN_UNLOCK_PASSWORD`
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Enabled HTTPS with valid SSL certificate
- [ ] Configured firewall (ufw or iptables)
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Database user has limited permissions
- [ ] Stripe webhook secret is configured
- [ ] SMTP credentials are secure (Gmail App Password)
- [ ] Rate limiting is enabled
- [ ] Secure cookies enabled (`COOKIE_SECURE=true`)
- [ ] Regular backups are configured

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscriptionStatus, trialEndsAt);
CREATE INDEX idx_horses_user ON horses(userId, isActive);

-- Optimize tables
OPTIMIZE TABLE users, horses, healthRecords, trainingSessions;
```

### Nginx Caching

Add to nginx config for better performance:

```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

# In server block, for API caching:
location /api/health {
    proxy_pass http://localhost:3000;
    proxy_cache api_cache;
    proxy_cache_valid 200 1m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## Support & Contact

- **Documentation:** https://docs.equiprofile.online
- **Email:** support@equiprofile.online
- **GitHub Issues:** https://github.com/amarktainetwork-blip/Equiprofile.online/issues
- **Emergency Contact:** emergency@equiprofile.online

---

**Deployment Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** January 5, 2026  
**Next Review:** April 2026
