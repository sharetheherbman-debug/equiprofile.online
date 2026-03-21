# Smoke Tests & QA Checklist

Quick validation steps to confirm a production deployment is healthy.

## API Health Check

```bash
# Returns 200 with build info
curl -s https://equiprofile.online/api/health | jq .
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

## Build Fingerprint Check

```bash
# Check build metadata
curl -s https://equiprofile.online/build.txt
# Expected: BUILD_SHA=<sha>, BUILD_TIME=<iso>, VERSION=<ver>
```

Build fingerprint is also visible to admins in:

- **Dashboard**: sidebar footer shows "Dashboard v2 · sha:<hash> · v<version>"
- **Settings → System tab** (unlocked admins only): shows version, SHA, build time

## "show admin" Stealth Command Test

1. Login and go to `/ai-chat`
2. In the chat input, type exactly: `show admin` (or `show afmin`) and press Enter
3. **Expected**: The text does NOT appear in the chat transcript. Instead, a password prompt appears below the chat box.
4. **Failure**: If the text "show admin" appears as a user message bubble in the transcript, the stealth intercept is broken.

## Upload Endpoint

To test the upload endpoint, authenticate first, then:

```bash
# 1. Login (get session cookie)
curl -s -c /tmp/cookies.txt -X POST https://equiprofile.online/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<your-email>","password":"<your-password>"}' | jq .status

# 2. Upload a test image via the trpc documents.upload procedure
# (Upload is handled via tRPC, see HorseForm.tsx for client implementation)
```

## QA UI Checklist

Access the interactive QA dashboard at `/qa-check` (requires login + admin unlock).

### Videos

- [ ] Landing page (`/`) — hero image slider rotates through slides
- [ ] Login page (`/login`) — image slider shows gallery images
- [ ] Register page (`/register`) — image slider shows gallery images

### Auth Layout

- [ ] Login/Register nav is identical to landing page nav (same `<MarketingNav>` component)
- [ ] Video + form panel starts at the top of the screen (no weird vertical centering)
- [ ] Login shows ONE field at a time: step 1 = email, step 2 = password (Back/Continue buttons)
- [ ] Register shows ONE step at a time: step 1 = name, step 2 = email/password

### Image Uploads

- [ ] Add/Edit Horse page shows a file picker button (not URL-only input)
- [ ] Selecting a valid image file (< 5 MB) uploads successfully and shows preview
- [ ] Oversized file (> 5 MB) shows an error toast, no upload attempted

### Dashboard

- [ ] `/dashboard` loads without white screen or console errors
- [ ] Stats overview shows horse count, training hours, upcoming events
- [ ] Quick actions (Add Horse, Log Training, Schedule, AI Chat) are clickable
- [ ] All module cards are visible and links navigate correctly
- [ ] Recent horses list shows if any horses exist

### Dashboard Routes (spot-check)

- [ ] `/horses` — horse list loads
- [ ] `/horses/new` — form renders
- [ ] `/health` — health hub renders
- [ ] `/training` — training log renders
- [ ] `/calendar` — calendar renders
- [ ] `/settings` — settings renders
- [ ] `/admin` — admin panel accessible (after unlock)

## Video Asset Paths

| Page                   | Asset Path                                |
| ---------------------- | ----------------------------------------- |
| Landing (`/`)          | Image slider (hero + landing images)      |
| Login (`/login`)       | Image slider (gallery images)             |
| Register (`/register`) | Image slider (gallery images)             |

Both assets are served as static files from `client/public/`.

## Files Changed

| File                                   | Change                                             |
| -------------------------------------- | -------------------------------------------------- |
| All MP4 files removed                  | Replaced with image sliders using existing images  |
| `client/src/config/marketingAssets.ts` | Removed video refs, added slider image arrays      |
| `client/src/pages/QAChecklist.tsx`     | Added Videos, Auth Layout, and Image Upload checks |
| `client/src/components/ImageSlider.tsx` | New reusable image slider component               |
