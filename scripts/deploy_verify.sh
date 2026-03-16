#!/bin/bash
# ==========================================
# EquiProfile Deployment Verification Script
# ==========================================
# Verifies that a fresh deployment is healthy before going live.
#
# Usage:
#   bash scripts/deploy_verify.sh [--base-url https://equiprofile.online]
#
# Optional env overrides:
#   BASE_URL  – public base URL to verify (default: http://localhost:3000)
#
# Exit codes:
#   0 – all critical checks passed
#   1 – one or more critical checks failed

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Parse --base-url argument
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url) BASE_URL="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# ── Counters ──────────────────────────────────────────────────────────────
PASS=0
FAIL=0
BLOCKERS=()

# ── Colours ───────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

pass()   { echo -e "${GREEN}✅ PASS${NC}  $1"; PASS=$((PASS+1)); }
fail()   { echo -e "${RED}❌ FAIL${NC}  $1"; FAIL=$((FAIL+1)); BLOCKERS+=("$1"); }
warn()   { echo -e "${YELLOW}⚠️  WARN${NC}  $1"; }
header() { echo ""; echo -e "${CYAN}── $1 ──────────────────────────────────────────${NC}"; }

http_status() { curl -fsS -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null || echo "000"; }
http_body()   { curl -fsS --max-time 10 "$1" 2>/dev/null || echo ""; }
http_post()   {
  local url="$1" data="$2"
  curl -fsS --max-time 10 -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$data" 2>/dev/null || echo ""
}

# ── Header ────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  EquiProfile Deployment Verification      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo "   Target : $BASE_URL"
echo "   Time   : $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

# ── 1. Server Startup ─────────────────────────────────────────────────────
header "1. Server Health"

status=$(http_status "$BASE_URL/api/health")
if [ "$status" = "200" ]; then
  pass "API health endpoint returns 200"
else
  fail "API health endpoint returned $status (expected 200)"
fi

body=$(http_body "$BASE_URL/api/health")
if echo "$body" | grep -q '"status"'; then
  pass "Health response contains 'status' field"
else
  fail "Health response missing 'status' field: ${body:0:100}"
fi

# ── 2. Homepage Renders ───────────────────────────────────────────────────
header "2. Homepage"

status=$(http_status "$BASE_URL/")
if [ "$status" = "200" ]; then
  pass "Homepage returns 200"
else
  fail "Homepage returned $status"
fi

body=$(http_body "$BASE_URL/")
if echo "$body" | grep -qi "EquiProfile\|root\|<html"; then
  pass "Homepage contains expected content"
else
  fail "Homepage response looks empty or wrong"
fi

# ── 3. Login Page Loads ───────────────────────────────────────────────────
header "3. Login Page"

status=$(http_status "$BASE_URL/login")
if [ "$status" = "200" ]; then
  pass "Login page returns 200"
else
  fail "Login page returned $status"
fi

# ── 4. Register Page Loads ────────────────────────────────────────────────
header "4. Register Page"

status=$(http_status "$BASE_URL/register")
if [ "$status" = "200" ]; then
  pass "Register page returns 200"
else
  fail "Register page returned $status"
fi

# ── 5. Dashboard Route ────────────────────────────────────────────────────
header "5. Dashboard Route"

status=$(http_status "$BASE_URL/dashboard")
if [ "$status" = "200" ]; then
  pass "Dashboard route returns 200 (SPA serves HTML)"
else
  fail "Dashboard route returned $status"
fi

# ── 6. Auth API ───────────────────────────────────────────────────────────
header "6. Authentication API"

# Bad credentials → must return JSON 401 (not HTML)
resp=$(http_post "$BASE_URL/api/auth/login" \
  '{"email":"verify-test-nosuchuser@equiprofile.invalid","password":"wrongpassword12"}')
if echo "$resp" | grep -q '"error"' && ! echo "$resp" | grep -qi "<!DOCTYPE"; then
  pass "Login with bad creds returns JSON error"
else
  fail "Login with bad creds returned unexpected response: ${resp:0:100}"
fi

# Missing body → 400 JSON
resp=$(http_post "$BASE_URL/api/auth/login" '{}')
if echo "$resp" | grep -q '"error"' && ! echo "$resp" | grep -qi "<!DOCTYPE"; then
  pass "Login with empty body returns JSON 400"
else
  fail "Login with empty body returned unexpected response: ${resp:0:100}"
fi

# ── 7. Navigation Routes ──────────────────────────────────────────────────
header "7. Navigation Routes (SPA)"

for route in /features /pricing /about /contact /terms /privacy; do
  status=$(http_status "$BASE_URL$route")
  if [ "$status" = "200" ]; then
    pass "GET $route returns 200"
  else
    fail "GET $route returned $status"
  fi
done

# ── 8. Static Assets ──────────────────────────────────────────────────────
header "8. Static Assets"

hero_status=$(http_status "$BASE_URL/assets/marketing/hero/LANDINGPAGEV2.mp4")
if [ "$hero_status" = "200" ] || [ "$hero_status" = "206" ]; then
  pass "Hero video LANDINGPAGEV2.mp4 accessible"
else
  warn "Hero video LANDINGPAGEV2.mp4 returned $hero_status (may be normal if using CDN)"
fi

auth_video_status=$(http_status "$BASE_URL/videos/LoginFinal2.mp4")
if [ "$auth_video_status" = "200" ] || [ "$auth_video_status" = "206" ]; then
  pass "Auth video LoginFinal2.mp4 accessible"
else
  warn "Auth video LoginFinal2.mp4 returned $auth_video_status (may be normal if using CDN)"
fi

# ── 9. API Safety Net ─────────────────────────────────────────────────────
header "9. API Safety Net"

resp=$(http_body "$BASE_URL/api/this-endpoint-does-not-exist-deploy-verify")
if echo "$resp" | grep -q '"error"' && ! echo "$resp" | grep -qi "<!DOCTYPE"; then
  pass "Unknown /api/* path returns JSON error (not HTML)"
else
  fail "Unknown /api/* path returned HTML or unexpected body: ${resp:0:100}"
fi

# ── 10. Build Fingerprint ─────────────────────────────────────────────────
header "10. Build Fingerprint"

build_body=$(http_body "$BASE_URL/build")
if echo "$build_body" | grep -q '"version"'; then
  pass "Build fingerprint endpoint returns version"
  sha=$(echo "$build_body" | grep -o '"sha":"[^"]*"' | head -1)
  [ -n "$sha" ] && echo "       $sha"
else
  warn "Build fingerprint not available: ${build_body:0:80}"
fi

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo "  Passed  : $PASS"
echo "  Failed  : $FAIL"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅  All deployment verification checks passed!${NC}"
  echo "   The server is ready to serve beta testers."
  exit 0
else
  echo -e "${RED}❌  $FAIL check(s) failed — deployment may have issues.${NC}"
  echo ""
  echo "Blockers:"
  for b in "${BLOCKERS[@]}"; do
    echo "  • $b"
  done
  exit 1
fi
