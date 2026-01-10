#!/bin/bash
# ==========================================
# EquiProfile Production Deployment Script
# ==========================================
# Idempotent, safe, and rerunnable deployment
# Handles complete setup from fresh Ubuntu 24.04 VPS to production
#
# Usage: sudo bash ops/deploy.sh [OPTIONS] [BRANCH]
#
# Options:
#   --root PATH       Deployment path (default: /var/equiprofile/app)
#   --domain DOMAIN   Domain name (e.g., equiprofile.online)
#   --user USER       System user (default: www-data)
#   --port PORT       Backend port (default: 3000)
#   --no-ssl          Skip SSL configuration (HTTP only mode)
#   --resume          Resume failed deployment
#   --unit            Run via systemd-run (SSH disconnect-safe)
#   BRANCH            Git branch to deploy (default: main)

set -e

# Default values
DEPLOY_ROOT="/var/equiprofile/app"
DOMAIN=""
SERVICE_USER="www-data"
BACKEND_PORT=3000
ENABLE_SSL=true
RESUME_MODE=false
BRANCH="main"
USE_SYSTEMD_RUN=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --root)
            DEPLOY_ROOT="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --user)
            SERVICE_USER="$2"
            shift 2
            ;;
        --port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        --no-ssl)
            ENABLE_SSL=false
            shift
            ;;
        --resume)
            RESUME_MODE=true
            shift
            ;;
        --unit)
            USE_SYSTEMD_RUN=true
            shift
            ;;
        --*)
            echo "Unknown option: $1"
            echo "Usage: sudo bash ops/deploy.sh [--root PATH] [--domain DOMAIN] [--user USER] [--port PORT] [--no-ssl] [--resume] [--unit] [BRANCH]"
            exit 1
            ;;
        *)
            # Positional argument - treat as branch name
            BRANCH="$1"
            shift
            ;;
    esac
done

# If --unit mode requested, re-exec via systemd-run
if [ "$USE_SYSTEMD_RUN" = true ]; then
    echo "======================================"
    echo "Starting SSH-disconnect-safe deployment via systemd-run"
    echo "======================================"
    
    # Create log directory
    mkdir -p /var/equiprofile/_ops
    LOG_FILE="/var/equiprofile/_ops/deploy_$(date +%Y%m%d_%H%M%S).log"
    
    # Build command to run
    CMD="cd $(pwd) && bash $0"
    [ -n "$DEPLOY_ROOT" ] && [ "$DEPLOY_ROOT" != "/var/equiprofile/app" ] && CMD="$CMD --root $DEPLOY_ROOT"
    [ -n "$DOMAIN" ] && CMD="$CMD --domain $DOMAIN"
    [ -n "$SERVICE_USER" ] && [ "$SERVICE_USER" != "www-data" ] && CMD="$CMD --user $SERVICE_USER"
    [ "$BACKEND_PORT" != "3000" ] && CMD="$CMD --port $BACKEND_PORT"
    [ "$ENABLE_SSL" = false ] && CMD="$CMD --no-ssl"
    [ "$RESUME_MODE" = true ] && CMD="$CMD --resume"
    [ "$BRANCH" != "main" ] && CMD="$CMD $BRANCH"
    CMD="$CMD > $LOG_FILE 2>&1"
    
    echo "Log file: $LOG_FILE"
    echo "Command: systemd-run --unit=equiprofile-deploy --property=RemainAfterExit=yes /bin/bash -c \"$CMD\""
    echo ""
    echo "To monitor progress:"
    echo "  tail -f $LOG_FILE"
    echo ""
    echo "To check systemd unit status:"
    echo "  systemctl status equiprofile-deploy"
    echo ""
    
    # Execute via systemd-run
    systemd-run --unit=equiprofile-deploy --property=RemainAfterExit=yes /bin/bash -c "$CMD"
    
    echo "Deployment started in background. Monitor with:"
    echo "  tail -f $LOG_FILE"
    exit 0
fi

# Validate required parameters
if [ -z "$DOMAIN" ] && [ "$ENABLE_SSL" = true ]; then
    echo -e "${RED}ERROR: --domain is required for SSL setup${NC}"
    echo "Usage: sudo bash ops/deploy.sh --domain your-domain.com"
    echo "Or use --no-ssl for HTTP-only mode"
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script must be run as root${NC}"
    echo "Run: sudo bash ops/deploy.sh --domain $DOMAIN"
    exit 1
fi

