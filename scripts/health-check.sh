#!/bin/bash
# ==========================================
# Production Health Check Script
# ==========================================
# Quick smoke test for production deployment
# Usage: bash scripts/health-check.sh [URL]
#
# Examples:
#   bash scripts/health-check.sh http://localhost:3000
#   bash scripts/health-check.sh https://equiprofile.online

# Use better error handling without immediate exit
set -uo pipefail

URL="${1:-http://localhost:3000}"
FAILED=0

echo "🏥 EquiProfile Health Check"
echo "   URL: $URL"
echo ""

# Function to test endpoint
test_endpoint() {
  local endpoint="$1"
  local expected_status="${2:-200}"
  local description="$3"
  
  echo -n "Testing $description... "
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL$endpoint" || echo "000")
  
  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo "✅ OK ($HTTP_CODE)"
    return 0
  else
    echo "❌ FAILED (got $HTTP_CODE, expected $expected_status)"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# Run health checks
test_endpoint "/healthz" "200" "Health endpoint"
test_endpoint "/api/health" "200" "API health endpoint"
test_endpoint "/build" "200" "Build info endpoint"
test_endpoint "/" "200" "Frontend (index.html)"
test_endpoint "/api/trpc/health.ping" "200" "tRPC health ping"

# Check Tasks/Contacts/Breeding pages (these require auth, so may redirect)
echo ""
echo "📋 Testing page endpoints (may require auth):"
# These endpoints may return 200 or redirect, so we don't fail on them
test_endpoint "/tasks" "200" "Tasks page" || echo "   (May require authentication)"
test_endpoint "/contacts" "200" "Contacts page" || echo "   (May require authentication)"
test_endpoint "/breeding" "200" "Breeding page" || echo "   (May require authentication)"

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✅ All health checks passed!"
  exit 0
else
  echo "❌ $FAILED health check(s) failed"
  exit 1
fi
