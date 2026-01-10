#!/bin/bash
# ==========================================
# EquiProfile Health Check Script
# ==========================================
# Checks application health endpoints
#
# Usage: bash ops/healthcheck.sh [--domain DOMAIN] [--port PORT]

set -e

# Default values
DOMAIN="localhost"
PORT=3000
TIMEOUT=10

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: bash ops/healthcheck.sh [--domain DOMAIN] [--port PORT] [--timeout SECONDS]"
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

echo "======================================"
echo "EquiProfile Health Checks"
echo "======================================"
echo "Domain: $DOMAIN"
echo "Port: $PORT"
echo ""

# Check 1: Local /api/health endpoint
echo "[1/6] Checking local /api/health..."
if curl -sf --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/api/health" > /dev/null; then
    RESPONSE=$(curl -s --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/api/health")
    check_pass "Local /api/health returned 200"
    echo "  Response: $RESPONSE"
else
    check_fail "Local /api/health failed or timed out"
    echo "  Check if application is running: systemctl status equiprofile"
fi

# Check 2: Local /api/health/ping endpoint  
echo ""
echo "[2/6] Checking local /api/health/ping..."
if curl -sf --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/api/health/ping" > /dev/null; then
    RESPONSE=$(curl -s --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/api/health/ping")
    check_pass "Local /api/health/ping returned 200"
    echo "  Response: $RESPONSE"
else
    check_fail "Local /api/health/ping failed or timed out"
fi

# Check 3: Local root endpoint
echo ""
echo "[3/6] Checking local root endpoint..."
if curl -sf --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/" > /dev/null; then
    RESPONSE=$(curl -sI --max-time "$TIMEOUT" "http://127.0.0.1:$PORT/" | head -n 1)
    check_pass "Local root endpoint returned 200"
    echo "  Response: $RESPONSE"
else
    check_fail "Local root endpoint failed"
fi

# Check 4: Public HTTP endpoint (if not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo ""
    echo "[4/6] Checking public HTTP endpoint..."
    if curl -sf --max-time "$TIMEOUT" "http://$DOMAIN/" > /dev/null; then
        check_pass "HTTP http://$DOMAIN/ returned 200"
    else
        check_fail "HTTP http://$DOMAIN/ failed"
        echo "  Check nginx configuration"
    fi
    
    # Check 5: Public HTTPS endpoint
    echo ""
    echo "[5/6] Checking public HTTPS endpoint..."
    if curl -sf --max-time "$TIMEOUT" "https://$DOMAIN/" > /dev/null; then
        check_pass "HTTPS https://$DOMAIN/ returned 200"
    else
        check_fail "HTTPS https://$DOMAIN/ failed"
        echo "  This is normal if SSL is not configured yet"
    fi
    
    # Check 6: Public API health
    echo ""
    echo "[6/6] Checking public API health..."
    if curl -sf --max-time "$TIMEOUT" "https://$DOMAIN/api/health" > /dev/null; then
        RESPONSE=$(curl -s --max-time "$TIMEOUT" "https://$DOMAIN/api/health")
        check_pass "Public /api/health returned 200"
        echo "  Response: $RESPONSE"
    else
        # Try HTTP if HTTPS fails
        if curl -sf --max-time "$TIMEOUT" "http://$DOMAIN/api/health" > /dev/null; then
            RESPONSE=$(curl -s --max-time "$TIMEOUT" "http://$DOMAIN/api/health")
            check_pass "Public /api/health returned 200 (HTTP)"
            echo "  Response: $RESPONSE"
        else
            check_fail "Public /api/health failed (both HTTP and HTTPS)"
        fi
    fi
else
    echo ""
    echo "[4-6] Skipping public endpoint checks (domain is localhost)"
fi

# Summary
echo ""
echo "======================================"
echo "Health Check Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL_COUNT${NC}"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some health checks failed${NC}"
    echo "Review the errors above and check:"
    echo "  - Application logs: journalctl -u equiprofile -n 50"
    echo "  - Service status: systemctl status equiprofile"
    echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
    exit 1
fi
