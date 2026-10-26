# -*- coding: utf-8 -*-
"""
KendraFi FastAPI Serverless Application Entrypoint
=================================================
Location: api/index.py

Exposes zero-trust authenticated REST endpoints for the KendraFi cooperative syndicate:
- POST /api/kendra/execute : Executes 5-state LangGraph FSM with multi-round CNP negotiation.
- POST /api/kendra/repay   : Triggers simulated 30-day post-lending MFS sweep & Bangla voice-bot nudge.
- POST /api/kendra/bailout : Triggers emergency autonomous monsoon flash bailout.
- GET  /api/kendra/state   : Returns current system state and cached trace data.
- GET  /api/health         : Health check endpoint for monitoring.
"""

from __future__ import annotations

import os
import uuid
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional
import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel, Field

from api.core.schemas import (
    ExecuteScenarioRequest,
    RepaymentSweepRequest,
    FlashBailoutRequest,
)
from api.core.zerotrust_guard import verify_zerotrust_headers, get_supabase_client
from api.core.syndicate_fsm import SyndicateFSMRunner
from api.core.rate_limit import rate_limit
from api.core.logging_mw import StructuredLoggingMiddleware


def validate_production_security() -> None:
    """
    Enforces that bypass flags or unconfigured secrets are strictly prohibited in production.
    Raises at startup if KENDRA_ENV == 'production' and any insecure configuration is present.
    """
    if os.getenv("KENDRA_ENV", "").lower() == "production":
        is_bypass = os.getenv("TEST_BYPASS_AUTH", "").lower() in ("true", "1")
        if is_bypass:
            raise RuntimeError(
                "CRITICAL_SECURITY_ERROR: TEST_BYPASS_AUTH cannot be enabled when KENDRA_ENV=production"
            )
        secret = os.getenv("ZEROTRUST_INTERNAL_HMAC_SECRET", "").strip()
        if not secret or secret == "change-me-32-bytes":
            raise RuntimeError(
                "CRITICAL_SECURITY_ERROR: ZEROTRUST_INTERNAL_HMAC_SECRET is missing or invalid in production"
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_production_security()
    yield


app = FastAPI(
    title="KendraFi Core Protocol API",
    description="Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol",
    version="1.0.0",
    lifespan=lifespan,
)

# Structured JSON request logging middleware (stdout log stream with X-Request-ID)
app.add_middleware(StructuredLoggingMiddleware)

# Enable CORS with explicit origins from environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("KENDRA_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": exc.detail}},
        headers=getattr(exc, "headers", None) or {},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": {"code": status.HTTP_400_BAD_REQUEST, "message": str(exc)}},
    )

runner = SyndicateFSMRunner()


# ==============================================================================
# ZERO-TRUST AUTHENTICATION HELPER
# ==============================================================================

async def authenticate_zerotrust_request(
    request: Request,
    x_zerotrust_signature: Optional[str] = Header(None, alias="X-ZeroTrust-Signature"),
    x_zerotrust_timestamp: Optional[str] = Header(None, alias="X-ZeroTrust-Timestamp"),
) -> None:
    """
    Enforces HMAC-SHA256 signature verification and 30-second anti-replay window.
    Bypasses authentication in local development if explicitly allowed or test runner flag is set.
    """
    # Refuse to run bypass or unconfigured secret in production (fail-closed)
    secret = os.getenv("ZEROTRUST_INTERNAL_HMAC_SECRET", "")
    is_production = os.getenv("KENDRA_ENV", "").lower() == "production"
    is_bypass = os.getenv("TEST_BYPASS_AUTH", "").lower() in ("true", "1")

    if is_production:
        if is_bypass:
            raise RuntimeError(
                "CRITICAL_SECURITY_ERROR: TEST_BYPASS_AUTH cannot be enabled when KENDRA_ENV=production"
            )
        if not secret or secret == "change-me-32-bytes":
            raise RuntimeError(
                "CRITICAL_SECURITY_ERROR: ZEROTRUST_INTERNAL_HMAC_SECRET is missing or invalid in production"
            )
    elif is_bypass or not secret:
        return

    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")

    is_valid, error_msg = verify_zerotrust_headers(
        signature=x_zerotrust_signature,
        timestamp=x_zerotrust_timestamp,
        body=body_str,
    )

    # For GET / HEAD requests where body is empty, accept signature over empty JSON object "{}" as well
    if not is_valid and request.method in ("GET", "HEAD") and not body_str:
        is_valid_alt, _ = verify_zerotrust_headers(
            signature=x_zerotrust_signature,
            timestamp=x_zerotrust_timestamp,
            body="{}",
        )
        if is_valid_alt:
            is_valid = True
            error_msg = ""

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Zero-Trust Gateway Intercept: {error_msg}",
        )


# ==============================================================================
# DATABASE CONNECTIVITY MONITORING (PART 14)
# ==============================================================================

async def check_supabase_health(timeout_seconds: float = 2.0) -> bool:
    """
    Pings Supabase with a 2-second timeout via REST API HEAD request.
    Returns True if reachable and responding with HTTP status < 500, False otherwise.
    In hermetic local test runs, respects TEST_MOCK_DB_HEALTH or test bypass flags
    unless FORCE_DB_HEALTH_FAIL is explicitly set.
    """
    if os.getenv("FORCE_DB_HEALTH_FAIL", "").lower() in ("true", "1"):
        return False

    if os.getenv("TEST_MOCK_DB_HEALTH", "").lower() in ("true", "1") or os.getenv("TEST_BYPASS_AUTH", "").lower() in ("true", "1"):
        return True

    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )
    if not url or not key:
        return False

    try:
        clean_url = url.rstrip("/")
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            resp = await client.head(f"{clean_url}/rest/v1/", headers=headers)
            if resp.status_code == 405:
                resp = await client.get(f"{clean_url}/rest/v1/", headers=headers)
            return resp.status_code < 500
    except Exception:
        return False


