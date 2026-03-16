#!/bin/bash
# ============================================================
# ops/deploy.sh  –  EquiProfile One-Command Production Deploy
# ============================================================
# Idempotent: safe to run on a fresh machine OR an existing one.
#
# What it does (in order):
#   1. git fetch + reset to origin/main
#   2. npm ci  (deterministic, no --force, no --legacy-peer-deps)
#   3. npm run build
#   4. DB migrate (idempotent baseline – never drops tables)
#   5. systemd restart
#   6. Health verification (local + public)
#
# Usage:
#   bash ops/deploy.sh
#   APP_DIR=/var/equiprofile/app SERVICE_NAME=equiprofile bash ops/deploy.sh
#   BRANCH=main bash ops/deploy.sh
#
# Exit codes:
#   0  – all steps succeeded
#   1  – a step failed; last 120 lines of service log printed

set -euo pipefail

# ── Configuration ──────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-equiprofile}"
BRANCH="${BRANCH:-main}"
HEALTH_LOCAL="http://127.0.0.1:3000/api/health"
HEALTH_PUBLIC="https://equiprofile.online/api/health"
DEPLOY_LOG="/var/log/equiprofile-deploy.log"
# ───────────────────────────────────────────────────────────

cd "$APP_DIR"

# Tee output to log file if directory is writable
if [ -d "$(dirname "$DEPLOY_LOG")" ] && [ -w "$(dirname "$DEPLOY_LOG")" ]; then
  exec > >(tee -a "$DEPLOY_LOG") 2>&1
fi

echo "============================================================"
echo " EquiProfile Production Deploy  –  $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"
echo " App dir:  $APP_DIR"
echo " Service:  $SERVICE_NAME"
echo " Branch:   $BRANCH"
echo " Log:      $DEPLOY_LOG"
echo ""

# ── Error handler ──────────────────────────────────────────
on_error() {
  local code=$?
  echo ""
  echo "❌  Deploy FAILED at step (exit $code)"
  echo ""
  echo "─── Last 120 lines of $SERVICE_NAME journal ───"
  journalctl -u "$SERVICE_NAME" -n 120 --no-pager 2>/dev/null || \
    echo "(journalctl unavailable – check $DEPLOY_LOG)"
  echo ""
  echo "─── nginx -t ──────────────────────────────────"
  nginx -t 2>&1 || true
  echo ""
  echo "Deploy log: $DEPLOY_LOG"
  exit "$code"
}
trap on_error ERR

# ── Step 1: Git update ─────────────────────────────────────
echo "Step 1/6: Updating source code (origin/$BRANCH)…"
git fetch --tags origin
git reset --hard "origin/$BRANCH"
echo "   ✓ $(git rev-parse --short HEAD) – $(git log -1 --format='%s')"
echo ""

# ── Step 2: Install deps ───────────────────────────────────
echo "Step 2/6: npm ci…"
npm ci
echo "   ✓ Dependencies installed"
echo ""

# ── Step 3: Build ──────────────────────────────────────────
echo "Step 3/6: Building application…"
NODE_ENV=production npm run build
[ -f "dist/index.js" ] || { echo "❌  dist/index.js missing after build"; exit 1; }
[ -f "dist/public/index.html" ] || { echo "❌  dist/public/index.html missing after build"; exit 1; }
echo "   ✓ dist/index.js and dist/public/index.html present"
echo ""

# ── Step 4: DB migrate ─────────────────────────────────────
echo "Step 4/6: Running DB migrations…"
bash "$SCRIPT_DIR/../scripts/migrate.sh"
echo "   ✓ Migrations complete"
echo ""

# ── Step 5: Restart service ────────────────────────────────
echo "Step 5/6: Restarting $SERVICE_NAME…"
if systemctl cat "$SERVICE_NAME" >/dev/null 2>&1; then
  sudo systemctl restart "$SERVICE_NAME"
  sleep 4
  systemctl is-active --quiet "$SERVICE_NAME" && \
    echo "   ✓ Service is running" || \
    { echo "❌  Service failed to start"; exit 1; }
else
  echo "   ⚠️  $SERVICE_NAME not found in systemd."
  echo "   Install: sudo cp deployment/equiprofile.service /etc/systemd/system/"
  echo "            sudo systemctl daemon-reload && sudo systemctl enable equiprofile"
fi
echo ""

# ── Step 6: Health checks ──────────────────────────────────
echo "Step 6/6: Health checks…"

_check() {
  local url="$1" label="$2" fatal="${3:-true}"
  local code
  code=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "   ✅ $label → HTTP $code"
  else
    echo "   ❌ $label → HTTP $code  (expected 200)"
    [ "$fatal" = "true" ] && exit 1
  fi
}

# Wait up to 20 s for service to be ready
for i in 1 2 3 4; do
  sleep 5
  curl -o /dev/null -s --max-time 3 "$HEALTH_LOCAL" 2>/dev/null && break || true
done

_check "$HEALTH_LOCAL"  "Local  $HEALTH_LOCAL"
_check "$HEALTH_PUBLIC" "Public $HEALTH_PUBLIC" "false" || \
  echo "   ⚠️  Public endpoint unreachable – DNS/TLS may not be configured yet."

echo ""
echo "============================================================"
echo " ✅  Deploy complete  –  $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"
