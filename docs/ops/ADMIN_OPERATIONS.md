# Admin Operations Guide

This guide covers administrative operations and maintenance tasks for EquiProfile.

## Table of Contents
- [Admin User Management](#admin-user-management)
- [Data Cleanup & Maintenance](#data-cleanup--maintenance)
- [Upload Storage](#upload-storage)
- [System Status Monitoring](#system-status-monitoring)

---

## Admin User Management

### Creating an Admin User

To promote a user to admin role, use the `make-admin` CLI script:

```bash
# Navigate to the project root
cd /path/to/equiprofile.online

# Run the script with the user's email
tsx scripts/make-admin.ts --email user@example.com
```

**Requirements:**
- Local server access (cannot be run remotely for security)
- User must already have a registered account
- Direct database access

**Example Output:**
```
🔧 Admin Bootstrap Script
========================

Looking up user: user@example.com...
✅ Success! User promoted to admin.
   Email: user@example.com
   User ID: 42
   Name: John Doe
   Previous role: user
   New role: admin

ℹ️  The user can now access admin features after unlocking admin mode in the app.
```

### Admin Mode Access

Once a user has admin role:

1. Sign in to the application
2. Navigate to AI Chat page
3. Send the command: `show admin`
4. Enter the admin unlock password (set in `ADMIN_UNLOCK_PASSWORD` env var)
5. Admin session is now active for 8 hours

### Admin Capabilities

Admins can access:
- User management (suspend, unsuspend, delete users)
- System statistics and analytics
- Activity logs
- API key management
- Environment health checks
- Data cleanup procedures

---

## Data Cleanup & Maintenance

### Orphaned Records

When horses are deleted, related records may become orphaned if not properly cleaned up.

#### Scan for Orphans (Dry Run)

Check for orphaned records without deleting:

```bash
# Via AI Chat (admin mode required)
# Use admin procedures or access via tRPC
```

In code (admin panel UI):
```typescript
const result = await trpc.admin.purgeOrphans.mutate({ 
  dryRun: true 
});

// Result shows counts of orphaned records:
// {
//   healthRecords: 5,
//   trainingSessions: 12,
//   feedCosts: 3,
//   ...
// }
```

#### Purge Orphans

Remove all orphaned records:

```typescript
const result = await trpc.admin.purgeOrphans.mutate({ 
  dryRun: false 
});
```

**Warning:** This action is irreversible. Always run with `dryRun: true` first.

### Hard Delete a Horse

Delete a horse and ALL related records:

```typescript
const result = await trpc.admin.deleteHorseHard.mutate({ 
  horseId: 123 
});

// Returns detailed deletion report:
// {
//   success: true,
//   horseName: "Thunder",
//   deleted: {
//     healthRecords: 15,
//     trainingSessions: 45,
//     feedCosts: 20,
//     lessonBookings: 8
//   }
// }
```

**Use Cases:**
- User requests complete data removal
- Cleaning up test data
- Preparing for system reset

---

## Upload Storage

### Storage Backends

EquiProfile supports three upload storage modes:

1. **Forge API** (recommended for production)
   - Configure `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`
   - Cloud storage with CDN delivery
   
2. **Local Storage** (fallback)
   - Automatic fallback when Forge not configured
   - Files stored in `LOCAL_UPLOADS_PATH` (default: `/var/equiprofile/uploads`)
   - Served via authenticated backend route `/api/storage/*`
   
3. **AWS S3** (legacy, optional)
   - Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

### Local Storage Setup

1. **Create uploads directory:**
   ```bash
   sudo mkdir -p /var/equiprofile/uploads
   sudo chown $(whoami):$(whoami) /var/equiprofile/uploads
   sudo chmod 755 /var/equiprofile/uploads
   ```

2. **Configure environment:**
   ```bash
   # .env
   ENABLE_UPLOADS=true
   LOCAL_UPLOADS_PATH=/var/equiprofile/uploads
   ```

3. **Verify:**
   - Upload a document in the app
   - Check that files appear in the uploads directory
   - Files are served via `/api/storage/{path}` (requires auth)

### Security Notes

- Local files are **never** served directly as static files
- All file access requires authentication
- Path traversal protection prevents accessing files outside uploads directory
- Content-Type headers are set based on file extension

---

## System Status Monitoring

### Health Endpoints

**Basic Health Check:**
```bash
curl http://localhost:3000/healthz
# Returns: {"ok":true,"timestamp":"2026-01-26T..."}
```

**Readiness Check:**
```bash
curl http://localhost:3000/api/ready
# Returns: {"status":"ready","database":"connected"}
```

**System Status (Detailed):**
```bash
curl http://localhost:3000/api/trpc/system.status
```

Returns comprehensive status:
```json
{
  "featureFlags": {
    "uploadsEnabled": true,
    "stripeEnabled": false,
    "forgeEnabled": true,
    "pwaEnabled": false
  },
  "serviceStatus": {
    "uploads": {
      "enabled": true,
      "ready": true,
      "backend": "local"
    },
    "ai": {
      "enabled": true,
      "ready": true
    },
    "weather": {
      "enabled": true,
      "ready": true
    },
    "stripe": {
      "enabled": false,
      "ready": false
    }
  },
  "environment": {
    "nodeEnv": "production",
    "version": "1.0.0"
  }
}
```

### Environment Health (Admin Only)

Check all required environment variables:

```typescript
const health = await trpc.admin.getEnvHealth.query();
```

Returns:
- Missing required variables
- Conditional requirements based on feature flags
- Overall health status

---

## Troubleshooting

### Common Issues

**1. Uploads Failing**

Check:
```bash
# Verify uploads directory exists and is writable
ls -la /var/equiprofile/uploads

# Check system status
curl http://localhost:3000/api/trpc/system.status

# Check environment variables
# ENABLE_UPLOADS=true
# LOCAL_UPLOADS_PATH or Forge credentials set
```

**2. Admin Mode Won't Unlock**

- Verify `ADMIN_UNLOCK_PASSWORD` is set in environment
- Ensure user has `role='admin'` in database
- Check admin session hasn't expired (8 hour limit)

**3. Orphaned Data After Horse Deletion**

- Run `purgeOrphans` in dry-run mode to assess
- Execute purge to clean up
- Consider implementing cascade deletes at database level (future enhancement)

---

## Backup Recommendations

**Before Major Cleanup Operations:**
```bash
# Backup database
mysqldump -u user -p equiprofile > backup_$(date +%Y%m%d).sql

# Backup uploads directory (if using local storage)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/equiprofile/uploads
```

**Regular Maintenance:**
- Weekly database backups
- Monitor orphaned records growth
- Review activity logs for suspicious patterns
- Update admin password regularly

---

## Support

For issues not covered in this guide:
1. Check logs: `/var/log/equiprofile/app.log` (if configured)
2. Review activity logs in admin panel
3. Contact technical support with:
   - System status output
   - Environment health check results
   - Relevant error messages