# Create ops log directory
mkdir -p /var/equiprofile/_ops
LOG_FILE="/var/equiprofile/_ops/deploy_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "======================================"
echo "EquiProfile Production Deployment"
echo "======================================"
echo "Started: $(date)"
echo "Branch: $BRANCH"
echo "Domain: ${DOMAIN:-HTTP-only mode}"
echo "Deploy root: $DEPLOY_ROOT"
echo "User: $SERVICE_USER"
echo "Port: $BACKEND_PORT"
echo "SSL: $ENABLE_SSL"
echo "Log: $LOG_FILE"
echo "======================================"
echo ""

# Step 0: Pre-flight checks (if not in resume mode)
if [ "$RESUME_MODE" = false ]; then
    echo -e "${BLUE}[0/12] Running pre-flight checks...${NC}"
    if [ -f "$SCRIPT_DIR/preflight.sh" ]; then
        bash "$SCRIPT_DIR/preflight.sh" --port "$BACKEND_PORT" || {
            echo -e "${RED}Pre-flight checks failed. Fix issues and try again.${NC}"
            exit 1
        }
    else
        echo -e "${YELLOW}Warning: preflight.sh not found, skipping checks${NC}"
    fi
    echo ""
fi

# Step 1: Install/verify Node.js LTS
echo -e "${BLUE}[1/12] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
NODE_VERSION=$(node --version)
echo "Node.js: $NODE_VERSION"
echo ""

# Step 2: Install/verify pnpm
echo -e "${BLUE}[2/12] Checking pnpm installation...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm@latest
fi
PNPM_VERSION=$(pnpm --version)
echo "pnpm: v$PNPM_VERSION"
echo ""

# Step 3: Setup deployment directory and git operations
echo -e "${BLUE}[3/12] Setting up deployment directory...${NC}"
mkdir -p "$DEPLOY_ROOT"
mkdir -p /var/log/equiprofile

# Check if deployment directory is a git repository
cd "$DEPLOY_ROOT"

if [ -d ".git" ]; then
    echo "Git repository found, performing git operations..."
    
    # Fetch latest changes
    echo "Fetching from remote..."
    sudo -u "$SERVICE_USER" git fetch --all --prune || {
        echo -e "${RED}ERROR: git fetch failed${NC}"
        exit 1
    }
    
    # Checkout target branch
    echo "Checking out branch: $BRANCH"
    sudo -u "$SERVICE_USER" git checkout "$BRANCH" || {
        echo -e "${RED}ERROR: Failed to checkout branch $BRANCH${NC}"
        exit 1
    }
    
    # Reset to origin
    echo "Resetting to origin/$BRANCH..."
    sudo -u "$SERVICE_USER" git reset --hard "origin/$BRANCH" || {
        echo -e "${RED}ERROR: git reset failed${NC}"
        exit 1
    }
    
    # Show current commit
    CURRENT_SHA=$(git rev-parse --short HEAD)
    echo -e "${GREEN}Deployed commit: $CURRENT_SHA${NC}"
else
    # If deploying from current directory and not a git repo, copy files
    if [ "$PROJECT_ROOT" != "$DEPLOY_ROOT" ]; then
        echo "Copying application files to $DEPLOY_ROOT..."
        rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
              "$PROJECT_ROOT/" "$DEPLOY_ROOT/"
    fi
fi

cd "$DEPLOY_ROOT"
echo "Working directory: $(pwd)"
echo ""

# Step 4: Set ownership
echo -e "${BLUE}[4/12] Setting ownership...${NC}"
chown -R "$SERVICE_USER":"$SERVICE_USER" "$DEPLOY_ROOT"
chown -R "$SERVICE_USER":"$SERVICE_USER" /var/log/equiprofile
echo "Owner: $SERVICE_USER"
echo ""

# Step 5: Stop old services
echo -e "${BLUE}[5/12] Stopping old services...${NC}"
# Stop main service
if systemctl is-active --quiet equiprofile 2>/dev/null; then
    echo "Stopping equiprofile.service..."
    systemctl stop equiprofile
fi

# Remove any transient services (equiprofile-node.service, etc.)
for service in $(systemctl list-units --all | grep equiprofile | grep -v "equiprofile.service" | awk '{print $1}'); do
    echo "Stopping transient service: $service"
    systemctl stop "$service" 2>/dev/null || true
done

# Kill any node processes running on the target port
if lsof -ti:"$BACKEND_PORT" >/dev/null 2>&1; then
    echo "Killing processes on port $BACKEND_PORT..."
    lsof -ti:"$BACKEND_PORT" | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo ""

# Step 6: Install dependencies with clean install
echo -e "${BLUE}[6/12] Installing dependencies...${NC}"
echo "Running: npm ci (clean install)"

