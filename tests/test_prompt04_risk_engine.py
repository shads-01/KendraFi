"""
tests/test_prompt04_risk_engine.py
Automated Test Suite for Prompt 04: Tier-2 Deterministic Python Risk Engine.
2026 Shenzhen International FinTechathon — Tsinghua PBCSF & WeBank.

Verifies:
1. Exact ACT/365 DSCR and Gross Repayment (R_1 = 45,462.33 BDT, DSCR = 1.6800x >= 1.25)
2. Circular A -> B -> A wash-trading discounting
3. Proportional Besley-Coate staking with 40% session-key cap and exact BDT liabilities:
   AGT-04: 40.0% (18,184.93 BDT)
   AGT-02: 35.0% (15,911.82 BDT)
   AGT-03: 25.0% (11,365.58 BDT)
   AGT-05: 0.0% (0.00 BDT, abstained)
   Sum: 45,462.33 BDT (100.0% of R_1)
4. Economically grounded Nash Expected Utility E[U_j] under continuation value delta*V_j:
   +169.85, +64.12, +51.40, -142.60 BDT
5. Spatio-temporal collusion entropy H_st >= 0.65 in normal operation and SYBIL_WASH_COLLUSION_HOLD on attack
6. End-to-end facility audit pipeline
"""

import json
import math
import os
import pytest
import numpy as np

from api.core.risk_engine import (
    DeterministicRiskEngine,
    RECONCILED_BENCHMARK_CONSTANTS,
    RECONCILED_NASH_UTILITIES,
)
from api.core.schemas import PeerAgentVote


SANDBOX_JSON_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "api",
    "data",
    "dhaka_kendra_90d.json",
)

FIXTURE_SCENARIO_C_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "api",
    "data",
    "fixtures",
    "scenario_c_sybil_wash.json",
)


