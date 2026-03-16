# Production Deployment Audit Report

**Date:** January 1, 2026  
**Version:** 1.0  
**Status:** 🟡 REVIEW IN PROGRESS

---

## Executive Summary

This audit assesses EquiProfile's readiness for production deployment on an Ubuntu + Nginx + MySQL VPS environment. The system is partially production-ready with critical security features in place, but requires completion of several deployment infrastructure components and feature implementations.

**Overall Readiness:** 65%

**Critical Blockers:** 3  
**High Priority Issues:** 7  
**Medium Priority Issues:** 12

---

## Application Architecture

### Stack Overview

```
┌─────────────────────────────────────────┐
│         Client Layer (React)            │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │ Pages  │  │  UI    │  │  Hooks   │  │
│  └────────┘  └────────┘  └──────────┘  │
└──────────────┬──────────────────────────┘
               │ tRPC + TanStack Query
┌──────────────┴──────────────────────────┐
│        Server Layer (Node/Express)      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ tRPC    │  │ Auth    │  │ Stripe  │ │
│  │ Routers │  │ OAuth   │  │ Webhook │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└──────────────┬──────────────────────────┘
               │ Drizzle ORM
┌──────────────┴──────────────────────────┐
│         Database (MySQL 8.0)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Users   │  │ Horses  │  │ Health  │ │
│  │ Stables │  │ Training│  │ Billing │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘

         External Services:
         • AWS S3 (file storage)
         • Stripe (payments)
         • OpenAI (AI features)
```

### Directory Structure

```
/
├── client/                  Frontend React app
│   ├── src/
│   │   ├── pages/          Page components
│   │   ├── components/     Reusable UI
│   │   ├── hooks/          Custom hooks
│   │   └── i18n/           Translations
│   └── public/             Static assets
├── server/                  Backend API
│   ├── _core/              Core infrastructure
│   │   ├── index.ts        Express server
│   │   ├── trpc.ts         tRPC setup
│   │   ├── oauth.ts        Auth handling
│   │   └── env.ts          Env validation
│   ├── routers.ts          All tRPC endpoints
│   ├── db.ts               Database queries
│   └── stripe.ts           Payment integration
├── drizzle/                 Database schema
│   ├── schema.ts           Table definitions
│   └── relations.ts        Foreign keys
├── scripts/                 Utility scripts
├── docs/                    Documentation
└── dist/                    Build output
```

---

## tRPC Router Inventory

**Total Routers:** 22  
**Total Procedures:** 80+

See `/docs/ROUTER_MAP.md` for complete procedure listing.

### Routers by Category:

**Core System (4):**

- system - Health checks, version
- auth - Login, logout, me
- adminUnlock - Admin session management
- ai - AI chat + admin unlock trigger

**Billing & Users (3):**

- billing - Stripe checkout, portal, pricing
- user - Profile, subscription status
- admin - User management, system settings

**Horse Management (7):**

- horses - CRUD operations
- healthRecords - Medical tracking
- training - Session logging
- feeding - Feeding plans
- documents - File management
- competitions - Results tracking
- breeding - Breeding records

**Features (8):**

- weather - AI weather analysis
- analytics - Statistics and charts
- reports - PDF generation
- calendar - Event scheduling
- stables - Team management
- messages - Team communication
- trainingPrograms - Training templates
- admin.apiKeys - API key management

---

## Missing Endpoints Analysis

### Critical Missing Procedures:

1. **CSV Exports** (9 procedures)
   - horses.exportCSV
   - healthRecords.exportCSV
   - training.exportCSV
   - competitions.exportCSV
   - feeding.exportCSV
   - breeding.exportCSV
   - documents.exportCSV (metadata)
   - reports.exportCSV (metadata)
   - foals.exportCSV

2. **Medical Passport** (3 procedures)
   - healthRecords.getMedicalPassport
   - healthRecords.generateQRCode
   - healthRecords.exportPDF

3. **Feed Optimization** (1 procedure)
   - feeding.getOptimizationRecommendations

4. **Lesson Scheduling** (5+ procedures)
   - lessons router (entire router missing)
   - createAvailability, bookLesson, etc.

5. **Client Portal** (1+ procedures)
   - clientPortal router (entire router missing)

