"""
tests/test_part3_fsm_event_insert.py
Part 3 (Task 3) DB-query regression check.

Guarantee: the kendra_fsm_events INSERT emitted by
api/core/syndicate_fsm.py::stream_fsm_event must satisfy the LOCKED Supabase
schema (supabase/migrations/20261015000000_kendra_zerotrust_schema.sql) —
only real column names, and every NOT NULL column without a DEFAULT supplied.
Historical defect this pins: the insert used "facility_id"/"event_type" keys
(no such columns) and omitted "trigger_event"/"timestamp_sec", so every FSM
telemetry row failed (42703) and was silently swallowed.

Runs standalone without pytest:  python tests/test_part3_fsm_event_insert.py
(also collectable by pytest, matching the tests/test_promptNN_*.py convention).
"""

import re
import sys
from pathlib import Path
from typing import Any, Dict

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))  # same bootstrap as api/scripts/export_fsm_traces.py

LOCKED_SQL = ROOT / "supabase" / "migrations" / "20261015000000_kendra_zerotrust_schema.sql"


def locked_kendra_fsm_events_columns() -> Dict[str, Dict[str, bool]]:
    """Parses the LOCKED kendra_fsm_events CREATE TABLE into {column: {not_null, has_default}}."""
    sql = LOCKED_SQL.read_text(encoding="utf-8")
    block = re.search(
        r"CREATE TABLE IF NOT EXISTS kendra_fsm_events \((.*?)\);", sql, re.DOTALL
    )
    assert block, "LOCKED kendra_fsm_events CREATE TABLE block not found"

    columns: Dict[str, Dict[str, bool]] = {}
    for raw in block.group(1).strip().splitlines():
        line = raw.strip().rstrip(",")
        m = re.match(r"^([a-z_][a-z0-9_]*)\s+(.*)$", line)
        if not m or m.group(1).upper() in ("CREATE", "CONSTRAINT"):
            continue
        rest = m.group(2).upper()
        columns[m.group(1)] = {
            "not_null": "NOT NULL" in rest,
            "has_default": "DEFAULT" in rest,
        }
    assert columns, "failed to parse any kendra_fsm_events columns"
    return columns


class _FakeSupabaseClient:
    """Captures the insert stream_fsm_event emits; never touches the network."""

    def __init__(self) -> None:
        self.sink: Dict[str, Any] = {}

    def table(self, name: str) -> "_FakeSupabaseClient":
        self.sink["table"] = name
        return self

    def insert(self, payload: Dict[str, Any]) -> "_FakeSupabaseClient":
        self.sink["payload"] = payload
        return self

    def execute(self) -> "_FakeSupabaseClient":
        self.sink["executed"] = True
        return self


def capture_stream_fsm_event_insert() -> Dict[str, Any]:
    import api.core.syndicate_fsm as fsm

    fake = _FakeSupabaseClient()
    original = fsm.get_supabase_client
    fsm.get_supabase_client = lambda: fake
    try:
        fsm.stream_fsm_event("FSM_STATE_TRANSITION", "IDLE_MONITORING", "INTENT_PERCEPTION", {"k": "v"})
    finally:
        fsm.get_supabase_client = original
    return fake.sink


def check() -> None:
    columns = locked_kendra_fsm_events_columns()
    sink = capture_stream_fsm_event_insert()

    assert sink.get("table") == "kendra_fsm_events", f"wrong table: {sink.get('table')}"
    assert sink.get("executed") is True, "insert().execute() must be reached when a client is live"

    payload = sink["payload"]
    unknown = sorted(set(payload) - set(columns))
    assert not unknown, (
        f"stream_fsm_event inserts columns absent from the LOCKED kendra_fsm_events "
        f"schema: {unknown} (locked columns: {sorted(columns)})"
    )

    required = {
        name for name, flags in columns.items() if flags["not_null"] and not flags["has_default"]
    }
    missing = sorted(required - set(payload))
    assert not missing, (
        f"stream_fsm_event omits NOT NULL columns (no DEFAULT) required by the "
        f"LOCKED kendra_fsm_events schema: {missing}"
    )


if __name__ == "__main__":
    check()
    print("PASS: stream_fsm_event INSERT satisfies the LOCKED kendra_fsm_events contract")