# Clean npm cache if needed
if [ "$RESUME_MODE" = false ]; then
    echo "Cleaning build cache..."
    rm -rf node_modules/.cache 2>/dev/null || true
fi

sudo -u "$SERVICE_USER" npm ci
echo ""

# Step 7: Clean and build application
echo -e "${BLUE}[7/12] Building application...${NC}"
echo "This may take 5-10 minutes..."

# Clean dist directory
echo "Cleaning dist directory..."
rm -rf "$DEPLOY_ROOT/dist"

# Build with memory-safe flags
export NODE_OPTIONS="--max_old_space_size=2048"
sudo -u "$SERVICE_USER" NODE_OPTIONS="--max_old_space_size=2048" npm run build

# Verify build outputs
echo "Verifying build outputs..."
BUILD_ERRORS=0

if [ ! -f "$DEPLOY_ROOT/dist/index.js" ]; then
    echo -e "${RED}ERROR: Build failed - dist/index.js not found${NC}"
    BUILD_ERRORS=$((BUILD_ERRORS + 1))
fi

if [ ! -d "$DEPLOY_ROOT/dist/public" ]; then
    echo -e "${RED}ERROR: Build failed - dist/public/ not found${NC}"
    BUILD_ERRORS=$((BUILD_ERRORS + 1))
fi

if [ ! -f "$DEPLOY_ROOT/dist/public/index.html" ]; then
    echo -e "${RED}ERROR: Build failed - dist/public/index.html not found${NC}"
    BUILD_ERRORS=$((BUILD_ERRORS + 1))
fi

if [ ! -f "$DEPLOY_ROOT/dist/public/build.txt" ]; then
    echo -e "${YELLOW}WARNING: build.txt not found (build fingerprinting may have failed)${NC}"
fi

if [ $BUILD_ERRORS -gt 0 ]; then
    echo -e "${RED}Build verification failed with $BUILD_ERRORS errors${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful and verified!${NC}"
ls -lh "$DEPLOY_ROOT/dist/" | head -20
echo ""

# Step 8: Configure systemd service
echo -e "${BLUE}[8/12] Configuring systemd service...${NC}"

# Generate systemd service file from template
cat > /etc/systemd/system/equiprofile.service <<EOF
[Unit]
Description=EquiProfile Node.js Application
After=network.target mysql.service mariadb.service
Wants=mysql.service mariadb.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$DEPLOY_ROOT
EnvironmentFile=$DEPLOY_ROOT/.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=equiprofile
TimeoutStopSec=30

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_ROOT
ReadWritePaths=/var/log/equiprofile

[Install]
WantedBy=multi-user.target
EOF

echo "Created /etc/systemd/system/equiprofile.service"
systemctl daemon-reload
echo ""

# Step 9: Configure nginx
echo -e "${BLUE}[9/12] Configuring nginx...${NC}"

if [ -n "$DOMAIN" ]; then
    # Generate nginx configuration
    cat > /etc/nginx/sites-available/equiprofile <<EOF
# HTTP server - redirect to HTTPS or serve temporarily
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

EOF

    if [ "$ENABLE_SSL" = true ]; then
        cat >> /etc/nginx/sites-available/equiprofile <<EOF
    # Redirect to HTTPS (will be uncommented after SSL setup)
    # return 301 https://\$host\$request_uri;

    # Temporary HTTP access during SSL setup
    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# HTTPS server (will be configured by certbot)
EOF
    else
        cat >> /etc/nginx/sites-available/equiprofile <<EOF
    # HTTP-only mode
    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    fi

    # Enable site
    ln -sf /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/equiprofile
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    if nginx -t 2>&1; then
        echo -e "${GREEN}Nginx configuration is valid${NC}"
        systemctl reload nginx
        echo "Nginx reloaded"
    else
        echo -e "${RED}ERROR: Nginx configuration test failed${NC}"
        exit 1
    fi
else
    echo "No domain specified, skipping nginx configuration"
fi
echo ""

# Step 10: Configure logrotate
echo -e "${BLUE}[10/12] Configuring log rotation...${NC}"
cat > /etc/logrotate.d/equiprofile <<EOF
/var/log/equiprofile/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 $SERVICE_USER $SERVICE_USER
    sharedscripts
    postrotate
        systemctl reload equiprofile > /dev/null 2>&1 || true
    endscript
}
EOF
echo "Created /etc/logrotate.d/equiprofile"
echo ""

# Step 11: Start service
echo -e "${BLUE}[11/12] Starting application...${NC}"
systemctl enable equiprofile
systemctl start equiprofile

