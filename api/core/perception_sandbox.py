"""
api/core/perception_sandbox.py
Tier-0 Untrusted Multimodal Perception Sandbox & Parallel OCR/x402 Firewall.
Isolates multimodal transcription (Gemini 2.5 Flash / Whisper) strictly within Tier 0.
Enforces Rule 1 (Zero LLM Math) and Rule 3 (Zero-Trust Perception & x402 Counterparty Guardrails).
"""

import json
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union
from web3 import Web3

from api.core.schemas import (
    COMPILED_INJECTION_RE,
    ExtractedInvoiceIntent,
    ZeroTrustInterceptLog,
)

logger = logging.getLogger(__name__)

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "fixtures")


class RawPerceptionDict(dict):
    """
    Tier-0 raw extraction container for unvalidated/adversarial payloads.
    Provides attribute access (e.g. payload.borrower_agent_id) and dict access (payload['borrower_agent_id']).
    """
    def __getattr__(self, name: str) -> Any:
        if name in self:
            return self[name]
        raise AttributeError(f"'RawPerceptionDict' has no attribute '{name}'")

    def __setattr__(self, name: str, value: Any) -> None:
        self[name] = value


# Canonical on-chain KYB Whitelist (x402 Registry)
KNOWN_KYB_SUPPLIERS: Dict[str, Dict[str, Any]] = {
    Web3.to_checksum_address("0x71c0000000000000000000000000000000000a91"): {
        "supplier_id": "MEGHNA-01",
        "name": "Meghna Group Wholesale (Grains & Oils)",
        "category": "FMCG_WHOLESALE",
        "whitelisted": True,
    },
    Web3.to_checksum_address("0x82d0000000000000000000000000000000000b42"): {
        "supplier_id": "ISLAMPUR-02",
        "name": "Islampur Fabric Mills",
        "category": "TEXTILE_WHOLESALE",
        "whitelisted": True,
    },
    Web3.to_checksum_address("0x93e0000000000000000000000000000000000c18"): {
        "supplier_id": "SHYAMOLI-03",
        "name": "Shyamoli Cold Storage & Agro Spices",
        "category": "AGRO_WHOLESALE",
        "whitelisted": True,
    },
    Web3.to_checksum_address("0xa4f0000000000000000000000000000000000d77"): {
        "supplier_id": "SQUARE-04",
        "name": "Square Pharma Central Depot",
        "category": "PHARMA_WHOLESALE",
        "whitelisted": True,
    },
}

# Canonical Sandbox Personas (Aligned 100% with CONTEXT.md §3 & kendra_agents table)
PERSONAS: Dict[str, Dict[str, Any]] = {
    "AGT-01": {
        "agent_id": "AGT-01",
        "name": "Rahim Store",
        "business_type": "Retail Grocery & Rice (Karwan Bazar)",
        "cluster": "Karwan Bazar Kitchen Market D-14, Dhaka",
        "session_wallet": Web3.to_checksum_address("0x1111111111111111111111111111111111111111"),
        "wallet": Web3.to_checksum_address("0x1111111111111111111111111111111111111111"),
        "preferred_supplier_id": "MEGHNA-01",
        "preferred_supplier_wallet": Web3.to_checksum_address("0x71c0000000000000000000000000000000000a91"),
        "role": "CREDITWORTHY_BORROWER",
        "reliability_score_p": 0.9850,
        "liquidity_buffer_bdt": 55000.00,
    },
    "AGT-02": {
        "agent_id": "AGT-02",
        "name": "Fatema Textiles",
        "business_type": "Tailoring & Fabrics (Islampur)",
        "cluster": "Islampur Market, Old Dhaka",
        "session_wallet": Web3.to_checksum_address("0x2222222222222222222222222222222222222222"),
        "wallet": Web3.to_checksum_address("0x2222222222222222222222222222222222222222"),
        "preferred_supplier_id": "ISLAMPUR-02",
        "preferred_supplier_wallet": Web3.to_checksum_address("0x82d0000000000000000000000000000000000b42"),
        "role": "GUARANTOR_PEER",
        "reliability_score_p": 0.9700,
        "liquidity_buffer_bdt": 48000.00,
    },
    "AGT-03": {
        "agent_id": "AGT-03",
        "name": "Kamal Agro",
        "business_type": "Vegetables & Spices (Karwan Bazar)",
        "cluster": "Krishi Market, Mohammadpur, Dhaka",
        "session_wallet": Web3.to_checksum_address("0x3333333333333333333333333333333333333333"),
        "wallet": Web3.to_checksum_address("0x3333333333333333333333333333333333333333"),
        "preferred_supplier_id": "SHYAMOLI-03",
        "preferred_supplier_wallet": Web3.to_checksum_address("0x93e0000000000000000000000000000000000c18"),
        "role": "GUARANTOR_PEER",
        "reliability_score_p": 0.9600,
        "liquidity_buffer_bdt": 34642.85,
    },
    "AGT-04": {
        "agent_id": "AGT-04",
        "name": "Nasrin Pharmacy",
        "business_type": "Dispensary & Medicine (Dhanmondi)",
        "cluster": "Dhanmondi Healthcare Corridor, Dhaka",
        "session_wallet": Web3.to_checksum_address("0x4444444444444444444444444444444444444444"),
        "wallet": Web3.to_checksum_address("0x4444444444444444444444444444444444444444"),
        "preferred_supplier_id": "SQUARE-04",
        "preferred_supplier_wallet": Web3.to_checksum_address("0xa4f0000000000000000000000000000000000d77"),
        "role": "ANCHOR_GUARANTOR",
        "reliability_score_p": 0.9920,
        "liquidity_buffer_bdt": 85000.00,
    },
    "AGT-05": {
        "agent_id": "AGT-05",
        "name": "Sohel Electronics",
        "business_type": "Mobile Repairs & Parts (Patuatuli)",
        "cluster": "Patuatuli Electronics Market, Old Dhaka",
        "session_wallet": Web3.to_checksum_address("0x5555555555555555555555555555555555555555"),
        "wallet": Web3.to_checksum_address("0x5555555555555555555555555555555555555555"),
        "preferred_supplier_id": "PATUATULI-99",
        "preferred_supplier_wallet": Web3.to_checksum_address("0xDead00000000000000000000000000000000Beef"),
        "role": "ADVERSARIAL_NODE",
        "reliability_score_p": 0.8900,
        "liquidity_buffer_bdt": 12000.00,
    },
}


