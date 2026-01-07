#!/bin/bash
# ==========================================
# EquiProfile Start Script
# ==========================================
# This script provides a simple way to start EquiProfile
# with automatic dependency installation and build.
#
# Usage: ./start.sh

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

echo "==========================================="
echo "  EquiProfile Start Script"
echo "==========================================="
echo ""

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  error "Node.js is not installed!"
  echo "Please install Node.js 20.x or higher"
  echo "Visit: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node --version)
info "Node.js version: $NODE_VERSION"

# Check for pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  warn "pnpm is not installed. Installing pnpm..."
  npm install -g pnpm@10.4.1
  success "pnpm installed"
fi

PNPM_VERSION=$(pnpm --version)
info "pnpm version: $PNPM_VERSION"

# Load environment variables
if [ -f ".env" ]; then
  info "Loading environment from .env"
  set -a
  source .env
  set +a
elif [ -f ".env.default" ]; then
  info "No .env found, using .env.default"
  set -a
  source .env.default
  set +a
  warn "Using default configuration. Create .env for production."
else
  error "No .env or .env.default file found!"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  info "Installing dependencies..."
  pnpm install --frozen-lockfile
  success "Dependencies installed"
else
  info "Dependencies already installed"
fi

# Build application if dist/index.js doesn't exist
if [ ! -f "dist/index.js" ]; then
  info "Building application..."
  pnpm run build
  success "Application built"
else
  info "Application already built (use 'pnpm run build' to rebuild)"
fi

# Create data directory for SQLite if needed
if [[ "$DATABASE_URL" == sqlite:* ]]; then
  SQLITE_PATH="${DATABASE_URL#sqlite:}"
  SQLITE_DIR=$(dirname "$SQLITE_PATH")
  
  if [ ! -d "$SQLITE_DIR" ]; then
    info "Creating SQLite data directory: $SQLITE_DIR"
    mkdir -p "$SQLITE_DIR"
  fi
fi

echo ""
success "Starting EquiProfile..."
echo ""

# Start the application
NODE_ENV="${NODE_ENV:-production}" node dist/index.js
