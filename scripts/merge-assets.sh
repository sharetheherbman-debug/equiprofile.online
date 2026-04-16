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
  MGMT_COUNT=$(find "$MGMT_ASSETS" -type f | wc -l)
  if [ "$MGMT_COUNT" -gt 0 ]; then
    cp -r --update=none "$MGMT_ASSETS"/. "$MERGED_ASSETS"/
    echo "   ✓ Management assets: $MGMT_COUNT files"
  else
    echo "   ⚠ Management assets directory exists but is empty"
  fi
else
  echo "   ⚠ Management assets not found at $MGMT_ASSETS"
fi

# Copy school assets (cp -rn = recursive, no-clobber)
if [ -d "$SCHOOL_ASSETS" ]; then
  SCHOOL_COUNT=$(find "$SCHOOL_ASSETS" -type f | wc -l)
  if [ "$SCHOOL_COUNT" -gt 0 ]; then
    cp -r --update=none "$SCHOOL_ASSETS"/. "$MERGED_ASSETS"/
    echo "   ✓ School assets: $SCHOOL_COUNT files"
  else
    echo "   ⚠ School assets directory exists but is empty"
  fi
else
  echo "   ⚠ School assets not found at $SCHOOL_ASSETS"
fi

TOTAL=$(ls -1 "$MERGED_ASSETS" 2>/dev/null | wc -l)
echo "   ✓ Merged total: $TOTAL unique assets in $MERGED_ASSETS"
echo "✅ Asset merge complete"
