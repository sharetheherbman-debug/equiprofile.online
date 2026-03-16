#!/bin/bash
# ==========================================
# EquiProfile Production Deploy Script
# ==========================================
# Full production deployment:
#   git pull/reset → npm ci → npm run build → DB migrate →
#   systemd restart → health check
#
# Usage: bash scripts/deploy.sh [--app-dir /path/to/app] [--service equiprofile]
#
# Environment variables:
#   APP_DIR      – project root (default: script's parent directory)
#   SERVICE_NAME – systemd service name (default: equiprofile)

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-equiprofile}"
HEALTH_LOCAL="http://127.0.0.1:3000/api/health"
HEALTH_PUBLIC="https://equiprofile.online/api/health"

cd "$APP_DIR"

echo "=========================================="
echo " EquiProfile Production Deployment"
echo "=========================================="
echo " App dir:  $APP_DIR"
echo " Service:  $SERVICE_NAME"
echo "=========================================="
echo ""

# ---------------------------------------------------------------------------
# Failure handler – print last 120 lines of service log on exit failure
# ---------------------------------------------------------------------------
on_error() {
  local exit_code=$?
  echo ""
  echo "❌ Deployment FAILED (exit code $exit_code)"
  echo "--- Last 120 lines of $SERVICE_NAME logs ---"
  journalctl -u "$SERVICE_NAME" -n 120 --no-pager 2>/dev/null || true
  exit "$exit_code"
}
trap on_error ERR

# ---------------------------------------------------------------------------
# Step 1: Git pull / reset
# ---------------------------------------------------------------------------
echo "Step 1/6: Updating source code..."
git fetch origin
git reset --hard origin/main
echo "   ✓ Source updated"
echo ""

# ---------------------------------------------------------------------------
# Step 2: Install dependencies (deterministic)
# ---------------------------------------------------------------------------
echo "Step 2/6: Installing dependencies (npm ci)..."
npm ci
echo "   ✓ Dependencies installed"
echo ""

# ---------------------------------------------------------------------------
# Step 3: Build
# ---------------------------------------------------------------------------
echo "Step 3/6: Building application..."
NODE_ENV=production npm run build
echo "   ✓ Build complete"
echo ""

# ---------------------------------------------------------------------------
# Step 4: DB migrations (idempotent – never drops tables)
# ---------------------------------------------------------------------------
echo "Step 4/6: Running DB migrations..."
bash "$SCRIPT_DIR/migrate.sh"
echo "   ✓ Migrations complete"
echo ""

# ---------------------------------------------------------------------------
# Step 5: Restart systemd service
# ---------------------------------------------------------------------------
echo "Step 5/6: Restarting $SERVICE_NAME service..."
if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null || \
   systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
  sudo systemctl restart "$SERVICE_NAME"
  sleep 3
  echo "   ✓ Service restarted"
else
  echo "   ⚠️  $SERVICE_NAME is not managed by systemd on this machine."
  echo "   Start it manually: NODE_ENV=production node dist/index.js"
fi
echo ""

# ---------------------------------------------------------------------------
# Step 6: Health checks
# ---------------------------------------------------------------------------
echo "Step 6/6: Verifying health..."

check_health() {
  local url="$1"
  local label="$2"
  local http_code
  http_code=$(curl -fsS -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo "   ✅ $label → HTTP $http_code"
  else
    echo "   ❌ $label → HTTP $http_code (expected 200)"
    return 1
  fi
}

# Wait up to 15s for the service to be ready
for i in 1 2 3; do
  sleep 5
  curl -fsS -o /dev/null --max-time 5 "$HEALTH_LOCAL" 2>/dev/null && break || true
done

# Verify the process is actually listening on port 3000
echo "   Checking listener on port 3000..."
if ss -lntp 2>/dev/null | grep -q ":3000"; then
  echo "   ✅ Port 3000 listener confirmed (ss -lntp)"
else
  echo "   ❌ No listener found on port 3000!"
  echo "   --- Last 80 lines of $SERVICE_NAME logs ---"
  journalctl -u "$SERVICE_NAME" -n 80 --no-pager 2>/dev/null || true
  exit 1
fi

check_health "$HEALTH_LOCAL"  "Local  ($HEALTH_LOCAL)"
check_health "$HEALTH_PUBLIC" "Public ($HEALTH_PUBLIC)" || \
  echo "   ⚠️  Public health check failed – DNS/TLS may not yet be pointing to this server."

echo ""
echo "=========================================="
echo " ✅ Deployment complete!"
echo "=========================================="

