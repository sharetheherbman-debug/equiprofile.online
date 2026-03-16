#!/usr/bin/env bash
# =============================================================================
# EquiProfile Go-Live Audit Script
# =============================================================================
# Usage:
#   BASE_URL=https://equiprofile.online bash scripts/go_live_audit.sh
#   BASE_URL=http://localhost:3000 bash scripts/go_live_audit.sh
#
# Exit codes:
#   0 – all checks passed (no blockers)
#   1 – one or more blockers found
# =============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

BLOCKERS=0
WARNINGS=0
RESULTS=()

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
pass()  { RESULTS+=("[PASS] $1"); }
fail()  { RESULTS+=("[FAIL] $1"); BLOCKERS=$((BLOCKERS + 1)); }
warn()  { RESULTS+=("[WARN] $1"); WARNINGS=$((WARNINGS + 1)); }

http_status() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null || echo "000"
}

http_body() {
  curl -s --max-time 10 "$1" 2>/dev/null || echo ""
}

http_body_post() {
  local url="$1"
  local data="$2"
  curl -s --max-time 10 -X POST -H "Content-Type: application/json" \
       -d "$data" -c /tmp/_audit_cookies.txt "$url" 2>/dev/null || echo ""
}

http_body_with_cookie() {
  curl -s --max-time 10 -b /tmp/_audit_cookies.txt "$1" 2>/dev/null || echo ""
}

print_header() {
  echo ""
  echo "===================================================="
  echo " EquiProfile Go-Live Audit"
  echo " Target: ${BASE_URL}"
  echo " Time:   ${TIMESTAMP}"
  echo "===================================================="
  echo ""
}

