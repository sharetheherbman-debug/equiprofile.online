#!/bin/bash
# ==========================================
# DEPRECATED — merge-assets.sh
# ==========================================
# This script is NO LONGER USED and is retained only for reference.
#
# It was removed because the "merge both builds into one shared /assets/"
# approach risked silent file overwrites when identically-named chunks from
# the management and school builds were copied into the same directory.
#
# REPLACEMENT STRATEGY (Option A — namespaced asset directories):
#
#   Management build outputs:
#     dist/public/management/management-assets/   → served at /management-assets/
#
#   School build outputs:
#     dist/public/school/school-assets/           → served at /school-assets/
#
#   The two URL namespaces are orthogonal.  Cross-site collisions are
#   structurally impossible.  No merge or post-processing step is needed.
#
#   The asset namespace is set in vite.config.ts via:
#     build.assetsDir = `${SITE_TARGET}-assets`
#
# This file is intentionally a no-op so any leftover CI/CD reference to it
# does not break the build.
echo "⚠️  merge-assets.sh is deprecated and does nothing. Asset namespacing"
echo "   (management-assets/ and school-assets/) replaces the merge approach."
