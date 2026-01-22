# EquiProfile Production Recovery Guide

Quick reference for recovering from common production deployment issues on Webdock Ubuntu VPS.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Restore Nginx Configuration](#restore-nginx-configuration)
- [Restore Systemd Service](#restore-systemd-service)
- [View Logs](#view-logs)
- [Common Failure Scenarios](#common-failure-scenarios)
- [Emergency Rollback](#emergency-rollback)

---

## Quick Diagnostics

Run these commands to quickly assess the system state:

```bash
# Check service status
systemctl status equiprofile

# Check nginx status
systemctl status nginx

# Check if application is responding
curl -s http://127.0.0.1:3000/api/health

# Check listening ports
ss -tlnp | grep -E ':(80|443|3000)'

# View recent application logs
journalctl -u equiprofile -n 50 --no-pager

# View recent nginx errors
tail -50 /var/log/nginx/error.log

# Check deployment logs
ls -lt /var/equiprofile/_ops/deploy_*.log | head -1
```

---

## Restore Nginx Configuration

### If nginx config is missing or broken:

```bash
# 1. Copy canonical config from repo
cd /var/equiprofile/app
sudo cp ops/nginx/equiprofile.webdock.conf /etc/nginx/sites-available/equiprofile

# 2. Create symlink if missing
sudo ln -sf /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/equiprofile

# 3. Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Test configuration
sudo nginx -t

# 5. If test passes, reload nginx
sudo systemctl reload nginx

# 6. If test fails, check error message and fix
sudo nginx -t 2>&1 | less
```

### If SSL certificates are missing:

```bash
# Check certificate status
sudo certbot certificates

# If certificates exist but nginx can't find them, verify paths:
ls -l /etc/letsencrypt/live/equiprofile.online/

# If certificates don't exist, obtain them:
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online
```

### If nginx won't start:

```bash
# Check what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Check nginx error log
sudo tail -50 /var/log/nginx/error.log

# Try starting nginx in foreground for debugging
sudo nginx -g 'daemon off;'
# Press Ctrl+C to stop

# If another process is using ports, stop it:
sudo systemctl stop <other-service>
sudo systemctl start nginx
```

---

## Restore Systemd Service

### If systemd service is missing or broken:

```bash
# 1. Copy canonical service file from repo
cd /var/equiprofile/app
sudo cp ops/systemd/equiprofile.service /etc/systemd/system/equiprofile.service

# 2. Reload systemd
sudo systemctl daemon-reload

# 3. Enable service (start on boot)
sudo systemctl enable equiprofile

# 4. Start service
sudo systemctl start equiprofile

# 5. Check status
systemctl status equiprofile

# 6. If failed, check logs
journalctl -u equiprofile -n 100 --no-pager
```

### If service won't start:

```bash
# Check what error is reported
systemctl status equiprofile

# View detailed logs
journalctl -u equiprofile -n 200 --no-pager

# Common issues:

# 1. Port already in use
sudo lsof -i :3000
# Kill the process if needed:
sudo kill -9 <PID>

# 2. Missing environment file
ls -l /var/equiprofile/app/.env
# If missing, restore from backup or create new from .env.example

# 3. Missing dist/index.js
ls -l /var/equiprofile/app/dist/index.js
# If missing, rebuild:
cd /var/equiprofile/app
sudo -u www-data npm run build

# 4. Permission issues
sudo chown -R www-data:www-data /var/equiprofile/app
```

---

## View Logs

### Deployment Logs

```bash
# List all deployment logs
ls -lth /var/equiprofile/_ops/deploy_*.log

# View latest deployment log
tail -200 $(ls -t /var/equiprofile/_ops/deploy_*.log | head -1)

# Follow deployment in real-time (if running)
tail -f $(ls -t /var/equiprofile/_ops/deploy_*.log | head -1)

# Search for errors in latest log
grep -i error $(ls -t /var/equiprofile/_ops/deploy_*.log | head -1)
```

### Application Logs

```bash
# View recent logs
journalctl -u equiprofile -n 100 --no-pager

# Follow logs in real-time
journalctl -u equiprofile -f

# View logs from last hour
journalctl -u equiprofile --since "1 hour ago"

# View logs from specific time
journalctl -u equiprofile --since "2024-01-10 14:00:00"

# View logs with priority filtering
journalctl -u equiprofile -p err  # Errors only
journalctl -u equiprofile -p warning  # Warnings and above

# Search for specific text
journalctl -u equiprofile | grep -i "database"
```

### Nginx Logs

```bash
# Access log (last 100 lines)
tail -100 /var/log/nginx/equiprofile-access.log

# Error log (last 100 lines)
tail -100 /var/log/nginx/equiprofile-error.log

# Follow error log in real-time
tail -f /var/log/nginx/equiprofile-error.log

# Find 5xx errors
grep " 5[0-9][0-9] " /var/log/nginx/equiprofile-access.log | tail -50

# Find 4xx errors
grep " 4[0-9][0-9] " /var/log/nginx/equiprofile-access.log | tail -50
```

---

## Common Failure Scenarios

### Scenario 1: Application won't start after deployment

**Symptoms:**
- `systemctl status equiprofile` shows "failed" or "inactive"
- `/api/health` endpoint not responding

**Recovery steps:**

```bash
# 1. Check service logs
journalctl -u equiprofile -n 50 --no-pager

# 2. Try starting manually to see errors
cd /var/equiprofile/app
sudo -u www-data node dist/index.js

# 3. Common fixes:
# - Missing .env file: sudo cp .env.example .env && sudo nano .env
# - Port in use: sudo lsof -i :3000 && sudo kill -9 <PID>
# - Bad database connection: check DATABASE_URL in .env
# - Missing dependencies: sudo -u www-data npm ci
# - Bad build: sudo -u www-data npm run build

# 4. Restart service
sudo systemctl restart equiprofile
```

### Scenario 2: Nginx serving 502 Bad Gateway

**Symptoms:**
- Website shows "502 Bad Gateway"
- Nginx is running but can't reach backend

**Recovery steps:**

```bash
# 1. Check if application is running
systemctl status equiprofile
curl http://127.0.0.1:3000/api/health

# 2. If application is down, start it
sudo systemctl start equiprofile

# 3. Check nginx proxy configuration
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/equiprofile | grep proxy_pass

# 4. Check nginx error log
tail -50 /var/log/nginx/equiprofile-error.log

# 5. Verify backend is listening on correct port
ss -tlnp | grep :3000

# 6. Reload nginx
sudo systemctl reload nginx
```

### Scenario 3: Deployment failed mid-way

**Symptoms:**
- Deployment log shows errors
- Application in unknown state

**Recovery steps:**

```bash
# 1. Check last deployment log
tail -200 $(ls -t /var/equiprofile/_ops/deploy_*.log | head -1)

# 2. If build failed:
cd /var/equiprofile/app
sudo rm -rf dist node_modules/.cache
sudo -u www-data npm ci
sudo -u www-data npm run build

# 3. If service failed to restart:
sudo systemctl restart equiprofile
sudo systemctl status equiprofile

# 4. If nginx failed to reload:
sudo nginx -t
sudo systemctl reload nginx

# 5. Re-run deployment script
sudo bash ops/deploy.sh --domain equiprofile.online --resume
```

### Scenario 4: Users seeing old version (cache issue)

**Symptoms:**
- Deployment succeeded but users see old UI
- Build SHA doesn't match expected version

**Recovery steps:**

```bash
# 1. Verify PWA is blocked
curl -I https://equiprofile.online/service-worker.js  # Must be 404
curl -I https://equiprofile.online/manifest.json      # Must be 404

# 2. Check index.html cache headers
curl -I https://equiprofile.online/ | grep Cache-Control
# Should show: no-store

# 3. Verify nginx config has cache rules
sudo grep -A 5 "index.html" /etc/nginx/sites-enabled/equiprofile

# 4. If nginx config is wrong, restore it:
sudo cp /var/equiprofile/app/ops/nginx/equiprofile.webdock.conf /etc/nginx/sites-available/equiprofile
sudo nginx -t && sudo systemctl reload nginx

# 5. Verify deployed version
curl https://equiprofile.online/api/version

# 6. Ask users to hard refresh:
# - Windows/Linux: Ctrl + Shift + R
# - Mac: Cmd + Shift + R
```

### Scenario 5: Database connection lost

**Symptoms:**
- Application logs show database errors
- API returns 500 errors

**Recovery steps:**

```bash
# 1. Check if MySQL is running
systemctl status mysql

# 2. If stopped, start it
sudo systemctl start mysql

# 3. Test database connection
mysql -u equiprofile -p -e "SELECT 1;"

# 4. Check DATABASE_URL in .env
sudo grep DATABASE_URL /var/equiprofile/app/.env

# 5. Verify database user has correct permissions
sudo mysql -e "SHOW GRANTS FOR 'equiprofile'@'localhost';"

# 6. Restart application
sudo systemctl restart equiprofile
```

---

## Emergency Rollback

### Rollback to previous git commit:

```bash
# 1. Find previous good commit
cd /var/equiprofile/app
git log --oneline -10

# 2. Reset to previous commit
sudo -u www-data git reset --hard <commit-sha>

# 3. Rebuild
sudo rm -rf dist
sudo -u www-data npm ci
sudo -u www-data npm run build

# 4. Restart
sudo systemctl restart equiprofile

# 5. Verify
sudo bash ops/verify.sh --domain equiprofile.online
```

### Rollback to previous branch:

```bash
# 1. Switch to stable branch
cd /var/equiprofile/app
sudo -u www-data git fetch --all
sudo -u www-data git checkout main
sudo -u www-data git reset --hard origin/main

# 2. Rebuild and restart
sudo rm -rf dist
sudo -u www-data npm ci
sudo -u www-data npm run build
sudo systemctl restart equiprofile

# 3. Verify
sudo bash ops/verify.sh --domain equiprofile.online
```

### Nuclear option - full redeployment:

```bash
# 1. Backup .env file
sudo cp /var/equiprofile/app/.env /tmp/.env.backup

# 2. Stop services
sudo systemctl stop equiprofile

# 3. Remove app directory
sudo rm -rf /var/equiprofile/app

# 4. Clone fresh
cd /var/equiprofile
sudo git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git app
cd app

# 5. Restore .env
sudo cp /tmp/.env.backup .env

# 6. Run full deployment
sudo bash ops/deploy.sh --domain equiprofile.online

# 7. Verify
sudo bash ops/verify.sh --domain equiprofile.online
```

---

## Prevention Tips

1. **Always backup .env before major changes:**
   ```bash
   sudo cp /var/equiprofile/app/.env /backup/.env_$(date +%Y%m%d)
   ```

2. **Use --unit mode for deployments to survive SSH disconnects:**
   ```bash
   sudo bash ops/deploy.sh --unit --domain equiprofile.online
   ```

3. **Monitor deployment logs during deployment:**
   ```bash
   tail -f /var/equiprofile/_ops/deploy_*.log
   ```

4. **Always run verify.sh after deployment:**
   ```bash
   sudo bash ops/verify.sh --domain equiprofile.online
   ```

5. **Keep deployment logs for at least 30 days:**
   ```bash
   # Add to crontab:
   0 3 * * * find /var/equiprofile/_ops -name "deploy_*.log" -mtime +30 -delete
   ```

---

## Getting Help

If recovery steps don't work:

1. **Check deployment logs:** `/var/equiprofile/_ops/deploy_*.log`
2. **Check application logs:** `journalctl -u equiprofile -n 200`
3. **Check nginx logs:** `/var/log/nginx/equiprofile-error.log`
4. **Verify environment:** `sudo bash ops/verify.sh --domain equiprofile.online`
5. **Check GitHub issues:** https://github.com/amarktainetwork-blip/Equiprofile.online/issues

---

## Emergency Contacts

- **Repository:** https://github.com/amarktainetwork-blip/Equiprofile.online
- **Documentation:** See `docs/` directory
- **Deployment Guide:** `docs/DEPLOYMENT.md`
