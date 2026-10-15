#!/usr/bin/env python3
"""
api/data/generate_sandbox.py
Deterministic 90-Day Karwan Bazar Sandbox Generator for KendraFi (Weiyedai-Global).
2026 Shenzhen International FinTechathon — Tsinghua PBCSF & WeBank.

This script uses np.random.default_rng(seed=2026) to generate 90 days (July 15 - October 12, 2026)
of calibrated MFS cash flows, transfer graphs, circular wash-trading loops, and monsoon shocks.

All numbers are mathematically reconciled against CONTEXT.md (Zero LLM Math).
"""

import json
import math
import os
from datetime import date, timedelta
from typing import Dict, Any, List, Tuple
import numpy as np
from web3 import Web3


def standardize_array(arr: np.ndarray, target_mean: float, target_std: float) -> np.ndarray:
    """Standardizes array to exact target sample mean and sample standard deviation (ddof=1)."""
    current_mean = np.mean(arr)
    current_std = np.std(arr, ddof=1)
    if current_std == 0:
        return np.full_like(arr, target_mean)
    standardized = (arr - current_mean) / current_std
    calibrated = target_mean + target_std * standardized
    return np.round(calibrated, 2)


def generate_90d_sandbox() -> Dict[str, Any]:
    rng = np.random.default_rng(seed=2026)
    start_date = date(2026, 7, 15)
    days_count = 90
    date_strings = [(start_date + timedelta(days=i)).isoformat() for i in range(days_count)]
    timestamps_sec = [int(1784073600 + i * 86400) for i in range(days_count)]  # July 15, 2026 00:00:00 UTC

    # 1. Configured Agents & Personas
    agents_spec = {
        "AGT-01": {
            "name": "Rahim Store",
            "business": "Retail Grocery & Rice (Karwan Bazar)",
            "role": "Active Borrower (Scenario A)",
            "mean_in": 8500.00,
            "std_in": 1400.00,
            "mean_out": 3450.00,
            "mean_net": 5050.00,
            "std_net": 1012.35,
            "c_sub": 2200.00,
            "b_buffer": 55000.00,
            "p_survival": 0.9850,
            "supplier_id": "MEGHNA-01",
            "supplier_name": "Meghna Group Wholesale (Grains & Oils)",
            "supplier_wallet": Web3.to_checksum_address("0x71C0000000000000000000000000000000000A91"),
            "agent_wallet": Web3.to_checksum_address("0x1111111111111111111111111111111111111111"),
            "is_kyb_verified": True
        },
        "AGT-02": {
            "name": "Fatema Textiles",
            "business": "Tailoring & Fabrics (Islampur)",
            "role": "Lead Peer Guarantor (35% stake)",
            "mean_in": 6200.00,
            "std_in": 1950.00,
            "mean_out": 3100.00,
            "mean_net": 3100.00,
            "std_net": 850.00,
            "c_sub": 1800.00,
            "b_buffer": 48000.00,
            "p_survival": 0.9700,
            "supplier_id": "ISLAMPUR-02",
            "supplier_name": "Islampur Fabric Mills",
            "supplier_wallet": Web3.to_checksum_address("0x82D0000000000000000000000000000000000B42"),
            "agent_wallet": Web3.to_checksum_address("0x2222222222222222222222222222222222222222"),
            "is_kyb_verified": True
        },
        "AGT-03": {
            "name": "Kamal Agro",
            "business": "Vegetable & Spice Stall (Karwan Bazar)",
            "role": "Peer Guarantor (25% stake)",
            "mean_in": 5400.00,
            "std_in": 1100.00,
            "mean_out": 2800.00,
            "mean_net": 2600.00,
            "std_net": 680.00,
            "c_sub": 1500.00,
            "b_buffer": 34642.85,
            "p_survival": 0.9600,
            "supplier_id": "SHYAMOLI-03",
            "supplier_name": "Shyamoli Cold Storage & Agro Spices",
            "supplier_wallet": Web3.to_checksum_address("0x93E0000000000000000000000000000000000C18"),
            "agent_wallet": Web3.to_checksum_address("0x3333333333333333333333333333333333333333"),
            "is_kyb_verified": True
        },
        "AGT-04": {
            "name": "Nasrin Pharmacy",
            "business": "Dispensary & Medicine (Dhanmondi)",
            "role": "Anchor Guarantor (40% capped stake)",
            "mean_in": 11200.00,
            "std_in": 950.00,
            "mean_out": 5600.00,
            "mean_net": 5600.00,
            "std_net": 920.00,
            "c_sub": 2500.00,
            "b_buffer": 85000.00,
            "p_survival": 0.9920,
            "supplier_id": "SQUARE-04",
            "supplier_name": "Square Pharma Central Depot",
            "supplier_wallet": Web3.to_checksum_address("0xA4F0000000000000000000000000000000000D77"),
            "agent_wallet": Web3.to_checksum_address("0x4444444444444444444444444444444444444444"),
            "is_kyb_verified": True
        },
        "AGT-05": {
            "name": "Sohel Electronics",
            "business": "Mobile Repairs & Parts (Patuatuli)",
            "role": "Adversarial / Stressed Node (Abstained, CV=0.634)",
            "mean_in": 4100.00,
            "std_in": 2600.00,
            "mean_out": 2500.00,
            "mean_net": 1600.00,
            "std_net": 1800.00,
            "c_sub": 1400.00,
            "b_buffer": 12000.00,
            "p_survival": 0.8900,
            "supplier_id": "PATUATULI-99",
            "supplier_name": "Patuatuli Parts Hub (Unverified Wholesaler)",
            "supplier_wallet": Web3.to_checksum_address("0xDead00000000000000000000000000000000Beef"),
            "agent_wallet": Web3.to_checksum_address("0x5555555555555555555555555555555555555555"),
            "is_kyb_verified": False
        }
    }

    # 2. Generate Time Series
    agents_data = {}
    mfs_transactions = []

    for agent_id, spec in agents_spec.items():
        if agent_id == "AGT-01":
            # Target exact net mean 5050.00 and net std 1012.35
            raw_net = rng.normal(size=days_count)
            calibrated_net = standardize_array(raw_net, spec["mean_net"], spec["std_net"])
            # Outflows bounded in [2000, 4900] with mean 3450.00
            raw_out = rng.uniform(2000, 4900, size=days_count)
            calibrated_out = np.round(spec["mean_out"] + (raw_out - np.mean(raw_out)), 2)
            calibrated_in = np.round(calibrated_net + calibrated_out, 2)
        elif agent_id == "AGT-05":
            # High volatility node: Gamma distributed inflows ensuring min >= 500, mean 4100, std 2600
            raw_in = rng.gamma(shape=2.5, scale=1640, size=days_count)
            calibrated_in = np.round(4100.00 + 2600.00 * (raw_in - np.mean(raw_in)) / np.std(raw_in, ddof=1), 2)
            calibrated_in = np.maximum(calibrated_in, 500.00)
            calibrated_in = np.round(4100.00 + 2600.00 * (calibrated_in - np.mean(calibrated_in)) / np.std(calibrated_in, ddof=1), 2)
            raw_out = rng.uniform(1200, 3800, size=days_count)
            calibrated_out = np.round(spec["mean_out"] + (raw_out - np.mean(raw_out)), 2)
            calibrated_net = np.round(calibrated_in - calibrated_out, 2)
        else:
            # AGT-02, AGT-03, AGT-04
            raw_net = rng.normal(size=days_count)
            calibrated_net = standardize_array(raw_net, spec["mean_net"], spec["std_net"])
            raw_out = rng.uniform(spec["mean_out"] * 0.6, spec["mean_out"] * 1.4, size=days_count)
            calibrated_out = np.round(spec["mean_out"] + (raw_out - np.mean(raw_out)), 2)
            calibrated_in = np.round(calibrated_net + calibrated_out, 2)

        # Build daily records
        daily_records = []
        for d_idx in range(days_count):
            in_val = max(0.0, float(calibrated_in[d_idx]))
            out_val = max(0.0, float(calibrated_out[d_idx]))
            net_val = float(calibrated_net[d_idx])
            record = {
                "day_index": d_idx + 1,
                "date": date_strings[d_idx],
                "timestamp_sec": timestamps_sec[d_idx],
                "inflow_bdt": in_val,
                "outflow_bdt": out_val,
                "net_flow_bdt": net_val,
                "mfs_provider": "bKash" if d_idx % 2 == 0 else "Nagad"
            }
            daily_records.append(record)

            # Generate synthetic customer MFS transactions
            num_txs = int(rng.integers(3, 8))
            for tx_i in range(num_txs):
                tx_amount = round(in_val / num_txs, 2)
                sender_hash = Web3.keccak(text=f"customer_{agent_id}_{d_idx}_{tx_i}").hex()[:18]
                tx_obj = {
                    "tx_id": f"TX-{agent_id}-{d_idx+1:02d}-{tx_i+1:02d}",
                    "sender_hash": sender_hash,
                    "receiver_hash": spec["agent_wallet"],
                    "amount_bdt": tx_amount,
                    "timestamp_sec": timestamps_sec[d_idx] + int(tx_i * 3600),
                    "sender_agent_id": None,
                    "receiver_agent_id": agent_id,
                    "category": "RETAIL_SALE",
                    "is_circular_wash": False
                }
                mfs_transactions.append(tx_obj)

        agents_data[agent_id] = {
            "profile": spec,
            "metrics": {
                "sample_mean_inflow": float(np.mean(calibrated_in)),
                "sample_std_inflow": float(np.std(calibrated_in, ddof=1)),
                "sample_mean_outflow": float(np.mean(calibrated_out)),
                "sample_mean_net": float(np.mean(calibrated_net)),
                "sample_std_net": float(np.std(calibrated_net, ddof=1)),
                "cv_inflow": float(np.std(calibrated_in, ddof=1) / np.mean(calibrated_in)),
                "sample_size_days": days_count
            },
            "daily_cashflows": daily_records
        }

    # 3. Create Circular Wash-Trading Fixture (Scenario C attack graph)
    # Circle: AGT-05 -> DummyB -> DummyC -> AGT-05
    wash_trading_fixture = []
    base_ts = timestamps_sec[45]  # Day 46
    wallet_a = agents_spec["AGT-05"]["agent_wallet"]
    wallet_b = Web3.to_checksum_address("0xBAAA000000000000000000000000000000000001")
    wallet_c = Web3.to_checksum_address("0xCAAA000000000000000000000000000000000002")

    for loop_i in range(5):
        ts = base_ts + loop_i * 1800
        wash_trading_fixture.extend([
            {
                "tx_id": f"WASH-LOOP-{loop_i+1}-AB",
                "sender_hash": wallet_a,
                "receiver_hash": wallet_b,
                "amount_bdt": 25000.00,
                "timestamp_sec": ts,
                "category": "CIRCULAR_WASH",
                "is_circular_wash": True
            },
            {
                "tx_id": f"WASH-LOOP-{loop_i+1}-BC",
                "sender_hash": wallet_b,
                "receiver_hash": wallet_c,
                "amount_bdt": 24900.00,
                "timestamp_sec": ts + 300,
                "category": "CIRCULAR_WASH",
                "is_circular_wash": True
            },
            {
                "tx_id": f"WASH-LOOP-{loop_i+1}-CA",
                "sender_hash": wallet_c,
                "receiver_hash": wallet_a,
                "amount_bdt": 24800.00,
                "timestamp_sec": ts + 600,
                "category": "CIRCULAR_WASH",
                "is_circular_wash": True
            }
        ])

    # 4. Create Monsoon Covariant Shock Series (August 20 - September 2, 2026: Days 37-50)
    # 14 days where >= 4 merchants suffer a >40% inflow drop
    monsoon_shock = {
        "event_name": "Dhaka Severe Monsoon Flash Flooding 2026",
        "affected_days": 14,
        "start_date": "2026-08-20",
        "end_date": "2026-09-02",
        "shock_magnitude": 0.45,  # 45% drop in daily inflow
        "affected_agents": ["AGT-01", "AGT-02", "AGT-03", "AGT-05"],  # 4 of 5 merchants (>= 80% quorum)
        "covariate_classification": "EXOGENOUS_WEATHER_SHOCK",
        "policy_action": "BESLEY_COATE_FLASH_BAILOUT_AND_14D_GRACE"
    }

    # 5. Assemble Final Sandbox JSON
    sandbox_payload = {
        "metadata": {
            "dataset_name": "Dhaka Karwan Bazar 90-Day MFS Sandbox",
            "seed": 2026,
            "generated_for": "2026 Shenzhen International FinTechathon (Topic E & F)",
            "start_date": "2026-07-15",
            "end_date": "2026-10-12",
            "total_days": 90,
            "standard_borrower": "AGT-01",
            "reconciled_benchmark_constants": {
                "principal_bdt": 45000.00,
                "tenor_days": 30,
                "borrower_apr": 0.1250,
                "gross_repayment_bdt": 45462.33,
                "daily_mfs_sweep_bdt": 1515.41,
                "supplier_mdr_rate": 0.0150,
                "supplier_mdr_bdt": 675.00,
                "net_supplier_payout_bdt": 44325.00,
                "dscr_target": 1.6800,
                "expected_stakes": {
                    "AGT-04": 0.4000,
                    "AGT-02": 0.3500,
                    "AGT-03": 0.2500,
                    "AGT-05": 0.0000
                }
            }
        },
        "agents": agents_data,
        "mfs_tx_graph": mfs_transactions[:200],  # Curated subset for compact size
        "wash_trading_tx_graph": wash_trading_fixture,
        "sybil_supplier_ids": [
            "PATUATULI-99",
            "0xDead00000000000000000000000000000000Beef"
        ],
        "monsoon_shock_series": monsoon_shock
    }

    return sandbox_payload


