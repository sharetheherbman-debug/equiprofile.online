#!/bin/bash
# ==========================================
# Post-Build Asset Merge Script
# ==========================================
# After building both management and school frontends, their hashed assets
# end up in separate directories:
#   dist/public/management/assets/
#   dist/public/school/assets/
#
# However, Vite generates HTML that references assets at /assets/ (root-relative).
# When Nginx serves static files from dist/public/, it cannot find assets because
# they live inside subdirectories.
#
# This script creates a merged dist/public/assets/ directory containing all hashed
# assets from BOTH builds. Since all filenames include content hashes, there are no
# collisions. This ensures Nginx's /assets/ location block can serve all assets
# correctly regardless of which frontend the user is on.
#
# Usage: bash scripts/merge-assets.sh (runs automatically as part of npm run build)
# ==========================================

set -euo pipefail

DIST_DIR="dist/public"
MERGED_ASSETS="$DIST_DIR/assets"
MGMT_ASSETS="$DIST_DIR/management/assets"
SCHOOL_ASSETS="$DIST_DIR/school/assets"

echo "📦 Merging frontend assets into $MERGED_ASSETS ..."

# Create merged directory
mkdir -p "$MERGED_ASSETS"

# Copy management assets
if [ -d "$MGMT_ASSETS" ]; then
  cp -n "$MGMT_ASSETS"/* "$MERGED_ASSETS"/ 2>/dev/null || true
  MGMT_COUNT=$(ls -1 "$MGMT_ASSETS" 2>/dev/null | wc -l)
  echo "   ✓ Management assets: $MGMT_COUNT files"
else
  echo "   ⚠ Management assets not found at $MGMT_ASSETS"
fi

# Copy school assets (cp -n = no-clobber, skip if exists)
if [ -d "$SCHOOL_ASSETS" ]; then
  cp -n "$SCHOOL_ASSETS"/* "$MERGED_ASSETS"/ 2>/dev/null || true
  SCHOOL_COUNT=$(ls -1 "$SCHOOL_ASSETS" 2>/dev/null | wc -l)
  echo "   ✓ School assets: $SCHOOL_COUNT files"
else
  echo "   ⚠ School assets not found at $SCHOOL_ASSETS"
fi

TOTAL=$(ls -1 "$MERGED_ASSETS" 2>/dev/null | wc -l)
echo "   ✓ Merged total: $TOTAL unique assets in $MERGED_ASSETS"
echo "✅ Asset merge complete"
