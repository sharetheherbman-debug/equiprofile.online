# Image Upload Instructions

## ⚠️ ACTION REQUIRED: Upload Missing Images

This PR updates all image references in the codebase, but the actual image files need to be uploaded manually.

## Required Images

Please upload the following 4 images to `client/public/images/`:

### 1. `about-hero.jpg`
- **Description**: Dark horse portrait
- **Usage**: About page hero section
- **Referenced in**: `client/src/pages/About.tsx`

### 2. `documents-xrays.jpg`
- **Description**: Two horses grazing
- **Usage**: Documents & X-rays pages
- **Referenced in**: `client/src/pages/Features.tsx`

### 3. `horse-profiles.jpg`
- **Description**: Horses by ocean
- **Usage**: Horse profiles/Horse pages header
- **Referenced in**: `client/src/pages/Horses.tsx`

### 4. `hero-auth.jpg`
- **Description**: Woman with horse silhouette
- **Usage**: Hero/Home/Login/Register pages backgrounds
- **Referenced in**: 
  - `client/src/pages/Home.tsx`
  - `client/src/pages/auth/Login.tsx`
  - `client/src/pages/auth/Register.tsx`

## Image to Delete

After uploading the new images, delete:
- `client/public/images/hero-horse.jpg` (not desktop-friendly)

## How to Upload Images

1. Save your 4 new images with the exact names listed above
2. Copy them to `client/public/images/` directory
3. Delete `client/public/images/hero-horse.jpg`
4. Test the application locally to ensure all images load correctly
5. Commit and push the changes

## Verification Checklist

After uploading images, verify:
- [ ] All 4 new images are in `client/public/images/`
- [ ] `hero-horse.jpg` has been deleted
- [ ] Home page displays `hero-auth.jpg` correctly
- [ ] Login page background uses `hero-auth.jpg`
- [ ] Register page background uses `hero-auth.jpg`
- [ ] About page hero shows `about-hero.jpg`
- [ ] Features page Documents section shows `documents-xrays.jpg`
- [ ] Horses page header displays `horse-profiles.jpg`
- [ ] All images are responsive on mobile and desktop
- [ ] No broken image links (404 errors)

## Code Changes Already Made

The following files have been updated to reference the new image paths:
- ✅ `client/src/pages/Home.tsx` - Changed hero image to `/images/hero-auth.jpg`
- ✅ `client/src/pages/auth/Login.tsx` - Changed background to `/images/hero-auth.jpg`
- ✅ `client/src/pages/auth/Register.tsx` - Changed background to `/images/hero-auth.jpg`
- ✅ `client/src/pages/About.tsx` - Changed hero to `/images/about-hero.jpg`
- ✅ `client/src/pages/Features.tsx` - Updated documents/x-rays section to use `/images/documents-xrays.jpg`
- ✅ `client/src/pages/Horses.tsx` - Added header image using `/images/horse-profiles.jpg`

## Pricing Changes Already Made

The following pricing updates have been completed:
- ✅ Removed all storage limit mentions (5GB, 10GB, 100GB)
- ✅ Updated Trial plan to "1 horse profile"
- ✅ Updated Pro plan to "Up to 10 horse profiles"
- ✅ Kept Stable plan as "Unlimited horse profiles"
- ✅ Updated both `Pricing.tsx` and `BillingPage.tsx`
