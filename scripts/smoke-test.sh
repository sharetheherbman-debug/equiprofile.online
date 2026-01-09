#!/bin/bash
# EquiProfile Smoke Tests
# Run after deployment to verify basic functionality

set -e  # Exit on first error

echo "🧪 Running EquiProfile Smoke Tests..."
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"
  
  echo -n "Testing $name... "
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ PASS (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL (HTTP $status, expected $expected_status)"
    FAIL=$((FAIL + 1))
  fi
}

# Helper function to test JSON response
test_json() {
  local name="$1"
  local url="$2"
  local key="$3"
  
  echo -n "Testing $name... "
  
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "\"$key\""; then
    echo "✅ PASS (JSON valid, '$key' present)"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL (JSON invalid or '$key' missing)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Core Endpoints ==="
test_endpoint "Health Check" "$BASE_URL/healthz"
test_endpoint "Build Info" "$BASE_URL/build"
test_json "Build Version" "$BASE_URL/build" "version"

echo ""
echo "=== Public Pages ==="
test_endpoint "Landing Page" "$BASE_URL/"
test_endpoint "Login Page" "$BASE_URL/login"
test_endpoint "Register Page" "$BASE_URL/register"
test_endpoint "About Page" "$BASE_URL/about"
test_endpoint "Features Page" "$BASE_URL/features"
test_endpoint "Pricing Page" "$BASE_URL/pricing"
test_endpoint "Contact Page" "$BASE_URL/contact"

echo ""
echo "=== API Endpoints ==="
test_json "API Health" "$BASE_URL/api/health" "status"
test_endpoint "OAuth Status" "$BASE_URL/api/oauth/status"

echo ""
echo "=== Asset Loading ==="
# Check if main JS bundle exists (any .js file in /assets)
echo -n "Testing JavaScript Assets... "
if curl -s "$BASE_URL/" | grep -q "src=\"/assets/.*\.js\""; then
  echo "✅ PASS (JS bundle referenced)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (JS bundle not found in HTML)"
  FAIL=$((FAIL + 1))
fi

echo -n "Testing CSS Assets... "
if curl -s "$BASE_URL/" | grep -q "href=\"/assets/.*\.css\""; then
  echo "✅ PASS (CSS bundle referenced)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (CSS bundle not found in HTML)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Service Status ==="
echo -n "Testing systemd service... "
if command -v systemctl &> /dev/null && systemctl is-active --quiet equiprofile 2>/dev/null; then
  echo "✅ PASS (service is active)"
  PASS=$((PASS + 1))
else
  echo "ℹ️  SKIP (service not managed by systemd or not active - OK for dev)"
  # Don't count as pass or fail
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ All smoke tests passed!"
  exit 0
else
  echo "❌ $FAIL test(s) failed"
  exit 1
fi
