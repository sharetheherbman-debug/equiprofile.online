#!/bin/bash
# ==========================================
# OBSOLETE — DO NOT USE
# ==========================================
# This script was the old single-build launcher.
# It is no longer valid because the project now uses a
# DUAL-frontend architecture:
#
#   dist/public/management/  ←  equiprofile.online
#   dist/public/school/      ←  school.equiprofile.online
#
# The canonical build command is:
#
#   npm run build
#
# which runs: build:management + build:school + build:server + build-fingerprint
# as defined in package.json.
#
# Running this script will EXIT with a non-zero code to prevent
# accidental use in CI/CD pipelines.

echo ""
echo "❌  ERROR: scripts/build.sh is OBSOLETE and must not be used."
echo ""
echo "   This script targets the old single-build architecture where"
echo "   Vite output went to dist/public/index.html."
echo ""
echo "   The canonical build command is:"
echo "     npm run build"
echo ""
echo "   That builds both frontends (management + school) plus the server."
echo ""
exit 1
