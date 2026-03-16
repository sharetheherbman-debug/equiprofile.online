#!/bin/bash
# ==========================================
# EquiProfile Dependency Installation
# ==========================================
# Installs all required dependencies using npm ci (deterministic, frozen)
#
# Usage: bash scripts/install.sh

set -e

echo "======================================"
echo "Installing EquiProfile Dependencies"
echo "======================================"
echo ""

echo "✅ node: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Install dependencies with frozen lockfile
echo "📦 Installing dependencies (npm ci)..."
echo ""

npm ci

echo ""
echo "======================================"
echo "✅ Installation Complete!"
echo "======================================"
echo ""
echo "Dependencies installed with frozen lockfile"
echo "Build artifacts: node_modules/"
echo ""
echo "Next steps:"
echo "  - Run 'bash scripts/build.sh' to build the application"
echo "  - Or run 'npm run dev' to start development server"
echo ""