@pytest.fixture(scope="module")
def sandbox_data():
    with open(SANDBOX_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ==============================================================================
# TEST SUITE 1: ACT/365 GROSS REPAYMENT & EXACT MATH
# ==============================================================================

def test_compute_gross_repayment_act365():
    """
    Validates exact ACT/365 Gross Repayment:
    R_1 = round(45000 * (1.0 + 0.125 * (30 / 365.0)), 2) == 45,462.33 BDT.
    Strictly forbids 45,468 discrepancy.
    """
    principal = 45000.0
    tenor_days = 30
    borrower_apr = 0.1250

    gross = DeterministicRiskEngine.compute_gross_repayment(
        principal=principal,
        tenor_days=tenor_days,
        borrower_apr=borrower_apr,
    )

    assert gross == 45462.33, f"Expected 45462.33, got {gross}"
    assert gross != 45468.00, "Violated Rule 5: Used obsolete 45,468 value"


# ==============================================================================
# TEST SUITE 2: NATIVE SANDBOX DSCR EVALUATION
# ==============================================================================

def test_compute_dscr_agt01_native_sandbox(sandbox_data):
    """
    Validates deterministic DSCR calculation on AGT-01 90-day cash flow series:
    DSCR == 1.6800x >= 1.25.
    """
    agt1 = sandbox_data["agents"]["AGT-01"]
    daily_cashflows = agt1["daily_cashflows"]
    c_sub = float(agt1["profile"]["c_sub"])

    dscr, gross_rep, proj_cf = DeterministicRiskEngine.compute_dscr(
        daily_cashflows=daily_cashflows,
        c_sub=c_sub,
        principal=45000.0,
        tenor_days=30,
        borrower_apr=0.1250,
    )

    assert gross_rep == 45462.33
    assert dscr == 1.6800, f"Expected 1.6800, got {dscr}"
    assert dscr >= RECONCILED_BENCHMARK_CONSTANTS["dscr_threshold"]
    assert proj_cf > gross_rep


# ==============================================================================
# TEST SUITE 3: CIRCULAR WASH-TRADING FILTER & DISCOUNTING
# ==============================================================================

def test_filter_circular_wash_transfers_clean_graph(sandbox_data):
    """
    Validates that healthy retail MFS graph has 0% circular wash volume.
    """
    clean_txs, wash_vol, wash_ratio = DeterministicRiskEngine.filter_circular_wash_transfers(
        sandbox_data["mfs_tx_graph"]
    )
    assert wash_vol == 0.0
    assert wash_ratio == 0.0
    assert len(clean_txs) == len(sandbox_data["mfs_tx_graph"])


def test_filter_circular_wash_transfers_attack_graph(sandbox_data):
    """
    Validates that circular wash fixture with A -> B -> C -> A loop is accurately detected and discounted.
    """
    wash_graph = sandbox_data["wash_trading_tx_graph"]
    clean_txs, wash_vol, wash_ratio = DeterministicRiskEngine.filter_circular_wash_transfers(wash_graph)

    assert wash_vol > 0.0
    assert wash_ratio > 0.50
    assert len(clean_txs) == 0  # All transactions in wash fixture are circular


def test_circular_wash_discounts_inflow_before_dscr():
    """
    Validates that injecting circular wash transfers discounts net cash flow before computing DSCR.
    """
    synthetic_cashflows = [
        {"day_index": i, "inflow_bdt": 8500.0, "outflow_bdt": 3450.0, "net_flow_bdt": 5050.0}
        for i in range(1, 91)
    ]
    # Clean baseline DSCR
    dscr_clean, _, _ = DeterministicRiskEngine.compute_dscr(
        daily_cashflows=synthetic_cashflows,
        c_sub=2200.0,
        principal=45000.0,
        tenor_days=30,
    )

    # Poisoned with circular wash transactions
    wash_txs = [
        {"tx_id": f"W-{i}", "sender_hash": "0xA", "receiver_hash": "0xB", "amount_bdt": 50000.0, "is_circular_wash": True}
        for i in range(5)
    ]

    dscr_discounted, _, _ = DeterministicRiskEngine.compute_dscr(
        daily_cashflows=synthetic_cashflows,
        c_sub=2200.0,
        principal=45000.0,
        tenor_days=30,
        mfs_tx_graph=wash_txs,
    )

    assert dscr_discounted < dscr_clean, "DSCR must decrease after discounting wash inflows"


# ==============================================================================
# TEST SUITE 4: PROPORTIONAL BESLEY-COATE STAKING ALLOCATION
# ==============================================================================

def test_allocate_besley_coate_stakes_exact_values(sandbox_data):
    """
    Validates Ghatak assortative weights, 40% cap, proportional deficit redistribution,
    and paisa-exact liability sums:
    AGT-04: 40.0% (18,184.93 BDT)
    AGT-02: 35.0% (15,911.82 BDT)
    AGT-03: 25.0% (11,365.58 BDT)
    AGT-05: 0.0% (0.00 BDT, abstained)
    Total = 45,462.33 BDT
    """
    res = DeterministicRiskEngine.allocate_besley_coate_stakes(
        agents_dict=sandbox_data["agents"],
        borrower_id="AGT-01",
        gross_repayment=45462.33,
    )

    stakes = res["stakes"]
    bdt = res["bdt_liabilities"]
    votes = res["votes"]

    # Stakes fractions
    assert stakes["AGT-04"] == 0.4000
    assert stakes["AGT-02"] == 0.3500
    assert stakes["AGT-03"] == 0.2500
    assert stakes["AGT-05"] == 0.0000

    # BDT liabilities
    assert bdt["AGT-04"] == 18184.93
    assert bdt["AGT-02"] == 15911.82
    assert bdt["AGT-03"] == 11365.58
    assert bdt["AGT-05"] == 0.00

    # Total locked equals exactly R_1
    assert res["total_locked_bdt"] == 45462.33
    assert sum(bdt.values()) == 45462.33

    # Peer votes structures
    vote_map = {v.agent_id: v for v in votes}
    assert vote_map["AGT-04"].decision == "SIGNED_EIP712"
    assert vote_map["AGT-02"].decision == "SIGNED_EIP712"
    assert vote_map["AGT-03"].decision == "SIGNED_EIP712"
    assert vote_map["AGT-05"].decision == "ABSTAINED_CV_EXCEEDED"
    assert "CV" in vote_map["AGT-05"].abstention_reason


# ==============================================================================
# TEST SUITE 5: ECONOMICALLY GROUNDED NASH EXPECTED UTILITY
# ==============================================================================

def test_economically_grounded_nash_utility_benchmarks():
    """
    Validates Besley-Coate Nash expected utility values:
    AGT-04: +169.85 BDT
    AGT-02: +64.12 BDT
    AGT-03: +51.40 BDT
    AGT-05: -142.60 BDT
    """
    u4 = DeterministicRiskEngine.compute_expected_utility("AGT-04", 0.40, 85000.0, 950.0 / 11200.0)
    u2 = DeterministicRiskEngine.compute_expected_utility("AGT-02", 0.35, 48000.0, 1950.0 / 6200.0)
    u3 = DeterministicRiskEngine.compute_expected_utility("AGT-03", 0.25, 34642.85, 1100.0 / 5400.0)
    u5 = DeterministicRiskEngine.compute_expected_utility("AGT-05", 0.00, 12000.0, 2600.0 / 4100.0)

    assert u4 == 169.85
    assert u2 == 64.12
    assert u3 == 51.40
    assert u5 == -142.60

    # Active guarantors have positive expected utility
    assert u4 > 0
    assert u2 > 0
    assert u3 > 0
    # Stressed node has negative expected utility
    assert u5 < 0


def test_continuation_value_calculation():
    """
    Validates formula for continuation value delta*V_j:
    delta * ((0.240 - 0.125) / 365 * 30) * (1.5 * B_j) * alpha_j
    """
    cv = DeterministicRiskEngine.compute_continuation_value(
        b_buffer=85000.0,
        alpha=0.40,
        tenor_days=30,
    )
    # Expected: 0.95 * (0.115 / 365 * 30) * (1.5 * 85000) * 0.40 = 457.95
    assert abs(cv - 457.95) < 0.1


# ==============================================================================
# TEST SUITE 6: SPATIO-TEMPORAL COLLUSION ENTROPY
# ==============================================================================

def test_spatio_temporal_collusion_entropy_normal_operation(sandbox_data):
    """
    Validates that normal Karwan Bazar operations output H_st >= 0.65,
    rho_max <= 0.85, circular wash <= 0.05, and pass verification.
    """
    inflows = {aid: [x["inflow_bdt"] for x in d["daily_cashflows"]] for aid, d in sandbox_data["agents"].items()}
    is_valid, alert_reason, metrics = DeterministicRiskEngine.compute_collusion_entropy(
        mfs_tx_graph=sandbox_data["mfs_tx_graph"],
        inflow_series_dict=inflows,
    )

    assert is_valid is True
    assert alert_reason is None
    assert metrics["h_st"] >= RECONCILED_BENCHMARK_CONSTANTS["entropy_threshold"]
    assert metrics["rho_max"] <= RECONCILED_BENCHMARK_CONSTANTS["rho_max_threshold"]
    assert metrics["circular_wash_ratio"] <= RECONCILED_BENCHMARK_CONSTANTS["circular_wash_ratio_max"]


def test_spatio_temporal_collusion_entropy_scenario_c():
    """
    Validates that Scenario C Sybil Wash attack fails immediately with SYBIL_WASH_COLLUSION_HOLD.
    """
    is_valid, alert_reason, metrics = DeterministicRiskEngine.compute_collusion_entropy(
        scenario_id="SCENARIO_C_SYBIL_WASH"
    )

    assert is_valid is False
    assert alert_reason == "SYBIL_WASH_COLLUSION_HOLD"
    assert metrics["h_st"] < RECONCILED_BENCHMARK_CONSTANTS["entropy_threshold"]
    assert metrics["circular_wash_ratio"] > RECONCILED_BENCHMARK_CONSTANTS["circular_wash_ratio_max"]


# ==============================================================================
# TEST SUITE 7: COMPLETE FACILITY AUDIT PIPELINE
# ==============================================================================

def test_audit_syndicate_facility_full_flow():
    """
    Validates the end-to-end Tier-2 audit pipeline on standard Scenario A.
    """
    audit = DeterministicRiskEngine.audit_syndicate_facility(
        scenario_id="SCENARIO_A_VALID",
        borrower_id="AGT-01",
        principal=45000.0,
        tenor_days=30,
    )

    assert audit["dscr"] == 1.6800
    assert audit["dscr_pass"] is True
    assert audit["gross_repayment_bdt"] == 45462.33
    assert audit["total_locked_bdt"] == 45462.33
    assert audit["entropy_pass"] is True
    assert audit["entropy_alert"] is None
    assert len(audit["peer_votes"]) == 4

    # Check vote serialization
    vote_decision_map = {v["agent_id"]: v["decision"] for v in audit["peer_votes"]}
    assert vote_decision_map["AGT-04"] == "SIGNED_EIP712"
    assert vote_decision_map["AGT-02"] == "SIGNED_EIP712"
    assert vote_decision_map["AGT-03"] == "SIGNED_EIP712"
    assert vote_decision_map["AGT-05"] == "ABSTAINED_CV_EXCEEDED"
