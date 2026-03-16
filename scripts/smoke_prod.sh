#!/bin/bash
# ==========================================
# EquiProfile Production Smoke Test Script
# ==========================================
# Comprehensive verification script for production deployments
# Tests service health, connectivity, and basic functionality
#
# Usage: bash scripts/smoke_prod.sh [BASE_URL]
# Example: bash scripts/smoke_prod.sh https://equiprofile.online

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default settings
BASE_URL="${1:-http://localhost:3000}"
PORT=3000
PASS=0
FAIL=0

echo "=========================================="
echo "  EquiProfile Production Smoke Tests"
echo "=========================================="
echo ""
echo "Testing: $BASE_URL"
echo "Started: $(date)"
echo ""

# Helper functions
pass_test() {
  echo -e "${GREEN}✅ PASS${NC} - $1"
  PASS=$((PASS + 1))
}

fail_test() {
  echo -e "${RED}❌ FAIL${NC} - $1"
  FAIL=$((FAIL + 1))
}

warn_test() {
  echo -e "${YELLOW}⚠️  WARN${NC} - $1"
}

info() {
  echo -e "${BLUE}ℹ️  INFO${NC} - $1"
}

# ==========================================
# Test 1: Service Status
# ==========================================
echo "=========================================="
echo "Test 1: Service Status"
echo "=========================================="

if command -v systemctl &> /dev/null; then
  if systemctl is-active --quiet equiprofile 2>/dev/null; then
    pass_test "systemd service 'equiprofile' is active and running"
    
    # Get service uptime
    UPTIME=$(systemctl show equiprofile -p ActiveEnterTimestamp --value)
    info "Service started at: $UPTIME"
  else
    fail_test "systemd service 'equiprofile' is not running"
    warn_test "Check logs: journalctl -u equiprofile -n 50"
  fi
else
  warn_test "systemctl not available, skipping service check"
fi

echo ""

# ==========================================
# Test 2: Port Listening
# ==========================================
echo "=========================================="
echo "Test 2: Port 3000 Listening"
echo "=========================================="

if command -v netstat &> /dev/null; then
  if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    pass_test "Port $PORT is listening"
  else
    fail_test "Port $PORT is not listening"
  fi
elif command -v ss &> /dev/null; then
  if ss -tuln | grep -q ":$PORT "; then
    pass_test "Port $PORT is listening"
  else
    fail_test "Port $PORT is not listening"
  fi
elif command -v lsof &> /dev/null; then
  if lsof -i :$PORT >/dev/null 2>&1; then
    pass_test "Port $PORT is listening"
    # Show what's using the port
    PROCESS=$(lsof -i :$PORT | tail -n 1 | awk '{print $1}')
    info "Process: $PROCESS"
  else
    fail_test "Port $PORT is not listening"
  fi
else
  warn_test "No network tools available to check port status"
fi

echo ""

# ==========================================
# Test 3: Health Endpoint
# ==========================================
echo "=========================================="
echo "Test 3: Health Endpoint"
echo "=========================================="

# Try local health endpoint first
LOCAL_HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/api/health 2>/dev/null || echo "000")

if [ "$LOCAL_HEALTH_STATUS" = "200" ]; then
  pass_test "Local health endpoint responding (HTTP 200)"
  
  # Check response content
  HEALTH_RESPONSE=$(curl -s http://127.0.0.1:$PORT/api/health 2>/dev/null || echo "{}")
  if echo "$HEALTH_RESPONSE" | grep -q "status"; then
    info "Health response contains 'status' field"
  fi
else
  # Try legacy /healthz endpoint
  LEGACY_HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/healthz 2>/dev/null || echo "000")
  
  if [ "$LEGACY_HEALTH_STATUS" = "200" ]; then
    pass_test "Legacy health endpoint responding (HTTP 200)"
  else
    fail_test "Health endpoint not responding (HTTP $LOCAL_HEALTH_STATUS)"
    warn_test "Check if application is running: systemctl status equiprofile"
  fi
fi

echo ""

# ==========================================
# Test 4: Public Domain (if not localhost)
# ==========================================
if [[ "$BASE_URL" != *"localhost"* ]] && [[ "$BASE_URL" != *"127.0.0.1"* ]]; then
  echo "=========================================="
  echo "Test 4: Public Domain Accessibility"
  echo "=========================================="
  
  # Test public health endpoint
  PUBLIC_HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null || echo "000")
  
  if [ "$PUBLIC_HEALTH_STATUS" = "200" ]; then
    pass_test "Public health endpoint accessible (HTTP 200)"
  else
    fail_test "Public health endpoint not accessible (HTTP $PUBLIC_HEALTH_STATUS)"
    warn_test "Check nginx configuration and DNS settings"
  fi
  
  echo ""
fi

# ==========================================
# Test 5: Root Path Serves HTML
# ==========================================
echo "=========================================="
echo "Test 5: Root Path (HTML)"
echo "=========================================="

ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/ 2>/dev/null || echo "000")

