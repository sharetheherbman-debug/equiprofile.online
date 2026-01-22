#!/bin/bash
# Smoke test script for local deployment
# Tests basic endpoints to verify the app is running correctly

set -e

PORT=${PORT:-3000}
BASE_URL="http://127.0.0.1:$PORT"

echo "🧪 Running smoke tests on $BASE_URL"
echo ""

# Test 1: Health endpoint
echo "Testing health endpoint..."
if curl -f -s "$BASE_URL/api/health" > /dev/null; then
  echo "✓ Health check passed"
else
  echo "✗ Health check failed"
  exit 1
fi

# Test 2: Readiness endpoint
echo "Testing readiness endpoint..."
if curl -f -s "$BASE_URL/api/ready" > /dev/null; then
  echo "✓ Readiness check passed"
else
  echo "⚠️  Readiness check failed (database may not be connected)"
fi

# Test 3: Build endpoint
echo "Testing build endpoint..."
if curl -f -s "$BASE_URL/build" > /dev/null; then
  echo "✓ Build endpoint passed"
else
  echo "✗ Build endpoint failed"
  exit 1
fi

echo ""
echo "✅ All smoke tests passed!"
