# EquiProfile Deployment Guide for Webdock VPS

This guide provides step-by-step instructions for deploying EquiProfile to your Webdock VPS with 2 cores, 8GB RAM, and 50GB SSD.

## Prerequisites

- Ubuntu 22.04 LTS on your Webdock VPS
- Domain name pointed to your VPS IP address
- SSH access to your server

## Server Setup

### 1. Update System and Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx
```

### 2. Install Node.js 22.x

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install pnpm

```bash
npm install -g pnpm
```

### 4. Install MySQL 8.0

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Create database and user:

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE equiprofile;
CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Application Deployment

### 1. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/Equiprofile.online.git equiprofile
sudo chown -R $USER:$USER /var/www/equiprofile
cd equiprofile
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add the following (replace with your actual values):

```env
# Database
DATABASE_URL=mysql://equiprofile:your_secure_password@localhost:3306/equiprofile

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Application
NODE_ENV=production
PORT=3000

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI (for weather analysis)
OPENAI_API_KEY=sk-xxxxx

# S3 Storage (optional - for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-2
AWS_S3_BUCKET=equiprofile-uploads
```

### 4. Run Database Migrations

```bash
pnpm db:push
```

### 5. Build Application

```bash
pnpm build
```

### 6. Setup PM2 Process Manager

```bash
sudo npm install -g pm2
pm2 start dist/index.js --name equiprofile
pm2 startup
pm2 save
```

## Nginx Configuration

### 1. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/equiprofile
```

Add:

```nginx
server {
    listen 80;
    server_name equiprofile.online www.equiprofile.online;

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

    # Increase upload size for documents
    client_max_body_size 20M;
}
```

### 2. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL Certificate

```bash
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

## Automated Backups

### 1. Create Backup Script

```bash
sudo nano /usr/local/bin/equiprofile-backup.sh
```

Add:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/equiprofile"
DB_NAME="equiprofile"
DB_USER="equiprofile"
DB_PASS="your_secure_password"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Backup uploaded files (if using local storage)
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /var/www/equiprofile/uploads 2>/dev/null || true

# Remove old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Log
echo "$(date): Backup completed - db_$TIMESTAMP.sql.gz" >> /var/log/equiprofile-backup.log
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/equiprofile-backup.sh
```

### 2. Setup Daily Cron Job

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/equiprofile-backup.sh
```

This runs backups daily at 2 AM.

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://equiprofile.online/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env` file

## Monitoring

### Check Application Status

```bash
pm2 status
pm2 logs equiprofile
```

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Check MySQL Status

```bash
sudo systemctl status mysql
```

## Updating the Application

```bash
cd /var/www/equiprofile
git pull origin main
pnpm install
pnpm build
pm2 restart equiprofile
```

## Troubleshooting

### Application Not Starting

```bash
pm2 logs equiprofile --lines 100
```

### Database Connection Issues

```bash
mysql -u equiprofile -p -e "SELECT 1"
```

### Nginx Issues

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

## Security Recommendations

1. Enable UFW firewall:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. Setup fail2ban:
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. Regular security updates:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Support

For issues or questions, contact support at your configured support email.
