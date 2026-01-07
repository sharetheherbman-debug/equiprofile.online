#!/bin/bash
# ==============================================================================
# EquiProfile Ubuntu 24.04 Installation Script
# ==============================================================================
# One-command installation for fresh Ubuntu 24.04 VPS
#
# Usage: sudo bash install.sh
#
# This script will:
# 1. Install prerequisites (Node.js LTS, pnpm, nginx)
# 2. Create system user 'equiprofile'
# 3. Setup application directory (/var/www/equiprofile)
# 4. Clone or use existing repository
# 5. Configure environment
# 6. Build application
# 7. Install systemd service
# 8. Configure nginx
# 9. Verify installation
# ==============================================================================

set -e  # Exit on error

# Logging setup
LOG_FILE="/var/log/equiprofile-install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

log_info "Starting EquiProfile installation on Ubuntu 24.04..."
log_info "Installation log: $LOG_FILE"
echo ""

# ==============================================================================
# 1. Install Prerequisites
# ==============================================================================
log_info "Step 1/9: Installing prerequisites..."

# Update system
log_info "Updating system packages..."
apt-get update -qq

# Install required packages
log_info "Installing curl, git, and build essentials..."
apt-get install -y curl git build-essential > /dev/null 2>&1

# Install Node.js LTS (using nodesource)
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
else
    log_info "Node.js already installed: $(node --version)"
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    log_info "Installing pnpm..."
    npm install -g pnpm > /dev/null 2>&1
else
    log_info "pnpm already installed: $(pnpm --version)"
fi

# Install nginx
if ! command -v nginx &> /dev/null; then
    log_info "Installing nginx..."
    apt-get install -y nginx > /dev/null 2>&1
else
    log_info "nginx already installed"
fi

log_success "Prerequisites installed successfully"
echo ""

# ==============================================================================
# 2. Create System User
# ==============================================================================
log_info "Step 2/9: Creating system user..."

if ! id -u equiprofile &> /dev/null; then
    useradd -r -m -s /bin/bash equiprofile
    log_success "Created user 'equiprofile'"
else
    log_info "User 'equiprofile' already exists"
fi
echo ""

# ==============================================================================
# 3. Setup Application Directory
# ==============================================================================
log_info "Step 3/9: Setting up application directory..."

APP_DIR="/var/www/equiprofile"

if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    log_success "Created directory: $APP_DIR"
else
    log_info "Directory already exists: $APP_DIR"
fi

# Set ownership
chown -R equiprofile:equiprofile "$APP_DIR"
log_success "Set ownership to equiprofile:equiprofile"
echo ""

# ==============================================================================
# 4. Clone/Copy Repository
# ==============================================================================
log_info "Step 4/9: Setting up repository..."

# Check if we're running from within the repo
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$SCRIPT_DIR" == *"/deployment/ubuntu24"* ]]; then
    REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    log_info "Using existing repository at: $REPO_ROOT"
    
    # Copy files if not already in APP_DIR
    if [ "$REPO_ROOT" != "$APP_DIR" ]; then
        log_info "Copying files to $APP_DIR..."
        rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' "$REPO_ROOT/" "$APP_DIR/"
        chown -R equiprofile:equiprofile "$APP_DIR"
    fi
else
    log_warn "Not running from repository. You'll need to manually copy files to $APP_DIR"
    log_warn "Or clone the repository: git clone <repo-url> $APP_DIR"
    exit 1
fi

cd "$APP_DIR"
log_success "Repository ready at $APP_DIR"
echo ""

# ==============================================================================
# 5. Configure Environment
# ==============================================================================
log_info "Step 5/9: Configuring environment..."

if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
        log_warn "Created .env from .env.example"
        log_warn ""
        log_warn "⚠️  IMPORTANT: You MUST configure the following in .env:"
        log_warn "   1. DATABASE_URL (MySQL connection string)"
        log_warn "   2. JWT_SECRET (generate with: openssl rand -base64 32)"
        log_warn "   3. ADMIN_UNLOCK_PASSWORD (change from default!)"
        log_warn "   4. NODE_ENV=production"
        log_warn "   5. BASE_URL (your domain)"
        log_warn ""
        log_warn "Optional features (configure if needed):"
        log_warn "   - ENABLE_STRIPE=true (requires Stripe keys)"
        log_warn "   - ENABLE_UPLOADS=true (requires storage config)"
        log_warn "   - OAuth settings (optional)"
        log_warn ""
        log_warn "Edit with: nano $APP_DIR/.env"
        log_warn ""
        read -p "Press Enter to continue after configuring .env, or Ctrl+C to exit..."
    else
        log_error ".env.example not found in repository"
        exit 1
    fi
else
    log_info ".env already exists"
fi

chown equiprofile:equiprofile "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"
log_success "Environment configuration ready"
echo ""

# ==============================================================================
# 6. Install Dependencies and Build
# ==============================================================================
log_info "Step 6/9: Installing dependencies and building..."