if [ "$ROOT_STATUS" = "200" ]; then
  pass_test "Root path returns HTTP 200"
  
  # Check content type
  CONTENT_TYPE=$(curl -s -I http://127.0.0.1:$PORT/ 2>/dev/null | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
  
  if echo "$CONTENT_TYPE" | grep -qi "html"; then
    pass_test "Root path serves HTML (Content-Type: $CONTENT_TYPE)"
  else
    fail_test "Root path does not serve HTML (Content-Type: $CONTENT_TYPE)"
  fi
  
  # Check if HTML contains expected elements
  ROOT_HTML=$(curl -s http://127.0.0.1:$PORT/ 2>/dev/null)
  
  if echo "$ROOT_HTML" | grep -q "<!DOCTYPE html>"; then
    pass_test "HTML document has DOCTYPE declaration"
  else
    warn_test "HTML document missing DOCTYPE declaration"
  fi
  
  if echo "$ROOT_HTML" | grep -q "<head>"; then
    pass_test "HTML document has head section"
  else
    fail_test "HTML document missing head section"
  fi
else
  fail_test "Root path not accessible (HTTP $ROOT_STATUS)"
fi

echo ""

# ==========================================
# Test 6: Static Assets MIME Types
# ==========================================
echo "=========================================="
echo "Test 6: Static Assets MIME Types"
echo "=========================================="

# Get HTML to find asset references
HTML=$(curl -s http://127.0.0.1:$PORT/ 2>/dev/null || echo "")

# Find first JS asset
JS_ASSET=$(echo "$HTML" | grep -o 'src="/assets/[^"]*\.js"' | head -1 | sed 's/src="\(.*\)"/\1/')

if [ -n "$JS_ASSET" ]; then
  JS_URL="http://127.0.0.1:$PORT$JS_ASSET"
  JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$JS_URL" 2>/dev/null || echo "000")
  
  if [ "$JS_STATUS" = "200" ]; then
    JS_CONTENT_TYPE=$(curl -s -I "$JS_URL" 2>/dev/null | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
    
    if echo "$JS_CONTENT_TYPE" | grep -qi "javascript\|text/javascript\|application/javascript"; then
      pass_test "JavaScript asset has correct MIME type ($JS_CONTENT_TYPE)"
    else
      fail_test "JavaScript asset has incorrect MIME type ($JS_CONTENT_TYPE)"
    fi
  else
    warn_test "JavaScript asset not accessible (HTTP $JS_STATUS): $JS_ASSET"
  fi
else
  warn_test "No JavaScript assets found in HTML"
fi

# Find first CSS asset
CSS_ASSET=$(echo "$HTML" | grep -o 'href="/assets/[^"]*\.css"' | head -1 | sed 's/href="\(.*\)"/\1/')

if [ -n "$CSS_ASSET" ]; then
  CSS_URL="http://127.0.0.1:$PORT$CSS_ASSET"
  CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CSS_URL" 2>/dev/null || echo "000")
  
  if [ "$CSS_STATUS" = "200" ]; then
    CSS_CONTENT_TYPE=$(curl -s -I "$CSS_URL" 2>/dev/null | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
    
    if echo "$CSS_CONTENT_TYPE" | grep -qi "css"; then
      pass_test "CSS asset has correct MIME type ($CSS_CONTENT_TYPE)"
    else
      fail_test "CSS asset has incorrect MIME type ($CSS_CONTENT_TYPE)"
    fi
  else
    warn_test "CSS asset not accessible (HTTP $CSS_STATUS): $CSS_ASSET"
  fi
else
  warn_test "No CSS assets found in HTML"
fi

echo ""

# ==========================================
# Test 7: Build Info
# ==========================================
echo "=========================================="
echo "Test 7: Build Information"
echo "=========================================="

BUILD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/build 2>/dev/null || echo "000")

if [ "$BUILD_STATUS" = "200" ]; then
  pass_test "Build endpoint accessible (HTTP 200)"
  
  BUILD_INFO=$(curl -s http://127.0.0.1:$PORT/build 2>/dev/null || echo "{}")
  
  if echo "$BUILD_INFO" | grep -q "version"; then
    VERSION=$(echo "$BUILD_INFO" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    info "Build version: $VERSION"
  fi
  
  if echo "$BUILD_INFO" | grep -q "timestamp"; then
    TIMESTAMP=$(echo "$BUILD_INFO" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
    info "Build timestamp: $TIMESTAMP"
  fi
else
  warn_test "Build endpoint not accessible (HTTP $BUILD_STATUS)"
fi

echo ""

# ==========================================
# Test 8: Key Pages
# ==========================================
echo "=========================================="
echo "Test 8: Key Pages Accessibility"
echo "=========================================="

PAGES=("/" "/login" "/register" "/about" "/features" "/pricing" "/contact")

for page in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT$page" 2>/dev/null || echo "000")
  
  if [ "$STATUS" = "200" ]; then
    pass_test "Page '$page' accessible (HTTP 200)"
  elif [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
    pass_test "Page '$page' redirects (HTTP $STATUS)"
  else
    warn_test "Page '$page' returned HTTP $STATUS"
  fi
done

echo ""

# ==========================================
# Results Summary
# ==========================================
echo "=========================================="
echo "  Test Results Summary"
echo "=========================================="
echo ""
echo "Passed: $PASS tests"
echo "Failed: $FAIL tests"
echo "Finished: $(date)"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo "Production deployment is healthy!"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Troubleshooting steps:"
  echo "1. Check service status: systemctl status equiprofile"
  echo "2. View recent logs: journalctl -u equiprofile -n 50"
  echo "3. Check nginx status: systemctl status nginx"
  echo "4. Test nginx config: nginx -t"
  echo "5. Check port binding: lsof -i :3000"
  exit 1
fi
