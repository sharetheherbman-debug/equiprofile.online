# 🚀 EquiProfile - Tonight's Deployment Quick Reference

**Ready to deploy in 30 minutes!**

---

## 📋 Pre-Flight Checklist (5 minutes)

On your Webdock VPS, ensure you have:

- [ ] Node.js 18+ installed
- [ ] MySQL installed and running
- [ ] Database created (`equiprofile`)
- [ ] Database user created
- [ ] Nginx installed
- [ ] Domain DNS pointed to VPS IP

### Quick Install Commands:

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt-get install -y mysql-server
sudo mysql_secure_installation

# Nginx  
sudo apt-get install -y nginx

# PM2
npm install -g pm2

# Create database
sudo mysql -u root -p
CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🎯 Deployment (15 minutes)

### Step 1: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/sharetheherbman-debug/equiprofile.online.git
cd equiprofile.online
sudo chown -R $USER:$USER .
```

### Step 2: Run One-Click Deployment

```bash
bash scripts/deploy-webdock.sh
```

**What it does:**
1. ✅ Checks prerequisites
2. ✅ Installs dependencies
3. ✅ Builds application
4. ✅ Creates .env file
5. ✅ Validates environment
6. ✅ Runs database migrations
7. ✅ Configures PM2
8. ✅ Creates Nginx config

### Step 3: Configure .env

When prompted, edit `.env` and set:

```bash
DATABASE_URL=mysql://equiprofile:YourPassword@localhost:3306/equiprofile
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_UNLOCK_PASSWORD=$(openssl rand -base64 24)
BASE_URL=https://equiprofile.online
```

### Step 4: Start Application

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the command it gives you
```

### Step 5: Configure Nginx

```bash
sudo cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/equiprofile
sudo nano /etc/nginx/sites-available/equiprofile
# Change 'equiprofile.online' to your domain (2 places)

sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Setup (5 minutes)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

**Automatic!** Certbot will:
- Get certificate
- Configure Nginx
- Setup auto-renewal

---

## 🔥 Firewall (2 minutes)

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

---

## ✅ Verification (3 minutes)

### Check Application:

```bash
pm2 status
pm2 logs equiprofile --lines 20
curl http://localhost:3000/health
```

### Test in Browser:

1. **Landing Page**: https://equiprofile.online
2. **Login Page**: https://equiprofile.online/login
3. **Register**: https://equiprofile.online/register
4. **Pricing**: https://equiprofile.online/pricing

### Verify Frontend Features:

- [ ] Landing page loads with hero image
- [ ] Login page shows 50/50 split layout
- [ ] Contact footer shows +44 7347 258089
- [ ] Email shows support@equiprofile.online
- [ ] Pricing FAQ accordion works
- [ ] Overlays are soft (not too dark)

---

## 🐛 Quick Troubleshooting

### App won't start:
```bash
pm2 logs equiprofile --lines 50
bash scripts/preflight.sh
```

### 502 Bad Gateway:
```bash
pm2 status
curl http://localhost:3000/health
sudo nginx -t
```

### Database errors:
```bash
mysql -u equiprofile -p equiprofile -e "SELECT 1;"
# Check DATABASE_URL in .env
```

---

## 📱 Commands You'll Need

```bash
# View logs
pm2 logs equiprofile

# Restart app
pm2 restart equiprofile

# Stop app
pm2 stop equiprofile

# Monitor
pm2 monit

# Nginx reload
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/equiprofile-access.log
```

---

## 🎉 Post-Deployment

### Create First Admin User:

1. Register at: https://equiprofile.online/register
2. Login
3. Open browser console (F12)
4. Type: `showAdmin()` and enter password
5. Navigate to `/admin`

### Enable Optional Features Later:

Edit `.env` and set:
```bash
ENABLE_STRIPE=true    # When ready for billing
ENABLE_UPLOADS=true   # When ready for file uploads
```

Then: `pm2 restart equiprofile`

---

## 📦 Backup Setup (Do Tomorrow)

```bash
# Create backup script
sudo nano /usr/local/bin/backup-equiprofile.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/backups/equiprofile"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u equiprofile -p'YourPassword' equiprofile > $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-equiprofile.sh
(crontab -l; echo "0 2 * * * /usr/local/bin/backup-equiprofile.sh") | crontab -
```

---

## 📊 Success Criteria

You're done when:

- ✅ Application loads at your domain
- ✅ SSL certificate is active (https)
- ✅ Login/Register pages work
- ✅ Frontend looks modern and polished
- ✅ Contact information is correct
- ✅ PM2 shows "online" status
- ✅ Health check returns 200 OK

---

## 🆘 Emergency Contact

If something breaks:

```bash
# Quick rollback to safe state
pm2 stop equiprofile
git checkout 345813c  # Last known good commit
pnpm install --frozen-lockfile
pnpm run build
pm2 restart equiprofile
```

---

## 🎯 Timeline

- **00:00-00:05** - Pre-flight checks
- **00:05-00:20** - Run deployment script
- **00:20-00:25** - SSL setup
- **00:25-00:27** - Firewall
- **00:27-00:30** - Verification

**Total: 30 minutes** ⏱️

---

## 📖 Full Docs

For detailed information, see:
- `WEBDOCK_DEPLOYMENT.md` - Complete guide
- `.env.production.example` - All environment options
- `IMPLEMENTATION_STATUS.md` - Feature status

---

**Ready to go live!** 🚀

Start with: `bash scripts/deploy-webdock.sh`