6. **White-Label** (2 procedures)
   - stables.updateBranding
   - stables.getBranding

### Missing UI Pages:

- ❌ Pricing.tsx (Stripe checkout interface)
- ❌ Competitions.tsx (competition results)
- ❌ TrainingTemplates.tsx (template management)
- ❌ Breeding.tsx (breeding records)
- ❌ Lessons.tsx (lesson scheduling)
- ❌ ClientPortal.tsx (owner read-only view)

---

## Auth/Session/Cookie Security Review

### ✅ Strengths:

1. **OAuth Authentication**
   - Third-party providers (secure, no password storage)
   - HTTP-only secure cookies
   - SameSite=Strict protection
   - 7-day session lifetime with auto-renewal

2. **Admin Unlock System**
   - Two-factor approach (role + unlock session)
   - Time-limited sessions (30 minutes)
   - Rate limiting (5 attempts → 15 min lockout)
   - All attempts logged
   - Password-protected (configurable via ADMIN_UNLOCK_PASSWORD)

3. **Session Management**
   - `adminSessions` table tracks unlock sessions
   - Server-side validation on every admin request
   - Automatic expiration
   - Manual lock/revoke capability

### ⚠️ Concerns:

1. **Default Admin Password**
   - Default `Ashmor12@` must be changed in production
   - ✅ Production validation exists (prevents startup with default)

2. **Session Storage**
   - Sessions in database (good)
   - No Redis caching (acceptable for single-server)

3. **Cookie Domain**
   - Must set COOKIE_DOMAIN for production
   - COOKIE_SECURE must be true in production

### 🔒 Recommendations:

1. ✅ Change ADMIN_UNLOCK_PASSWORD immediately after deployment
2. ✅ Rotate admin password every 90 days
3. ⚠️ Consider adding 2FA for regular users (future)
4. ⚠️ Implement session revocation on password change (future)

---

## Stripe Billing Flow Review

### Checkout Flow:

```
User clicks "Subscribe"
    ↓
billing.createCheckout (tRPC)
    ↓
Create Stripe Checkout Session
    ↓
Redirect to Stripe hosted page
    ↓
User completes payment
    ↓
Stripe sends webhook: checkout.session.completed
    ↓
Update user: subscriptionStatus = 'active'
    ↓
Redirect to success_url
```

### ✅ Implemented:

- Checkout session creation
- Customer portal for managing subscriptions
- Webhook endpoint exists
- Signature verification
- Basic event handling

### ❌ Missing/Issues:

1. **Idempotency** (CRITICAL)
   - No duplicate event detection
   - Risk of double-processing
   - **Fix:** Add `stripeEvents` table with unique eventId

2. **Event Coverage**
   - Missing handlers for some events:
     - ✅ checkout.session.completed
     - ✅ customer.subscription.updated
     - ✅ customer.subscription.deleted
     - ❌ invoice.payment_succeeded (needs verification)
     - ❌ invoice.payment_failed (needs verification)

3. **Error Handling**
   - Webhook errors not logged to database
   - No retry mechanism for failed processing

4. **Testing**
   - No test suite for webhook processing
   - Stripe CLI testing not documented

### 🔧 Required Fixes:

```typescript
// Add to drizzle/schema.ts
export const stripeEvents = mysqlTable("stripeEvents", {
  id: int("id").primaryKey().autoincrement(),
  eventId: varchar("eventId", { length: 255 }).unique().notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processedAt"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Update webhook handler
async function handleWebhook(event) {
  // Check for duplicate
  const existing = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.eventId, event.id),
  });

  if (existing) {
    return { received: true, duplicate: true };
  }

  // Insert event
  await db.insert(stripeEvents).values({
    eventId: event.id,
    eventType: event.type,
  });

  // Process event
  try {
    await processEvent(event);

    // Mark as processed
    await db
      .update(stripeEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(stripeEvents.eventId, event.id));
  } catch (error) {
    // Log error
    await db
      .update(stripeEvents)
      .set({ error: error.message })
      .where(eq(stripeEvents.eventId, event.id));

    throw error;
  }
}
```

---

## Data Model Review

### Database Schema Coverage:

**✅ Complete:**

