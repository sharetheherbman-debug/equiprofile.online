#!/bin/bash
# ==========================================
# Build Fingerprinting Script
# ==========================================
# Captures build metadata (git SHA, timestamp) and writes to build.txt
# Also injects meta tag into index.html for client-side verification
#
# Usage: bash scripts/build-fingerprint.sh

set -e

# Get git commit SHA (short)
BUILD_SHA="unknown"
if git rev-parse --short HEAD >/dev/null 2>&1; then
    BUILD_SHA=$(git rev-parse --short HEAD)
fi

# Get ISO 8601 timestamp
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")

echo "📦 Build Fingerprinting"
echo "   SHA:     $BUILD_SHA"
echo "   Time:    $BUILD_TIME"
echo "   Version: $VERSION"

# Write build.txt to dist/public/
mkdir -p dist/public
cat > dist/public/build.txt <<EOF
BUILD_SHA=$BUILD_SHA
BUILD_TIME=$BUILD_TIME
VERSION=$VERSION
EOF

echo "✓ Created dist/public/build.txt"

# Inject meta tag into index.html if it exists
if [ -f "dist/public/index.html" ]; then
    # Check if meta tag already exists
    if grep -q 'name="x-build-sha"' dist/public/index.html; then
        # Replace existing meta tag
        sed -i "s/<meta name=\"x-build-sha\" content=\"[^\"]*\">/<meta name=\"x-build-sha\" content=\"$BUILD_SHA\">/" dist/public/index.html
    else
        # Insert new meta tag after charset or viewport
        sed -i "/<meta charset/a\\    <meta name=\"x-build-sha\" content=\"$BUILD_SHA\">" dist/public/index.html
    fi
    echo "✓ Injected build SHA into index.html"
else
    echo "⚠️  index.html not found, skipping meta tag injection"
fi

echo "✓ Build fingerprinting complete"
