"""
tests/test_monitoring.py
Part 14 Monitoring & Alerts test suite.
Validates real database health checks, component status reporting, request ID correlation,
HTTP 503 on database failure, and lightweight process liveness probes.
"""

import os
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from api.index import app, check_supabase_health


@pytest.fixture
def test_client():
    """Returns a test client for FastAPI."""
    return TestClient(app)


def test_health_check_healthy_db(test_client):
    """
    When database is healthy, /api/health must return HTTP 200
    with status 'healthy', components.db == 'ok', and a valid request_id.
    """
    with patch("api.index.check_supabase_health", return_value=True):
        resp = test_client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()

        assert data["status"] == "healthy"
        assert data["service"] == "kendra-core-engine"
        assert data["version"] == "1.0.0"
        assert "components" in data
        assert data["components"]["db"] == "ok"
        assert "request_id" in data
        assert len(data["request_id"]) >= 8

        # X-Request-ID header must match body request_id
        assert resp.headers.get("x-request-id") == data["request_id"]


def test_health_check_unhealthy_db(test_client):
    """
    When database connectivity fails, /api/health must tell the truth:
    return HTTP 503 Service Unavailable with status 'unhealthy',
    components.db == 'fail', and request_id.
    """
    with patch("api.index.check_supabase_health", return_value=False):
        resp = test_client.get("/api/health")
        assert resp.status_code == 503
        data = resp.json()

        assert data["status"] == "unhealthy"
        assert data["service"] == "kendra-core-engine"
        assert data["components"]["db"] == "fail"
        assert "request_id" in data
        assert resp.headers.get("x-request-id") == data["request_id"]


def test_health_check_custom_request_id(test_client):
    """
    If a custom X-Request-ID is provided by upstream load balancer or client,
    it must be preserved in both response body and headers.
    """
    custom_id = "upstream-trace-99"
    with patch("api.index.check_supabase_health", return_value=True):
        resp = test_client.get("/api/health", headers={"X-Request-ID": custom_id})
        assert resp.status_code == 200
        data = resp.json()
        assert data["request_id"] == custom_id
        assert resp.headers.get("x-request-id") == custom_id


def test_liveness_probe(test_client):
    """
    /api/health/live must be a lightweight probe returning status 'live'
    without performing database queries, suitable for high-frequency LB pings.
    """
    resp = test_client.get("/api/health/live")
    assert resp.status_code == 200
    assert resp.json() == {"status": "live"}


def test_check_supabase_health_force_fail():
    """
    FORCE_DB_HEALTH_FAIL env var forces check_supabase_health to immediately return False.
    """
    import asyncio
    orig = os.environ.get("FORCE_DB_HEALTH_FAIL")
    try:
        os.environ["FORCE_DB_HEALTH_FAIL"] = "true"
        is_healthy = asyncio.run(check_supabase_health(timeout_seconds=0.5))
        assert is_healthy is False
    finally:
        if orig is not None:
            os.environ["FORCE_DB_HEALTH_FAIL"] = orig
        else:
            os.environ.pop("FORCE_DB_HEALTH_FAIL", None)


def test_check_supabase_health_missing_credentials():
    """
    When Supabase URL and keys are unconfigured, check_supabase_health returns False.
    """
    import asyncio
    with patch.dict(os.environ, {
        "SUPABASE_URL": "",
        "NEXT_PUBLIC_SUPABASE_URL": "",
        "SUPABASE_SERVICE_ROLE_KEY": "",
        "SUPABASE_SECRET_KEY": "",
        "SUPABASE_PUBLISHABLE_KEY": "",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "",
        "FORCE_DB_HEALTH_FAIL": "",
        "TEST_MOCK_DB_HEALTH": "",
        "TEST_BYPASS_AUTH": "",
    }, clear=False):
        is_healthy = asyncio.run(check_supabase_health(timeout_seconds=0.5))
        assert is_healthy is False