# Wait for service to start
sleep 5

# Check if service is running
if systemctl is-active --quiet equiprofile; then
    echo -e "${GREEN}✓ Service is running${NC}"
else
    echo -e "${RED}✗ Service failed to start${NC}"
    echo "Check logs: journalctl -u equiprofile -n 50"
    exit 1
fi
echo ""

# Step 12: Health checks and SSL setup
echo -e "${BLUE}[12/12] Running health checks...${NC}"

# Check local health endpoint
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://127.0.0.1:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Local health check passed (http://127.0.0.1:$BACKEND_PORT/api/health)${NC}"
        break
    else
        ((RETRY_COUNT++))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Waiting for application to start... ($RETRY_COUNT/$MAX_RETRIES)"
            sleep 3
        else
            echo -e "${YELLOW}! Health check failed after $MAX_RETRIES attempts${NC}"
            echo "Application may still be starting. Check logs: journalctl -u equiprofile -f"
        fi
    fi
done

# Check version endpoint
if curl -sf http://127.0.0.1:$BACKEND_PORT/api/version > /dev/null 2>&1; then
    VERSION_INFO=$(curl -s http://127.0.0.1:$BACKEND_PORT/api/version)
    echo -e "${GREEN}✓ Version endpoint accessible${NC}"
    echo "  $VERSION_INFO"
else
    echo -e "${YELLOW}! Version endpoint not accessible${NC}"
fi

# Check public domain if available
if [ -n "$DOMAIN" ]; then
    echo ""
    echo "Checking public domain..."
    
    # Check HTTPS health endpoint
    if curl -sf -k https://$DOMAIN/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HTTPS health check passed (https://$DOMAIN/api/health)${NC}"
    else
        echo -e "${YELLOW}! HTTPS health check failed${NC}"
        
        # Try HTTP as fallback
        if curl -sf http://$DOMAIN/api/health > /dev/null 2>&1; then
            echo -e "${YELLOW}! HTTP health check works (HTTPS may not be configured)${NC}"
        fi
    fi
    
    # Verify PWA files return 404
    echo ""
    echo "Verifying PWA blocking..."
    SW_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://$DOMAIN/service-worker.js 2>/dev/null || echo "000")
    MANIFEST_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://$DOMAIN/manifest.json 2>/dev/null || echo "000")
    
    if [ "$SW_STATUS" = "404" ]; then
        echo -e "${GREEN}✓ service-worker.js returns 404${NC}"
    else
        echo -e "${RED}✗ service-worker.js returns $SW_STATUS (expected 404)${NC}"
    fi
    
    if [ "$MANIFEST_STATUS" = "404" ]; then
        echo -e "${GREEN}✓ manifest.json returns 404${NC}"
    else
        echo -e "${RED}✗ manifest.json returns $MANIFEST_STATUS (expected 404)${NC}"
    fi
fi

# Setup SSL if requested
if [ "$ENABLE_SSL" = true ] && [ -n "$DOMAIN" ]; then
    echo ""
    echo "Setting up SSL certificates..."
    
    if command -v certbot &> /dev/null; then
        # Run certbot
        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || {
            echo -e "${YELLOW}! SSL setup failed${NC}"
            echo "You can manually run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
        }
        
        # Uncomment HTTPS redirect in nginx config
        sed -i 's/# return 301/return 301/' /etc/nginx/sites-available/equiprofile
        nginx -t && systemctl reload nginx
    else
        echo -e "${YELLOW}! certbot not installed${NC}"
        echo "Install certbot: sudo apt-get install certbot python3-certbot-nginx"
        echo "Then run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo "Finished: $(date)"
echo ""
echo "Service Status:"
systemctl status equiprofile --no-pager -l | head -10
echo ""
echo "Useful Commands:"
echo "  View logs:       journalctl -u equiprofile -f"
echo "  Check status:    systemctl status equiprofile"
echo "  Restart service: systemctl restart equiprofile"
echo "  View deploy log: cat $LOG_FILE"
echo ""

if [ -n "$DOMAIN" ]; then
    echo "URLs:"
    echo "  HTTP:  http://$DOMAIN"
    if [ "$ENABLE_SSL" = true ]; then
        echo "  HTTPS: https://$DOMAIN"
    fi
    echo "  API:   http://127.0.0.1:$BACKEND_PORT/api/health"
    echo ""
    echo "Next: Run verification script"
    echo "  bash ops/verify.sh --domain $DOMAIN"
fi

echo ""
echo "Deployment log saved to: $LOG_FILE"