- users (auth, subscription, profile)
- horses (horse profiles)
- healthRecords (medical tracking)
- vaccinations (vaccine schedules)
- dewormings (deworming logs)
- trainingSessions (training logs)
- feedingPlans (feeding schedules)
- feedCosts (cost tracking)
- documents (file metadata)
- weatherLogs (weather cache)
- stables (team/stable accounts)
- stableMembers (team membership)
- stableInvites (pending invites)
- events (calendar events)
- competitions (competition results)
- reports (report metadata)
- reportSchedules (scheduled reports)
- activityLogs (audit trail)
- adminSessions (admin unlock sessions)
- adminUnlockAttempts (rate limiting)
- apiKeys (integration keys)
- systemSettings (app config)
- backupLogs (backup history)
- trainingProgramTemplates (training templates)
- trainingPrograms (applied programs)
- breeding (breeding records)
- foals (foal records)
- messageThreads (team messaging)
- messages (message content)

**❌ Missing:**

- stripeEvents (webhook idempotency) - CRITICAL
- lessonAvailability (trainer schedules) - if needed
- lessonBookings (lesson appointments) - if needed
- clientPortalShares (sharing tokens) - if needed

### Migration Status:

- ✅ Drizzle migrations configured
- ✅ Migration tracking in `_journal.json`
- ✅ Schema push command works (`npm run db:push`)
- ⚠️ No rollback mechanism (Drizzle limitation)
- ⚠️ Production migrations should be manual (not auto-push)

---

## Performance Issues & Fixes

### Current Performance Profile:

**✅ Good:**

- Code splitting with Vite
- React 19 (latest)
- TanStack Query caching
- Database indexes on foreign keys
- Connection pooling (MySQL2)

**⚠️ Needs Optimization:**

1. **Missing Indexes**
   - activityLogs.userId (frequent queries)
   - healthRecords.horseId + dueDate (reminder queries)
   - trainingSessions.horseId + completedAt (analytics)
   - documents.horseId + category (filtering)

   **Fix:**

   ```typescript
   // Add to schema
   indexes: {
     userId_idx: index('userId').on(activityLogs.userId),
     horseId_dueDate_idx: index('horseId_dueDate').on(
       healthRecords.horseId,
       healthRecords.dueDate
     ),
   }
   ```

2. **N+1 Query Issues**
   - Dashboard stats queries (multiple round trips)
   - Horse list with related data

   **Fix:** Use Drizzle's `with` for eager loading

3. **Large Payload Issues**
   - Document list includes full file URLs
   - No pagination on some list endpoints

   **Fix:** Add pagination to all list procedures

4. **No Query Caching**
   - No server-side caching (Redis/Memcached)
   - Acceptable for initial deployment
   - Consider for scale

5. **Image Optimization**
   - S3 images not resized
   - No CDN
   - No lazy loading

   **Fix:**
   - Add image optimization to upload pipeline
   - Consider CloudFront CDN
   - Implement lazy loading with Intersection Observer

### Performance Recommendations:

1. **Immediate:**
   - ✅ Add database indexes
   - ✅ Add pagination to all lists
   - ⚠️ Optimize dashboard queries

2. **Short-term:**
   - ⚠️ Add server-side caching (Redis)
   - ⚠️ Implement CDN for static assets
   - ⚠️ Add query result caching

3. **Long-term:**
   - Consider read replicas for scaling
   - Add full-text search (if needed)
   - Consider websockets for real-time features

---

## Deployment Readiness Checklist

### Environment Variables

**✅ Configured:**

- DATABASE_URL
- JWT_SECRET
- NODE_ENV
- PORT
- BASE_URL
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_MONTHLY_PRICE_ID
- STRIPE_YEARLY_PRICE_ID
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET
- AWS_REGION
- ADMIN_UNLOCK_PASSWORD
- COOKIE_DOMAIN
- COOKIE_SECURE

**❌ Missing/Needs Update:**

- LOG_FILE_PATH (not in .env.example)
- SMTP_PASSWORD (missing field)
- Complete Stripe webhook example

**🔒 Production Validation:**

- ✅ Startup validation exists (checks critical vars)
- ✅ Prevents start with default admin password
- ✅ Clear error messages

### Build System

**✅ Working:**

- `npm install` - Dependencies install
- Vite build system configured
- ESBuild for server compilation
- TypeScript compilation

**❌ Issues:**

