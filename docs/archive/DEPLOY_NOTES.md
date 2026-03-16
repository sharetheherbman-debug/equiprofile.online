# EquiProfile Deployment Notes

## Production Deployment Commands

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Application

```bash
pnpm run build
```

Expected output:

- `dist/index.js` - Server bundle (~179KB)
- `dist/public/` - Client assets
- Build should complete in ~20-25 seconds

### 3. Restart Service

```bash
sudo systemctl restart equiprofile
```

### 4. Verify Health

```bash
# Check service status
sudo systemctl status equiprofile

# Test health endpoint
curl http://127.0.0.1:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0","services":{"database":true,"stripe":false,"oauth":false}}
```

### 5. Verify Nginx Proxy

```bash
# Test through Nginx
curl -I https://equiprofile.online/

# Should return 200 OK with proper headers
```

## Environment Variables Required

Ensure these are set in `/home/equiprofile/.env`:

```bash
# Required
DATABASE_URL="mysql://..."
JWT_SECRET="..."
ADMIN_UNLOCK_PASSWORD="..."

# Optional but recommended
ENABLE_STRIPE=true
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ENABLE_UPLOADS=true
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Server config
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
```

## Key Changes in This Release

### Authentication

- Password requirement now 12 characters minimum (matches backend)
- New 50/50 split screen layout on desktop
- Mobile uses full-screen background with glass overlay

### Navigation

- Menu items: About, Features, Pricing, Contact (in that order)
- Footer added to ALL pages with "© 2026 EquiProfile — Part of Amarktai Network..."
- Automatic scroll-to-top on route change

### Marketing Pages

- **Home**: Removed pricing, FAQ, and "Watch Demo"; 7-day trial messaging
- **Features**: Complete 70+ features list in 13 categories
- **Pricing**: Already updated with 7-day trial
- **Auth pages**: New split-screen layout

### Technical Fixes

- Fixed Express 5 wildcard routing compatibility
- Server reliably starts on 127.0.0.1:3000
- All media assets organized in proper locations

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### Server Won't Start

```bash
# Check logs
sudo journalctl -u equiprofile -n 50

# Common issues:
# - Missing environment variables
# - Port 3000 already in use
# - Database connection failed
```

### Assets Not Loading

```bash
# Verify assets exist
ls -la /home/equiprofile/Equiprofile.online/dist/public/assets/marketing/

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

## Rollback Procedure

If issues occur:

```bash
# Revert to previous commit
cd /home/equiprofile/Equiprofile.online
git reset --hard <previous-commit-sha>
pnpm install
pnpm run build
sudo systemctl restart equiprofile
```

## Post-Deployment Verification Checklist

- [ ] Home page loads with video background
- [ ] Navigation shows: About, Features, Pricing, Contact
- [ ] Footer appears on all pages
- [ ] Login page shows split-screen layout
- [ ] Register page shows split-screen layout
- [ ] Features page shows all 70+ features
- [ ] No pricing on Home page
- [ ] Pricing only appears on /pricing page
- [ ] All "free trial" references say "7-day"
- [ ] Scroll-to-top works when navigating
- [ ] Health endpoint returns 200 OK
- [ ] No console errors in browser

## Performance Notes

- Build size warnings for some chunks (>500KB) are expected for code highlighting and chart libraries
- Consider code-splitting for future optimization
- Current build is production-ready and performant

## Security

- All security scans passed (manual review completed)
- No new vulnerabilities introduced
- Authentication properly secured
- HTTPS enforced via Nginx
- CSP headers properly configured
