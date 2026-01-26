# EquiprofIle Deployment Guide

## 🚀 Quick Deployment (Production)

### Pre-Deployment Checklist

- [ ] VPS with Ubuntu 22.04/24.04
- [ ] Node.js 20.x installed
- [ ] MySQL 8.0+ running
- [ ] Nginx installed
- [ ] Domain DNS configured
- [ ] SSL certificate ready (certbot)
- [ ] Environment variables prepared

---

## Step-by-Step Deployment

### 1. Environment Setup

Create `/var/www/equiprofile/.env`:

```bash
# CORE REQUIRED
DATABASE_URL=mysql://username:password@localhost:3306/equiprofile
JWT_SECRET=<run: openssl rand -base64 32>
ADMIN_UNLOCK_PASSWORD=<your-secure-password>
NODE_ENV=production
PORT=3000
BASE_URL=https://equiprofile.online

# ADMIN USERS (as per requirement)
ADMIN1_EMAIL=amarktainetwork@gmail.com
ADMIN1_PASSWORD=ashmor12@
ADMIN2_EMAIL=ashley@equiprofile.online
ADMIN2_PASSWORD=ashmor12@

# FEATURE FLAGS
ENABLE_UPLOADS=true
ENABLE_STRIPE=false
ENABLE_FORGE=false

# AI FEATURES
OPENAI_API_KEY=sk-xxxxx

# WEATHER
WEATHER_API_KEY=your_weather_api_key
WEATHER_API_PROVIDER=openweathermap

# COOKIE SECURITY
COOKIE_DOMAIN=equiprofile.online
COOKIE_SECURE=true
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p

CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_password';
CREATE USER 'equiprofile'@'127.0.0.1' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

```bash
# Navigate to app directory
cd /var/www/equiprofile

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Apply database migrations
pnpm db:push

# Create admin users
node scripts/create-admin-users.mjs

# Seed AI training templates
node scripts/seed-training-templates.mjs

# Build application
pnpm build

# Verify build
ls -la dist/
```

### 4. Systemd Service Setup

Create `/etc/systemd/system/equiprofile.service`:

```ini
[Unit]
Description=EquiprofIle Horse Management Platform
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/equiprofile
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /var/www/equiprofile/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=equiprofile

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable equiprofile
sudo systemctl start equiprofile
sudo systemctl status equiprofile
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/equiprofile`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name equiprofile.online www.equiprofile.online;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name equiprofile.online www.equiprofile.online;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Root and index
    root /var/www/equiprofile/dist/public;
    index index.html;
    
    # Proxy to Node.js backend
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Application health
curl https://equiprofile.online/healthz

# API health
curl https://equiprofile.online/api/health

# System status
curl https://equiprofile.online/api/trpc/system.status
```

### 2. Test Authentication

```bash
# Test register
curl -X POST https://equiprofile.online/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'

# Test login
curl -X POST https://equiprofile.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 3. Verify Admin Users

```bash
# Check admin users were created
mysql -u equiprofile -p equiprofile -e "SELECT id, email, role FROM users WHERE role='admin';"
```

### 4. Monitor Logs

```bash
# Application logs
sudo journalctl -u equiprofile -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Rollback Procedure

### Quick Rollback

```bash
# Stop service
sudo systemctl stop equiprofile

# Revert to previous version
cd /var/www/equiprofile
git log --oneline -5  # Find previous commit
git checkout <previous-commit>

# Rebuild
pnpm install
pnpm build

# Restart
sudo systemctl start equiprofile
```

### Database Rollback

```bash
# If migration issues, restore from backup
mysql -u equiprofile -p equiprofile < /backup/equiprofile_backup.sql

# Or drop new tables manually
mysql -u equiprofile -p
USE equiprofile;
DROP TABLE IF EXISTS careScores;
DROP TABLE IF EXISTS medicationSchedules;
DROP TABLE IF EXISTS medicationLogs;
DROP TABLE IF EXISTS behaviorLogs;
DROP TABLE IF EXISTS healthAlerts;
```

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check service status
sudo systemctl status equiprofile

# Check disk space
df -h

# Check memory
free -h

# Check logs for errors
sudo journalctl -u equiprofile --since today | grep ERROR
```

### Weekly Maintenance

```bash
# Database backup
mysqldump -u equiprofile -p equiprofile > /backup/equiprofile_$(date +%Y%m%d).sql

# Clear old logs
sudo journalctl --vacuum-time=7d

# Update dependencies (test in staging first)
cd /var/www/equiprofile
pnpm update
```

### Performance Monitoring

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://equiprofile.online/api/health

# Check database connections
mysql -u equiprofile -p -e "SHOW PROCESSLIST;"

# Check memory usage
pm2 monit  # If using PM2
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u equiprofile -n 50

# Common issues:
# - Missing DATABASE_URL
# - Invalid JWT_SECRET
# - Port 3000 already in use
# - Database connection failed

# Test manually
cd /var/www/equiprofile
node dist/index.js
```

### Login Returns 401

```bash
# Verify environment variables
cat /var/www/equiprofile/.env | grep JWT_SECRET

# Check database connection
mysql -u equiprofile -p -e "USE equiprofile; SELECT COUNT(*) FROM users;"

# Verify bcrypt consistency
# Recreate admin users
node scripts/create-admin-users.mjs
```

### Upload Failures

```bash
# Verify feature flag
cat /var/www/equiprofile/.env | grep ENABLE_UPLOADS

# Check storage directory permissions
ls -la /var/equiprofile/uploads
sudo chown -R www-data:www-data /var/equiprofile/uploads
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check logs
sudo tail -100 /var/log/nginx/error.log
```

---

## Security Hardening

### 1. Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Fail2ban

```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Database Security

```bash
# Run MySQL secure installation
sudo mysql_secure_installation

# Disable remote root login
mysql -u root -p -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
```

---

## Support & Contact

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Emergency**: Contact system administrator

---

*Last Updated: 2026-01-26*
*Version: 1.0*
