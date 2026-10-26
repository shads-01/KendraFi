"""
tests/test_api_hardening.py
Verification suite for Part 5 (APIs & backend logic hardening):
1. GET /api/kendra/state without HMAC headers -> 401 (with ZEROTRUST_INTERNAL_HMAC_SECRET set and bypass off).
2. GET /api/kendra/state with valid HMAC headers -> 200.
3. Garbage JSON to POST /api/kendra/execute -> 400 with {"error": {"code": 400, "message": <detail>}} envelope.
4. CORS origin configuration check.
"""

import os
import time
import pytest
from fastapi.testclient import TestClient

from api.index import app
from api.core.zerotrust_guard import (
    compute_hmac_signature,
    SIGNATURE_HEADER_NAME,
    TIMESTAMP_HEADER_NAME,
)


@pytest.fixture
def test_client():
    with TestClient(app) as client:
        yield client


def test_state_endpoint_unauthenticated_returns_401(test_client):
    """
    GET /api/kendra/state without HMAC headers -> 401 with standard error envelope
    when ZEROTRUST_INTERNAL_HMAC_SECRET is set and bypass is disabled.
    """
    secret = "kendra-test-secret-32-chars-long-1234"
    orig_secret = os.environ.get("ZEROTRUST_INTERNAL_HMAC_SECRET")
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")

    try:
        os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = secret
        os.environ["TEST_BYPASS_AUTH"] = "false"

        response = test_client.get("/api/kendra/state")
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == 401
        assert "Zero-Trust Gateway Intercept" in data["error"]["message"]
    finally:
        if orig_secret is not None:
            os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = orig_secret
        else:
            os.environ.pop("ZEROTRUST_INTERNAL_HMAC_SECRET", None)

        if orig_bypass is not None:
            os.environ["TEST_BYPASS_AUTH"] = orig_bypass
        else:
            os.environ.pop("TEST_BYPASS_AUTH", None)


def test_state_endpoint_with_valid_hmac_returns_200(test_client):
    """
    GET /api/kendra/state with valid HMAC-SHA256 headers -> 200 OK.
    """
    secret = "kendra-test-secret-32-chars-long-1234"
    orig_secret = os.environ.get("ZEROTRUST_INTERNAL_HMAC_SECRET")
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")

    try:
        os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = secret
        os.environ["TEST_BYPASS_AUTH"] = "false"

        timestamp = f"{time.time():.3f}"
        sig = compute_hmac_signature(secret, timestamp, "")

        headers = {
            SIGNATURE_HEADER_NAME: sig,
            TIMESTAMP_HEADER_NAME: timestamp,
        }

        response = test_client.get("/api/kendra/state", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "OPERATIONAL"
        assert "current_facility" in data
        assert "guarantor_quorum" in data
    finally:
        if orig_secret is not None:
            os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = orig_secret
        else:
            os.environ.pop("ZEROTRUST_INTERNAL_HMAC_SECRET", None)

        if orig_bypass is not None:
            os.environ["TEST_BYPASS_AUTH"] = orig_bypass
        else:
            os.environ.pop("TEST_BYPASS_AUTH", None)


def test_execute_garbage_json_returns_400_with_error_envelope(test_client):
    """
    Garbage JSON or malformed payload to /api/kendra/execute -> 400 Bad Request
    with {"error": {"code": 400, "message": <detail>}} standard envelope.
    """
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")
    try:
        os.environ["TEST_BYPASS_AUTH"] = "true"

        # 1. Syntactically invalid JSON
        response = test_client.post(
            "/api/kendra/execute",
            content=b"{invalid-json-content",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == 400
        assert isinstance(data["error"]["message"], str)

        # 2. Schema-violating JSON payload (missing required fields)
        response2 = test_client.post(
            "/api/kendra/execute",
            json={"random_garbage_field": "no_scenario"},
        )
        assert response2.status_code == 400
        data2 = response2.json()
        assert "error" in data2
        assert data2["error"]["code"] == 400
        assert isinstance(data2["error"]["message"], str)
    finally:
        if orig_bypass is not None:
            os.environ["TEST_BYPASS_AUTH"] = orig_bypass
        else:
            os.environ.pop("TEST_BYPASS_AUTH", None)


def test_cors_middleware_configured(test_client):
    """
    Verifies CORS headers respond appropriately for allowed origins.
    """
    response = test_client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_production_mode_refuses_bypass_at_startup():
    """
    Part 10 verification: with KENDRA_ENV=production + TEST_BYPASS_AUTH=true,
    startup raises RuntimeError.
    """
    orig_env = os.environ.get("KENDRA_ENV")
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")
    orig_secret = os.environ.get("ZEROTRUST_INTERNAL_HMAC_SECRET")

    try:
        os.environ["KENDRA_ENV"] = "production"
        os.environ["TEST_BYPASS_AUTH"] = "true"
        os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = "valid-32-byte-secret-for-prod-test"

        with pytest.raises(RuntimeError) as exc_info:
            with TestClient(app) as client:
                client.get("/api/health")
        assert "CRITICAL_SECURITY_ERROR" in str(exc_info.value)
        assert "TEST_BYPASS_AUTH" in str(exc_info.value)
    finally:
        if orig_env is not None:
            os.environ["KENDRA_ENV"] = orig_env
        else:
            os.environ.pop("KENDRA_ENV", None)

        if orig_bypass is not None:
            os.environ["TEST_BYPASS_AUTH"] = orig_bypass
        else:
            os.environ.pop("TEST_BYPASS_AUTH", None)

        if orig_secret is not None:
            os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = orig_secret
        else:
            os.environ.pop("ZEROTRUST_INTERNAL_HMAC_SECRET", None)


def test_production_mode_refuses_empty_secret_at_startup():
    """
    Part 10 verification: with KENDRA_ENV=production and empty/placeholder secret,
    startup raises RuntimeError.
    """
    orig_env = os.environ.get("KENDRA_ENV")
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")
    orig_secret = os.environ.get("ZEROTRUST_INTERNAL_HMAC_SECRET")

    try:
        os.environ["KENDRA_ENV"] = "production"
        os.environ["TEST_BYPASS_AUTH"] = "false"
        os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = "change-me-32-bytes"

        with pytest.raises(RuntimeError) as exc_info:
            with TestClient(app) as client:
                client.get("/api/health")
        assert "CRITICAL_SECURITY_ERROR" in str(exc_info.value)
    finally:
        if orig_env is not None:
            os.environ["KENDRA_ENV"] = orig_env
        else:
            os.environ.pop("KENDRA_ENV", None)

        if orig_bypass is not None:
            os.environ["TEST_BYPASS_AUTH"] = orig_bypass
        else:
            os.environ.pop("TEST_BYPASS_AUTH", None)

        if orig_secret is not None:
            os.environ["ZEROTRUST_INTERNAL_HMAC_SECRET"] = orig_secret
        else:
            os.environ.pop("ZEROTRUST_INTERNAL_HMAC_SECRET", None)


def test_env_example_clean_of_old_hmac_literal():
    """
    Part 10 verification: .env.example greps clean for the old literal
    'kendra_zt_hmac_2026_shenzhen_fintechathon_secret_key'.
    """
    env_example_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.example")
    with open(env_example_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "kendra_zt_hmac_2026_shenzhen_fintechathon_secret_key" not in content
    assert "change-me-32-bytes" in content

