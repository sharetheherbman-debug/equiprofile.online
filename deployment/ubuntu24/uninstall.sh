#!/bin/bash
# ==============================================================================
# EquiProfile Ubuntu 24.04 Uninstallation Script
# ==============================================================================
# Clean uninstallation of EquiProfile
#
# Usage: sudo bash uninstall.sh
#
# This script will:
# 1. Stop and disable systemd service
# 2. Remove nginx configuration
# 3. Remove application directory
# 4. Keep /etc/letsencrypt intact (SSL certificates)
# ==============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root or with sudo"
    exit 1
fi

echo "=============================================================================="
echo "  EquiProfile Uninstallation"
echo "=============================================================================="
echo ""
log_warn "This will remove EquiProfile from your system."
log_warn "Application data in /var/equiprofile/app will be deleted."
log_warn "SSL certificates in /etc/letsencrypt will be preserved."
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Uninstallation cancelled"
    exit 0
fi

# ==============================================================================
# 1. Stop and Disable Service
# ==============================================================================
log_info "Step 1/4: Stopping and disabling service..."

if systemctl is-active --quiet equiprofile; then
    systemctl stop equiprofile
    log_success "Stopped equiprofile service"
else
    log_info "Service not running"
fi

if systemctl is-enabled --quiet equiprofile 2>/dev/null; then
    systemctl disable equiprofile
    log_success "Disabled equiprofile service"
fi

if [ -f "/etc/systemd/system/equiprofile.service" ]; then
    rm /etc/systemd/system/equiprofile.service
    systemctl daemon-reload
    log_success "Removed systemd service file"
fi

echo ""

# ==============================================================================
# 2. Remove Nginx Configuration
# ==============================================================================
log_info "Step 2/4: Removing nginx configuration..."

if [ -L "/etc/nginx/sites-enabled/equiprofile" ]; then
    rm /etc/nginx/sites-enabled/equiprofile
    log_success "Removed nginx site symlink"
fi

if [ -f "/etc/nginx/sites-available/equiprofile" ]; then
    rm /etc/nginx/sites-available/equiprofile
    log_success "Removed nginx site configuration"
fi

# Test and reload nginx
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    log_success "Reloaded nginx"
else
    log_warn "Nginx configuration test failed, but continuing..."
fi

echo ""

# ==============================================================================
# 3. Remove Application Directory
# ==============================================================================
log_info "Step 3/4: Removing application directory..."

APP_DIR="/var/equiprofile/app"

if [ -d "$APP_DIR" ]; then
    # Create backup of .env if it exists
    if [ -f "$APP_DIR/.env" ]; then
        BACKUP_FILE="/tmp/equiprofile-env-backup-$(date +%Y%m%d-%H%M%S).txt"
        cp "$APP_DIR/.env" "$BACKUP_FILE"
        log_info "Backed up .env to: $BACKUP_FILE"
    fi
    
    rm -rf "$APP_DIR"
    log_success "Removed application directory"
else
    log_info "Application directory not found"
fi

echo ""

# ==============================================================================
# 4. Summary
# ==============================================================================
log_info "Step 4/4: Cleanup complete"

echo ""
echo "=============================================================================="
echo -e "${GREEN}✅ UNINSTALL SUCCESS${NC}"
echo "=============================================================================="
echo ""
echo "EquiProfile has been uninstalled from your system."
echo ""
echo "Preserved:"
echo "  • SSL certificates (/etc/letsencrypt)"
echo "  • System packages (Node.js, nginx, etc.)"
if [ -n "$BACKUP_FILE" ]; then
echo "  • Environment backup: $BACKUP_FILE"
fi
echo ""
echo "To completely remove all traces:"
echo "  • Remove Node.js: sudo apt remove nodejs"
echo "  • Remove nginx: sudo apt remove nginx"
echo "=============================================================================="
