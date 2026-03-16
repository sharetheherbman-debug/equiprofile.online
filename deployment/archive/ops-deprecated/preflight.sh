#!/bin/bash
# ==========================================
# EquiProfile Pre-flight Checks
# ==========================================
# Validates system requirements before deployment
# Run before ops/deploy.sh to catch issues early
#
# Usage: bash ops/preflight.sh [--port PORT]

set -e

# Default values
CHECK_PORT=3000
REQUIRED_NODE_MAJOR=20
REQUIRED_PNPM_MAJOR=10
MIN_DISK_GB=5
MIN_RAM_MB=2048

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            CHECK_PORT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: bash ops/preflight.sh [--port PORT]"
            exit 1
            ;;
    esac
done

FAIL_COUNT=0
WARN_COUNT=0

echo "======================================"
echo "EquiProfile Pre-flight Checks"
echo "======================================"
echo ""

# Function to check and report
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}!${NC} $1"
    ((WARN_COUNT++))
}

# Check 1: OS Version
echo "[1/10] Checking OS version..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "ubuntu" ]]; then
        if [[ "$VERSION_ID" == "24.04" ]] || [[ "$VERSION_ID" == "22.04" ]]; then
            check_pass "OS: Ubuntu $VERSION_ID"
        else
            check_warn "OS: Ubuntu $VERSION_ID (recommended: 24.04 LTS or 22.04 LTS)"
        fi
    else
        check_warn "OS: $PRETTY_NAME (recommended: Ubuntu 24.04 LTS)"
    fi
else
    check_warn "Cannot determine OS version"
fi

# Check 2: Node.js version
echo ""
echo "[2/10] Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ]; then
        check_pass "Node.js: v$NODE_VERSION"
    else
        check_fail "Node.js: v$NODE_VERSION (required: v$REQUIRED_NODE_MAJOR or higher)"
        echo "  Install Node.js $REQUIRED_NODE_MAJOR:"
        echo "    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x | sudo -E bash -"
        echo "    sudo apt-get install -y nodejs"
    fi
else
    check_fail "Node.js not installed"
    echo "  Install Node.js:"
    echo "    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x | sudo -E bash -"
    echo "    sudo apt-get install -y nodejs"
fi

# Check 3: pnpm
echo ""
echo "[3/10] Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    PNPM_MAJOR=$(echo "$PNPM_VERSION" | cut -d'.' -f1)
    if [ "$PNPM_MAJOR" -ge "$REQUIRED_PNPM_MAJOR" ]; then
        check_pass "pnpm: v$PNPM_VERSION"
    else
        check_fail "pnpm: v$PNPM_VERSION (required: v$REQUIRED_PNPM_MAJOR or higher)"
        echo "  Install pnpm:"
        echo "    npm install -g pnpm@latest"
    fi
else
    check_fail "pnpm not installed"
    echo "  Install pnpm:"
    echo "    npm install -g pnpm"
    echo "  Or use corepack:"
    echo "    corepack enable"
    echo "    corepack prepare pnpm@latest --activate"
fi

# Check 4: Port availability
echo ""
echo "[4/10] Checking port availability..."
if command -v nc &> /dev/null || command -v netcat &> /dev/null; then
    # Check port 3000 (or specified port)
    if nc -z 127.0.0.1 "$CHECK_PORT" 2>/dev/null || netcat -z 127.0.0.1 "$CHECK_PORT" 2>/dev/null; then
        check_warn "Port $CHECK_PORT is already in use"
        echo "  Process using port $CHECK_PORT:"
        lsof -i :"$CHECK_PORT" 2>/dev/null || ss -tlnp | grep ":$CHECK_PORT" || echo "  Cannot determine process"
    else
        check_pass "Port $CHECK_PORT is available"
    fi
    
    # Check port 80
    if nc -z 127.0.0.1 80 2>/dev/null || netcat -z 127.0.0.1 80 2>/dev/null; then
        check_pass "Port 80 is in use (nginx likely installed)"
    else
        check_warn "Port 80 is not in use (nginx may not be running)"
    fi
    
    # Check port 443
    if nc -z 127.0.0.1 443 2>/dev/null || netcat -z 127.0.0.1 443 2>/dev/null; then
        check_pass "Port 443 is in use (HTTPS configured)"
    else
        check_warn "Port 443 is not in use (HTTPS not configured yet)"
    fi
