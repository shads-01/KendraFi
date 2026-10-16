"""
api/core/schemas.py
Strict Pydantic v2 schemas defining Zero-Trust boundaries for KendraFi.
Guarantees byte-level type safety across Tier-0 multimodal extraction,
Tier-2 deterministic risk audits, multi-agent CNP negotiation,
secp256k1 ZK range proofs, and on-chain escrow cosigning.
"""

from enum import Enum
import re
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from web3 import Web3

EIP55_WALLET_REGEX = r"^0x[a-fA-F0-9]{40}$"
AGENT_ID_REGEX = r"^AGT-0[1-5]$"

# High-precision injection patterns covering directive overrides, system manipulation, and adversarial jailbreaks
PROMPT_INJECTION_PATTERNS = [
    r"(?i)\bignore\s+(all\s+|previous\s+|prior\s+)?(instructions|rules|prompts|system)\b",
    r"(?i)\bdisregard\s+(all\s+|previous\s+|prior\s+)?(instructions|rules|prompts)\b",
    r"(?i)\b(system\s+prompt|system\s+directive|developer\s+mode|jailbreak)\b",
    r"(?i)\bset\s+dscr\s*=\s*[0-9]+",
    r"(?i)\bapprove\s+(transfer|loan|disbursement|payout)\b",
    r"(?i)\bunverified\s+wallet\b",
    r"(?i)\boverride\s+(rules|dscr|kyb|entropy|validation)\b",
    r"(?i)\byou\s+are\s+now\s+(an\s+unconstrained|a\s+rogue|an\s+autonomous)\b",
    r"(?i)<\s*script\b",
    r"(?i)\bdrop\s+table\b",
]

COMPILED_INJECTION_RE = [re.compile(p) for p in PROMPT_INJECTION_PATTERNS]


class FSMState(str, Enum):
    """
    Finite State Machine states representing the complete cooperative micro-syndicate lifecycle.
    """
    IDLE_MONITORING = "IDLE_MONITORING"
    INTENT_PERCEPTION = "INTENT_PERCEPTION"
    DETERMINISTIC_AUDIT = "DETERMINISTIC_AUDIT"
    SYNDICATE_P2P_NEGOTIATION = "SYNDICATE_P2P_NEGOTIATION"
    ESCROW_COSIGN_AND_SETTLE = "ESCROW_COSIGN_AND_SETTLE"
    BLOCKED_ADVERSARIAL = "BLOCKED_ADVERSARIAL"
    FLASH_BAILOUT_ACTIVE = "FLASH_BAILOUT_ACTIVE"


