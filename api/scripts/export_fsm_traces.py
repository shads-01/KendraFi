# -*- coding: utf-8 -*-
"""
KendraFi Automated FSM State-Transition Trace Exporter
======================================================
Location: api/scripts/export_fsm_traces.py

Executes all 3 competition scenarios through the 5-state LangGraph FSM
and exports complete JSON state-transition trace logs to docs/traces/:
1. docs/traces/scenario_a_valid_trace.json (Valid 45k Restock + 3-Round CNP + Repayment Sweep)
2. docs/traces/scenario_b_redteam_trace.json (Red-Team Prompt Injection + Adversarial Intercept)
3. docs/traces/scenario_c_bailout_trace.json (Sybil Wash-Trading Hold + Monsoon Flash Bailout)
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from api.core.syndicate_fsm import SyndicateFSMRunner


def export_traces(output_dir: Path | None = None) -> None:
    if output_dir is None:
        output_dir = Path(__file__).resolve().parent.parent.parent / "docs" / "traces"

    output_dir.mkdir(parents=True, exist_ok=True)
    runner = SyndicateFSMRunner()

    print("=" * 70)
    print("KENDRAFI — COMPREHENSIVE FSM STATE TRANSITION TRACE EXPORTER")
    print("=" * 70)

    # ==========================================================================
    # SCENARIO A: VALID 45,000 BDT RESTOCK + 3-ROUND CNP + REPAYMENT SWEEP
    # ==========================================================================
    print("\n[1/3] Generating Scenario A (Valid Restock & Full Repayment)...")
    res_a = runner.run_scenario("SCENARIO_A_VALID")
    sweep_a = runner.run_repayment_sweep(
        facility_id="INV-2026-DHAKA-001",
        amount_bdt=res_a.get("gross_repayment_bdt", 45462.33),
    )
    res_a["repayment_sweep"] = sweep_a

    file_a = output_dir / "scenario_a_valid_trace.json"
    with open(file_a, "w", encoding="utf-8") as f:
        json.dump(res_a, f, indent=2, ensure_ascii=False)
    print(f"  -> Exported to: {file_a} ({file_a.stat().st_size / 1024:.1f} KB)")
    print(f"     FSM Trace: {' -> '.join(res_a['fsm_trace'])}")
    print(f"     CNP Rounds: {len(res_a['cnp_messages'])} communicative acts logged across 3 rounds")
    print(f"     Escrow TX: {res_a['tx_result']['tx_hash']} ({res_a['tx_result']['tx_mode']})")

    # ==========================================================================
    # SCENARIO B: RED-TEAM OCR PROMPT INJECTION + ADVERSARIAL INTERCEPT
    # ==========================================================================
    print("\n[2/3] Generating Scenario B (Red-Team Prompt Injection Defense)...")
    res_b = runner.run_scenario("SCENARIO_B_REDTEAM")

    file_b = output_dir / "scenario_b_redteam_trace.json"
    with open(file_b, "w", encoding="utf-8") as f:
        json.dump(res_b, f, indent=2, ensure_ascii=False)
    print(f"  -> Exported to: {file_b} ({file_b.stat().st_size / 1024:.1f} KB)")
    print(f"     FSM Trace: {' -> '.join(res_b['fsm_trace'])}")
    print(f"     Status: {res_b['status']} | Intercept: {res_b.get('error')}")

    # ==========================================================================
    # SCENARIO C: SYBIL WASH-TRADING HOLD + MONSOON FLASH BAILOUT
    # ==========================================================================
    print("\n[3/3] Generating Scenario C (Sybil Collusion Hold & Monsoon Flash Bailout)...")
    res_c = runner.run_scenario("SCENARIO_C_SYBIL_WASH")

    file_c = output_dir / "scenario_c_bailout_trace.json"
    with open(file_c, "w", encoding="utf-8") as f:
        json.dump(res_c, f, indent=2, ensure_ascii=False)
    print(f"  -> Exported to: {file_c} ({file_c.stat().st_size / 1024:.1f} KB)")
    print(f"     FSM Trace: {' -> '.join(res_c['fsm_trace'])}")
    print(f"     Status: {res_c['status']} | Bailout TX: {res_c['bailout_result']['tx_hash']}")

    print("\n" + "=" * 70)
    print("[SUCCESS] All 3 competition JSON traces exported successfully!")
    print("=" * 70)


if __name__ == "__main__":
    export_traces()
