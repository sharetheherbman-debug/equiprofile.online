#!/bin/bash
# EquiProfile Smoke Tests
# Run after deployment to verify basic functionality
#
# Usage:
#   BASE_URL=https://equiprofile.online bash scripts/smoke-test.sh
#
# Exit codes:
#   0 – all tests passed
#   1 – one or more tests failed

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

echo "🧪 EquiProfile Smoke Tests — $BASE_URL"
echo "────────────────────────────────────────"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

# test_status NAME URL EXPECTED_HTTP_STATUS
test_status() {
  local name="$1" url="$2" expected="${3:-200}"
  echo -n "  $name ... "
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expected" ]; then
    echo "✅ $status"
    PASS=$((PASS + 1))
  else
    echo "❌ got $status (expected $expected)"
    FAIL=$((FAIL + 1))
  fi
}

# test_json_key NAME URL JSON_KEY
test_json_key() {
  local name="$1" url="$2" key="$3"
  echo -n "  $name ... "
  local body
  body=$(curl -sS --max-time 10 "$url" 2>/dev/null)
  if echo "$body" | grep -q "\"$key\""; then
    echo "✅ key '$key' present"
    PASS=$((PASS + 1))
  else
    echo "❌ key '$key' missing in: ${body:0:120}"
    FAIL=$((FAIL + 1))
  fi
}

