"""
tests/test_prompt08_syndicate_fsm.py
Tests for Prompt 08: Layer-2 Multi-Round LangGraph Contract Net Protocol (CNP) FSM,
JSON Trace Exporter, Next.js BFF Routes, and Post-Lending Repayment Sweep.
"""

import json
import os
import pytest
from fastapi.testclient import TestClient

from api.index import app
from api.core.syndicate_fsm import SyndicateFSMRunner
from api.core.schemas import FSMState


@pytest.fixture
def fsm_runner():
    return SyndicateFSMRunner()


@pytest.fixture
def api_client():
    os.environ["TEST_BYPASS_AUTH"] = "true"
    with TestClient(app) as client:
        yield client


# ==============================================================================
# 1. MULTI-ROUND CONTRACT NET PROTOCOL (CNP) NEGOTIATION TESTS
# ==============================================================================

def test_scenario_a_three_round_cnp_negotiation(fsm_runner):
    """
    Verifies that Scenario A executes the complete 3-round CNP negotiation:
    - Round 1: CFP broadcast, AGT-04 capped at 40%, AGT-02 bids 28.2%, AGT-03 bids 20.2%, AGT-05 abstains.
    - Round 2: Clearing yield phi* = 1.00% APR; AGT-02 expands to 35.0%, AGT-03 expands to 25.0%.
    - Round 3: Nash equilibrium quorum lock (40% + 35% + 25% = 100%), 4 EIP-712 signatures.
    """
    res = fsm_runner.run_scenario("SCENARIO_A_VALID")

    assert res["status"] == "SUCCESS"
    assert res["extracted_intent"]["borrower_agent_id"] == "AGT-01"
    assert res["extracted_intent"]["amount_bdt"] == 45000.00
    assert res["gross_repayment_bdt"] == 45462.33
    assert res["net_supplier_payout_bdt"] == 44325.00  # 45,000 * 0.985

    # Check FSM state progression
    trace = res["fsm_trace"]
    assert FSMState.IDLE_MONITORING.value in trace
    assert FSMState.INTENT_PERCEPTION.value in trace
    assert FSMState.DETERMINISTIC_AUDIT.value in trace
    assert FSMState.SYNDICATE_P2P_NEGOTIATION.value in trace
    assert FSMState.ESCROW_COSIGN_AND_SETTLE.value in trace

    # Check CNP Messages
    cnp_msgs = res["cnp_messages"]
    assert len(cnp_msgs) >= 10

    # Round 1 verification
    r1_msgs = [m for m in cnp_msgs if m["round_num"] == 1]
    assert len(r1_msgs) >= 5

    cfp = next(m for m in r1_msgs if m["message_type"] == "CFP_BROADCAST")
    assert cfp["sender_agent"] == "AGT-01"

    agt04_r1 = next(m for m in r1_msgs if m["sender_agent"] == "AGT-04")
    assert agt04_r1["proposed_alpha"] == 0.4000
    assert "11.6% uncovered residual" in agt04_r1["detail"] or "capped" in agt04_r1["detail"]

    agt02_r1 = next(m for m in r1_msgs if m["sender_agent"] == "AGT-02")
    assert agt02_r1["proposed_alpha"] == 0.2820

    agt03_r1 = next(m for m in r1_msgs if m["sender_agent"] == "AGT-03")
    assert agt03_r1["proposed_alpha"] == 0.2020

    agt05_r1 = next(m for m in r1_msgs if m["sender_agent"] == "AGT-05")
    assert agt05_r1["message_type"] == "ABSTAIN_LIQUIDITY_STRESS"

    # Round 2 verification
    r2_msgs = [m for m in cnp_msgs if m["round_num"] == 2]
    assert len(r2_msgs) >= 3

    clearing = next(m for m in r2_msgs if m["sender_agent"] == "AGT-01")
    assert clearing["proposed_yield_apr_bps"] == 100

    agt02_r2 = next(m for m in r2_msgs if m["sender_agent"] == "AGT-02")
    assert agt02_r2["proposed_alpha"] == 0.3500

    agt03_r2 = next(m for m in r2_msgs if m["sender_agent"] == "AGT-03")
    assert agt03_r2["proposed_alpha"] == 0.2500

    # Round 3 verification
    r3_msgs = [m for m in cnp_msgs if m["round_num"] == 3]
    lock_msg = next(m for m in r3_msgs if m["message_type"] == "NASH_EQUILIBRIUM_CLEARED")
    assert lock_msg["proposed_alpha"] == 1.0000

    # Staking allocation lock from peer_votes
    votes = {v["agent_id"]: v["alpha_star"] for v in res["peer_votes"]}
    assert votes["AGT-04"] == 0.4000
    assert votes["AGT-02"] == 0.3500
    assert votes["AGT-03"] == 0.2500
    assert votes["AGT-05"] == 0.0000
    assert (votes["AGT-04"] + votes["AGT-02"] + votes["AGT-03"]) == pytest.approx(1.0, 1e-6)

    # 4 EIP-712 Signatures
    assert len(res["quorum_signatures"]) == 4

    # On-chain Escrow execution
    assert res["tx_result"] is not None
    assert res["tx_result"]["tx_hash"].startswith("0x")
    assert res["tx_result"]["tx_mode"] in ("LIVE_RPC_BROADCAST", "REPLAY_OF_VERIFIED_TESTNET_TX")


# ==============================================================================
# 2. ADVERSARIAL & SYBIL RESILIENCE TESTS
# ==============================================================================

