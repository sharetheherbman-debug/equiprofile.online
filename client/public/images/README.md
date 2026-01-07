# EquiProfile Images

This directory contains all visual assets for the EquiProfile application.

## Current Assets

### Feature Icons (`features/`)
- `icon-automation.svg` - Automation/workflow icon
- `icon-analytics.svg` - Analytics/charts icon
- `icon-security.svg` - Security/lock icon
- `icon-integrations.svg` - Integrations/connections icon
- `icon-speed.svg` - Performance/speed icon
- `icon-support.svg` - Support/help icon

**Note**: These are placeholder SVG icons. For production, consider:
- Using your brand's icon style
- Ensuring consistent stroke width and sizing
- Optimizing SVGs with SVGO
- Adding proper aria-labels in components

### Hero Images (To Be Added)

**hero.webp** (Required for new design)
- **Recommended size**: 1920x1080px
- **Format**: WebP (for optimal loading)
- **Content suggestions**:
  - Modern professional equestrian setting
  - Horse care or stable management scene
  - Abstract tech visual with equestrian theme
  - Professional photography showing the app in use
- **Optimization**: Use tools like `squoosh.app` or `sharp` to optimize
- **Fallback**: Can temporarily use `hero-horse.jpg` (exists in directory)

### Current Images (May be replaced)
- `hero-horse.jpg` (245KB) - Current hero image
- `horse-stable.jpg` (70KB) - Stable scene
- `riding-lesson.jpg` (110KB) - Training scene
- `stable.jpg` (127KB) - Stable exterior
- `training.jpg` (203KB) - Training activity

## Image Guidelines

### Performance Requirements
1. **Format**: Use WebP for photos, SVG for icons/graphics
2. **Compression**: All images should be optimized
   - Photos: 60-80% quality WebP
   - Max file size: 200KB per image
3. **Lazy Loading**: Images below the fold should use `loading="lazy"`
4. **Responsive**: Provide multiple sizes for different viewports

### Naming Conventions
- Use kebab-case: `hero-background.webp`
- Be descriptive: `dashboard-empty-state.svg`
- Include dimensions if specific: `logo-192x192.png`

### Directory Structure
```
images/
├── features/          # Feature section icons
├── hero.webp          # Main hero image
├── logo.svg           # App logo (if separate from header)
└── [legacy images]    # To be reviewed/replaced
```

## Adding New Images

### For WebP Conversion
```bash
# Using sharp-cli (recommended)
npx sharp-cli --input source.jpg --output optimized.webp --quality 75

# Using cwebp (Google's tool)
cwebp -q 75 source.jpg -o optimized.webp
```

### For SVG Optimization
```bash
# Using SVGO
npx svgo input.svg -o output.svg
```

## Future Improvements
- [ ] Replace hero-horse.jpg with modern hero.webp
- [ ] Optimize all existing JPG images to WebP
- [ ] Add dark mode variants if needed
- [ ] Create favicon set (16x16, 32x32, 180x180)
- [ ] Add Open Graph images for social sharing
- [ ] Create app store screenshots

## Copyright Notice
Ensure all images used are:
- Owned by you/your organization
- Licensed for commercial use
- Properly attributed if required
- Optimized for web delivery

---

**Last Updated**: January 2026
