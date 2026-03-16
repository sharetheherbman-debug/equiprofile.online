#!/bin/bash
# ==========================================
# EquiProfile Production Deploy Script
# ==========================================
# One-command production deployment:
#   git reset → npm ci → build → DB migrate → restart → health verify
#
# Usage:
#   bash scripts/deploy_prod.sh
#
# Optional env overrides:
#   APP_DIR      – project root (default: script's parent directory)
#   SERVICE_NAME – systemd service name (default: equiprofile)
#   BASE_URL     – public base URL (default: https://equiprofile.online)
#   SKIP_GIT     – set to "1" to skip git pull/reset (e.g. for local dev)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-equiprofile}"
BASE_URL="${BASE_URL:-https://equiprofile.online}"
HEALTH_LOCAL="http://127.0.0.1:3000/api/health"

cd "$APP_DIR"

echo "=========================================="
echo " EquiProfile Production Deployment"
echo "=========================================="
echo " App dir : $APP_DIR"
echo " Service : $SERVICE_NAME"
echo " Public  : $BASE_URL"
echo "=========================================="
echo ""

# ── Failure handler ────────────────────────────────────────────────────────
on_error() {
  local code=$?
  echo ""
  echo "❌ Deployment FAILED (exit $code)"
  echo "--- Last 60 lines of $SERVICE_NAME logs ---"
  journalctl -u "$SERVICE_NAME" -n 60 --no-pager 2>/dev/null || true
  exit "$code"
}
trap on_error ERR

# ── Step 1: Update source ──────────────────────────────────────────────────
if [ "${SKIP_GIT:-0}" != "1" ]; then
  echo "Step 1/6: Updating source code..."
  git fetch --all --prune
  git reset --hard origin/main
  git clean -fd
  echo "   ✓ Source updated to $(git rev-parse --short HEAD)"
else
  echo "Step 1/6: Skipping git (SKIP_GIT=1)"
fi
echo ""

# ── Step 2: Install dependencies ──────────────────────────────────────────
echo "Step 2/6: Installing dependencies (npm ci)..."
npm ci
echo "   ✓ Dependencies installed"
echo ""

# ── Step 3: Build ──────────────────────────────────────────────────────────
echo "Step 3/6: Building application..."
NODE_ENV=production npm run build
echo "   ✓ Build complete"
echo ""

# ── Step 4: DB migrations (idempotent) ────────────────────────────────────
echo "Step 4/6: Running DB migrations..."
bash "$SCRIPT_DIR/migrate.sh"
echo "   ✓ Migrations complete"
echo ""

# ── Step 5: Restart service ───────────────────────────────────────────────
echo "Step 5/6: Restarting $SERVICE_NAME service..."
if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
  sudo systemctl restart "$SERVICE_NAME"
  sleep 5
  echo "   ✓ Service restarted"
elif command -v pm2 &>/dev/null && pm2 list | grep -q "$SERVICE_NAME"; then
  pm2 restart "$SERVICE_NAME"
  sleep 3
  echo "   ✓ PM2 process restarted"
else
  echo "   ⚠️  $SERVICE_NAME not managed by systemd/pm2 on this host."
  echo "   Start manually: NODE_ENV=production node dist/index.js"
fi
echo ""

# ── Step 6: Health checks ─────────────────────────────────────────────────
echo "Step 6/6: Verifying health..."

http_get() {
  curl -fsS -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null || echo "000"
}

# Wait up to 20 s for the process to bind
for i in 1 2 3 4; do
  code="$(http_get "$HEALTH_LOCAL")"
  [ "$code" = "200" ] && break
  echo "   … waiting for server (attempt $i/4, HTTP $code)"
  sleep 5
done

check() {
  local url="$1" label="$2"
  local code; code="$(http_get "$url")"
  if [ "$code" = "200" ]; then
    echo "   ✅ $label → HTTP $code"
  else
    echo "   ❌ $label → HTTP $code (expected 200)"
    return 1
  fi
}

check "$HEALTH_LOCAL"           "Local  ($HEALTH_LOCAL)"
check "$BASE_URL/api/health"    "Public ($BASE_URL/api/health)" || \
  echo "   ⚠️  Public check failed – DNS/TLS may not point to this server yet."

echo ""
echo "=========================================="
echo " ✅ Deployment complete!"
echo " Run   bash scripts/audit_prod.sh   to verify all features."
echo "=========================================="
