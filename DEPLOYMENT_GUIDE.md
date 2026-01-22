# EquiProfile Deployment Guide - Frontend Updates

## 🚀 Quick Deployment Steps

### 1. Pre-Deployment Checklist

✅ Review all commits in this PR:
```bash
git log --oneline cb19350^..cb19350
```

✅ Verify no TypeScript errors in modified files:
```bash
pnpm run check 2>&1 | grep -E "(Pricing|Login|Register|AuthSplit|Footer|Contact|Privacy|Terms|About|Home).tsx"
```
Expected: No errors (pre-existing errors in other files are OK)

✅ Test build:
```bash
pnpm run build
```

### 2. Add Marketing Images

**Directory**: `client/src/assets/marketing/`

**Required Images** (4 total):

1. **Landing Page Hero**
   - Filename: `landing-hero.jpg` OR `landing-page2.jpg`
   - Usage: Main hero on Home.tsx
   - Specs: High-res, responsive, works with dark overlay

2. **Auth Split Screen**
   - Filename: `auth-split.jpg`
   - Usage: Login/Register pages (right side)
   - Specs: Professional, suitable for 50/50 split

3. **Training & Scheduling**
   - Filename: `training-scheduling.jpg`
   - Usage: Features page section
   - Specs: Modern, equine-themed

4. **Reporting & Analytics**
   - Filename: `reporting-analytics.jpg`
   - Usage: Features page section
   - Specs: Professional, data/analytics theme

**After adding images**, update imports in:
- `client/src/pages/Home.tsx` (hero image)
- `client/src/components/AuthSplitLayout.tsx` (optional: custom auth image)
- `client/src/pages/Features.tsx` (feature section images)

### 3. Environment Variables

**Required** (should already be set):
```bash
# Admin password
VITE_ADMIN_PASSWORD=<secure-password>

# Database
DATABASE_URL=<connection-string>
```

**Optional** (for future backend tasks):
```bash
# Stripe (for B3)
STRIPE_PUBLISHABLE_KEY=<key>
STRIPE_SECRET_KEY=<secret>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# OpenAI (for B6 weather)
OPENAI_API_KEY=<key>

# SMTP (for B7)
SMTP_HOST=<host>
SMTP_PORT=<port>
SMTP_USER=<user>
SMTP_PASSWORD=<password>
SMTP_FROM=support@equiprofile.online
```

### 4. Build & Deploy

```bash
# Install dependencies (if not already done)
pnpm install

# Run type check
pnpm run check

# Build for production
pnpm run build

# Start production server
pnpm run start
```

### 5. Smoke Test Checklist

After deployment, test these flows:

- [ ] **Landing Page**
  - Hero displays correctly
  - Overlay is soft (bg-black/20)
  - Feature sections look good
  - Footer shows +44 7347 258089 and support@equiprofile.online

- [ ] **Auth Pages**
  - Login page: 50/50 split (desktop), hero on right
  - Register page: 50/50 split (desktop), hero on right
  - Mobile: Forms stack properly
  - WhatsApp link includes prefilled message

- [ ] **Pricing Page**
  - FAQ accordion expands/collapses
  - All 7 questions display correctly
  - Contact details correct in FAQ
  - Support CTA links to /contact

- [ ] **Contact Page**
  - Email: support@equiprofile.online
  - Phone: +44 7347 258089
  - WhatsApp: Correct number with prefilled message

- [ ] **Legal Pages**
  - Privacy page: support@equiprofile.online (2 places)
  - Terms page: support@equiprofile.online (1 place)

- [ ] **About Page**
  - Soft overlay (bg-black/20) on hero
  - Soft overlay on story section

- [ ] **Admin Access** (for admins only)
  - No hints in console
  - `showAdmin()` still works
  - Admin panel accessible after unlock

### 6. Rollback Plan

If issues are found:

```bash
# Revert to previous version
git revert cb19350^..cb19350

# Or checkout previous commit
git checkout 4402938

# Rebuild and deploy
pnpm run build
pnpm run start
```

---

## 📝 What's Changed

### Content
- Email: `support@equiprofile.com` → `support@equiprofile.online` (3 instances)
- Phone: `+447700900000` → `+44 7347 258089` (2 instances)
- WhatsApp: Added prefilled message

### UI/UX
- Auth pages: Centered form → 50/50 split screen
- Overlays: Dark (50%) → Soft (20%)
- Pricing FAQ: Basic divs → Modern accordion

### Code
- New component: `AuthSplitLayout.tsx`
- New directory: `client/src/assets/marketing/`
- Admin hints removed from console

---

## 🐛 Troubleshooting

### Issue: Build fails with TypeScript errors

**Solution**: Check if errors are in modified files:
```bash
pnpm run check 2>&1 | grep -E "(Pricing|Login|Register|AuthSplit|Footer|Contact|Privacy|Terms|About|Home).tsx"
```

If errors exist in our files, review changes. If errors are only in other files (Appointments, DentalCare, etc.), they are pre-existing and won't block deployment.

### Issue: Images not loading

**Solution**:
1. Verify images are in `client/src/assets/marketing/`
2. Check filenames match exactly (case-sensitive)
3. Update imports in component files
4. Rebuild: `pnpm run build`

### Issue: Auth pages look wrong

**Solution**:
1. Clear browser cache
2. Check `AuthSplitLayout.tsx` is properly imported
3. Verify Tailwind classes are compiled
4. Check browser console for errors

### Issue: WhatsApp link doesn't work

**Solution**:
1. Verify phone number format: `+447347258089` (no spaces in URL)
2. Check `encodeURIComponent()` wraps the message
3. Test on mobile device (WhatsApp must be installed)

---

## 📞 Support

If deployment issues arise:
- Email: support@equiprofile.online
- Phone: +44 7347 258089

For backend tasks (B2-B8), refer to `IMPLEMENTATION_STATUS.md` for detailed planning.

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ All smoke tests pass
- ✅ No new TypeScript errors
- ✅ Build completes without errors
- ✅ UI changes display correctly
- ✅ All contact details are correct
- ✅ Admin system works (no UI hints)
- ✅ Mobile responsive design works

**Expected Result**: Modern, polished frontend with consistent branding and improved UX.
