#!/bin/bash
# EquiProfile Production Verification Script
# Proves the system is stable and production-ready
# Usage: bash scripts/verify_production.sh [BASE_URL]
set -uo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0
WARN=0

echo "============================================"
echo "  EquiProfile Production Verification"
echo "  $(date)"
echo "============================================"
echo ""

pass() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
info() { echo "  ℹ️  $1"; }

# Git + Build identity
echo "=== Identity ==="
if command -v git &>/dev/null && [ -d .git ]; then
  info "Git SHA: $(git rev-parse HEAD 2>/dev/null | cut -c1-8)"
fi
if [ -f dist/public/build.txt ]; then
  info "Build: $(cat dist/public/build.txt | tr '\n' ' ')"
fi
echo ""

# Health endpoints
echo "=== Health Endpoints ==="
for path in /healthz "/api/health"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE_URL}${path}" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    pass "GET ${path} → 200"
  else
    fail "GET ${path} → ${status}"
  fi
done
echo ""

# Key routes
echo "=== Key Routes (200 expected) ==="
for path in / /login /register /about /features /pricing /contact; do
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE_URL}${path}" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    pass "GET ${path} → 200"
  else
    fail "GET ${path} → ${status}"
  fi
done
echo ""

# Header checks
echo "=== Security Headers ==="
headers=$(curl -sI --max-time 10 "${BASE_URL}/" 2>/dev/null)
for header in "x-frame-options" "x-content-type-options" "referrer-policy"; do
  if echo "$headers" | grep -qi "^${header}:"; then
    val=$(echo "$headers" | grep -i "^${header}:" | head -1 | tr -d '\r')
    pass "Header present: ${val}"
  else
    warn "Header missing: ${header}"
  fi
done
# CSP check
if echo "$headers" | grep -qi "^content-security-policy:"; then
  pass "Content-Security-Policy header present"
else
  warn "Content-Security-Policy header missing"
fi
echo ""

# Cache headers
echo "=== Cache Headers ==="
html_cc=$(curl -sI --max-time 10 "${BASE_URL}/" 2>/dev/null | grep -i "^cache-control:" | head -1 | tr -d '\r')
if echo "$html_cc" | grep -qi "no-store"; then
  pass "/ Cache-Control: no-store ✓"
else
  warn "/ Cache-Control missing no-store: ${html_cc}"
fi

# Find a hashed asset and check immutable
asset_path=$(curl -s --max-time 10 "${BASE_URL}/" 2>/dev/null | grep -o 'src="/assets/[^"]*\.js"' | head -1 | sed 's/src="\(.*\)"/\1/')
if [ -n "$asset_path" ]; then
  asset_cc=$(curl -sI --max-time 10 "${BASE_URL}${asset_path}" 2>/dev/null | grep -i "^cache-control:" | head -1 | tr -d '\r')
  if echo "$asset_cc" | grep -qi "immutable"; then
    pass "Asset Cache-Control: immutable ✓"
  else
    warn "Asset missing immutable: ${asset_cc}"
  fi
fi

sw_cc=$(curl -sI --max-time 10 "${BASE_URL}/service-worker.js" 2>/dev/null | grep -i "^cache-control:" | head -1 | tr -d '\r')
if echo "$sw_cc" | grep -qi "no-store\|no-cache"; then
  pass "service-worker.js Cache-Control: no-cache ✓"
elif curl -s --max-time 5 "${BASE_URL}/service-worker.js" 2>/dev/null | grep -q "CACHE_VERSION"; then
  warn "service-worker.js served without no-cache: ${sw_cc}"
fi
echo ""

# API safety
echo "=== API Safety ==="
resp=$(curl -s --max-time 10 "${BASE_URL}/api/does-not-exist" 2>/dev/null)
if echo "$resp" | grep -q '"error"' && ! echo "$resp" | grep -qi "<!DOCTYPE\|<html"; then
  pass "Unknown /api path → JSON 404 (no HTML leak)"
else
  fail "Unknown /api path returns HTML or unexpected response"
fi
echo ""

# Summary
echo "============================================"
echo "  PASSED: $PASS  |  FAILED: $FAIL  |  WARN: $WARN"
echo "============================================"
if [ $FAIL -eq 0 ]; then
  echo ""
  echo "  ✅ System verification PASSED"
  echo "  The platform appears production-ready."
  exit 0
else
  echo ""
  echo "  ❌ System verification FAILED ($FAIL checks failed)"
  exit 1
fi
