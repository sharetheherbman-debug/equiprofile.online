#!/bin/bash
# ==========================================
# EquiProfile Installation Script
# ==========================================
# This script installs EquiProfile on a fresh Ubuntu/Webdock VPS.
# It is idempotent and safe to run multiple times.
#
# Prerequisites:
# - Ubuntu 20.04 or 24.04
# - Root or sudo access
# - Git installed
#
# Usage: sudo ./install.sh

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
echo "  EquiProfile Installation"
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  error "Please run as root or with sudo"
  exit 1
fi

# Variables
APP_DIR="/var/equiprofile/app"
LOG_DIR="/var/log/equiprofile"
REPO_URL="https://github.com/amarktainetwork-blip/Equiprofile.online.git"

# Step 1: Update system packages
info "Updating system packages..."
apt-get update -qq
success "System packages updated"
echo ""

# Step 2: Install required dependencies
info "Installing required dependencies..."
apt-get install -y -qq curl wget git nginx mysql-server certbot python3-certbot-nginx build-essential
success "Dependencies installed"
echo ""

# Step 3: Install Node.js 20.x (LTS)
info "Installing Node.js 20.x..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
  success "Node.js installed: $(node --version)"
else
  success "Node.js already installed: $(node --version)"
fi
echo ""

# Step 4: Install pnpm
info "Installing pnpm..."
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm@10.4.1
  success "pnpm installed: $(pnpm --version)"
else
  success "pnpm already installed: $(pnpm --version)"
fi
echo ""

# Step 5: Create application directory
info "Creating application directory..."
mkdir -p "$APP_DIR"
mkdir -p "$LOG_DIR"
success "Directories created"
echo ""

# Step 6: Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
  info "Repository already exists, pulling latest changes..."
  cd "$APP_DIR"
  git pull origin main || git pull origin master || warn "Could not pull latest changes"
  success "Repository updated"
else
  info "Cloning repository..."
  if [ "$(ls -A $APP_DIR)" ]; then
    warn "Directory not empty, backing up existing files..."
    mv "$APP_DIR" "${APP_DIR}.backup.$(date +%s)"
    mkdir -p "$APP_DIR"
  fi
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  success "Repository cloned"
fi
echo ""

# Step 7: Create .env file if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
  info "Creating .env file from template..."
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  warn "⚠️  IMPORTANT: Edit $APP_DIR/.env with your configuration!"
  warn "   Required: DATABASE_URL, JWT_SECRET, ADMIN_UNLOCK_PASSWORD"
  warn "   Optional: OAUTH_SERVER_URL, STRIPE keys, etc."
  echo ""
  
  # Check if running interactively
  if [ -t 0 ]; then
    echo "Do you want to edit .env now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      ${EDITOR:-nano} "$APP_DIR/.env"
    fi
  else
    warn "Running non-interactively, skipping .env editor prompt"
  fi
else
  success ".env file already exists"
fi
echo ""

# Step 8: Install dependencies
info "Installing application dependencies..."
cd "$APP_DIR"
pnpm install --frozen-lockfile
success "Dependencies installed"
echo ""

# Step 9: Build application
info "Building application..."
pnpm run build
success "Application built"
echo ""

# Step 10: Set permissions
info "Setting permissions..."
chown -R www-data:www-data "$APP_DIR"
chown -R www-data:www-data "$LOG_DIR"
chmod -R 755 "$APP_DIR"
success "Permissions set"
echo ""

# Step 11: Install systemd service
info "Installing systemd service..."
cp "$APP_DIR/deployment/equiprofile.service" /etc/systemd/system/equiprofile.service
systemctl daemon-reload
systemctl enable equiprofile
success "Systemd service installed and enabled"
echo ""

# Step 12: Start service
info "Starting equiprofile service..."
systemctl restart equiprofile
sleep 3
if systemctl is-active --quiet equiprofile; then
  success "Service started successfully"
else
  error "Service failed to start. Check logs with: journalctl -u equiprofile -n 50"
fi
echo ""

# Step 13: Install nginx configuration
info "Installing nginx configuration..."
if [ ! -f /etc/nginx/sites-available/equiprofile ]; then
  cp "$APP_DIR/deployment/nginx-webdock.conf" /etc/nginx/sites-available/equiprofile
  
  # Check if running interactively
  if [ -t 0 ]; then
    echo ""
    warn "⚠️  IMPORTANT: Update /etc/nginx/sites-available/equiprofile"
    warn "   Replace DOMAIN_NAME with your actual domain"
    echo ""
    echo "Enter your domain name (e.g., equiprofile.online):"
    read -r domain
    
    if [ -n "$domain" ]; then
      sed -i "s/DOMAIN_NAME/$domain/g" /etc/nginx/sites-available/equiprofile
      success "Domain name updated to: $domain"
    else
      warn "No domain provided, you'll need to edit manually"
    fi
  else
    warn "Running non-interactively, skipping domain prompt"
    warn "Please manually update DOMAIN_NAME in /etc/nginx/sites-available/equiprofile"
  fi
  
  # Enable site
  ln -sf /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/
  
  # Test nginx configuration
  if nginx -t >/dev/null 2>&1; then
    success "Nginx configuration is valid"
    systemctl reload nginx
    success "Nginx reloaded"
  else
    error "Nginx configuration has errors:"
    nginx -t
  fi
else
  success "Nginx configuration already exists"
fi
echo ""

# Step 14: Run health check
info "Running system health check..."
sleep 2
cd "$APP_DIR/deployment"
bash doctor.sh || warn "Some health checks failed"
echo ""

# Final instructions
echo "==========================================="
echo "  Installation Complete!"
echo "==========================================="
echo ""
success "EquiProfile has been installed successfully"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your .env file:"
echo "   sudo nano $APP_DIR/.env"
echo ""
echo "2. Restart the service after .env changes:"
echo "   sudo systemctl restart equiprofile"
echo ""
echo "3. Check service status:"
echo "   sudo systemctl status equiprofile"
echo ""
echo "4. View logs:"
echo "   sudo journalctl -u equiprofile -f"
echo ""
echo "5. Set up SSL certificate (recommended for production):"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "6. Run health check anytime:"
echo "   cd $APP_DIR/deployment && sudo bash doctor.sh"
echo ""
echo "Access your application at: http://localhost:3000"
echo "Or via nginx at: http://yourdomain.com (once configured)"
echo ""
