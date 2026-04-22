#!/bin/bash
# ==========================================
# EquiProfile One-Command Deployment Script
# ==========================================
# This script handles complete deployment of EquiProfile
# Safe to run multiple times (idempotent)
#
# Usage: sudo bash deployment/deploy.sh

set -e

LOG_FILE="/var/log/equiprofile-deploy.log"
DEPLOY_DIR="/var/equiprofile/app"

# Ensure we're running with proper permissions
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Setup logging
exec > >(tee -a "$LOG_FILE") 2>&1

echo "======================================"
echo "EquiProfile Deployment"
echo "Started: $(date)"
echo "======================================"

# Step 1: Stop service if running
echo ""
echo "[1/9] Stopping service..."
systemctl stop equiprofile || echo "Service not running (this is okay on first install)"

# Step 2: Navigate to deployment directory
echo ""
echo "[2/9] Checking deployment directory..."
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "ERROR: Deployment directory $DEPLOY_DIR does not exist"
    echo "Please ensure the application is cloned/copied to $DEPLOY_DIR"
    exit 1
fi

cd "$DEPLOY_DIR"
echo "Working directory: $(pwd)"

# Verify ownership
CURRENT_OWNER=$(stat -c '%U' .)
if [ "$CURRENT_OWNER" != "www-data" ]; then
    echo "WARNING: Directory owned by $CURRENT_OWNER, not www-data"
    echo "Fixing ownership..."
    chown -R www-data:www-data .
fi

# Create log directory
mkdir -p /var/log/equiprofile
chown -R www-data:www-data /var/log/equiprofile

# Create uploads directory (default production path used when STORAGE_PATH is unset)
# The Node.js app runs as www-data so this directory must be writable by that user.
mkdir -p /var/www/equiprofile/uploads
chown -R www-data:www-data /var/www/equiprofile/uploads
echo "Uploads directory ready: /var/www/equiprofile/uploads"

# Step 3: Pull latest code (if git repo)
echo ""
echo "[3/9] Updating code..."
if [ -d ".git" ]; then
    sudo -u www-data git pull origin main || echo "Git pull failed or not a git repo"
else
    echo "Not a git repository, skipping pull"
fi

# Step 4: Install dependencies
echo ""
echo "[4/9] Installing dependencies (npm ci)..."

sudo -u www-data npm ci

# Step 5: Build application
echo ""
echo "[5/9] Building application..."

# Backup previous dist before building (keep last 2 for rollback)
if [ -d "dist" ]; then
    if [ -d "dist.prev2" ]; then rm -rf dist.prev2; fi
    if [ -d "dist.prev" ]; then mv dist.prev dist.prev2; fi
    cp -r dist dist.prev
    echo "Previous dist backed up to dist.prev"
fi

sudo -u www-data npm run build

# Verify build output exists
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: Build failed - dist/index.js not found"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "ERROR: Build failed - dist/public/ not found"
    exit 1
fi

echo "Build successful!"

# Step 6: Install systemd service
echo ""
echo "[6/9] Installing systemd service..."
if [ ! -f /etc/systemd/system/equiprofile.service ]; then
    if [ -f deployment/equiprofile.service ]; then
        cp deployment/equiprofile.service /etc/systemd/system/
        systemctl daemon-reload
        echo "Systemd service installed"
    else
        echo "WARNING: deployment/equiprofile.service not found"
    fi
else
    echo "Systemd service already installed"
    # Reload in case it changed
    cp deployment/equiprofile.service /etc/systemd/system/ 2>/dev/null || true
    systemctl daemon-reload
fi

# Step 7: Check nginx configuration
echo ""
echo "[7/9] Checking nginx configuration..."
if [ ! -f /etc/nginx/sites-available/equiprofile ]; then
    if command -v nginx &>/dev/null; then
        # nginx is installed — auto-deploy the config if the source exists
        if [ -f deployment/nginx/equiprofile.conf ]; then
            echo "Auto-installing nginx config from deployment/nginx/equiprofile.conf..."
            cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/equiprofile
            # Create symlink if not already present
            if [ ! -L /etc/nginx/sites-enabled/equiprofile ]; then
                ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/equiprofile
                echo "Symlink created: /etc/nginx/sites-enabled/equiprofile"
            fi
            # Test and reload
            if nginx -t 2>/dev/null; then
                systemctl reload nginx
                echo "Nginx configuration installed and reloaded"
            else
                echo "WARNING: Auto-installed nginx config failed validation"
                echo "Please check /etc/nginx/sites-available/equiprofile manually"
            fi
        else
            echo "WARNING: deployment/nginx/equiprofile.conf not found"
            echo "Please:"
            echo "  1. Edit deployment/nginx/equiprofile.conf"
            echo "  2. Replace ALL instances of YOUR_DOMAIN_HERE with your actual domain"
            echo "  3. Re-run this script, or copy manually and reload nginx"
        fi
    else
        echo "INFO: Nginx is not installed — skipping nginx configuration"
    fi
else
    # Check if placeholder still exists
    if grep -q "YOUR_DOMAIN_HERE" /etc/nginx/sites-available/equiprofile 2>/dev/null; then
        echo "ERROR: Nginx config still contains YOUR_DOMAIN_HERE placeholder"
        echo "Please edit /etc/nginx/sites-available/equiprofile and replace with your actual domain"
    else
        # ── Ensure client_max_body_size is 50M in every server block ──────────
        # When certbot rewrites the nginx config to add SSL it may not preserve
        # the server-level client_max_body_size directive that was in the
        # original HTTP block.  We patch it in-place now so that file uploads
        # are not rejected with 413 on the HTTPS endpoint.
        #
        # Strategy:
        #  1. Replace any existing (possibly lower) client_max_body_size value.
        #  2. If the directive is missing entirely in a server block, insert it
        #     immediately after the first server_name line in that block.
        NGINX_CONF="/etc/nginx/sites-available/equiprofile"
        # Use a Python state-machine to ensure EVERY server block in the live
        # config has client_max_body_size 50M.  The simple grep+sed approach
        # used previously had a gap: when certbot adds an HTTPS 443 block that
        # lacks the directive, grep finds it in the HTTP redirect block and
        # skips the "insert" branch — leaving the 443 block at nginx's 1 MB
        # default and causing 413 errors on document uploads.
        python3 - "$NGINX_CONF" << 'PYEOF'