def load_scenario_fixture(scenario: str) -> Dict[str, Any]:
    """
    Loads benchmark scenario fixture JSON from disk.
    Supports SCENARIO_A_VALID, SCENARIO_B_REDTEAM, SCENARIO_C_SYBIL_WASH.
    """
    mapping = {
        "SCENARIO_A_VALID": "scenario_a_valid.json",
        "SCENARIO_B_REDTEAM": "scenario_b_redteam.json",
        "SCENARIO_C_SYBIL_WASH": "scenario_c_sybil_wash.json",
    }
    filename = mapping.get(scenario.strip().upper())
    if not filename:
        raise ValueError(f"Unknown scenario identifier: {scenario}. Expected one of {list(mapping.keys())}")

    filepath = os.path.join(FIXTURES_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def get_active_persona_for_scenario(scenario: str) -> Dict[str, Any]:
    """
    Resolves the active phone persona for the Left Panel UI.
    Guarantees 100% consistency between the phone header and the payload:
      - SCENARIO_A_VALID -> AGT-01 (Rahim Store)
      - SCENARIO_B_REDTEAM -> AGT-05 (Sohel Electronics - Adversarial Node)
      - SCENARIO_C_SYBIL_WASH -> AGT-01 (Rahim Store)
    """
    clean_scenario = scenario.strip().upper()
    if clean_scenario == "SCENARIO_B_REDTEAM":
        return PERSONAS["AGT-05"]
    return PERSONAS["AGT-01"]


def parse_bangla_audio_and_receipt(
    scenario_or_payload: Union[str, Dict[str, Any]]
) -> Union[ExtractedInvoiceIntent, RawPerceptionDict]:
    """
    Tier-0 Multimodal Perception Parser.
    Extracts raw invoice fields into ExtractedInvoiceIntent (or RawPerceptionDict if injection prevents Pydantic initialization).
    Strictly forbids computing financial metrics (DSCR, interest, credit limits).
    """
    if isinstance(scenario_or_payload, str):
        clean_name = scenario_or_payload.strip().upper()
        fixture = load_scenario_fixture(clean_name)
        if clean_name == "SCENARIO_B_REDTEAM":
            # Scenario B contains adversarial injection in raw OCR text; return RawPerceptionDict
            # so the parallel firewall can report both TIER0 and x402 violations
            return RawPerceptionDict(fixture["raw_intent_payload"])
        raw_data = fixture["extracted_intent"]
    else:
        raw_data = scenario_or_payload

    # For valid payloads, instantiate strict Pydantic model
    try:
        return ExtractedInvoiceIntent(**raw_data)
    except Exception:
        # Wrap in RawPerceptionDict to allow parallel firewall screening without crashing
        return RawPerceptionDict(raw_data)


def run_tier0_and_x402_firewall(
    intent_or_dict: Union[str, ExtractedInvoiceIntent, Dict[str, Any]],
    raw_payload: Optional[str] = None
) -> Tuple[bool, List[str]]:
    """
    Parallel Security Screening Firewall.
    Executes:
      1. Tier-0 Regex / Perplexity Prompt Injection Check
      2. x402 KYB Supplier Registry Check
    CRITICAL: Runs both checks in parallel without short-circuiting so Scenario B
    reports BOTH 'TIER0_PROMPT_INJECTION_DETECTED' and 'X402_UNVERIFIED_SUPPLIER_ADDRESS' simultaneously!
    """
    # Allow scenario name string input directly
    if isinstance(intent_or_dict, str):
        if intent_or_dict.strip().upper() in ("SCENARIO_A_VALID", "SCENARIO_B_REDTEAM", "SCENARIO_C_SYBIL_WASH"):
            intent_or_dict = parse_bangla_audio_and_receipt(intent_or_dict)
        else:
            raise ValueError(f"Unrecognized scenario string: {intent_or_dict}")

    violations: List[str] = []

    # Extract raw string fields for prompt injection screening
    if isinstance(intent_or_dict, ExtractedInvoiceIntent):
        raw_ocr = intent_or_dict.raw_ocr_text
        summary = intent_or_dict.item_summary
        sup_id = intent_or_dict.supplier_id
        sup_wallet = intent_or_dict.supplier_wallet
    else:
        raw_ocr = str(intent_or_dict.get("raw_ocr_text", ""))
        summary = str(intent_or_dict.get("item_summary", ""))
        sup_id = str(intent_or_dict.get("supplier_id", ""))
        sup_wallet = str(intent_or_dict.get("supplier_wallet", ""))

    all_untrusted_text = f"{raw_ocr} {summary} {sup_id} {sup_wallet} {raw_payload or ''}"

    # -------------------------------------------------------------
    # Check 1: Tier-0 Prompt Injection Check
    # -------------------------------------------------------------
    has_injection = False
    for pattern in COMPILED_INJECTION_RE:
        if pattern.search(all_untrusted_text):
            has_injection = True
            break

    if has_injection:
        violations.append("TIER0_PROMPT_INJECTION_DETECTED")

    # -------------------------------------------------------------
    # Check 2: x402 KYB Supplier Registry Check (Parallel, no short-circuit)
    # -------------------------------------------------------------
    is_whitelisted = False
    try:
        checksummed_wallet = Web3.to_checksum_address(sup_wallet.strip())
        if checksummed_wallet in KNOWN_KYB_SUPPLIERS:
            supplier_meta = KNOWN_KYB_SUPPLIERS[checksummed_wallet]
            if supplier_meta.get("whitelisted", False):
                is_whitelisted = True
    except Exception:
        is_whitelisted = False

    if not is_whitelisted:
        violations.append("X402_UNVERIFIED_SUPPLIER_ADDRESS")

    is_clean = len(violations) == 0
    return is_clean, violations


def create_zero_trust_intercept_logs(
    violations: List[str],
    payload: Dict[str, Any],
    invoice_id: Optional[str] = None
) -> List[ZeroTrustInterceptLog]:
    """
    Creates immutable ZeroTrustInterceptLog instances for detected security violations.
    """
    import hashlib

    raw_bytes = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
    digest = hashlib.sha256(raw_bytes).hexdigest()
    now_iso = datetime.now(timezone.utc).isoformat()
    logs = []

    for violation in violations:
        tier = "TIER-0" if "TIER0" in violation else "TIER-3" if "X402" in violation else "TIER-1"
        log = ZeroTrustInterceptLog(
            incident_id=str(uuid.uuid4()),
            timestamp=now_iso,
            threat_tier=tier,
            reason=violation,
            payload_digest=digest,
            action_taken="BLOCKED_AND_RECORDED",
        )
        logs.append(log)

    return logs


def log_security_intercept_to_supabase(
    invoice_id: str,
    attempted_by: str,
    attack_type: str,
    intercept_reason: str,
    payload: Dict[str, Any],
    client_ip: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Writes security intercept incident directly to Supabase zerotrust_security_intercepts table.
    Enforced by database trigger: updates and deletions are cryptographically prohibited.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")

    if not supabase_url or not supabase_key:
        logger.warning("Supabase credentials missing; skipping live database audit log write.")
        return None

    try:
        from supabase import create_client
        client = create_client(supabase_url, supabase_key)
        data = {
            "invoice_id": invoice_id,
            "attempted_by": attempted_by,
            "attack_type": attack_type,
            "intercept_reason": intercept_reason,
            "payload": payload,
            "client_ip": client_ip,
        }
        res = client.table("zerotrust_security_intercepts").insert(data).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error("Failed to write security intercept to Supabase: %s", e)
        return None
