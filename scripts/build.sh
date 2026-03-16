#!/bin/bash
# ==========================================
# EquiProfile Production Build Script
# ==========================================
# Builds both client and server for production deployment
# Output: dist/public (client) and dist/index.js (server)
#
# Usage: bash scripts/build.sh

set -e

echo "======================================"
echo "Building EquiProfile for Production"
echo "======================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules not found"
    echo ""
    echo "Please run 'bash scripts/install.sh' first to install dependencies"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
echo "   ✓ Removed dist/"
echo ""

# Update service worker version
echo "📝 Updating service worker version..."
node scripts/update-sw-version.js
echo ""

# Build client with Vite
echo "🔨 Building client (Vite)..."
echo "   Source: client/"
echo "   Output: dist/public/"
echo ""
npx vite build
echo ""

# Build server with esbuild
echo "🔨 Building server (esbuild)..."
echo "   Source: server/_core/index.ts"
echo "   Output: dist/index.js"
echo ""
npx esbuild server/_core/index.ts \
  --platform=node \
  --bundle \
  --format=esm \
  --outdir=dist \
  --minify \
  --packages=external
echo ""

# Verify build outputs
echo "✅ Verifying build outputs..."

if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: dist/index.js not found"
    echo "   Server build failed"
    exit 1
fi
echo "   ✓ dist/index.js"

if [ ! -d "dist/public" ]; then
    echo "❌ Error: dist/public/ not found"
    echo "   Client build failed"
    exit 1
fi
echo "   ✓ dist/public/"

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Error: dist/public/index.html not found"
    echo "   Client build incomplete"
    exit 1
fi
echo "   ✓ dist/public/index.html"

# Show build sizes
echo ""
echo "📊 Build sizes:"
du -sh dist/index.js 2>/dev/null || echo "   dist/index.js: (size unknown)"
du -sh dist/public/ 2>/dev/null || echo "   dist/public/: (size unknown)"

echo ""
echo "======================================"
echo "✅ Build Complete!"
echo "======================================"
echo ""
echo "Build outputs:"
echo "  - Client: dist/public/ (static files served by Express)"
echo "  - Server: dist/index.js (Node.js application)"
echo ""
echo "Next steps:"
echo "  - Set NODE_ENV=production"
echo "  - Configure .env file with production settings"
echo "  - Run 'npm start' or 'node dist/index.js'"
echo ""
echo "For deployment:"
echo "  - Copy dist/, node_modules/, package.json to production server"
echo "  - Ensure .env is configured"
echo "  - Run with: NODE_ENV=production node dist/index.js"
echo ""