# ==============================================================================
# API ROUTE HANDLERS
# ==============================================================================

@app.get("/api/health")
async def health_check(request: Request):
    """
    Health check endpoint verifying process integrity and Supabase DB reachability.
    Returns HTTP 200 with components {"db": "ok"} when healthy.
    Returns HTTP 503 with components {"db": "fail"} when DB ping fails.
    """
    request_id = getattr(request.state, "request_id", None) or uuid.uuid4().hex[:12]
    db_ok = await check_supabase_health(timeout_seconds=2.0)

    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    content = {
        "status": "healthy" if db_ok else "unhealthy",
        "service": "kendra-core-engine",
        "version": "1.0.0",
        "components": {
            "db": "ok" if db_ok else "fail",
        },
        "request_id": request_id,
    }
    return JSONResponse(status_code=status_code, content=content)


@app.get("/api/health/live")
async def liveness_probe():
    """Lightweight process liveness probe for load balancers and container runners."""
    return {"status": "live"}


@app.post("/api/kendra/execute", dependencies=[Depends(rate_limit("execute", limit=10, per_seconds=60))])
async def execute_scenario(
    payload: ExecuteScenarioRequest,
    request: Request,
    x_zerotrust_signature: Optional[str] = Header(None, alias="X-ZeroTrust-Signature"),
    x_zerotrust_timestamp: Optional[str] = Header(None, alias="X-ZeroTrust-Timestamp"),
):
    """
    Executes the 5-state LangGraph FSM with multi-round CNP negotiation for a designated scenario.
    """
    await authenticate_zerotrust_request(request, x_zerotrust_signature, x_zerotrust_timestamp)
    result = runner.run_scenario(payload.scenario)
    return result


@app.post("/api/kendra/repay", dependencies=[Depends(rate_limit("repay", limit=30, per_seconds=60))])
async def execute_repayment_sweep(
    payload: RepaymentSweepRequest,
    request: Request,
    x_zerotrust_signature: Optional[str] = Header(None, alias="X-ZeroTrust-Signature"),
    x_zerotrust_timestamp: Optional[str] = Header(None, alias="X-ZeroTrust-Timestamp"),
):
    """
    Executes the 30-day post-lending simulated MFS sales sweep, triggers Bangla voice-bot
    nudge telemetry, unlocks peer stakes, and pays the 1.0% APR micro-guarantee yield.
    """
    await authenticate_zerotrust_request(request, x_zerotrust_signature, x_zerotrust_timestamp)
    result = runner.run_repayment_sweep(
        facility_id=payload.facility_id,
        amount_bdt=payload.amount_bdt,
    )
    return result


@app.post("/api/kendra/bailout", dependencies=[Depends(rate_limit("bailout", limit=10, per_seconds=60))])
async def execute_flash_bailout(
    payload: FlashBailoutRequest,
    request: Request,
    x_zerotrust_signature: Optional[str] = Header(None, alias="X-ZeroTrust-Signature"),
    x_zerotrust_timestamp: Optional[str] = Header(None, alias="X-ZeroTrust-Timestamp"),
):
    """
    Triggers emergency autonomous monsoon flash bailout for covariant weather shocks.
    Unlocks peer collateral without slashing social reputation.
    """
    await authenticate_zerotrust_request(request, x_zerotrust_signature, x_zerotrust_timestamp)
    result = runner.run_flash_bailout(
        facility_id=payload.facility_id,
        reason=payload.trigger_reason,
    )
    return result


@app.get("/api/kendra/state", dependencies=[Depends(rate_limit("state", limit=60, per_seconds=60))])
async def get_system_state(
    request: Request,
    x_zerotrust_signature: Optional[str] = Header(None, alias="X-ZeroTrust-Signature"),
    x_zerotrust_timestamp: Optional[str] = Header(None, alias="X-ZeroTrust-Timestamp"),
):
    """Returns current syndicate system state, agents, and contract parameters."""
    await authenticate_zerotrust_request(request, x_zerotrust_signature, x_zerotrust_timestamp)
    return {
        "status": "OPERATIONAL",
        "current_facility": {
            "invoice_id": "INV-2026-DHAKA-001",
            "borrower": "AGT-01 (Rahim Store)",
            "supplier": "Meghna Group Wholesale (0x71c...a91)",
            "principal_bdt": 45000.00,
            "gross_repayment_bdt": 45462.33,
            "dscr": 1.6800,
            "tenor_days": 30,
            "status": "ACTIVE",
        },
        "guarantor_quorum": [
            {"agent_id": "AGT-04", "name": "Nasrin Pharmacy", "stake_pct": 40.0, "stake_bdt": 18184.93},
            {"agent_id": "AGT-02", "name": "Fatema Textiles", "stake_pct": 35.0, "stake_bdt": 15911.82},
            {"agent_id": "AGT-03", "name": "Kamal Agro", "stake_pct": 25.0, "stake_bdt": 11365.58},
            {"agent_id": "AGT-05", "name": "Tariq Hardware", "stake_pct": 0.0, "stake_bdt": 0.00, "status": "ABSTAINED_CV_EXCEEDED"},
        ],
        "macro_parameters": {
            "apr": 12.50,
            "wholesaler_mdr_fee": 1.50,
            "peer_yield_apr": 1.00,
            "max_alpha_cap": 40.0,
        },
    }
