# EquiProfile Smoke Tests

**Purpose**: Quick validation that deployment was successful  
**Run After**: Every deployment, build, or restart  
**Expected Time**: < 30 seconds

---

## Automated Smoke Test Script

Location: `/scripts/smoke-test.sh`

```bash
#!/bin/bash
# EquiProfile Smoke Tests
# Run after deployment to verify basic functionality

set -e  # Exit on first error

echo "🧪 Running EquiProfile Smoke Tests..."
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  echo -n "Testing $name... "

  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

  if [ "$status" = "$expected_status" ]; then
    echo "✅ PASS (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL (HTTP $status, expected $expected_status)"
    FAIL=$((FAIL + 1))
  fi
}

# Helper function to test JSON response
test_json() {
  local name="$1"
  local url="$2"
  local key="$3"

  echo -n "Testing $name... "

  response=$(curl -s "$url")

  if echo "$response" | grep -q "\"$key\""; then
    echo "✅ PASS (JSON valid, '$key' present)"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL (JSON invalid or '$key' missing)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Core Endpoints ==="
test_endpoint "Health Check" "$BASE_URL/healthz"
test_endpoint "Build Info" "$BASE_URL/build"
test_json "Build Version" "$BASE_URL/build" "version"

echo ""
echo "=== Public Pages ==="
test_endpoint "Landing Page" "$BASE_URL/"
test_endpoint "Login Page" "$BASE_URL/login"
test_endpoint "Register Page" "$BASE_URL/register"
test_endpoint "About Page" "$BASE_URL/about"
test_endpoint "Features Page" "$BASE_URL/features"
test_endpoint "Pricing Page" "$BASE_URL/pricing"
test_endpoint "Contact Page" "$BASE_URL/contact"

echo ""
echo "=== API Endpoints ==="
test_json "API Health" "$BASE_URL/api/health" "status"
test_endpoint "OAuth Status" "$BASE_URL/api/oauth/status"

echo ""
echo "=== Asset Loading ==="
# Check if main JS bundle exists (any .js file in /assets)
echo -n "Testing JavaScript Assets... "
if curl -s "$BASE_URL/" | grep -q "src=\"/assets/.*\.js\""; then
  echo "✅ PASS (JS bundle referenced)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (JS bundle not found in HTML)"
  FAIL=$((FAIL + 1))
fi

echo -n "Testing CSS Assets... "
if curl -s "$BASE_URL/" | grep -q "href=\"/assets/.*\.css\""; then
  echo "✅ PASS (CSS bundle referenced)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (CSS bundle not found in HTML)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Service Status ==="
echo -n "Testing systemd service... "
if systemctl is-active --quiet equiprofile; then
  echo "✅ PASS (service is active)"
  PASS=$((PASS + 1))
else
  echo "⚠️  WARNING (service not managed by systemd or not active)"
  # Don't count as fail - might be dev environment
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ All smoke tests passed!"
  exit 0
else
  echo "❌ $FAIL test(s) failed"
  exit 1
fi
```

---

## Manual Smoke Test Checklist

If automated script isn't available, manually verify:

### 1. Service is Running

```bash
sudo systemctl status equiprofile
```

**Expected**: `active (running)`

### 2. Health Endpoints

```bash
curl http://localhost:3000/healthz
```

**Expected**: `{"ok":true,"timestamp":"..."}`

```bash
curl http://localhost:3000/api/health
```

**Expected**: `{"status":"healthy","timestamp":"...","services":{...}}`

### 3. Landing Page Loads

```bash
curl -I http://localhost:3000/
```

**Expected**: `HTTP/1.1 200 OK` with `Content-Type: text/html`

### 4. Auth Pages Load

```bash
curl -I http://localhost:3000/login
curl -I http://localhost:3000/register
```

**Expected**: Both return `200 OK`

### 5. Assets Are Served

```bash
curl -I http://localhost:3000/assets/index-[hash].js
```

**Expected**: `200 OK` (replace `[hash]` with actual hash from page source)

### 6. API Responds

```bash
curl http://localhost:3000/api/trpc/auth.me
```

**Expected**: JSON response (even if unauthenticated)

### 7. No JavaScript Errors

Open browser to `http://localhost:3000/` and check console:

**Expected**: No red errors in console

---

## Expected Response Samples

### /healthz

```json
{
  "ok": true,
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

### /api/health

```json
{
  "status": "healthy",
  "timestamp": "2026-01-09T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": true,
    "stripe": false,
    "oauth": true
  }
}
```

### /build

```json
{
  "version": "1.0.0",
  "buildId": "20260109-120000",
  "commit": "abc1234",
  "buildTime": "2026-01-09T12:00:00.000Z",
  "nodeVersion": "v18.19.0"
}
```

---

## Troubleshooting Failed Tests

### Health Check Fails

**Cause**: Server not running or not responding

**Solution**:

1. Check service status: `sudo systemctl status equiprofile`
2. Check logs: `sudo journalctl -u equiprofile -n 50`
3. Verify port 3000 is listening: `sudo netstat -tulpn | grep 3000`

### Page Returns 404

**Cause**: Static files not built or served correctly

**Solution**:

1. Verify `dist/` directory exists: `ls -la dist/`
2. Check Vite build completed: Look for `dist/index.html`
3. Rebuild: `npm run build`

### Database Connection Fails

**Cause**: MySQL not running or wrong credentials

**Solution**:

1. Check MySQL status: `sudo systemctl status mysql`
2. Test connection: `mysql -h localhost -u equiprofile -p`
3. Verify DATABASE_URL in `.env`

### API Returns 500 Error

**Cause**: Server-side error

**Solution**:

1. Check logs: `sudo journalctl -u equiprofile -n 100`
2. Look for stack traces
3. Verify all environment variables are set

---

## Integration with CI/CD

Add to GitHub Actions or CI pipeline:

```yaml
- name: Run Smoke Tests
  run: |
    ./scripts/smoke-test.sh
  env:
    BASE_URL: http://localhost:3000
```

---

## Success Criteria

Deployment is successful when:

- ✅ All automated tests pass (0 failures)
- ✅ Service is running (`systemctl status equiprofile`)
- ✅ Health endpoint responds within 1 second
- ✅ Landing page loads in browser
- ✅ No JavaScript console errors
- ✅ Login page accessible

---

## Emergency Rollback

If smoke tests fail after deployment:

1. Immediately rollback to previous version
2. Run smoke tests again
3. Investigate failure cause
4. Fix and redeploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for rollback procedure.

---

**End of Smoke Tests Guide**
