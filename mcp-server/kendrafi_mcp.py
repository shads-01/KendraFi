# -*- coding: utf-8 -*-
"""
KendraFi MCP Server — stdio bridge for the autonomous syndicate FSM.
=============================================================
Exposes three tools over the Model Context Protocol so any MCP client
(Claude Desktop, Cursor, OpenCode, ...) can drive and inspect the
KendraFi demo without a running Next.js/BFF stack:

  run_scenario(A|B|C)     -> executes the 5-state LangGraph FSM in-process
  get_trace(A|B|C)        -> returns the exported JSON state trace
  get_backtest_summary()  -> returns Monte Carlo headline metrics

Run from the repo root:  python mcp/kendrafi_mcp.py   (transport: stdio)
Dependency:              pip install mcp
"""

import json
import sys
from contextlib import redirect_stdout
from pathlib import Path

from mcp.server.fastmcp import FastMCP

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from api.core.syndicate_fsm import SyndicateFSMRunner  # noqa: E402

SCENARIOS = {
    "A": "SCENARIO_A_VALID",
    "B": "SCENARIO_B_REDTEAM",
    "C": "SCENARIO_C_SYBIL_WASH",
}
TRACES = {
    "A": "scenario_a_valid_trace.json",
    "B": "scenario_b_redteam_trace.json",
    "C": "scenario_c_bailout_trace.json",
}

mcp = FastMCP("kendrafi")
_runner = None


def _resolve(scenario: str) -> str:
    key = (scenario or "").strip().upper()[:1]
    if key not in SCENARIOS:
        raise ValueError(f"Unknown scenario '{scenario}' — use A, B or C.")
    return key


def _runner_instance() -> SyndicateFSMRunner:
    global _runner
    if _runner is None:
        _runner = SyndicateFSMRunner()
    return _runner


@mcp.tool()
def run_scenario(scenario: str) -> str:
    """Run a KendraFi demo scenario in-process.

    A = valid 45,000 BDT rice restock -> 3-round CNP -> on-chain settle.
    B = red-team poisoned invoice -> BLOCKED_ADVERSARIAL.
    C = sybil/wash ring -> hold, then monsoon flash bailout.
    Returns a compact digest: FSM trace, DSCR, CNP rounds, peer votes, tx mode/hash.
    """
    key = _resolve(scenario)
    with redirect_stdout(sys.stderr):  # keep JSON-RPC stdout clean
        state = _runner_instance().run_scenario(SCENARIOS[key])
    tx = state.get("tx_result") or {}
    digest = {
        "scenario": key,
        "status": state.get("status"),
        "fsm_trace": state.get("fsm_trace"),
        "dscr": state.get("dscr"),
        "gross_repayment_bdt": state.get("gross_repayment_bdt"),
        "net_supplier_payout_bdt": state.get("net_supplier_payout_bdt"),
        "cnp_rounds": len({m.get("round_num") for m in state.get("cnp_messages") or []}),
        "peer_votes": [
            {
                "agent_id": v.get("agent_id"),
                "alpha_star": v.get("alpha_star"),
                "stake_bdt": v.get("stake_bdt"),
                "expected_utility_bdt": v.get("expected_utility_bdt"),
                "decision": v.get("decision"),
            }
            for v in state.get("peer_votes") or []
        ],
        "tx_mode": tx.get("tx_mode"),
        "tx_hash": tx.get("tx_hash"),
        "intercept_log": state.get("intercept_log"),
        "error": state.get("error"),
    }
    return json.dumps(digest, indent=2, default=str)


@mcp.tool()
def get_trace(scenario: str) -> str:
    """Return the exported JSON FSM state trace for scenario A, B or C."""
    path = ROOT / "docs" / "traces" / TRACES[_resolve(scenario)]
    if not path.exists():
        raise FileNotFoundError(f"Trace not exported yet: {path.name}")
    return path.read_text(encoding="utf-8")


@mcp.tool()
def get_backtest_summary() -> str:
    """Return the fixed-seed Monte Carlo backtest headline metrics (baseline vs KendraFi)."""
    data = json.loads((ROOT / "docs" / "backtest_results.json").read_text(encoding="utf-8"))
    keys = ("benchmark_label", "dataset_parameters", "solo_mfs_baseline", "kendrafi_fate_protocol", "empirical_uplifts")
    return json.dumps({k: data.get(k) for k in keys}, indent=2)


if __name__ == "__main__":
    mcp.run()
