---
name: api-test
description: Runs comprehensive tests against FastAPI backend endpoints. Use when testing the API, verifying endpoints, checking backend health, or running API tests.
---

# API Test Skill

Tests FastAPI backend endpoints for the Turnify B2B Return Portal.

## Description

This skill runs comprehensive tests against the FastAPI backend to verify all endpoints are working correctly. It tests health checks, authentication, returns, purchase orders, users, and OMS sync endpoints.

## Use Cases

- "Test the API"
- "Run API tests"
- "Check if backend endpoints are working"
- "Verify FastAPI health"
- "Test all endpoints"

## Requirements

- FastAPI backend running on localhost:8000
- PostgreSQL database accessible
- (Optional) Valid JWT token for authenticated endpoints

## Script

Ref: scripts/test_api.py

## Parameters

- `--health-only` - Test only health endpoints (fast)
- `--auth` - Include authentication tests (requires credentials)
- `--verbose` - Show detailed request/response info
- `--endpoint <name>` - Test specific endpoint only

## Output

Displays test results:
- ✅ Passed tests
- ❌ Failed tests
- Response times
- Status codes
- Error messages (if any)

## Examples

```bash
# Test all endpoints
python scripts/test_api.py

# Test only health endpoints (fast)
python scripts/test_api.py --health-only

# Test with verbose output
python scripts/test_api.py --verbose

# Test specific endpoint
python scripts/test_api.py --endpoint returns
```
