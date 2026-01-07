# Admin Unlock System - Complete Guide

## Overview

The EquiProfile admin panel is protected by a two-factor security system:
1. User must have `admin` role in the database
2. Admin session must be unlocked via AI chat (time-limited to 30 minutes)

This design ensures that even if someone gains admin role access, they cannot use admin features without the unlock password.

---

## 🔐 Security Features

### Multi-Layer Protection
- **Role-Based Access**: Only users with `role='admin'` can attempt unlock
- **Password Protection**: Requires `ADMIN_UNLOCK_PASSWORD` environment variable
- **Rate Limiting**: 5 failed attempts = 15-minute lockout
- **Session Expiry**: Admin access expires after 30 minutes of inactivity
- **Activity Logging**: All unlock attempts are logged (success and failure)
- **No Plaintext Storage**: Passwords never logged or stored in plain text

### Security Best Practices
- Change default password immediately in production
- Use strong passwords (minimum 12 characters, mixed case, numbers, symbols)
- Rotate password periodically
- Monitor activity logs for suspicious unlock attempts
- Consider IP-based access restrictions for admin features

---

## 🚀 Quick Start

### 1. Setup Admin User

```sql
-- Connect to MySQL
mysql -u root -p

-- Set user as admin
USE equiprofile;
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
exit;
```

### 2. Configure Password

```bash
# Edit .env file
nano .env

# Add or update this line:
ADMIN_UNLOCK_PASSWORD=your_secure_password_here

# Restart application
pm2 restart equiprofile  # or: npm run dev
```

### 3. Test Unlock Flow

1. **Login** to the application with admin user
2. **Navigate** to AI Chat (`/ai-chat`)
3. **Type**: `show admin`
4. **Enter** the admin password when prompted
5. **Success**: Admin mode unlocked for 30 minutes
6. **Access** admin panel at `/admin`

---

## 📋 Usage Guide

### Unlocking Admin Mode

**Step 1: Navigate to AI Chat**
- Click "AI Chat" in the sidebar navigation
- Or visit `/ai-chat` directly

**Step 2: Trigger Unlock**
- Type the command: `show admin`
- System responds with password challenge

**Step 3: Enter Password**
- Password input field appears below chat
- Enter your `ADMIN_UNLOCK_PASSWORD`
- Press Enter or click "Unlock" button

**Step 4: Access Admin Panel**
- Success message confirms unlock
- Admin panel accessible at `/admin`
- Session valid for 30 minutes

### Checking Session Status

**In AI Chat:**
- Admin status badge shows in header if unlocked
- Displays expiry time

**In Admin Panel:**
- Attempting to access without unlock redirects to AI Chat
- Alert message explains unlock requirement

### Extending Session

- Simply unlock again before expiry
- New 30-minute session replaces old one
- No penalty for re-unlocking while active

### Manual Lock (Early Termination)

Currently not exposed in UI, but can be called via tRPC:

```typescript
const lockMutation = trpc.adminUnlock.lock.useMutation();
lockMutation.mutate();
```

---

## 🔧 Technical Details

### Database Schema

**Admin Sessions Table:**
```sql
CREATE TABLE adminSessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Unlock Attempts Tracking:**
```sql
CREATE TABLE adminUnlockAttempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  attempts INT DEFAULT 0,
  lockedUntil TIMESTAMP NULL,
  lastAttemptAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

**Check Status:**
```typescript
GET /api/trpc/adminUnlock.getStatus
Response: { isUnlocked: boolean, expiresAt?: Date }
```

**Request Unlock Challenge:**
```typescript
POST /api/trpc/adminUnlock.requestUnlock
Response: { challenge: string, attemptsRemaining: number }
```

**Submit Password:**
```typescript
POST /api/trpc/adminUnlock.submitPassword
Body: { password: string }
Response: { success: true, expiresAt: Date }
Error: { code: 'UNAUTHORIZED' | 'TOO_MANY_REQUESTS' }
```

**Revoke Session:**
```typescript
POST /api/trpc/adminUnlock.lock
Response: { success: true }
```

### Rate Limiting Logic

```typescript
// On password submission:
1. Increment attempt counter for user
2. If attempts > 5:
   - Set lockedUntil = now + 15 minutes
   - Throw TOO_MANY_REQUESTS error
3. If password correct:
   - Create admin session (expires in 30 minutes)
   - Reset attempt counter to 0
4. If password incorrect:
   - Log failed attempt
   - Throw UNAUTHORIZED error
```

### Session Validation

```typescript
// adminProcedure middleware:
1. Check if user.role === 'admin'
2. Query adminSessions table for active session
3. Verify session.expiresAt > now
4. If no valid session:
   - Throw FORBIDDEN error
   - Prompt user to unlock via AI chat
5. Otherwise: Allow request to proceed
```

---

## 🧪 Testing Checklist

### Basic Flow
- [ ] Non-admin user cannot see "show admin" option
- [ ] Non-admin user gets rejection message on "show admin"
- [ ] Admin user can trigger unlock with "show admin"
- [ ] Password input appears after challenge
- [ ] Correct password unlocks admin mode
- [ ] Admin panel becomes accessible after unlock
- [ ] Session status shows in AI Chat header

### Security Tests
- [ ] Incorrect password rejects unlock
- [ ] 5 failed attempts triggers 15-minute lockout
- [ ] Cannot unlock again during lockout period
- [ ] Lockout expires after 15 minutes
- [ ] Session expires after 30 minutes
- [ ] Admin panel redirects to AI Chat when session expired
- [ ] All attempts logged in activity logs

### Edge Cases
- [ ] Multiple unlock attempts in quick succession
- [ ] Session expires while on admin page
- [ ] Re-unlocking before expiry extends session
- [ ] Password with special characters works correctly
- [ ] Empty password rejected
- [ ] Very long password handled correctly