# test_post_json NAME URL BODY EXPECTED_HTTP_STATUS EXPECTED_KEY
# Verifies that the response is JSON (not HTML) and contains the expected key.
test_post_json() {
  local name="$1" url="$2" body="$3" expected_status="${4:-200}" expected_key="${5:-}"
  echo -n "  $name ... "
  local resp http_code content_type
  resp=$(curl -sS -D /tmp/smoke_headers.txt --max-time 10 \
    -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$body" \
    2>/dev/null)
  http_code=$(grep -i "^HTTP/" /tmp/smoke_headers.txt | tail -1 | awk '{print $2}')
  content_type=$(grep -i "^content-type:" /tmp/smoke_headers.txt | tail -1)

  local ok=true
  local notes=""

  # Check HTTP status
  if [ "$http_code" != "$expected_status" ]; then
    ok=false
    notes="$notes  HTTP $http_code (expected $expected_status)"
  fi

  # Ensure response is JSON, not HTML
  if echo "$resp" | grep -qi "<!DOCTYPE html\|<html"; then
    ok=false
    notes="$notes  RESPONSE IS HTML (not JSON!)"
  fi

  # Check expected JSON key if given
  if [ -n "$expected_key" ] && ! echo "$resp" | grep -q "\"$expected_key\""; then
    ok=false
    notes="$notes  key '$expected_key' missing"
  fi

  if [ "$ok" = "true" ]; then
    echo "✅ $http_code JSON"
    PASS=$((PASS + 1))
  else
    echo "❌ $notes"
    echo "     body: ${resp:0:200}"
    FAIL=$((FAIL + 1))
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# 1. Core Health
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Core Health ==="
test_status      "GET /healthz"              "$BASE_URL/healthz"
test_json_key    "GET /api/health (status)"  "$BASE_URL/api/health"   "status"
test_json_key    "GET /build (version)"      "$BASE_URL/build"        "version"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 2. Public Marketing Pages (must return HTML 200)
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Public Pages (must return HTML 200) ==="
test_status "GET /"         "$BASE_URL/"
test_status "GET /login"    "$BASE_URL/login"
test_status "GET /register" "$BASE_URL/register"
test_status "GET /about"    "$BASE_URL/about"
test_status "GET /features" "$BASE_URL/features"
test_status "GET /pricing"  "$BASE_URL/pricing"
test_status "GET /contact"  "$BASE_URL/contact"
test_status "GET /terms"    "$BASE_URL/terms"
test_status "GET /privacy"  "$BASE_URL/privacy"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 3. Auth API — must always return JSON, never HTML
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Auth API (must return JSON, never HTML) ==="

# Bad credentials → 401 JSON { "error": "..." }
test_post_json \
  "POST /api/auth/login  bad-creds → 401 JSON" \
  "$BASE_URL/api/auth/login" \
  '{"email":"smoke-test-no-such-user@example.com","password":"wrongpassword"}' \
  401 \
  "error"

# Missing fields → 400 JSON
test_post_json \
  "POST /api/auth/login  no body → 400 JSON" \
  "$BASE_URL/api/auth/login" \
  '{}' \
  400 \
  "error"

# Register with a unique throw-away email (generates a real user; safe to re-run
# because duplicate email returns 400 which is also non-HTML JSON)
SMOKE_EMAIL="smoke-$(date +%s)@equiprofile-test.invalid"
test_post_json \
  "POST /api/auth/signup  new user → 200 JSON" \
  "$BASE_URL/api/auth/signup" \
  "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"SmokeTe5tP@ssword!\",\"name\":\"Smoke Test\"}" \
  200 \
  "success"

# Login with the just-created user → 200 JSON { "success": true }
test_post_json \
  "POST /api/auth/login  valid creds → 200 JSON" \
  "$BASE_URL/api/auth/login" \
  "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"SmokeTe5tP@ssword!\"}" \
  200 \
  "success"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 4. Contact Form
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Contact Form ==="
test_post_json \
  "POST /api/contact  valid payload → 200 JSON" \
  "$BASE_URL/api/contact" \
  '{"name":"Smoke Test","email":"smoke@equiprofile-test.invalid","subject":"Smoke test","message":"Automated smoke test message. Please ignore."}' \
  200 \
  "success"

test_post_json \
  "POST /api/contact  missing fields → 400 JSON" \
  "$BASE_URL/api/contact" \
  '{"name":"Smoke Test"}' \
  400 \
  "error"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 5. Sales Chat
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Sales Chat ==="
test_post_json \
  "POST /api/sales-chat  valid message → 200 JSON" \
  "$BASE_URL/api/sales-chat" \
  '{"message":"Hello, what plans do you offer?","history":[]}' \
  200 \
  "reply"

test_post_json \
  "POST /api/sales-chat  missing message → 400 JSON" \
  "$BASE_URL/api/sales-chat" \
  '{}' \
  400 \
  "error"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 6. Asset Loading (quick sanity check)
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Asset Loading ==="
echo -n "  JS bundle referenced in / ... "
if curl -sS --max-time 10 "$BASE_URL/" 2>/dev/null | grep -q 'src="/assets/.*\.js"'; then
  echo "✅ found"
  PASS=$((PASS + 1))
else
  echo "❌ not found (may be normal in dev mode)"
  FAIL=$((FAIL + 1))
fi
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 7. Unhandled /api path must return JSON 404, never HTML
# ──────────────────────────────────────────────────────────────────────────────
echo "=== API Safety Net ==="
echo -n "  GET /api/nonexistent-endpoint → JSON 404 ... "
resp=$(curl -sS --max-time 10 "$BASE_URL/api/nonexistent-endpoint" 2>/dev/null)
if echo "$resp" | grep -q '"error"' && ! echo "$resp" | grep -qi "<!DOCTYPE html"; then
  echo "✅ JSON 404"
  PASS=$((PASS + 1))
else
  echo "❌ got HTML or unexpected response: ${resp:0:120}"
  FAIL=$((FAIL + 1))
fi
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# 8. Service Status (optional)
# ──────────────────────────────────────────────────────────────────────────────
echo "=== Service Status ==="
echo -n "  systemd equiprofile service ... "
if command -v systemctl &>/dev/null && systemctl is-active --quiet equiprofile 2>/dev/null; then
  echo "✅ active"
  PASS=$((PASS + 1))
else
  echo "ℹ️  SKIP (not systemd-managed or not active — OK for dev/CI)"
fi
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════"
echo "  Passed : $PASS"
echo "  Failed : $FAIL"
echo "════════════════════════════════════════"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅  All smoke tests passed!"
  exit 0
else
  echo "❌  $FAIL test(s) failed — check the output above."
  exit 1
fi
