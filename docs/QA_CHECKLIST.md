# Production QA Checklist

This checklist validates that the production deployment is working correctly.

## Build & Start

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` produces `dist/index.js` and `dist/public/`
- [ ] Verify `dist/index.js` exists and is >100KB
- [ ] Verify `dist/public/index.html` exists
- [ ] Verify `dist/public/assets/` directory exists with JS/CSS files
- [ ] `node dist/index.js` starts server on port 3000
- [ ] `curl http://localhost:3000/healthz` returns `{"ok":true}`

## Nginx & Deployment

- [ ] `sudo nginx -t` passes configuration test
- [ ] `sudo systemctl status equiprofile` shows service as active
- [ ] `curl https://yourdomain.com` returns 200 OK (not 502/503)
- [ ] `curl https://yourdomain.com/healthz` returns JSON with `"ok":true`
- [ ] HTTPS redirect works: `curl -I http://yourdomain.com` returns 301

## Assets & MIME Types

Test that assets are served with correct Content-Type headers:

- [ ] `curl -I https://yourdomain.com/assets/*.js` returns `Content-Type: application/javascript`
- [ ] `curl -I https://yourdomain.com/assets/*.css` returns `Content-Type: text/css`
- [ ] `/theme-override.css` does NOT return index.html (should return CSS or 404)
- [ ] `/service-worker.js` returns JavaScript, not HTML
- [ ] Asset files return actual file content, not the SPA fallback HTML

### Test Command Examples

```bash
# Test JavaScript MIME type
curl -I https://yourdomain.com/assets/index-*.js | grep -i content-type
# Should show: content-type: application/javascript

# Test CSS MIME type
curl -I https://yourdomain.com/assets/index-*.css | grep -i content-type
# Should show: content-type: text/css

# Test that non-existent asset returns 404, not HTML
curl -I https://yourdomain.com/assets/nonexistent.js
# Should show: HTTP/2 404
```

## CSP & Console Errors

Open the application in a browser and check the developer console:

- [ ] Browser console shows NO CSP violations
- [ ] Browser console shows NO "Failed to load module" errors
- [ ] Browser console shows NO MIME-type errors (e.g., "was blocked due to MIME type")
- [ ] No errors about "Refused to execute inline script"
- [ ] No errors about "Refused to load the stylesheet"

### Common CSP Errors to Watch For

❌ `Refused to execute inline script because it violates the following Content Security Policy directive`
❌ `The resource was blocked due to MIME type ("text/html") mismatch`
✅ No errors in console

## Routes & Login

Test core application functionality:

- [ ] Landing page loads (not white screen)
- [ ] Landing page shows hero section with proper styling
- [ ] `/login` route works and displays login form
- [ ] `/register` route works and displays registration form
- [ ] Login with valid credentials works
- [ ] After login, redirects to `/dashboard`
- [ ] `/dashboard` route works (after login)
- [ ] Dashboard shows user information
- [ ] SPA navigation works without full page reload (check network tab - should not reload index.html on navigation)

## Visual Check

- [ ] Hero image displays on homepage
- [ ] Typography is consistent and readable
- [ ] Colors match branding (primary blue theme)
- [ ] Buttons have proper styling
- [ ] Cards have proper shadows and borders
- [ ] Navigation menu works
- [ ] Footer displays correctly
- [ ] Mobile responsive (test with browser dev tools)

## Service Worker (if PWA enabled)

- [ ] Service worker registers successfully (check console)
- [ ] No service worker errors in console
- [ ] Service worker serves with correct MIME type
- [ ] `/manifest.json` loads correctly

## Database & Backend

- [ ] Health records can be created
- [ ] Training sessions can be created
- [ ] Horse profiles can be created
- [ ] Data persists after page reload
- [ ] Search/filter functionality works

## Performance

- [ ] Initial page load < 3 seconds
- [ ] Time to Interactive (TTI) < 5 seconds
- [ ] No console warnings about performance
- [ ] Images load properly (check network tab)

## Security

- [ ] HTTPS works (green padlock in browser)
- [ ] SSL certificate is valid
- [ ] HTTP redirects to HTTPS
- [ ] CSP headers are present (check in network tab)
- [ ] Security headers present: X-Frame-Options, X-Content-Type-Options, etc.

### Check Security Headers

```bash
curl -I https://yourdomain.com | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)"
```

Expected output:

```
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
```

## Deployment Script

- [ ] `deployment/deploy.sh` can be run successfully
- [ ] Running deploy script twice (idempotent) causes no errors
- [ ] Deploy script shows all green checkmarks
- [ ] Deploy script creates systemd service
- [ ] Deploy script tests nginx configuration

## Logs & Monitoring

- [ ] Application logs are visible: `journalctl -u equiprofile -n 50`
- [ ] No error messages in application logs
- [ ] Nginx access logs working: `/var/log/nginx/equiprofile-access.log`
- [ ] Nginx error logs working: `/var/log/nginx/equiprofile-error.log`

## Final Integration Test

Perform a complete user journey:

1. [ ] Visit homepage
2. [ ] Click "Start Free Trial"
3. [ ] Register new account
4. [ ] Verify email/complete registration
5. [ ] Login with new account
6. [ ] Create a horse profile
7. [ ] Add a health record
8. [ ] Schedule a training session
9. [ ] View dashboard
10. [ ] Logout
11. [ ] Login again - data persists

## Troubleshooting Common Issues

### White Screen

If you see a white screen:

1. Check browser console for CSP errors
2. Check browser console for MIME type errors
3. Verify `dist/public/index.html` exists
4. Check nginx error logs

### Assets Return HTML

If assets return HTML instead of JS/CSS:

1. Check server/\_core/vite.ts SPA fallback logic
2. Verify assets are in `dist/public/assets/`
3. Test with: `curl https://yourdomain.com/assets/index-*.js | head -n1`
   - Should show JavaScript, not `<!doctype html>`

### CSP Violations

If you see CSP violations:

1. Ensure no inline scripts in `client/index.html`
2. Verify `server/_core/index.ts` has correct CSP config
3. Check that all scripts are loaded from `/src/` or `/assets/`

---

## Sign-Off

Deployment tested by: **\*\***\_\_\_**\*\***  
Date: **\*\***\_\_\_**\*\***  
Environment: **\*\***\_\_\_**\*\***  
Version: **\*\***\_\_\_**\*\***

All checks passed: ☐ Yes ☐ No

If no, list issues:
