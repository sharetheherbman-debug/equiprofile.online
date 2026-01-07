#!/bin/bash
# ==========================================
# EquiProfile Update Script
# ==========================================
# This script safely updates EquiProfile to the latest version.
# It is idempotent and safe to run multiple times.
#
# Usage: sudo ./update.sh

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
echo "  EquiProfile Update"
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  error "Please run as root or with sudo"
  exit 1
fi

# Variables
APP_DIR="/var/equiprofile/app"
BACKUP_DIR="/var/equiprofile/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check if application is installed
if [ ! -d "$APP_DIR" ]; then
  error "EquiProfile is not installed at $APP_DIR"
  error "Please run install.sh first"
  exit 1
fi

# Step 1: Check service status
info "Checking service status..."
if systemctl is-active --quiet equiprofile; then
  success "Service is running"
  SERVICE_WAS_RUNNING=true
else
  warn "Service is not running"
  SERVICE_WAS_RUNNING=false
fi
echo ""

# Step 2: Create backup
info "Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$APP_DIR/dist" ]; then
  tar -czf "$BACKUP_DIR/equiprofile-$TIMESTAMP.tar.gz" -C "$APP_DIR" dist .env 2>/dev/null || true
  success "Backup created: $BACKUP_DIR/equiprofile-$TIMESTAMP.tar.gz"
else
  warn "No dist folder to backup (fresh install?)"
fi
echo ""

# Step 3: Stop service
if [ "$SERVICE_WAS_RUNNING" = true ]; then
  info "Stopping service..."
  systemctl stop equiprofile
  success "Service stopped"
  echo ""
fi

# Step 4: Pull latest changes
info "Pulling latest changes from repository..."
cd "$APP_DIR"
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Current branch: $CURRENT_BRANCH"

# Stash any local changes (except .env)
if ! git diff-index --quiet HEAD --; then
  warn "Local changes detected, stashing..."
  git stash push -m "Auto-stash before update $TIMESTAMP"
fi

git pull origin "$CURRENT_BRANCH" || {
  error "Failed to pull changes"
  error "You may need to resolve conflicts manually"
  exit 1
}
success "Repository updated"
echo ""

# Step 5: Install/update dependencies
info "Installing/updating dependencies..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
else
  warn "pnpm not found, using npm..."
  npm install
fi
success "Dependencies updated"
echo ""

# Step 6: Rebuild application
info "Rebuilding application..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm run build
else
  npm run build
fi
success "Application rebuilt"
echo ""

# Step 7: Update systemd service if changed
if ! diff -q "$APP_DIR/deployment/equiprofile.service" /etc/systemd/system/equiprofile.service >/dev/null 2>&1 || [ $? -eq 2 ]; then
  info "Updating systemd service..."
  cp "$APP_DIR/deployment/equiprofile.service" /etc/systemd/system/equiprofile.service
  systemctl daemon-reload
  success "Systemd service updated"
else
  info "Systemd service unchanged"
fi
echo ""

# Step 8: Check nginx configuration
info "Checking nginx configuration..."
if [ -f "$APP_DIR/deployment/nginx-webdock.conf" ]; then
  if [ -f /etc/nginx/sites-available/equiprofile ]; then
    # Check if there are significant differences
    if ! diff -q "$APP_DIR/deployment/nginx-webdock.conf" /etc/nginx/sites-available/equiprofile >/dev/null 2>&1; then
      warn "Nginx configuration template has changed"
      warn "Please review: $APP_DIR/deployment/nginx-webdock.conf"
      warn "Current config: /etc/nginx/sites-available/equiprofile"
      warn "Update manually if needed and reload nginx"
    else
      success "Nginx configuration unchanged"
    fi
  fi
else
  info "No nginx configuration to update"
fi
echo ""

# Step 9: Set permissions
info "Setting permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
success "Permissions set"
echo ""

# Step 10: Restart service
info "Starting service..."
systemctl restart equiprofile
sleep 3

if systemctl is-active --quiet equiprofile; then
  success "Service started successfully"
else
  error "Service failed to start"
  error "Check logs with: journalctl -u equiprofile -n 50"
  echo ""
  echo "Attempting to restore from backup..."
  if [ -f "$BACKUP_DIR/equiprofile-$TIMESTAMP.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/equiprofile-$TIMESTAMP.tar.gz" -C "$APP_DIR"
    systemctl restart equiprofile
    if systemctl is-active --quiet equiprofile; then
      success "Service restored from backup"
    else
      error "Failed to restore service"
    fi
  fi
  exit 1
fi
echo ""

# Step 11: Reload nginx if running
if systemctl is-active --quiet nginx; then
  info "Reloading nginx..."
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    success "Nginx reloaded"
  else
    error "Nginx configuration has errors, not reloading"
    nginx -t
  fi
fi
echo ""

# Step 12: Run health check
info "Running health check..."
sleep 2
if [ -f "$APP_DIR/deployment/doctor.sh" ]; then
  cd "$APP_DIR/deployment"
  bash doctor.sh || warn "Some health checks failed"
else
  warn "Health check script not found"
fi
echo ""

# Cleanup old backups (keep last 10)
info "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t equiprofile-*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
success "Old backups cleaned"
echo ""

# Final status
echo "==========================================="
echo "  Update Complete!"
echo "==========================================="
echo ""
success "EquiProfile has been updated successfully"
echo ""
echo "Service status:"
systemctl status equiprofile --no-pager -l | head -10
echo ""
echo "View full logs with:"
echo "  sudo journalctl -u equiprofile -f"
echo ""
echo "Run health check anytime:"
echo "  cd $APP_DIR/deployment && sudo bash doctor.sh"
echo ""