### Integration Tests
- [ ] Admin endpoints blocked without session
- [ ] Admin endpoints work with valid session
- [ ] Session persists across page refreshes
- [ ] Session shared across browser tabs
- [ ] Logout clears admin session

---

## 🐛 Troubleshooting

### "Admin session expired" Error

**Problem**: Trying to access admin panel but session expired.

**Solution**: 
1. Go to AI Chat (`/ai-chat`)
2. Type "show admin"
3. Enter password to unlock again

### "Too many attempts" Error

**Problem**: Exceeded 5 failed password attempts.

**Solution**: 
- Wait 15 minutes for lockout to expire
- Or, as admin, manually reset in database:
  ```sql
  UPDATE adminUnlockAttempts 
  SET attempts = 0, lockedUntil = NULL 
  WHERE userId = [your_user_id];
  ```

### Password Not Working

**Check**:
1. Verify `ADMIN_UNLOCK_PASSWORD` in `.env` file
2. Restart application after changing `.env`
3. Check for trailing spaces in password
4. Ensure password matches exactly (case-sensitive)

### Admin Panel Not Accessible

**Check**:
1. User has `role='admin'` in database
2. Admin session is unlocked and not expired
3. Browser cookies enabled
4. No console errors in browser DevTools

### "Database not available" Error

**Check**:
1. MySQL server is running
2. `DATABASE_URL` in `.env` is correct
3. Database tables created (run migrations)
4. Database user has proper permissions

---

## 📊 Monitoring & Analytics

### Activity Log Queries

**View recent unlock attempts:**
```sql
SELECT * FROM activityLogs 
WHERE action IN ('admin_unlocked', 'admin_unlock_failed') 
ORDER BY createdAt DESC 
LIMIT 20;
```

**Count failed attempts by user:**
```sql
SELECT userId, COUNT(*) as failed_attempts 
FROM activityLogs 
WHERE action = 'admin_unlock_failed' 
AND createdAt > NOW() - INTERVAL 24 HOUR
GROUP BY userId;
```

**Check active admin sessions:**
```sql
SELECT s.*, u.email 
FROM adminSessions s
JOIN users u ON s.userId = u.id
WHERE s.expiresAt > NOW();
```

### Rate Limit Status

**Check locked accounts:**
```sql
SELECT a.*, u.email 
FROM adminUnlockAttempts a
JOIN users u ON a.userId = u.id
WHERE a.lockedUntil > NOW();
```

---

## 🔒 Production Security Recommendations

### Password Policy
- **Minimum 16 characters**
- Mix of uppercase, lowercase, numbers, symbols
- Avoid dictionary words
- Rotate every 90 days
- Never share password via email or chat

### Environment Security
- Store `.env` file outside web root
- Restrict file permissions: `chmod 600 .env`
- Use secrets manager in production (AWS Secrets Manager, Vault, etc.)
- Never commit `.env` to version control

### Additional Hardening
- Enable 2FA for database access
- Implement IP whitelisting for admin routes
- Add honeypot logging for unauthorized attempts
- Set up alerting for suspicious activity
- Regular security audits of admin actions

### Compliance
- Log all admin actions for audit trail
- Retain logs per compliance requirements
- Implement log rotation and archival
- Encrypt logs at rest
- Regular backup of activity logs

---

## 📝 FAQ

**Q: Can I use the admin panel without unlocking?**  
A: No, even with admin role, you must unlock via AI chat first.

**Q: How long does admin session last?**  
A: 30 minutes from unlock. You can re-unlock to extend.

**Q: What happens if I close the browser?**  
A: Session persists as long as cookies are saved. Session still expires after 30 minutes.

**Q: Can multiple admins be unlocked simultaneously?**  
A: Yes, each admin user has their own independent session.

**Q: Is the password encrypted?**  
A: Password stored in environment variable, never in database. Transmitted over HTTPS only.

**Q: Can I change the session duration?**  
A: Yes, modify the duration in `server/routers.ts`:
```typescript
const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
```

**Q: How do I disable the unlock requirement?**  
A: Not recommended, but you can modify `adminProcedure` middleware to skip session check. This removes a critical security layer.

**Q: Are there any commands besides "show admin"?**  
A: Currently, "show admin" is the only special command. The AI chat also handles normal queries.

---

## 🚨 Emergency Procedures

### Forgot Admin Password

1. SSH into server
2. Edit `.env` file
3. Update `ADMIN_UNLOCK_PASSWORD`
4. Restart application: `pm2 restart equiprofile`
5. Use new password to unlock

### Locked Out (Too Many Attempts)

**Option 1: Wait 15 minutes**

**Option 2: Manual reset**
```bash
# Connect to MySQL
mysql -u root -p equiprofile

# Reset lockout for user
UPDATE adminUnlockAttempts 
SET attempts = 0, lockedUntil = NULL 
WHERE userId = (SELECT id FROM users WHERE email = 'admin@example.com');
```

### Session Expired During Critical Task

1. Save any work immediately
2. Open AI Chat in new tab
3. Type "show admin" and unlock
4. Return to admin panel
5. Continue work

### Suspicious Activity Detected

1. Immediately change admin password
2. Revoke all active admin sessions:
   ```sql
   DELETE FROM adminSessions;
   ```
3. Review activity logs for unauthorized access
4. Check for unauthorized user role changes
5. Verify database integrity
6. Consider enabling additional security measures

---

## 📚 Additional Resources

- **Main Documentation**: `/README.md`
- **Deployment Guide**: `/DEPLOYMENT.md`
- **API Documentation**: `/docs/API.md`
- **Security Policy**: `/SECURITY.md`

---

**Last Updated**: 2026-01-01  
**Version**: 1.0.0