# Switch to equiprofile user for npm operations
sudo -u equiprofile bash << 'EOF'
cd /var/www/equiprofile
pnpm install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi
EOF

log_success "Dependencies installed"

# Build application
log_info "Building application..."
sudo -u equiprofile bash << 'EOF'
cd /var/www/equiprofile
pnpm build
if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi
EOF

log_success "Application built successfully"

# Verify build output
if [ ! -f "$APP_DIR/dist/index.js" ]; then
    log_error "Build verification failed: dist/index.js not found"
    exit 1
fi

if [ ! -f "$APP_DIR/dist/public/index.html" ]; then
    log_error "Build verification failed: dist/public/index.html not found"
    exit 1
fi

log_success "Build verification passed"
echo ""

# ==============================================================================
# 7. Install Systemd Service
# ==============================================================================
log_info "Step 7/9: Installing systemd service..."

# Create systemd service file
cat > /etc/systemd/system/equiprofile.service << 'SYSTEMD_EOF'
[Unit]
Description=Equiprofile Application
After=network.target

[Service]
Type=simple
User=equiprofile
WorkingDirectory=/var/www/equiprofile
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable equiprofile
log_success "Systemd service installed and enabled"

# Start service
log_info "Starting EquiProfile service..."
systemctl start equiprofile
sleep 3

# Check service status
if systemctl is-active --quiet equiprofile; then
    log_success "EquiProfile service is running"
else
    log_error "EquiProfile service failed to start"
    log_error "Check logs with: journalctl -u equiprofile -n 50"
    exit 1
fi
echo ""

# ==============================================================================
# 8. Configure Nginx
# ==============================================================================
log_info "Step 8/9: Configuring nginx..."

# Get port from .env or default to 3000
PORT=$(grep -E '^PORT=' "$APP_DIR/.env" | cut -d '=' -f2 || echo "3000")
DOMAIN=$(grep -E '^BASE_URL=' "$APP_DIR/.env" | cut -d '=' -f2 | sed 's|https\?://||' | sed 's|/.*||' || echo "_")

# Create nginx config
cat > /etc/nginx/sites-available/equiprofile << NGINX_EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp)$ {
        proxy_pass http://127.0.0.1:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/equiprofile

# Test nginx config
nginx -t
if [ $? -ne 0 ]; then
    log_error "Nginx configuration test failed"
    exit 1
fi

# Reload nginx
systemctl reload nginx
log_success "Nginx configured and reloaded"
echo ""

# ==============================================================================
# 9. Verify Installation
# ==============================================================================
log_info "Step 9/9: Verifying installation..."

# Wait a moment for service to fully start
sleep 3

# Check health endpoint
log_info "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/healthz)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    log_success "Health endpoint responding correctly"
else
    log_warn "Health endpoint returned: $HEALTH_RESPONSE (may not be implemented yet)"
fi

# Check build endpoint
log_info "Testing build endpoint..."
BUILD_RESPONSE=$(curl -s http://127.0.0.1:$PORT/build)
if echo "$BUILD_RESPONSE" | grep -q "version"; then
    log_success "Build endpoint responding correctly"
else
    log_warn "Build endpoint may not be implemented yet"
fi

# Final checks
log_info "Running final checks..."

# Check service status
if systemctl is-active --quiet equiprofile; then
    log_success "✓ Service is running"
else
    log_error "✗ Service is not running"
    exit 1
fi

# Check nginx status
if systemctl is-active --quiet nginx; then
    log_success "✓ Nginx is running"
else
    log_error "✗ Nginx is not running"
    exit 1
fi

# Check application responding
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT | grep -q "200\|301\|302"; then
    log_success "✓ Application is responding"
else
    log_warn "✗ Application may not be responding correctly"
fi

echo ""
echo "=============================================================================="
echo -e "${GREEN}✅ DEPLOY SUCCESS${NC}"
echo "=============================================================================="
echo ""
echo "EquiProfile has been successfully installed!"
echo ""
echo "Service Management:"
echo "  • Status:  systemctl status equiprofile"
echo "  • Stop:    systemctl stop equiprofile"
echo "  • Start:   systemctl start equiprofile"
echo "  • Restart: systemctl restart equiprofile"
echo "  • Logs:    journalctl -u equiprofile -f"
echo ""
echo "Application:"
echo "  • Directory: $APP_DIR"
echo "  • Port: $PORT"
echo "  • URL: http://$DOMAIN"
echo ""
echo "Next Steps:"
echo "  1. Configure SSL with certbot:"
echo "     sudo apt install certbot python3-certbot-nginx"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  2. Review environment configuration:"
echo "     nano $APP_DIR/.env"
echo ""
echo "  3. Restart after .env changes:"
echo "     systemctl restart equiprofile"
echo ""
echo "Installation log saved to: $LOG_FILE"
echo "=============================================================================="