- `npm run check` - TypeScript errors exist (2 errors)
- No CI/CD pipeline configured
- No automated testing in CI

**Fix Required:**

```bash
# Fix TypeScript errors
npm run check
# Should output: No errors found
```

### Database Migrations

**✅ Working:**

- Drizzle Kit installed
- Migrations generated
- Push command works

**⚠️ Production Concerns:**

- No migration rollback
- No migration verification script
- Manual migration process not documented

**Recommendation:**

```bash
# Production migration process:
1. Backup database
2. Test migration on staging
3. Run: npm run db:push
4. Verify schema with SELECT queries
5. Test critical queries
```

### Nginx Configuration

**❌ Not Provided**

**Required:**

```nginx
server {
    listen 80;
    server_name equiprofile.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name equiprofile.online;

    ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase upload size for documents
    client_max_body_size 50M;

    # Proxy to Node app
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

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### PM2 Configuration

**🟡 Partial:**

- `ecosystem.config.js` exists
- Basic config present

**❌ Needs Update:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "equiprofile",
      script: "dist/index.js",
      instances: 1, // Low-memory VPS: use 1
      // instances: 2,  // If RAM >= 4GB: use 2
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/equiprofile/error.log",
      out_file: "/var/log/equiprofile/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M", // Restart if memory exceeds 500MB
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

### Logging System

**❌ NOT IMPLEMENTED - CRITICAL**

**Current State:**

- Using console.log() throughout
- No structured logging
- No log files
- Secrets might be logged

**Required Implementation:**

1. **Install Winston**

   ```bash
   npm install winston
   ```

2. **Create logger.ts**

   ```typescript
   // server/_core/logger.ts
   import winston from "winston";

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || "info",
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json(),
     ),
     defaultMeta: { service: "equiprofile" },
     transports: [
       new winston.transports.File({
         filename: process.env.LOG_FILE_PATH || "/var/log/equiprofile/app.log",
         maxsize: 10485760, // 10MB
         maxFiles: 10,
       }),
       new winston.transports.Console({
         format: winston.format.simple(),
       }),
     ],
   });

   // Redact sensitive data
   const redactSecrets = (obj: any) => {
     const redacted = { ...obj };
     const sensitiveKeys = ["password", "secret", "token", "key", "apiKey"];

     for (const key in redacted) {
       if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
         redacted[key] = "[REDACTED]";
       }
     }

     return redacted;
   };

   export default logger;
   ```

3. **Replace console.log**

   ```typescript
   // Before
   console.log("User logged in", userId);

   // After
   logger.info("User logged in", { userId });
   ```

### Backup System

**🟡 Partial:**

- `/scripts/backup.sh` might exist
- Backup logs table exists

**❌ Not Verified:**

- Backup script not tested
- Cron job not documented
- Restore procedure not documented

**Required:**

```bash
#!/bin/bash
# /scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/equiprofile"
DB_NAME="equiprofile"
DB_USER="equiprofile"
DB_PASS="${MYSQL_PASSWORD}"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Log backup
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "INSERT INTO backupLogs (backupDate, backupType, backupSize, backupLocation, status) VALUES (NOW(), 'database', $(du -b $BACKUP_DIR/db_$DATE.sql.gz | cut -f1), '$BACKUP_DIR/db_$DATE.sql.gz', 'success');"

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

**Cron:**

```cron
# Daily backup at 2 AM
0 2 * * * /var/www/equiprofile/scripts/backup.sh
```

### Production Checklist Script

**❌ DOES NOT EXIST - CRITICAL**

**Required:** `/scripts/prod_checklist.sh`