else
    check_warn "nc/netcat not installed, cannot check port availability"
    echo "  Install: sudo apt-get install netcat"
fi

# Check 5: Nginx
echo ""
echo "[5/10] Checking nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | grep -o '[0-9.]*')
    check_pass "nginx: v$NGINX_VERSION"
    
    # Check if nginx is running
    if systemctl is-active --quiet nginx 2>/dev/null; then
        check_pass "nginx service is running"
    else
        check_warn "nginx is installed but not running"
        echo "  Start nginx: sudo systemctl start nginx"
    fi
else
    check_warn "nginx not installed (required for production)"
    echo "  Install nginx:"
    echo "    sudo apt-get install nginx"
fi

# Check 6: Disk space
echo ""
echo "[6/10] Checking disk space..."
AVAILABLE_GB=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_GB" -ge "$MIN_DISK_GB" ]; then
    check_pass "Disk space: ${AVAILABLE_GB}GB available"
else
    check_fail "Disk space: ${AVAILABLE_GB}GB available (minimum: ${MIN_DISK_GB}GB required)"
fi

# Check 7: RAM
echo ""
echo "[7/10] Checking RAM..."
TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM_MB" -ge "$MIN_RAM_MB" ]; then
    check_pass "RAM: ${TOTAL_RAM_MB}MB total"
else
    check_warn "RAM: ${TOTAL_RAM_MB}MB total (recommended: ${MIN_RAM_MB}MB for safe builds)"
    echo "  Build may require NODE_OPTIONS='--max_old_space_size=2048'"
fi

# Check 8: MySQL/MariaDB (optional)
echo ""
echo "[8/10] Checking database..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
    check_pass "MySQL/MariaDB: v$MYSQL_VERSION"
    
    # Check if MySQL is running
    if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mariadb 2>/dev/null; then
        check_pass "MySQL/MariaDB service is running"
    else
        check_warn "MySQL/MariaDB installed but not running"
    fi
else
    check_warn "MySQL/MariaDB not installed (SQLite will be used)"
    echo "  For production, install MySQL:"
    echo "    sudo apt-get install mysql-server"
fi

# Check 9: Certbot (for SSL)
echo ""
echo "[9/10] Checking certbot..."
if command -v certbot &> /dev/null; then
    CERTBOT_VERSION=$(certbot --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
    check_pass "certbot: v$CERTBOT_VERSION"
else
    check_warn "certbot not installed (required for HTTPS)"
    echo "  Install certbot:"
    echo "    sudo apt-get install certbot python3-certbot-nginx"
fi

# Check 10: Permissions
echo ""
echo "[10/10] Checking permissions..."
if [ -w . ]; then
    check_pass "Current directory is writable"
else
    check_fail "Current directory is not writable"
    echo "  Ensure proper ownership: sudo chown -R \$USER:\$USER ."
fi

# Check if running as root (not recommended for normal operation)
if [ "$EUID" -eq 0 ]; then
    check_warn "Running as root (use --user flag in deploy.sh to run as different user)"
fi

# Summary
echo ""
echo "======================================"
echo "Pre-flight Check Summary"
echo "======================================"

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "System is ready for deployment."
    echo "Run: sudo bash ops/deploy.sh --domain your-domain.com"
    exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}! $WARN_COUNT warning(s)${NC}"
    echo ""
    echo "System is ready for deployment, but some optional components are missing."
    echo "You can proceed with deployment, but review warnings above."
    echo ""
    echo "Run: sudo bash ops/deploy.sh --domain your-domain.com"
    exit 0
else
    echo -e "${RED}✗ $FAIL_COUNT critical issue(s)${NC}"
    if [ $WARN_COUNT -gt 0 ]; then
        echo -e "${YELLOW}! $WARN_COUNT warning(s)${NC}"
    fi
    echo ""
    echo "Please fix the critical issues above before proceeding with deployment."
    exit 1
fi
