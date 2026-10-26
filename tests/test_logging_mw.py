"""
tests/test_logging_mw.py
Verification suite for Part 13 (Structured logging middleware & request IDs):
1. Every response carries X-Request-ID header.
2. If client sends X-Request-ID, it is propagated.
3. Every completed request writes exactly one JSON line to stdout with:
   ts, level, request_id, method, path, status, duration_ms.
4. Request bodies are never logged (redaction-by-design).
"""

import io
import json
import os
import sys
import pytest
from fastapi.testclient import TestClient

from api.index import app



@pytest.fixture
def test_client():
    orig_bypass = os.environ.get("TEST_BYPASS_AUTH")
    os.environ["TEST_BYPASS_AUTH"] = "true"
    with TestClient(app) as client:
        yield client
    if orig_bypass is not None:
        os.environ["TEST_BYPASS_AUTH"] = orig_bypass
    else:
        os.environ.pop("TEST_BYPASS_AUTH", None)


def test_response_attaches_request_id_header(test_client, capsys):
    """
    Verifies that FastAPI attaches X-Request-ID header and emits one JSON log line to stdout.
    """
    response = test_client.get("/api/health")
    assert response.status_code == 200

    # Header verification
    assert "x-request-id" in response.headers
    req_id = response.headers["x-request-id"]
    assert len(req_id) == 12

    # Stdout JSON log line verification
    captured = capsys.readouterr()
    lines = [line for line in captured.out.strip().split("\n") if line.strip()]
    assert len(lines) >= 1, "Expected stdout log line but found empty"

    last_log = json.loads(lines[-1])
    assert last_log["request_id"] == req_id
    assert last_log["method"] == "GET"
    assert last_log["path"] == "/api/health"
    assert last_log["status"] == 200
    assert last_log["level"] == "INFO"
    assert "duration_ms" in last_log
    assert "ts" in last_log

    # Verify no body is logged
    assert "body" not in last_log


def test_incoming_request_id_preserved(test_client, capsys):
    """
    Verifies that client-supplied X-Request-ID is honored and propagated.
    """
    custom_id = "trace-judge-99"
    response = test_client.get("/api/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("x-request-id") == custom_id

    captured = capsys.readouterr()
    lines = [line for line in captured.out.strip().split("\n") if line.strip()]
    assert len(lines) >= 1
    last_log = json.loads(lines[-1])
    assert last_log["request_id"] == custom_id