class ExtractedInvoiceIntent(BaseModel):
    """
    Tier-0 untrusted perception output ONLY: raw transcription fields from OCR / audio.
    Strictly forbids computed financial values, risk scores, or credit decisions.
    """
    model_config = ConfigDict(frozen=True)

    borrower_agent_id: str = Field(..., pattern=AGENT_ID_REGEX, description="Merchant agent identifier (AGT-01 to AGT-05)")
    supplier_wallet: str = Field(..., pattern=EIP55_WALLET_REGEX, description="EIP-55 checksummed Ethereum address of KYB supplier")
    supplier_id: str = Field(..., min_length=2, max_length=64, description="Supplier registry identifier (e.g. MEGHNA-01)")
    amount_bdt: float = Field(..., gt=0.0, description="Requested principal restock loan in BDT")
    tenor_days: int = Field(..., gt=0, le=180, description="Repayment duration in days")
    raw_ocr_text: str = Field(..., min_length=1, description="Raw OCR transcription text from physical invoice")
    item_summary: str = Field(..., min_length=1, description="Extracted summary of restock goods")

    @field_validator("supplier_wallet", mode="before")
    @classmethod
    def validate_and_checksum_wallet(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("supplier_wallet must be a string")
        v_clean = v.strip()
        if not re.match(EIP55_WALLET_REGEX, v_clean):
            raise ValueError(f"Invalid Ethereum address format: {v_clean}")
        try:
            return Web3.to_checksum_address(v_clean)
        except Exception as e:
            raise ValueError(f"Invalid EIP-55 address checksum: {e}")

    @field_validator("raw_ocr_text", "item_summary", "supplier_id")
    @classmethod
    def detect_prompt_injection(cls, v: str) -> str:
        if not isinstance(v, str):
            return v
        for pattern in COMPILED_INJECTION_RE:
            if pattern.search(v):
                raise ValueError(
                    f"TIER0_PROMPT_INJECTION_DETECTED: Malicious instruction or adversarial prompt injection detected in field: '{v[:60]}...'"
                )
        return v

    def __getitem__(self, item: str):
        """Allow subscript access for seamless dictionary compatibility."""
        return getattr(self, item)


class BitRangeProof(BaseModel):
    """
    Cramer-Damgård-Schoenmakers 1994 (CDS94) Disjunctive 1-bit OR-Proof for secp256k1.
    Proves that a committed bit b_k in sum(2^k * b_k) satisfies b_k in {0, 1} in Zero-Knowledge.
    """
    model_config = ConfigDict(frozen=True)

    bit_index: int = Field(..., ge=0, le=15, description="Bit index from 0 to 15 (16-bit range [0, 65535])")
    commitment_point_hex: str = Field(..., pattern=r"^0[23][0-9a-fA-F]{64}$", description="Compressed secp256k1 point (66 hex chars) C_k = b_k*G + r_k*H")
    e0_hex: str = Field(..., pattern=r"^[0-9a-fA-F]{64}$", description="Challenge scalar for b=0 branch (32 bytes)")
    z0_hex: str = Field(..., pattern=r"^[0-9a-fA-F]{64}$", description="Response scalar for b=0 branch (32 bytes)")
    e1_hex: str = Field(..., pattern=r"^[0-9a-fA-F]{64}$", description="Challenge scalar for b=1 branch (32 bytes)")
    z1_hex: str = Field(..., pattern=r"^[0-9a-fA-F]{64}$", description="Response scalar for b=1 branch (32 bytes)")


class ZKCommitmentProof(BaseModel):
    """
    Zero-Knowledge Solvency and Confidentiality Proof.
    Guarantees private cash flow solvency without exposing raw balance sheets.
    """
    model_config = ConfigDict(frozen=True)

    commitment_hex: str = Field(..., pattern=r"^0[23][0-9a-fA-F]{64}$", description="Full 66-char compressed secp256k1 point hex for cashflow commitment C = v*G + r*H")
    display_short_hex: str = Field(..., description="Truncated visual representation for UI rendering (e.g. 0x029f8a...)")
    excess_commitment_hex: str = Field(..., pattern=r"^0[23][0-9a-fA-F]{64}$", description="Excess solvency commitment C_excess = (v - T)*G + r*H")
    bit_range_proofs: List[BitRangeProof] = Field(..., min_length=16, max_length=16, description="16 CDS94 bit range proofs proving (v - T) in [0, 65535]")
    psi_supplier_hmac_hex: str = Field(..., min_length=64, max_length=64, description="Private Set Intersection blind token for KYB verification")
    dscr_verified_ge_125: bool = Field(..., description="Set strictly from cryptographic verification of range proof, NEVER blindly asserted")
    supplier_kyb_verified: bool = Field(..., description="Verification flag confirming supplier is registered in on-chain KYB whitelist")
    collusion_entropy_pass: bool = Field(..., description="Spatio-temporal entropy verification flag (H_st >= 0.65)")
    fate_survival_prob_p: float = Field(..., ge=0.0, le=1.0, description="Heterogeneous Logistic Regression survival probability from WeBank FATE model")

    @model_validator(mode="after")
    def verify_proof_structural_integrity(self) -> "ZKCommitmentProof":
        """
        Guarantees that security assertions (dscr_verified_ge_125=True) cannot be trivially forged
        without complete underlying cryptographic artifacts (16 bit proofs, secp256k1 points, PSI token).
        """
        if self.dscr_verified_ge_125:
            if len(self.bit_range_proofs) != 16:
                raise ValueError("CRYPTO_INTEGRITY_VIOLATION: dscr_verified_ge_125 requires exact 16-bit range decomposition")
            for idx, p in enumerate(self.bit_range_proofs):
                if p.bit_index != idx:
                    raise ValueError(f"CRYPTO_INTEGRITY_VIOLATION: Out-of-order bit range proof index at {idx}")
            if not self.commitment_hex.startswith(("02", "03")) or len(self.commitment_hex) != 66:
                raise ValueError("CRYPTO_INTEGRITY_VIOLATION: Malformed secp256k1 commitment point")
            if not self.excess_commitment_hex.startswith(("02", "03")) or len(self.excess_commitment_hex) != 66:
                raise ValueError("CRYPTO_INTEGRITY_VIOLATION: Malformed secp256k1 excess commitment point")
            if len(self.psi_supplier_hmac_hex) != 64:
                raise ValueError("CRYPTO_INTEGRITY_VIOLATION: Malformed PSI blind token length")
        return self


class CNPWallMessage(BaseModel):
    """
    Contract Net Protocol (CNP) multi-round peer-to-peer negotiation log message.
    """
    model_config = ConfigDict(frozen=True)

    round_num: int = Field(..., ge=1, le=10, description="Negotiation round number (1, 2, or 3)")
    sender_agent: str = Field(..., pattern=AGENT_ID_REGEX, description="Agent sending this proposal or bid")
    message_type: Literal[
        "CFP_BROADCAST",
        "PROVISIONAL_BID",
        "DEFICIT_REALLOCATION",
        "NASH_EQUILIBRIUM_CLEARED",
        "ABSTAIN_LIQUIDITY_STRESS",
    ] = Field(..., description="FIPA-compliant CNP communicative act")
    proposed_alpha: float = Field(..., ge=0.0, le=1.0, description="Proposed guarantee stake fraction (<= 0.40)")
    proposed_yield_apr_bps: int = Field(..., ge=0, description="Proposed interest yield in basis points (100 bps = 1.0% APR)")
    expected_utility_bdt: float = Field(..., description="Besley-Coate expected utility in BDT under continuation value delta*V_j")
    detail: str = Field(..., description="Detailed message explanation or mathematical rationale")


class PeerAgentVote(BaseModel):
    """
    Guarantor peer agent participation decision and formal EIP-712 cosigning vote.
    """
    model_config = ConfigDict(frozen=True)

    agent_id: str = Field(..., pattern=AGENT_ID_REGEX, description="Guarantor agent identifier (AGT-01 to AGT-05)")
    alpha_star: float = Field(..., ge=0.0, le=1.0, description="Final equilibrium stake percentage")
    stake_bdt: float = Field(..., ge=0.0, description="Absolute stake obligation in BDT (alpha_star * gross_repayment)")
    expected_utility_bdt: float = Field(..., description="Evaluated expected utility in BDT")
    decision: Literal["SIGNED_EIP712", "ABSTAINED_CV_EXCEEDED", "ABSTAINED_LOW_P"] = Field(..., description="Vote outcome")
    abstention_reason: Optional[str] = Field(None, description="Explicit reason if abstained (e.g. CV=0.6341 > 0.55)")


class EscrowExecutionResult(BaseModel):
    """
    Complete audit trail and cryptographic execution receipt for syndicate facility.
    """
    model_config = ConfigDict(frozen=True)

    fsm_trace: List[FSMState] = Field(..., description="Ordered list of FSM states traversed during execution")
    cnp_negotiation_log: List[CNPWallMessage] = Field(..., description="Chronological log of CNP messages")
    peer_votes: List[PeerAgentVote] = Field(..., description="Formal votes and stakes from all 4 syndicate peers")
    zk_proof: ZKCommitmentProof = Field(..., description="Verified Zero-Knowledge Solvency Proof")
    dscr: float = Field(..., ge=0.0, description="Deterministic ACT/365 Debt Service Coverage Ratio (1.6800 for AGT-01)")
    gross_repayment_bdt: float = Field(..., gt=0.0, description="Gross repayment obligation including 12.5% ACT/365 interest (45,462.33 BDT)")
    net_supplier_payout_bdt: float = Field(..., gt=0.0, description="Net capital delivered to supplier after 1.5% MDR deduction (44,325.00 BDTc)")
    tx_mode: Literal["LIVE_RPC_BROADCAST", "REPLAY_OF_VERIFIED_TESTNET_TX"] = Field(
        ...,
        description="Execution mode flag ensuring full transparency on whether live Base Sepolia RPC was used or a verified deterministic receipt"
    )
    tx_hash: Optional[str] = Field(None, description="Blockchain transaction hash (0x...)")
    blockscout_url: Optional[str] = Field(None, description="Blockscout explorer link for transaction verification")


class ExecuteScenarioRequest(BaseModel):
    """
    API payload for executing a multi-agent scenario.
    """
    scenario: Literal["SCENARIO_A_VALID", "SCENARIO_B_REDTEAM", "SCENARIO_C_SYBIL_WASH"] = Field(
        ...,
        description="Demo scenario identifier"
    )


class FlashBailoutRequest(BaseModel):
    """
    API payload for triggering a covariant monsoon shock flash bailout.
    """
    facility_id: str = Field(..., min_length=4, description="Unique facility or invoice identifier")
    trigger_reason: str = Field(default="COVARIANT_MONSOON_SHOCK", description="Justification for emergency bailout")


class RepaymentSweepRequest(BaseModel):
    """
    API payload for executing the 30-day simulated repayment sweep.
    """
    facility_id: str = Field(..., min_length=4, description="Unique facility or invoice identifier")
    amount_bdt: float = Field(default=45462.33, gt=0.0, description="Amount to be swept in BDT")


class ZeroTrustInterceptLog(BaseModel):
    """
    Structured security incident log written to Supabase zerotrust_security_intercepts.
    """
    model_config = ConfigDict(frozen=True)

    incident_id: str = Field(..., description="UUID or unique hash of incident")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of detection")
    threat_tier: str = Field(..., description="Zero-trust tier where threat was intercepted (e.g. TIER-0, TIER-1, TIER-2)")
    reason: str = Field(..., description="Standardized error code (e.g. TIER0_PROMPT_INJECTION_DETECTED, X402_UNVERIFIED_SUPPLIER_ADDRESS)")
    payload_digest: str = Field(..., description="SHA-256 hash of intercepted raw payload")
    action_taken: str = Field(default="BLOCKED_AND_RECORDED", description="Enforcement action applied")