def test_scenario_b_redteam_prompt_injection(fsm_runner):
    """
    Verifies that Scenario B intercepts prompt injection, sets BLOCKED_ADVERSARIAL,
    and logs the intercept without negotiating or disbursing funds.
    """
    res = fsm_runner.run_scenario("SCENARIO_B_REDTEAM")

    assert res["status"] == "BLOCKED_ADVERSARIAL"
    assert "INJECTION" in res["error"]
    assert FSMState.BLOCKED_ADVERSARIAL.value in res["fsm_trace"]
    assert FSMState.SYNDICATE_P2P_NEGOTIATION.value not in res["fsm_trace"]
    assert len(res.get("cnp_messages", [])) == 0


def test_scenario_c_sybil_wash_and_monsoon_bailout(fsm_runner):
    """
    Verifies that Scenario C detects circular wash collusion, suspends the facility,
    and transitions safely to FLASH_BAILOUT_ACTIVE.
    """
    res = fsm_runner.run_scenario("SCENARIO_C_SYBIL_WASH")

    assert res["status"] == "FLASH_BAILOUT_ACTIVE"
    assert FSMState.FLASH_BAILOUT_ACTIVE.value in res["fsm_trace"]
    assert FSMState.SYNDICATE_P2P_NEGOTIATION.value not in res["fsm_trace"]
    assert res.get("bailout_result") is not None
    assert res["bailout_result"]["status"] == "SUCCESS"
    assert "tx_hash" in res["bailout_result"]


# ==============================================================================
# 3. POST-LENDING REPAYMENT SWEEP & BANGLA VOICE-BOT TESTS
# ==============================================================================

def test_simulated_30day_repayment_sweep(fsm_runner):
    """
    Verifies 30 daily automated sweeps, Bangla voice-bot nudge telemetry,
    and 1.0% APR peer yield distribution.
    """
    sweep = fsm_runner.run_repayment_sweep(
        facility_id="INV-2026-DHAKA-001",
        amount_bdt=45462.33,
    )

    assert sweep["status"] == "REPAID_AND_YIELD_DISTRIBUTED"
    assert sweep["total_repaid_bdt"] == 45462.33
    assert sweep["daily_installment_bdt"] == 1515.41
    assert sweep["days_swept"] == 30

    # Check Bangla Voice-Bot Telemetry
    telemetry = sweep["voice_bot_telemetry"]
    assert telemetry["language"] == "bn-BD"
    assert telemetry["cost_per_nudge_usd"] < 0.001  # 1/15th cost of standard IVR
    assert "আসসালামু আলাইকুম" in telemetry["audio_transcription"]

    # Check Peer Yield Distribution
    dist = sweep["peer_yield_distribution"]
    assert dist["total_yield_distributed_bdtc"] == 37.37  # 45,462.33 * 0.01 * (30/365)
    assert dist["AGT-04"]["stake_bdt"] == 18184.93
    assert dist["AGT-02"]["stake_bdt"] == 15911.82
    assert dist["AGT-03"]["stake_bdt"] == 11365.58

    # On-Chain Sweep TX Result
    assert sweep["onchain_tx"] is not None
    assert sweep["onchain_tx"]["tx_hash"].startswith("0x")


# ==============================================================================
# 4. FASTAPI & NEXT.JS BFF ROUTE HANDLERS
# ==============================================================================

def test_fastapi_health(api_client):
    resp = api_client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "kendra-core-engine"


def test_fastapi_execute_scenario_a(api_client):
    payload = {
        "scenario": "SCENARIO_A_VALID",
        "borrower_id": "AGT-01",
        "principal_bdt": 45000.0,
        "tenor_days": 30,
    }
    resp = api_client.post("/api/kendra/execute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert len(data["cnp_messages"]) >= 10
    assert len(data["quorum_signatures"]) == 4


def test_fastapi_repay_endpoint(api_client):
    payload = {
        "facility_id": "INV-2026-DHAKA-001",
        "amount_bdt": 45462.33,
    }
    resp = api_client.post("/api/kendra/repay", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "REPAID_AND_YIELD_DISTRIBUTED"
    assert data["total_repaid_bdt"] == 45462.33
    assert data["voice_bot_telemetry"]["language"] == "bn-BD"


def test_fastapi_bailout_endpoint(api_client):
    payload = {
        "facility_id": "INV-MONSOON-003",
        "trigger_reason": "COVARIANT_MONSOON_FLOODING_EXOGENOUS_SHOCK",
    }
    resp = api_client.post("/api/kendra/bailout", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "BAILED_OUT_WITHOUT_PENALTY"
    assert data["collateral_status"] == "UNLOCKED_NO_SLASHING"


def test_fastapi_state_endpoint(api_client):
    resp = api_client.get("/api/kendra/state")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert "current_facility" in data
    assert "guarantor_quorum" in data
    assert len(data["guarantor_quorum"]) >= 4


# ==============================================================================
# 5. EXPORTED JSON TRACES VERIFICATION
# ==============================================================================

def test_trace_files_exist_and_valid():
    """
    Verifies that docs/traces/scenario_{a,b,c}_trace.json exist,
    parse cleanly as JSON, and contain full state transition data.
    """
    traces_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "traces")
    
    files = {
        "scenario_a_valid_trace.json": "SUCCESS",
        "scenario_b_redteam_trace.json": "BLOCKED_ADVERSARIAL",
        "scenario_c_bailout_trace.json": "FLASH_BAILOUT_ACTIVE",
    }

    for filename, expected_status in files.items():
        filepath = os.path.join(traces_dir, filename)
        assert os.path.exists(filepath), f"Missing trace file: {filepath}"
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert data["status"] == expected_status
            assert "fsm_trace" in data
            assert len(data["fsm_trace"]) >= 2
