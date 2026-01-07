#!/bin/bash
# ==========================================
# EquiProfile System Health Check Script
# ==========================================
# This script runs comprehensive checks on the system
# and reports PASS/FAIL for each component.
#
# Usage: ./doctor.sh

set -e

PASS_COUNT=0
FAIL_COUNT=0

echo "==========================================="
echo "  EquiProfile System Doctor"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((PASS_COUNT++))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((FAIL_COUNT++))
}

warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

info() {
  echo -e "ℹ️  INFO: $1"
}

# Check 1: Port 3000 availability or service running
echo "Checking port 3000..."
if lsof -i :3000 >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":3000 "; then
  pass "Port 3000 is in use (service likely running)"
elif systemctl is-active --quiet equiprofile 2>/dev/null; then
  pass "Port 3000 available and equiprofile service is running"
else
  warn "Port 3000 is available but service may not be running"
fi
echo ""

# Check 2: Nginx configuration syntax
echo "Checking Nginx configuration..."
if command -v nginx >/dev/null 2>&1; then
  if sudo nginx -t >/dev/null 2>&1; then
    pass "Nginx configuration is valid"
  else
    fail "Nginx configuration has errors"
    sudo nginx -t 2>&1 | tail -5
  fi
else
  warn "Nginx not installed"
fi
echo ""

# Check 3: Systemd service status
echo "Checking systemd service..."
if systemctl list-unit-files | grep -q equiprofile.service; then
  if systemctl is-active --quiet equiprofile; then
    pass "equiprofile.service is active and running"
    info "Service started: $(systemctl show -p ActiveEnterTimestamp equiprofile | cut -d= -f2)"
  else
    fail "equiprofile.service exists but is not active"
    info "Status: $(systemctl is-active equiprofile)"
  fi
else
  warn "equiprofile.service not installed"
fi
echo ""

# Check 4: Environment validation
echo "Checking environment variables..."
if [ -f "/var/equiprofile/app/.env" ]; then
  pass ".env file exists at /var/equiprofile/app/.env"
  
  # Safely parse .env file without executing it
  required_vars=("DATABASE_URL" "JWT_SECRET" "ADMIN_UNLOCK_PASSWORD")
  missing_vars=()
  
  for var in "${required_vars[@]}"; do
    # Use grep to check if variable is defined in .env file
    if ! grep -q "^${var}=" /var/equiprofile/app/.env 2>/dev/null; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -eq 0 ]; then
    pass "All required environment variables are set"
  else
    fail "Missing required variables: ${missing_vars[*]}"
  fi
elif [ -f ".env" ]; then
  warn ".env file found in current directory (should be in /var/equiprofile/app/)"
else
  fail ".env file not found"
fi
echo ""

# Check 5: Health endpoint
echo "Checking application health endpoint..."
if command -v curl >/dev/null 2>&1; then
  if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    pass "Health endpoint responds successfully"
    health_response=$(curl -s http://localhost:3000/api/health)
    info "Response: $health_response"
  else
    fail "Health endpoint not responding"
    info "Attempted: http://localhost:3000/api/health"
  fi
else
  warn "curl not installed, skipping health check"
fi
echo ""

# Check 6: Static assets
echo "Checking static assets..."
if [ -d "/var/equiprofile/app/dist/public" ]; then
  if [ -f "/var/equiprofile/app/dist/public/index.html" ]; then
    pass "Static assets exist in dist/public/"
    asset_count=$(find /var/equiprofile/app/dist/public -type f | wc -l)
    info "Found $asset_count files"
  else
    fail "dist/public/ exists but index.html missing"
  fi
else
  fail "dist/public/ directory not found"
fi
echo ""

# Check 7: Database connectivity
echo "Checking database connectivity..."
if [ -f "/var/equiprofile/app/dist/index.js" ]; then
  if [ -n "$DATABASE_URL" ]; then
    # Extract database host and port from DATABASE_URL
    db_host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    db_port=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -n "$db_host" ] && [ -n "$db_port" ]; then
      if nc -z "$db_host" "$db_port" 2>/dev/null || timeout 2 bash -c "cat < /dev/null > /dev/tcp/$db_host/$db_port" 2>/dev/null; then
        pass "Database server is reachable at $db_host:$db_port"
      else
        fail "Cannot connect to database server at $db_host:$db_port"
      fi
    else
      warn "Could not parse database host/port from DATABASE_URL"
    fi
  else
    warn "DATABASE_URL not set, skipping database check"
  fi
else
  warn "Application not built, skipping database check"
fi
echo ""

# Check 8: Trust proxy configuration
echo "Checking trust proxy configuration..."
if [ -f "/var/equiprofile/app/dist/index.js" ]; then
  if grep -q "trust proxy" /var/equiprofile/app/dist/index.js; then
    pass "Trust proxy configuration found in built application"
  else
    warn "Trust proxy configuration not found (may cause rate limiting issues behind nginx)"
  fi
else
  warn "Application not built, skipping trust proxy check"
fi
echo ""

# Check 9: Node.js and npm
echo "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
  node_version=$(node --version)
  pass "Node.js installed: $node_version"
else
  fail "Node.js not installed"
fi
echo ""

# Check 10: Disk space
echo "Checking disk space..."
disk_usage=$(df -h /var/equiprofile 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')
if [ -n "$disk_usage" ]; then
  if [ "$disk_usage" -lt 90 ]; then
    pass "Disk space OK (${disk_usage}% used)"
  else
    warn "Disk space running low (${disk_usage}% used)"
  fi
else
  warn "Could not check disk space for /var/equiprofile"
fi
echo ""

# Summary
echo "==========================================="
echo "  Summary"
echo "==========================================="
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 All critical checks passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed. Please review the errors above.${NC}"
  exit 1
fi