def compute_dscr_test(agent_dict: Dict[str, Any], principal: float = 45000.0, tenor_days: int = 30) -> Tuple[float, float, float]:
    """Pure mathematical DSCR evaluation according to Rule 1 & Rule 5."""
    r_apr = 0.1250
    gross_repayment = round(principal * (1.0 + r_apr * (tenor_days / 365.0)), 2)

    net_flows = [d["net_flow_bdt"] for d in agent_dict["daily_cashflows"]]
    mu_net = float(np.mean(net_flows))
    sigma_net = float(np.std(net_flows, ddof=1))
    c_sub = float(agent_dict["profile"]["c_sub"])
    z_95 = 1.645

    projected_cf = (mu_net - c_sub) * tenor_days - z_95 * sigma_net * math.sqrt(tenor_days)
    dscr = round(projected_cf / gross_repayment, 4)

    return dscr, gross_repayment, round(projected_cf, 2)


def allocate_stakes_test(agents: Dict[str, Any], gross_repayment: float = 45462.33) -> Dict[str, float]:
    """Evaluates proportional Besley-Coate staking allocation according to Prompt 01 and CONTEXT.md."""
    weights = {}
    for agent_id, data in agents.items():
        if agent_id == "AGT-01":
            continue  # Borrower does not guarantee own facility
        cv = data["metrics"]["cv_inflow"]
        p = data["profile"]["p_survival"]
        b = data["profile"]["b_buffer"]

        if cv > 0.55 or p < 0.90:
            weights[agent_id] = 0.0
        else:
            weights[agent_id] = p * max(0.0, b)

    active_weight_sum = sum(weights.values())
    raw_stakes = {k: v / active_weight_sum for k, v in weights.items()}

    final_stakes = {}
    capped_agents = []
    uncapped_agents = []

    for k, v in raw_stakes.items():
        if v > 0.40:
            final_stakes[k] = 0.4000
            capped_agents.append(k)
        elif v == 0.0:
            final_stakes[k] = 0.0000
        else:
            uncapped_agents.append(k)

    remaining_deficit = 1.0 - sum(final_stakes.values())
    uncapped_weights_sum = sum(weights[k] for k in uncapped_agents)

    for k in uncapped_agents:
        proportional_share = remaining_deficit * (weights[k] / uncapped_weights_sum)
        final_stakes[k] = round(proportional_share, 4)

    return final_stakes