```bash
#!/bin/bash
# Production Deployment Checklist

echo "=== EquiProfile Production Checklist ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node version
echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (>= 18)"
else
    echo -e "${RED}✗${NC} Node.js $NODE_VERSION (< 18 required)"
    ERRORS=$((ERRORS + 1))
fi

# Check npm install
echo "2. Checking dependencies..."
if npm install --legacy-peer-deps > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}✗${NC} Dependency installation failed"
    ERRORS=$((ERRORS + 1))
fi

# Check build
echo "3. Checking build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build succeeded"
else
    echo -e "${RED}✗${NC} Build failed"
    ERRORS=$((ERRORS + 1))
fi

# Check TypeScript
echo "4. Checking TypeScript..."
if npm run check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript check passed"
else
    echo -e "${RED}✗${NC} TypeScript errors found"
    ERRORS=$((ERRORS + 1))
fi

# Check database connectivity
echo "5. Checking database connectivity..."
if echo "SELECT 1;" | mysql -u $(echo $DATABASE_URL | grep -oP '(?<=://).*(?=:)') -p$(echo $DATABASE_URL | grep -oP '(?<=:)[^@]*(?=@)') > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database connection successful"
else
    echo -e "${RED}✗${NC} Database connection failed"
    ERRORS=$((ERRORS + 1))
fi

# Check critical env vars
echo "6. Checking environment variables..."
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "ADMIN_UNLOCK_PASSWORD"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_S3_BUCKET"
)

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo -e "${RED}✗${NC} Missing: $VAR"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} $VAR is set"
    fi
done

# Check admin password is not default
if [ "$ADMIN_UNLOCK_PASSWORD" = "Ashmor12@" ]; then
    echo -e "${RED}✗${NC} Admin password is still default!"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} Admin password changed from default"
fi

# Summary
echo ""
echo "=== Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found. Fix before deploying.${NC}"
    exit 1
fi
```

---

## Known Risks & Mitigation

### Risk 1: Data Loss During Migration

**Severity:** HIGH  
**Likelihood:** LOW

**Risk:**

- Database migration error could corrupt data
- No automatic rollback mechanism

**Mitigation:**

- ✅ Always backup before migration
- ✅ Test migrations on staging first
- ✅ Manual verification after migration
- ⚠️ Consider manual SQL migrations for critical changes

### Risk 2: Stripe Webhook Replay Attacks

**Severity:** HIGH  
**Likelihood:** MEDIUM

**Risk:**

- Duplicate webhook processing
- Double-charging or double-crediting

**Mitigation:**

- ❌ NOT IMPLEMENTED
- **Fix:** Add stripeEvents table with unique eventId
- Store and check eventId before processing

### Risk 3: Admin Password Compromise

**Severity:** CRITICAL  
**Likelihood:** LOW

**Risk:**

- Default password known publicly
- Weak password chosen

**Mitigation:**

- ✅ Production validation prevents default password
- ✅ Rate limiting on unlock attempts
- ✅ Activity logging
- ⚠️ Require strong password (16+ chars)

### Risk 4: S3 Bucket Misconfiguration

**Severity:** HIGH  
**Likelihood:** MEDIUM

**Risk:**

- Public bucket exposes private documents
- Incorrect permissions

**Mitigation:**

- ✅ Pre-signed URLs (not public URLs)
- ⚠️ Verify bucket policy blocks public access
- ⚠️ Enable bucket versioning
- ⚠️ Enable access logging

### Risk 5: Memory Exhaustion

**Severity:** MEDIUM  
**Likelihood:** MEDIUM

**Risk:**

- Single Node process on VPS
- Large file uploads
- Memory leaks

**Mitigation:**

- ✅ PM2 max_memory_restart configured
- ✅ File upload size limits
- ⚠️ Monitor memory usage
- ⚠️ Consider swap space

### Risk 6: Database Connection Pool Exhaustion

**Severity:** MEDIUM  
**Likelihood:** LOW

**Risk:**

- Too many concurrent requests
- Connection leaks

**Mitigation:**

- ✅ MySQL2 connection pooling
- ⚠️ Configure pool size (default: 10)
- ⚠️ Add connection timeout
- ⚠️ Monitor active connections

---

## Deployment Steps (Production)

### Prerequisites:

- Ubuntu 22.04 LTS VPS
- 2+ CPU cores
- 4+ GB RAM
- 50+ GB SSD
- Root or sudo access
- Domain name configured

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: MySQL Setup

```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql
mysql> CREATE DATABASE equiprofile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> CREATE USER 'equiprofile'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
mysql> GRANT ALL PRIVILEGES ON equiprofile.* TO 'equiprofile'@'localhost';
mysql> FLUSH PRIVILEGES;
mysql> EXIT;
```

### Step 3: Application Deployment