import sys, re

conf = sys.argv[1]
try:
    with open(conf) as f:
        content = f.read()
except Exception as e:
    print(f"Nginx: could not open {conf}: {e}")
    sys.exit(0)

# Step 1: normalise any existing client_max_body_size value to 50M
content = re.sub(r'(client_max_body_size\s+)[^\s;]+;', r'\g<1>50M;', content)

# Step 2: walk the config line-by-line with brace-depth tracking so we can
# detect top-level server { } blocks and insert the directive into any that
# still lack it (e.g. certbot-generated HTTPS blocks).
lines = content.split('\n')
result = []
depth = 0
in_server = False
server_has_limit = False
server_name_insert_after = -1

for line in lines:
    opens = line.count('{')
    closes = line.count('}')
    stripped = line.strip()

    # Detect the opening of a top-level server block
    if depth == 0 and opens > 0 and re.search(r'\bserver\b', line):
        in_server = True
        server_has_limit = False
        server_name_insert_after = -1

    result.append(line)
    depth += opens - closes

    # Inspect lines that belong directly to the server block (depth == 1)
    if in_server and depth == 1:
        if 'client_max_body_size' in stripped:
            server_has_limit = True
        elif stripped.startswith('server_name '):
            server_name_insert_after = len(result) - 1

    # End of the top-level server block
    if in_server and depth == 0:
        if not server_has_limit and server_name_insert_after >= 0:
            result.insert(server_name_insert_after + 1, '    client_max_body_size 50M;')
        in_server = False

with open(conf, 'w') as f:
    f.write('\n'.join(result))
print("Nginx: client_max_body_size 50M ensured in all server blocks")
PYEOF

        # Test nginx config
        if nginx -t 2>/dev/null; then
            echo "Nginx configuration is valid"
            systemctl reload nginx
            echo "Nginx reloaded"
        else
            echo "WARNING: Nginx configuration test failed"
            echo "Please check nginx configuration manually"
        fi
    fi
fi

# Step 8: Start service
echo ""
echo "[8/9] Starting application service..."
systemctl start equiprofile
systemctl enable equiprofile

# Wait for service to start
sleep 3

# Step 9: Health checks
echo ""
echo "[9/9] Running health checks..."

# Check if service is running
if systemctl is-active --quiet equiprofile; then
    echo "✓ Service is running"
else
    echo "✗ Service failed to start"
    echo "Check logs with: journalctl -u equiprofile -n 50"
    exit 1
fi

# Check local health endpoint
if curl -sf http://127.0.0.1:3000/api/health > /dev/null; then
    echo "✓ Local health check passed"
else
    echo "✗ Local health check failed (trying legacy /healthz)"
    if curl -sf http://127.0.0.1:3000/healthz > /dev/null; then
        echo "✓ Legacy health check passed"
    else
        echo "Service may still be starting, or there's a configuration issue"
    fi
fi

# Try HTTPS check (may fail if SSL not configured)
DOMAIN=$(grep server_name /etc/nginx/sites-available/equiprofile 2>/dev/null | grep -v "#" | awk '{print $2}' | tr -d ';' | head -n1)
if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "YOUR_DOMAIN_HERE" ]; then
    if curl -sfI https://$DOMAIN > /dev/null 2>&1; then
        echo "✓ HTTPS check passed (https://$DOMAIN)"
    else
        echo "! HTTPS check failed (https://$DOMAIN)"
        echo "  This is normal if SSL certificates are not configured yet"
    fi
fi

# Rollback function — restores dist.prev and restarts the service
rollback() {
    echo "⚠️  ROLLING BACK to previous build..."
    if [ -d "dist.prev" ]; then
        rm -rf dist
        mv dist.prev dist
        systemctl restart equiprofile
        echo "✓ Rollback complete"
    else
        echo "✗ No previous build available for rollback"
    fi
    exit 1
}

# Run UI smoke test if available
if command -v node &>/dev/null && [ -f "scripts/ui-smoke-test.mjs" ]; then
    # Only try to install Playwright if chromium is not already available.
    # Pre-installing Playwright on the deployment target is recommended:
    #   npx playwright install chromium --with-deps
    PLAYWRIGHT_AVAILABLE=false
    if node -e "require('playwright')" 2>/dev/null; then
        PLAYWRIGHT_AVAILABLE=true
    elif npx --yes playwright install chromium --with-deps >/dev/null 2>&1; then
        PLAYWRIGHT_AVAILABLE=true
    fi

    if $PLAYWRIGHT_AVAILABLE; then
        echo "Running UI smoke test..."
        BASE_URL="http://127.0.0.1:3000" node scripts/ui-smoke-test.mjs || rollback
    else
        echo "⚠️  Playwright not available — skipping UI smoke test."
        echo "   To enable: run 'npx playwright install chromium --with-deps' on this server."
    fi
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "Finished: $(date)"
echo "======================================"
echo ""
echo "Next steps:"
echo "  - View logs: journalctl -u equiprofile -f"
echo "  - Check status: systemctl status equiprofile"
echo "  - View this log: cat $LOG_FILE"
echo "  - Rollback if needed: bash deployment/deploy.sh --rollback"
echo ""