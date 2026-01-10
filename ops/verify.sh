#!/bin/bash
# ==========================================
# EquiProfile Post-Deployment Verification
# ==========================================
# Validates deployment was successful
#
# Usage: bash ops/verify.sh [--domain DOMAIN] [--port PORT]

set -e

# Default values
DOMAIN="localhost"
PORT=3000

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: bash ops/verify.sh [--domain DOMAIN] [--port PORT]"
            exit 1
            ;;
    esac
done

FAIL_COUNT=0
PASS_COUNT=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}!${NC} $1"
}

echo "======================================"
echo "EquiProfile Deployment Verification"
echo "======================================"
echo "Domain: $DOMAIN"
echo "Port: $PORT"
echo ""

# Check 0: Git and Build SHA
echo "[0/9] Checking build information..."
if command -v git &> /dev/null && [ -d ".git" ]; then
    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    echo -e "${BLUE}  Git SHA: $GIT_SHA${NC}"
else
    echo -e "${YELLOW}  Git SHA: not available${NC}"
fi

# Check build.txt
if [ -f "dist/public/build.txt" ]; then
    echo -e "${BLUE}  Build info:${NC}"
    cat dist/public/build.txt | sed 's/^/    /'
else
    echo -e "${YELLOW}  build.txt not found${NC}"
fi

