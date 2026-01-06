#!/bin/bash
# ==========================================
# EquiProfile Environment Check Script
# ==========================================
# This script displays the effective runtime environment
# with sensitive values redacted for security.
#
# Usage: ./env-check.sh

set -e

echo "==========================================="
echo "  EquiProfile Environment Check"
echo "==========================================="
echo ""

# Function to check if env var is set
check_env() {
  local var_name=$1
  local is_secret=${2:-false}
  
  if [ -n "${!var_name}" ]; then
    if [ "$is_secret" = "true" ]; then
      echo "✅ $var_name=***REDACTED***"
    else
      echo "✅ $var_name=${!var_name}"
    fi
  else
    echo "❌ $var_name=NOT SET"
  fi
}

echo "CORE CONFIGURATION:"
check_env "DATABASE_URL" true
check_env "JWT_SECRET" true
check_env "ADMIN_UNLOCK_PASSWORD" true
check_env "NODE_ENV"
check_env "PORT"
check_env "BASE_URL"
echo ""

echo "OAUTH CONFIGURATION:"
check_env "OAUTH_SERVER_URL"
check_env "VITE_APP_ID"
check_env "OWNER_OPEN_ID" true
echo ""

echo "FEATURE FLAGS:"
check_env "ENABLE_STRIPE"
check_env "ENABLE_UPLOADS"
echo ""

echo "STRIPE CONFIGURATION:"
check_env "STRIPE_SECRET_KEY" true
check_env "STRIPE_WEBHOOK_SECRET" true
check_env "STRIPE_PUBLISHABLE_KEY"
check_env "STRIPE_MONTHLY_PRICE_ID"
check_env "STRIPE_YEARLY_PRICE_ID"
echo ""

echo "UPLOAD/STORAGE CONFIGURATION:"
check_env "BUILT_IN_FORGE_API_URL"
check_env "BUILT_IN_FORGE_API_KEY" true
echo ""

echo "SECURITY & PROXY SETTINGS:"
check_env "RATE_LIMIT_WINDOW_MS"
check_env "RATE_LIMIT_MAX_REQUESTS"
check_env "COOKIE_DOMAIN"
check_env "COOKIE_SECURE"
echo ""

echo "==========================================="
echo ""

# Check if running as systemd service
if systemctl is-active --quiet equiprofile 2>/dev/null; then
  echo "ℹ️  Service Status: equiprofile.service is ACTIVE"
  echo "ℹ️  View logs with: journalctl -u equiprofile -f"
else
  echo "ℹ️  Service Status: equiprofile.service is NOT ACTIVE or not installed"
fi

echo ""
