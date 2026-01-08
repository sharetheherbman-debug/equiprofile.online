#!/bin/bash
# ==========================================
# EquiProfile Dependency Installation
# ==========================================
# Installs all required dependencies with frozen lockfile
# This ensures consistent builds across environments
#
# Usage: bash scripts/install.sh

set -e

echo "======================================"
echo "Installing EquiProfile Dependencies"
echo "======================================"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed"
    echo ""
    echo "Please install pnpm first:"
    echo "  npm install -g pnpm"
    echo ""
    echo "Or using corepack (recommended):"
    echo "  corepack enable"
    echo "  corepack prepare pnpm@latest --activate"
    exit 1
fi

echo "✅ pnpm found: $(pnpm --version)"
echo ""

# Install dependencies with frozen lockfile
echo "📦 Installing dependencies..."
echo "   Using frozen lockfile to ensure consistent builds"
echo ""

pnpm install --frozen-lockfile

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
echo "  - Or run 'pnpm dev' to start development server"
echo ""