# Check build SHA from API
if curl -sf http://127.0.0.1:$PORT/api/version > /dev/null 2>&1; then
    API_VERSION=$(curl -s http://127.0.0.1:$PORT/api/version)
    echo -e "${BLUE}  API version: $API_VERSION${NC}"
else
    echo -e "${YELLOW}  /api/version not accessible${NC}"
fi

echo ""

# Check 1: Service is running and only ONE service exists
echo "[1/9] Checking service status..."
if systemctl is-active --quiet equiprofile; then
    check_pass "equiprofile service is active"
    
    # Check for duplicate/transient services
    EQUIPROFILE_SERVICES=$(systemctl list-units --all | grep -c "equiprofile" || true)
    if [ "$EQUIPROFILE_SERVICES" -eq 1 ]; then
        check_pass "Only ONE equiprofile service exists (no duplicates)"
    else
        check_fail "Multiple equiprofile services found ($EQUIPROFILE_SERVICES)"
        echo "  Services:"
        systemctl list-units --all | grep "equiprofile"
    fi
else
    check_fail "equiprofile service is not running"
    echo "  Start service: sudo systemctl start equiprofile"
    echo "  View logs: journalctl -u equiprofile -n 50"
fi

# Check 2: No transient services running
echo ""
echo "[2/9] Checking for transient services..."
TRANSIENT_SERVICES=$(systemctl list-units --all | grep "equiprofile" | grep -v "equiprofile.service" | wc -l || true)
if [ "$TRANSIENT_SERVICES" -eq 0 ]; then
    check_pass "No transient services running"
else
    check_fail "Found $TRANSIENT_SERVICES transient service(s)"
    systemctl list-units --all | grep "equiprofile" | grep -v "equiprofile.service"
fi

# Check 3: Health endpoints
echo ""
echo "[3/9] Checking health endpoints..."
if curl -sf http://127.0.0.1:$PORT/api/health > /dev/null; then
    check_pass "http://127.0.0.1:$PORT/api/health returns 200"
else
    check_fail "http://127.0.0.1:$PORT/api/health failed"
fi

if curl -sf http://127.0.0.1:$PORT/api/health/ping > /dev/null; then
    check_pass "http://127.0.0.1:$PORT/api/health/ping returns 200"
else
    check_fail "http://127.0.0.1:$PORT/api/health/ping failed"
fi

# Check version endpoint
if curl -sf http://127.0.0.1:$PORT/api/version > /dev/null; then
    check_pass "http://127.0.0.1:$PORT/api/version returns 200"
else
    check_fail "http://127.0.0.1:$PORT/api/version failed"
fi

# Check 4: Frontend serves with hashed assets
echo ""
echo "[4/9] Checking frontend assets..."
FRONTEND_HTML=$(curl -s http://127.0.0.1:$PORT/)
if echo "$FRONTEND_HTML" | grep -q "/assets/index-"; then
    check_pass "Frontend serves hashed assets (/assets/index-*.js)"
else
    check_fail "Frontend does not serve hashed assets"
    echo "  This may indicate a build or configuration issue"
fi

# Check 5: Nginx listening on ports 80 and 443
echo ""
echo "[5/9] Checking nginx..."
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        check_pass "nginx service is running"
        
        # Check port 80
        if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
            check_pass "nginx listening on port 80"
        else
            check_fail "nginx not listening on port 80"
        fi
        
        # Check port 443
        if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
            check_pass "nginx listening on port 443 (HTTPS configured)"
        else
            check_warn "nginx not listening on port 443 (HTTPS not configured)"
        fi
    else
        check_fail "nginx service is not running"
    fi
else
    check_warn "nginx not installed"
fi

# Check 6: Public domain checks (if not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo ""
    echo "[6/9] Checking public domain..."
    
    # Check HTTPS endpoint
    if curl -sf https://$DOMAIN/api/health > /dev/null; then
        check_pass "https://$DOMAIN/api/health returns 200"
    else
        check_fail "https://$DOMAIN/api/health failed"
        
        # Try HTTP as fallback
        if curl -sf http://$DOMAIN/api/health > /dev/null; then
            check_warn "http://$DOMAIN/api/health works (HTTPS may not be configured)"
        fi
    fi
    
    # Check frontend
    if curl -sf https://$DOMAIN/ > /dev/null; then
        FRONTEND=$(curl -s https://$DOMAIN/)
        if echo "$FRONTEND" | grep -q "/assets/index-"; then
            check_pass "https://$DOMAIN/ serves frontend with hashed assets"
        else
            check_warn "https://$DOMAIN/ serves content but no hashed assets found"
        fi
    else
        check_fail "https://$DOMAIN/ failed"
    fi
else
    echo ""
    echo "[6/9] Skipping public domain checks (domain is localhost)"
fi

# Check 7: Port consistency (using specified port, not auto-switched)
echo ""
echo "[7/9] Checking port binding..."
if lsof -i :$PORT 2>/dev/null | grep -q "node"; then
    check_pass "Application bound to port $PORT (no auto-switching)"
else
    check_fail "Application not bound to port $PORT"
    echo "  Check other ports:"
    lsof -i :3000 2>/dev/null || echo "  Port 3000: not in use"
    lsof -i :3001 2>/dev/null || echo "  Port 3001: not in use"
fi

# Check 8: PWA blocking - service worker and manifest MUST return 404
echo ""
echo "[8/9] Checking PWA blocking..."

if [ "$DOMAIN" != "localhost" ]; then
    # Check via public domain
    SW_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://$DOMAIN/service-worker.js 2>/dev/null || echo "000")
    MANIFEST_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://$DOMAIN/manifest.json 2>/dev/null || echo "000")
    
    if [ "$SW_STATUS" = "404" ]; then
        check_pass "service-worker.js returns 404 (PWA blocked)"
    else
        check_fail "service-worker.js returns $SW_STATUS (expected 404)"
    fi
    
    if [ "$MANIFEST_STATUS" = "404" ]; then
        check_pass "manifest.json returns 404 (PWA blocked)"
    else
        check_fail "manifest.json returns $MANIFEST_STATUS (expected 404)"
    fi
else
    # Check via localhost
    SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/service-worker.js 2>/dev/null || echo "000")
    MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/manifest.json 2>/dev/null || echo "000")
    
    if [ "$SW_STATUS" = "404" ]; then
        check_pass "service-worker.js returns 404 (PWA blocked)"
    else
        check_warn "service-worker.js returns $SW_STATUS (check nginx config)"
    fi
    
    if [ "$MANIFEST_STATUS" = "404" ]; then
        check_pass "manifest.json returns 404 (PWA blocked)"
    else
        check_warn "manifest.json returns $MANIFEST_STATUS (check nginx config)"
    fi
fi

# Check 9: Build SHA in HTML meta tag
echo ""
echo "[9/9] Checking build SHA in HTML..."
if [ "$DOMAIN" != "localhost" ]; then
    HTML_CONTENT=$(curl -k -s https://$DOMAIN/ 2>/dev/null || echo "")
else
    HTML_CONTENT=$(curl -s http://127.0.0.1:$PORT/ 2>/dev/null || echo "")
fi

if echo "$HTML_CONTENT" | grep -q 'name="x-build-sha"'; then
    BUILD_SHA=$(echo "$HTML_CONTENT" | grep -o 'name="x-build-sha" content="[^"]*"' | cut -d'"' -f4)
    check_pass "Build SHA found in HTML: $BUILD_SHA"
else
    check_warn "Build SHA meta tag not found in HTML"
fi

# Summary
echo ""
echo "======================================"
echo "Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL_COUNT${NC}"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment verified successfully!${NC}"
    echo ""
    echo "Your EquiProfile instance is ready:"
    if [ "$DOMAIN" != "localhost" ]; then
        echo "  - https://$DOMAIN"
        echo "  - https://$DOMAIN/api/health"
    else
        echo "  - http://127.0.0.1:$PORT"
        echo "  - http://127.0.0.1:$PORT/api/health"
    fi
    echo ""
    echo "Useful commands:"
    echo "  - View logs: journalctl -u equiprofile -f"
    echo "  - Check status: systemctl status equiprofile"
    echo "  - Restart: sudo systemctl restart equiprofile"
    exit 0
else
    echo -e "${RED}✗ Deployment verification failed${NC}"
    echo ""
    echo "Please review the errors above and check:"
    echo "  - Application logs: journalctl -u equiprofile -n 100"
    echo "  - Service status: systemctl status equiprofile"
    echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
    echo "  - Port conflicts: lsof -i :$PORT"
    echo ""
    echo "To re-deploy:"
    echo "  sudo bash ops/deploy.sh --domain $DOMAIN --resume"
    exit 1
fi