def main():
    print("=" * 70)
    print("KENDRAFI — 90-DAY KARWAN BAZAR DETERMINISTIC SANDBOX GENERATOR")
    print("=" * 70)

    sandbox = generate_90d_sandbox()

    # Verify AGT-01 DSCR
    dscr_1, gross_rep, cf_proj = compute_dscr_test(sandbox["agents"]["AGT-01"])
    print(f"[Verification 1] AGT-01 Gross Repayment: {gross_rep:.2f} BDT (Target: 45462.33 BDT)")
    print(f"[Verification 2] AGT-01 Projected Net Cashflow: {cf_proj:.2f} BDT (Target: 76376.71 BDT)")
    print(f"[Verification 3] AGT-01 ACT/365 DSCR: {dscr_1:.4f}x (Target: 1.6800x)")

    assert gross_rep == 45462.33, f"Gross repayment mismatch: {gross_rep} != 45462.33"
    assert dscr_1 == 1.6800, f"DSCR mismatch: {dscr_1} != 1.6800"

    # Verify Besley-Coate Proportional Stakes
    stakes = allocate_stakes_test(sandbox["agents"], gross_rep)
    print("\n[Verification 4] Besley-Coate Proportional Guarantee Stakes:")
    for a_id in ["AGT-04", "AGT-02", "AGT-03", "AGT-05"]:
        print(f"  * {a_id}: {stakes[a_id]:.4f} ({stakes[a_id]*100:.1f}%)")

    assert stakes["AGT-04"] == 0.4000, f"AGT-04 stake mismatch: {stakes['AGT-04']}"
    assert stakes["AGT-02"] == 0.3500, f"AGT-02 stake mismatch: {stakes['AGT-02']}"
    assert stakes["AGT-03"] == 0.2500, f"AGT-03 stake mismatch: {stakes['AGT-03']}"
    assert stakes["AGT-05"] == 0.0000, f"AGT-05 stake mismatch: {stakes['AGT-05']}"

    # Verify BDT Liability Sum
    stake_bdt_4 = round(gross_rep * stakes["AGT-04"], 2)
    stake_bdt_2 = round(gross_rep * stakes["AGT-02"], 2)
    stake_bdt_3 = round(gross_rep - stake_bdt_4 - stake_bdt_2, 2)
    total_locked = stake_bdt_4 + stake_bdt_2 + stake_bdt_3
    print(f"  * Total Locked BDT: {total_locked:.2f} BDT == Gross Repayment: {gross_rep:.2f} BDT")
    assert total_locked == gross_rep, "BDT stakes sum mismatch"

    # Output to File
    target_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(target_dir, exist_ok=True)
    out_path = os.path.join(target_dir, "dhaka_kendra_90d.json")

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(sandbox, f, indent=2)

    file_size_kb = os.path.getsize(out_path) / 1024
    print(f"\n[SUCCESS] Calibrated dataset written to: {out_path} ({file_size_kb:.1f} KB)")
    print("=" * 70)


if __name__ == "__main__":
    main()
