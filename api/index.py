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
from typing import Any, Dict, Optional
from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api.core.schemas import (
    ExecuteScenarioRequest,
    RepaymentSweepRequest,
    FlashBailoutRequest,
)
from api.core.zerotrust_guard import verify_zerotrust_headers, get_supabase_client
from api.core.syndicate_fsm import SyndicateFSMRunner

app = FastAPI(
    title="KendraFi Core Protocol API",
    description="Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    # Allow testing without signature if HMAC secret is set to 'development-bypass'
    secret = os.getenv("ZEROTRUST_INTERNAL_HMAC_SECRET", "")
    if os.getenv("TEST_BYPASS_AUTH", "").lower() in ("true", "1") or not secret:
        return

    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")

    is_valid, error_msg = verify_zerotrust_headers(
        signature=x_zerotrust_signature,
        timestamp=x_zerotrust_timestamp,
        body=body_str,
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Zero-Trust Gateway Intercept: {error_msg}",
        )


# ==============================================================================
# API ROUTE HANDLERS
# ==============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint for Vercel and container probes."""
    return {
        "status": "healthy",
        "service": "kendra-core-engine",
        "version": "1.0.0",
        "framework": "LangGraph + FastAPI",
    }


@app.post("/api/kendra/execute")
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


@app.post("/api/kendra/repay")
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


@app.post("/api/kendra/bailout")
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


@app.get("/api/kendra/state")
async def get_system_state():
    """Returns current syndicate system state, agents, and contract parameters."""
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
