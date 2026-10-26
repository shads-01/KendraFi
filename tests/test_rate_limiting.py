"""
tests/test_rate_limiting.py
Verification suite for Part 11 (Rate limiting):
1. 10 rapid calls to /api/kendra/execute -> 200 OK.
2. 11th rapid call from same IP -> 429 Too Many Requests with Retry-After header.
3. Response adheres to standard error envelope: {"error": {"code": 429, "message": <detail>}}.
4. Separate scopes and counter resetting.
"""

import os
import pytest
from fastapi.testclient import TestClient

from api.index import app
from api.core.rate_limit import clear_rate_limits


@pytest.fixture(autouse=True)
def setup_rate_limit_test():
    """Ensure rate limits are cleared before and after each test."""
    clear_rate_limits()
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")
    os.environ["TEST_BYPASS_AUTH"] = "true"
    yield
    clear_rate_limits()
    if orig_bypass is not None:
        os.environ["TEST_BYPASS_AUTH"] = orig_bypass
    else:
        os.environ.pop("TEST_BYPASS_AUTH", None)


@pytest.fixture
def test_client():
    with TestClient(app) as client:
        yield client


def test_rapid_execute_calls_trigger_429_on_eleventh_attempt(test_client):
    """
    Part 11 verification:
    10 calls to /api/kendra/execute succeed (limit = 10/min per IP).
    The 11th rapid call returns 429 with 'Retry-After' header and error envelope.
    """
    payload = {
        "scenario": "SCENARIO_A_VALID",
        "borrower_id": "AGT-01",
        "principal_bdt": 45000.0,
        "tenor_days": 30,
    }
    client_headers = {"X-Forwarded-For": "203.0.113.195"}

    # First 10 calls succeed
    for i in range(10):
        resp = test_client.post("/api/kendra/execute", json=payload, headers=client_headers)
        assert resp.status_code == 200, f"Call {i+1} failed with status {resp.status_code}"

    # 11th call exceeds rate limit
    resp_11 = test_client.post("/api/kendra/execute", json=payload, headers=client_headers)
    assert resp_11.status_code == 429, f"Expected 429, got {resp_11.status_code}"

    # Verify Retry-After header
    assert "retry-after" in resp_11.headers
    retry_after = int(resp_11.headers["retry-after"])
    assert 1 <= retry_after <= 60

    # Verify standard error envelope
    data = resp_11.json()
    assert "error" in data
    assert data["error"]["code"] == 429
    assert "Rate limit exceeded" in data["error"]["message"]
    assert "execute" in data["error"]["message"]


def test_different_ips_have_independent_quotas(test_client):
    """
    Verifies that rate limit counters are isolated per client IP.
    """
    payload = {
        "scenario": "SCENARIO_A_VALID",
        "borrower_id": "AGT-01",
        "principal_bdt": 45000.0,
        "tenor_days": 30,
    }

    # Exhaust IP 1
    ip1_headers = {"X-Forwarded-For": "198.51.100.1"}
    for _ in range(10):
        resp = test_client.post("/api/kendra/execute", json=payload, headers=ip1_headers)
        assert resp.status_code == 200

    resp_ip1_blocked = test_client.post("/api/kendra/execute", json=payload, headers=ip1_headers)
    assert resp_ip1_blocked.status_code == 429

    # IP 2 should still be permitted
    ip2_headers = {"X-Forwarded-For": "198.51.100.2"}
    resp_ip2 = test_client.post("/api/kendra/execute", json=payload, headers=ip2_headers)
    assert resp_ip2.status_code == 200
