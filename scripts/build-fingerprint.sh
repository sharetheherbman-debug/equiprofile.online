#!/bin/bash
# ==========================================
# Build Fingerprinting Script
# ==========================================
# Captures build metadata (git SHA, timestamp) and writes to build.txt
# Also injects meta tag into both frontend HTML shells:
#
#   dist/public/management/index.html  (equiprofile.online)
#   dist/public/school/index.html      (school.equiprofile.online)
#
# The old path dist/public/index.html does NOT exist in this architecture.
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

# Write build.txt to dist/public/ (shared metadata endpoint)
mkdir -p dist/public
cat > dist/public/build.txt <<EOF
BUILD_SHA=$BUILD_SHA
BUILD_TIME=$BUILD_TIME
VERSION=$VERSION
EOF

echo "✓ Created dist/public/build.txt"

# Inject meta tag into each frontend's index.html
inject_meta() {
    local html_file="$1"
    local label="$2"

    if [ ! -f "$html_file" ]; then
        echo "⚠️  $label index.html not found at $html_file — skipping meta injection"
        return
    fi

    if grep -q 'name="x-build-sha"' "$html_file"; then
        # Replace existing meta tag
        sed -i "s/<meta name=\"x-build-sha\" content=\"[^\"]*\">/<meta name=\"x-build-sha\" content=\"$BUILD_SHA\">/" "$html_file"
    else
        # Insert new meta tag after charset declaration
        sed -i "/<meta charset/a\\    <meta name=\"x-build-sha\" content=\"$BUILD_SHA\">" "$html_file"
    fi
    echo "✓ Injected build SHA into $label index.html"
}

inject_meta "dist/public/management/index.html" "management"
inject_meta "dist/public/school/index.html"     "school"

echo "✓ Build fingerprinting complete"