print_results() {
  echo ""
  for r in "${RESULTS[@]}"; do
    echo "$r"
  done
  echo ""
  echo "===================================================="
  printf " BLOCKERS: %d\n" "$BLOCKERS"
  printf " WARNINGS: %d\n" "$WARNINGS"
  if [ "$BLOCKERS" -eq 0 ]; then
    echo " Result:   PASS ✅"
  else
    echo " Result:   FAIL ❌"
  fi
  echo "===================================================="
  echo ""
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 1 – Server health
# ──────────────────────────────────────────────────────────────────────────────
check_server_health() {
  local status
  status="$(http_status "${BASE_URL}/api/health")"
  local body
  body="$(http_body "${BASE_URL}/api/health")"

  if [ "$status" != "200" ]; then
    fail "Server health check – expected 200 got ${status}"
    return
  fi

  # Must be JSON
  if ! echo "$body" | grep -q '"status"'; then
    fail "Server health – response is not JSON: ${body:0:120}"
    return
  fi

  pass "Server health check (${status} JSON)"

  # CHECK 2 – DB connectivity embedded in health response
  if echo "$body" | grep -q '"db":true'; then
    pass "DB connectivity (db: true)"
  elif echo "$body" | grep -q '"db"'; then
    fail "DB connectivity – health reports db not ready: ${body:0:200}"
  else
    warn "DB connectivity – 'db' field not present in health response"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 3 – Auth: valid login returns 200 + cookie
# ──────────────────────────────────────────────────────────────────────────────
check_auth_login_valid() {
  rm -f /tmp/_audit_cookies.txt

  # Use a known test user if TEST_EMAIL / TEST_PASSWORD are set, otherwise skip
  local email="${TEST_EMAIL:-}"
  local pass_val="${TEST_PASSWORD:-}"

  if [ -z "$email" ] || [ -z "$pass_val" ]; then
    warn "Auth login valid-creds check skipped (set TEST_EMAIL and TEST_PASSWORD to enable)"
    return
  fi

  local body
  body="$(http_body_post "${BASE_URL}/api/auth/login" \
         "{\"email\":\"${email}\",\"password\":\"${pass_val}\"}")"

  local http_code
  http_code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
               -X POST -H "Content-Type: application/json" \
               -d "{\"email\":\"${email}\",\"password\":\"${pass_val}\"}" \
               -c /tmp/_audit_cookies.txt \
               "${BASE_URL}/api/auth/login" 2>/dev/null || echo "000")"

  if [ "$http_code" = "200" ]; then
    pass "Auth login returns 200 for valid creds"
  else
    fail "Auth login – expected 200 got ${http_code}"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 4 – Auth: invalid login returns 401
# ──────────────────────────────────────────────────────────────────────────────
check_auth_login_invalid() {
  local http_code
  http_code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
               -X POST -H "Content-Type: application/json" \
               -d '{"email":"nobody@example.invalid","password":"wrongpassword123"}' \
               "${BASE_URL}/api/auth/login" 2>/dev/null || echo "000")"

  if [ "$http_code" = "401" ]; then
    pass "Auth login returns 401 for invalid creds"
  elif [ "$http_code" = "000" ]; then
    fail "Auth login invalid – could not connect to server"
  else
    warn "Auth login invalid creds – expected 401 got ${http_code} (may be expected if endpoint differs)"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 5 – /api/auth/me returns JSON (not HTML) with cookie
# ──────────────────────────────────────────────────────────────────────────────
check_auth_me() {
  # If we have a session cookie from previous step use it; else check unauthenticated
  local body
  body="$(http_body_with_cookie "${BASE_URL}/api/auth/me")"

  if echo "$body" | grep -qi "<html"; then
    fail "/api/auth/me returns HTML instead of JSON – API route falling through to SPA"
    return
  fi

  # Unauthenticated should be 401 JSON, not HTML
  local http_code
  http_code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
               -b /tmp/_audit_cookies.txt \
               "${BASE_URL}/api/auth/me" 2>/dev/null || echo "000")"

  if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
    pass "/api/auth/me returns JSON (${http_code}, not HTML)"
  else
    warn "/api/auth/me returned unexpected ${http_code}"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 6 – Pricing sanity (never £0; correct fallback defaults)
# ──────────────────────────────────────────────────────────────────────────────
check_pricing() {
  local body
  body="$(http_body "${BASE_URL}/api/trpc/billing.getPricing?batch=1&input=%7B%7D")"

  if [ -z "$body" ]; then
    # Try alternative tRPC path
    body="$(http_body "${BASE_URL}/api/trpc/billing.getPricing")"
  fi

  if echo "$body" | grep -q '"amount"'; then
    # Threshold of 1000 pence = £10 matches DEFAULT_PRICING.individual.monthly.amount in shared/pricing.ts
    local pro_monthly
    pro_monthly="$(echo "$body" | grep -o '"amount":[0-9]*' | head -1 | grep -o '[0-9]*$' || echo "0")"

    if [ "${pro_monthly:-0}" -ge 1000 ] 2>/dev/null; then
      local pounds_display
      pounds_display="$(awk "BEGIN {printf \"%.2f\", ${pro_monthly}/100}" 2>/dev/null || echo "${pro_monthly}p")"
      pass "Pricing – Pro monthly £${pounds_display} (≥ £10)"
    elif [ "${pro_monthly:-0}" -gt 0 ] 2>/dev/null; then
      fail "Pricing – Pro monthly amount ${pro_monthly} pence is less than expected £10 (1000p)"
    else
      fail "Pricing – could not parse pro monthly amount (response: ${body:0:200})"
    fi

    # Check for zero prices
    if echo "$body" | grep -q '"amount":0'; then
      fail "Pricing – one or more plan amounts are 0 (£0 displayed to users)"
    else
      pass "Pricing – no £0 amounts detected"
    fi
  else
    warn "Pricing – could not retrieve pricing data from tRPC (Stripe may be disabled; check server logs)"
  fi

  # Check Stripe config
  if [ "${ENABLE_STRIPE:-false}" = "true" ]; then
    local missing_ids=()
    [ -z "${STRIPE_MONTHLY_PRICE_ID:-}" ] && missing_ids+=("STRIPE_MONTHLY_PRICE_ID")
    [ -z "${STRIPE_YEARLY_PRICE_ID:-}" ] && missing_ids+=("STRIPE_YEARLY_PRICE_ID")
    [ -z "${STRIPE_STABLE_MONTHLY_PRICE_ID:-}" ] && missing_ids+=("STRIPE_STABLE_MONTHLY_PRICE_ID")
    [ -z "${STRIPE_STABLE_YEARLY_PRICE_ID:-}" ] && missing_ids+=("STRIPE_STABLE_YEARLY_PRICE_ID")

    if [ "${#missing_ids[@]}" -gt 0 ]; then
      fail "Stripe enabled but missing price IDs: ${missing_ids[*]}"
    else
      pass "Stripe price IDs all present"
    fi
  else
    warn "Stripe not configured (ENABLE_STRIPE != true) – default prices shown (not a blocker)"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 7 – Required env vars (no secrets printed)
# ──────────────────────────────────────────────────────────────────────────────
check_env_vars() {
  local missing=()

  # Core vars (check local .env if running locally)
  local core_vars=("DATABASE_URL" "JWT_SECRET" "BASE_URL")
  for v in "${core_vars[@]}"; do
    [ -z "${!v:-}" ] && missing+=("$v")
  done

  if [ "${ENABLE_STRIPE:-false}" = "true" ]; then
    local stripe_vars=("STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET"
                        "STRIPE_MONTHLY_PRICE_ID" "STRIPE_YEARLY_PRICE_ID"
                        "STRIPE_STABLE_MONTHLY_PRICE_ID" "STRIPE_STABLE_YEARLY_PRICE_ID")
    for v in "${stripe_vars[@]}"; do
      [ -z "${!v:-}" ] && missing+=("$v")
    done
  fi

  if [ "${ENABLE_UPLOADS:-false}" = "true" ]; then
    local upload_vars=("BUILT_IN_FORGE_API_URL" "BUILT_IN_FORGE_API_KEY")
    for v in "${upload_vars[@]}"; do
      [ -z "${!v:-}" ] && missing+=("$v")
    done
  fi

  if [ "${#missing[@]}" -eq 0 ]; then
    pass "Required env vars all present"
  else
    # Report names only – never print values
    fail "Missing env vars: ${missing[*]}"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 8 – Static assets reachable
# ──────────────────────────────────────────────────────────────────────────────
check_static_assets() {
  local assets=(
    "/assets/marketing/hero/hero.mp4"
    "/images/hero-horse.jpg"
    "/images/riding-lesson.jpg"
    "/images/gallery/1.jpg"
  )

  local any_fail=0
  for asset in "${assets[@]}"; do
    local code
    code="$(http_status "${BASE_URL}${asset}")"
    if [ "$code" = "200" ] || [ "$code" = "206" ]; then
      pass "Static asset: ${asset} (${code})"
    else
      fail "Static asset missing: ${asset} (got ${code})"
      any_fail=1
    fi
  done
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 9 – API routes return JSON, not HTML (nginx SPA fallback guard)
# ──────────────────────────────────────────────────────────────────────────────
check_api_not_html() {
  local body
  body="$(http_body "${BASE_URL}/api/health")"

  if echo "$body" | grep -qi "<html"; then
    fail "/api/health returns HTML – nginx/server SPA fallback is catching API routes"
  else
    pass "/api/ route returns JSON not HTML"
  fi

  # Also check a known 404 API path
  local body404
  body404="$(http_body "${BASE_URL}/api/nonexistent-endpoint-xyz")"
  if echo "$body404" | grep -qi "<html"; then
    fail "/api/nonexistent returns HTML – all API 404s fall through to SPA (incorrect)"
  else
    pass "/api/ 404 returns JSON/error not HTML"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# CHECK 10 – Nav routes return 200
# ──────────────────────────────────────────────────────────────────────────────
check_nav_routes() {
  local routes=("/" "/about" "/features" "/pricing" "/contact" "/login" "/register")
  for route in "${routes[@]}"; do
    local code
    code="$(http_status "${BASE_URL}${route}")"
    if [ "$code" = "200" ]; then
      pass "Nav route ${route} → ${code}"
    else
      fail "Nav route ${route} → ${code} (expected 200)"
    fi
  done
}

# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────
print_header

echo "Running checks against: ${BASE_URL}"
echo ""

check_server_health
check_auth_login_valid
check_auth_login_invalid
check_auth_me
check_pricing
check_env_vars
check_static_assets
check_api_not_html
check_nav_routes

print_results

# Machine-readable summary (JSON)
cat > /tmp/go_live_audit_result.json <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "target": "${BASE_URL}",
  "blockers": ${BLOCKERS},
  "warnings": ${WARNINGS},
  "passed": $([ "$BLOCKERS" -eq 0 ] && echo "true" || echo "false")
}
EOF

echo "Machine-readable result written to: /tmp/go_live_audit_result.json"
echo ""

exit "$BLOCKERS"
