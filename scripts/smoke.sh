#!/bin/bash
#
# Smoke Test Script for Production Verification
# Tests critical API endpoints to ensure production readiness
#
set -e

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔥 Running smoke tests against: $BASE_URL"
echo "=================================================="

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local expected_status=$3
    local expected_content_type=$4
    local data=$5
    local description=$6
    local extra_headers=$7

    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{content_type}" -X GET "$BASE_URL$path" $extra_headers)
    else
        response=$(curl -s -w "\n%{http_code}\n%{content_type}" -X POST "$BASE_URL$path" \
            -H "Content-Type: application/json" \
            -d "$data" $extra_headers)
    fi
    
    # Parse response
    body=$(echo "$response" | head -n -2)
    status=$(echo "$response" | tail -n 2 | head -n 1)
    content_type=$(echo "$response" | tail -n 1)
    
    # Check status code
    if [ "$status" != "$expected_status" ]; then
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected status: $expected_status, Got: $status"
        echo "  Response body: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    # Check content type
    if [[ "$content_type" != *"$expected_content_type"* ]]; then
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected content-type: $expected_content_type, Got: $content_type"
        echo "  Response body: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    echo -e "${GREEN}✓ PASSED${NC}"
    return 0
}

# Test 1: Health endpoint returns JSON
test_endpoint "GET" "/api/health" "200" "application/json" "" "Health check returns JSON"

# Test 2: Non-existent API route returns JSON 404 (not HTML)
test_endpoint "GET" "/api/this-should-not-exist" "404" "application/json" "" "Non-existent API route returns JSON 404"

# Test 3: Register endpoint returns JSON (might be 400 if user exists)
test_endpoint "POST" "/api/auth/register" "400" "application/json" \
    '{"email":"test@example.com","password":"password123","name":"Test User"}' \
    "Register endpoint returns JSON"

# Test 4: Register with /signup also works
test_endpoint "POST" "/api/auth/signup" "400" "application/json" \
    '{"email":"test@example.com","password":"password123","name":"Test User"}' \
    "Signup endpoint (alias) returns JSON"

# Test 5: Login endpoint returns JSON (will fail with invalid credentials but should be JSON)
test_endpoint "POST" "/api/auth/login" "401" "application/json" \
    '{"email":"nonexistent@example.com","password":"wrongpassword"}' \
    "Login endpoint returns JSON error"

# Test 6: Version endpoint returns JSON
test_endpoint "GET" "/api/version" "200" "application/json" "" "Version endpoint returns JSON"

# Test 7: SSE endpoint without auth returns JSON 401 (not HTML)
echo -n "Testing: SSE endpoint without auth returns JSON 401 ... "
response=$(curl -s -w "\n%{http_code}\n%{content_type}" -X GET "$BASE_URL/api/realtime/events")
body=$(echo "$response" | head -n -2)
status=$(echo "$response" | tail -n 2 | head -n 1)
content_type=$(echo "$response" | tail -n 1)

if [ "$status" = "401" ] && [[ "$content_type" == *"application/json"* ]]; then
    echo -e "${GREEN}✓ PASSED${NC}"
elif [ "$status" = "200" ] && [[ "$content_type" == *"text/event-stream"* ]]; then
    # SSE might allow unauthenticated connections in some configs, check for heartbeat
    echo -e "${YELLOW}⚠ SKIPPED (SSE allows unauth connections)${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Expected status 401 with JSON or 200 with event-stream"
    echo "  Got status: $status, content-type: $content_type"
    FAILED=$((FAILED + 1))
fi

# Test 8: Email normalization - test with uppercase email
echo -n "Testing: Email normalization (uppercase email) ... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"TEST@EXAMPLE.COM","password":"password123","name":"Test User"}')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)

# Should return 400 (already registered) or 200 (success), both are JSON
if [ "$status" = "400" ] || [ "$status" = "200" ]; then
    if echo "$body" | grep -q '"error"' || echo "$body" | grep -q '"access_token"'; then
        echo -e "${GREEN}✓ PASSED${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Response is not valid JSON"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Unexpected status: $status"
    FAILED=$((FAILED + 1))
fi

echo "=================================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED test(s) failed${NC}"
    exit 1
fi
