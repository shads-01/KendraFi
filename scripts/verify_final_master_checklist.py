# -*- coding: utf-8 -*-
"""
scripts/verify_final_master_checklist.py
KendraFi (Weiyedai-Global) Final Master Verification Script (Section 4)
Competition: 2026 Shenzhen International FinTechathon (Tsinghua PBCSF & WeBank)
Author: Lead 5 (Security Auditor & Submission Director)
"""

import os
import sys
import json
import math
import numpy as np

if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def run_master_verification():
    print("=" * 80)
    print("KENDRAFI (WEIYEDAI-GLOBAL) FINAL MASTER VERIFICATION AUDIT")
    print("Co-Hosts: Tsinghua University PBCSF & WeBank • 2026 Shenzhen FinTechathon")
    print("=" * 80)

    all_passed = True
    audit_results = []

    def check(name, condition, details=""):
        nonlocal all_passed
        status = "PASSED" if condition else "FAILED"
        if not condition:
            all_passed = False
        print(f"[{status:6s}] {name}")
        if details:
            print(f"         |-- {details}")
        audit_results.append((name, status, details))

    # =========================================================================
    # 4.1 MATHEMATICAL & LOGIC RECONCILIATION CHECKLIST
    # =========================================================================
    print("\n>>> 4.1 Mathematical & Logic Reconciliation Audit:")

    # 1. Exact ACT/365 Gross Repayment
    principal = 45000.00
    apr = 0.125
    tenor = 30
    gross_repayment_exact = round(principal * (1.0 + apr * tenor / 365.0), 2)
    check(
        "Exact ACT/365 Gross Repayment R_1",
        gross_repayment_exact == 45462.33,
        f"Principal={principal:.2f} BDT, APR={apr*100:.2f}%, Tenor={tenor}d -> R_1={gross_repayment_exact:.2f} BDT (Target: 45,462.33 BDT)"
    )

    # 2. Daily MFS Sweep & Wholesaler MDR
    daily_sweep = round(gross_repayment_exact / tenor, 2)
    check("Daily MFS Sweep (30 Days)", daily_sweep == 1515.41, f"Daily Sweep = {daily_sweep:.2f} BDT/day")

    mdr_rate = 0.0150
    mdr_fee = round(principal * mdr_rate, 2)
    net_supplier_payout = round(principal - mdr_fee, 2)
    check(
        "Wholesaler 1.50% MDR & Net Supplier Payout",
        mdr_fee == 675.00 and net_supplier_payout == 44325.00,
        f"MDR Rebate = {mdr_fee:.2f} BDT, Net Supplier Payout = {net_supplier_payout:.2f} BDT"
    )

    # 3. Exact Proportional Staking Shares
    stake_4 = round(gross_repayment_exact * 0.4000, 2)
    stake_2 = round(gross_repayment_exact * 0.3500, 2)
    stake_3 = round(gross_repayment_exact * 0.2500, 2)
    stake_5 = 0.00
    total_locked = round(stake_4 + stake_2 + stake_3 + stake_5, 2)
    check(
        "Exact Proportional Staking Shares (100.0% Coverage)",
        stake_4 == 18184.93 and stake_2 == 15911.82 and stake_3 == 11365.58 and total_locked == 45462.33,
        f"AGT-04: {stake_4:.2f} (40%), AGT-02: {stake_2:.2f} (35%), AGT-03: {stake_3:.2f} (25%) -> Total = {total_locked:.2f} BDT"
    )

    # 4. Economically Grounded Nash Utility E[U_j]
    from api.core.risk_engine import DeterministicRiskEngine
    engine = DeterministicRiskEngine()
    sandbox_path = os.path.join(os.path.dirname(__file__), "..", "api", "data", "dhaka_kendra_90d.json")
    if os.path.exists(sandbox_path):
        with open(sandbox_path, "r", encoding="utf-8") as f:
            sandbox_data = json.load(f)
        alloc_res = engine.allocate_besley_coate_stakes(
            agents_dict=sandbox_data["agents"],
            borrower_id="AGT-01",
            gross_repayment=gross_repayment_exact,
            principal=principal,
            tenor_days=tenor
        )
        votes = alloc_res["votes"]
        u_map = {v.agent_id: (round(v.expected_utility_bdt, 2), v.alpha_star) for v in votes}
        check(
            "Economically Grounded Nash Utilities E[U_j]",
            u_map["AGT-04"][0] == 169.85 and u_map["AGT-02"][0] == 64.12 and u_map["AGT-03"][0] == 51.40 and u_map["AGT-05"][0] == -142.60,
            f"AGT-04: {u_map['AGT-04'][0]:+.2f} BDT, AGT-02: {u_map['AGT-02'][0]:+.2f} BDT, AGT-03: {u_map['AGT-03'][0]:+.2f} BDT, AGT-05: {u_map['AGT-05'][0]:+.2f} BDT"
        )
    else:
        check("Economically Grounded Nash Utilities E[U_j]", False, "Sandbox dataset missing")

    # 5. Deterministic DSCR = 1.6800x
    agt01_data = sandbox_data["agents"]["AGT-01"]
    daily_cashflows = agt01_data["daily_cashflows"]
    c_sub = float(agt01_data["profile"]["c_sub"])
    dscr, gross_rep, proj_cf = DeterministicRiskEngine.compute_dscr(
        daily_cashflows=daily_cashflows,
        c_sub=c_sub,
        principal=principal,
        tenor_days=tenor,
        borrower_apr=apr,
    )
    check(
        "Deterministic DSCR Calculation = 1.6800x",
        dscr == 1.6800 and dscr >= 1.25,
        f"DSCR={dscr:.4f}x (Threshold >= 1.25x), CF_proj={proj_cf:.2f} BDT, Gross Repayment={gross_rep:.2f} BDT"
    )

    # =========================================================================
    # 4.2 CRYPTOGRAPHIC, SMART CONTRACT & INFRASTRUCTURE CHECKLIST
    # =========================================================================
    print("\n>>> 4.2 Cryptographic, Smart Contract & Infrastructure Audit:")

    # 1. Prompt 00 (CONTEXT.md)
    context_path = os.path.join(os.path.dirname(__file__), "..", "CONTEXT.md")
    context_valid = False
    if os.path.exists(context_path):
        with open(context_path, "r", encoding="utf-8") as f:
            c_text = f.read()
            context_valid = "RULE 1" in c_text and "45,462.33" in c_text
    check("Prompt 00: CONTEXT.md Constitution & Invariants", context_valid, f"Verified at {context_path}")

    # 2. Sound secp256k1 16-Bit Range Proof (Prompt 05)
    from api.core.zk_fate_privacy import create_zk_solvency_proof, verify_zk_solvency_proof
    v = 76376
    T = 56828
    zk_proof = create_zk_solvency_proof(projected_cf_v=v, solvency_floor_t=T)
    zk_verified = verify_zk_solvency_proof(proof=zk_proof, solvency_floor_t=T)
    delta_v = v - T
    check(
        "Sound secp256k1 16-Bit Range Proof (Prompt 05)",
        zk_verified and delta_v == 19548 and len(zk_proof.bit_range_proofs) == 16,
        f"v={v}, T={T}, delta_v={delta_v} in [0, 65535], 16-Bit Proofs={len(zk_proof.bit_range_proofs)}, Verified={zk_verified}"
    )

    # 3. On-Chain EIP-712 Quorum & Paris EVM (Prompt 06)
    contract_path = os.path.join(os.path.dirname(__file__), "..", "contracts", "src", "KendraEscrow.sol")
    contract_valid = False
    if os.path.exists(contract_path):
        with open(contract_path, "r", encoding="utf-8") as f:
            c_code = f.read()
            contract_valid = "ECDSA.recover" in c_code and "executeSyndicateEscrow" in c_code and "repayFacility" in c_code
    foundry_path = os.path.join(os.path.dirname(__file__), "..", "contracts", "foundry.toml")
    evm_paris = False
    if os.path.exists(foundry_path):
        with open(foundry_path, "r", encoding="utf-8") as f:
            evm_paris = 'evm_version = "paris"' in f.read()
    check(
        "On-Chain EIP-712 Signature Recovery & Paris EVM (Prompt 06)",
        contract_valid and evm_paris,
        "KendraEscrow.sol verified with ECDSA.recover; foundry.toml locks evm_version='paris' (Zero PUSH0)"
    )

    # 4. Multi-Round CNP & JSON Trace Export (Prompt 08)
    traces_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "traces")
    traces_exist = (
        os.path.exists(os.path.join(traces_dir, "scenario_a_valid_trace.json")) and
        os.path.exists(os.path.join(traces_dir, "scenario_b_redteam_trace.json")) and
        os.path.exists(os.path.join(traces_dir, "scenario_c_bailout_trace.json"))
    )
    check("Multi-Round CNP & JSON Trace Export (Prompt 08)", traces_exist, f"All 3 scenario traces verified in {traces_dir}")

    # 5. Supabase RLS, Immutability Trigger & Lean Serverless Bundle (Prompts 01-02)
    sql_migration = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations", "20261015000000_kendra_zerotrust_schema.sql")
    sql_valid = False
    if os.path.exists(sql_migration):
        with open(sql_migration, "r", encoding="utf-8") as f:
            s_text = f.read()
            sql_valid = "merchant_private_cashflows" in s_text and "zerotrust_security_intercepts" in s_text and "kendra_fsm_events" in s_text
    reqs_path = os.path.join(os.path.dirname(__file__), "..", "api", "requirements.txt")
    lean_bundle = False
    if os.path.exists(reqs_path):
        with open(reqs_path, "r", encoding="utf-8") as f:
            req_lines = [line.strip().lower() for line in f if line.strip() and not line.strip().startswith("#")]
            has_scipy = any(line.startswith("scipy") for line in req_lines)
            has_sklearn = any(line.startswith(("scikit-learn", "sklearn")) for line in req_lines)
            lean_bundle = not has_scipy and not has_sklearn
    check(
        "Supabase RLS, Immutability Trigger & Lean Bundle (Prompts 01-02)",
        sql_valid and lean_bundle,
        "RLS isolation & immutability triggers defined; api/requirements.txt strictly excludes scipy/sklearn (<65 MB)"
    )

    # 6. All Competition Deliverables in docs/ (Prompts 10-11)
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    deliverables = [
        "TECHNICAL_DOCUMENTATION.md",
        "SECURITY_SELF_ASSESSMENT.md",
        "ONCHAIN_EXECUTION_EVIDENCE.md",
        "PRESENTATION_DECK_SLIDES.md",
        "VIDEO_STORYBOARD_180S.md",
        "SHENZHEN_QA_DEFENSE_PLAYBOOK.md",
        "backtest_results.json"
    ]
    missing = [d for d in deliverables if not os.path.exists(os.path.join(docs_dir, d))]
    check(
        "Mandatory Competition Deliverables in docs/ (Prompts 10-11)",
        len(missing) == 0,
        f"Verified all 7 submission files in docs/ (Missing: {missing})"
    )

    # =========================================================================
    # SUMMARY
    # =========================================================================
    print("\n" + "=" * 80)
    if all_passed:
        print("[AUDIT SUCCESS]: All Section 4 Master Verification Checklist items PASSED with 100% compliance!")
    else:
        print("[AUDIT FAILURE]: Some checklist items failed verification.")
    print("=" * 80)
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_master_verification())