```bash
# Clone repository
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/your-org/equiprofile.git
cd equiprofile

# Install dependencies
sudo npm install --legacy-peer-deps

# Create .env file
sudo nano .env
# (Paste production environment variables)

# Build application
sudo npm run build

# Run production checklist
sudo chmod +x scripts/prod_checklist.sh
sudo ./scripts/prod_checklist.sh

# Run database migrations
sudo npm run db:push

# Start with PM2
sudo pm2 start ecosystem.config.js --env production
sudo pm2 save
sudo pm2 startup
```

### Step 4: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/equiprofile

# (Paste Nginx configuration from above)

# Enable site
sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate

```bash
# Obtain Let's Encrypt certificate
sudo certbot --nginx -d equiprofile.online -d www.equiprofile.online

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Configure Backups

```bash
# Create backup directory
sudo mkdir -p /var/backups/equiprofile

# Create log directory
sudo mkdir -p /var/log/equiprofile
sudo chown www-data:www-data /var/log/equiprofile

# Setup backup script
sudo chmod +x /var/www/equiprofile/scripts/backup.sh

# Add to cron
sudo crontab -e
# Add: 0 2 * * * /var/www/equiprofile/scripts/backup.sh
```

### Step 7: Configure Stripe Webhook

```bash
# In Stripe Dashboard:
# 1. Go to Developers → Webhooks
# 2. Add endpoint: https://equiprofile.online/api/webhooks/stripe
# 3. Select events:
#    - checkout.session.completed
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 4. Copy webhook signing secret to .env
```

### Step 8: Post-Deployment Verification

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs equiprofile --lines 50

# Test health endpoint
curl https://equiprofile.online/api/health

# Verify database connection
mysql -u equiprofile -p equiprofile -e "SELECT COUNT(*) FROM users;"

# Check Nginx status
sudo systemctl status nginx

# Verify SSL
curl -I https://equiprofile.online
```

### Step 9: Create First Admin User

```bash
# Connect to database
mysql -u equiprofile -p equiprofile

# Update user role
mysql> UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
mysql> EXIT;
```

### Step 10: Test Admin Unlock

1. Login to application
2. Navigate to `/ai-chat`
3. Type "show admin"
4. Enter admin password
5. Verify admin panel accessible at `/admin`

---

## Monitoring & Maintenance

### Daily Checks:

- ✅ PM2 status (`pm2 status`)
- ✅ Error logs (`pm2 logs equiprofile --err`)
- ✅ Disk space (`df -h`)
- ✅ Memory usage (`free -m`)

### Weekly Checks:

- ✅ Backup verification
- ✅ SSL certificate expiration
- ✅ Failed login attempts (activityLogs)
- ✅ Subscription renewals

### Monthly Checks:

- ✅ Dependency updates (`npm outdated`)
- ✅ Security patches
- ✅ Database optimization
- ✅ Log rotation

### Monitoring Tools Recommendations:

- PM2 Plus (paid, excellent monitoring)
- Uptime Robot (free uptime monitoring)
- Sentry (error tracking)
- Google Analytics (usage tracking)

---

## Security Hardening

### Firewall:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### Fail2Ban:

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### SSH Hardening:

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

---

## Conclusion

**Production Readiness: 65%**

### Ready for Production:

- ✅ Core application functionality
- ✅ Authentication and authorization
- ✅ Database schema and migrations
- ✅ Stripe payment integration (mostly)
- ✅ Admin unlock system
- ✅ Basic security measures

### Critical Blockers:

1. ❌ Stripe webhook idempotency
2. ❌ Logging system (Winston)
3. ❌ Production checklist script

### High Priority Before Launch:

1. Fix TypeScript errors
2. Verify build succeeds
3. Complete Stripe webhook handling
4. Implement logging
5. Test admin unlock flow
6. Verify backup system
7. Update PM2 config
8. Create Nginx config

### Post-Launch Priority:

1. Implement missing features (CSV exports, medical passport, etc.)
2. Mobile apps
3. Advanced features (breeding, lessons, client portal)
4. Performance optimization
5. Monitoring and alerting

**Estimated Time to Production Ready:** 40-60 hours (critical items only)  
**Estimated Time to Feature Complete:** 200+ hours (all requested features)

---

**Document Version:** 1.0  
**Last Updated:** January 1, 2026  
**Next Review:** After critical fixes completed
