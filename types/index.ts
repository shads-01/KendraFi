/**
 * types/index.ts
 * Master TypeScript definitions mirroring Pydantic v2 schemas and domain entities.
 * Ensures complete type parity across Next.js frontend, BFF routes, and FastAPI backend.
 */

export type FSMState =
  | "IDLE_MONITORING"
  | "INTENT_PERCEPTION"
  | "DETERMINISTIC_AUDIT"
  | "SYNDICATE_P2P_NEGOTIATION"
  | "ESCROW_COSIGN_AND_SETTLE"
  | "BLOCKED_ADVERSARIAL"
  | "FLASH_BAILOUT_ACTIVE";

export interface ExtractedInvoiceIntent {
  borrower_agent_id: string; // "AGT-01" to "AGT-05"
  supplier_wallet: string;   // EIP-55 checksummed 0x... address
  supplier_id: string;       // e.g. "MEGHNA-01"
  amount_bdt: number;        // Principal in BDT
  tenor_days: number;        // Loan tenor
  raw_ocr_text: string;      // Raw OCR transcription
  item_summary: string;      // Restock item summary
}

export interface BitRangeProof {
  bit_index: number;            // 0 to 15
  commitment_point_hex: string; // 66 hex chars (02... / 03...)
  e0_hex: string;               // 64 hex chars
  z0_hex: string;               // 64 hex chars
  e1_hex: string;               // 64 hex chars
  z1_hex: string;               // 64 hex chars
}

export interface ZKCommitmentProof {
  commitment_hex: string;          // 66 hex chars
  display_short_hex: string;       // "0x029f8a..."
  excess_commitment_hex: string;   // 66 hex chars
  bit_range_proofs: BitRangeProof[]; // 16 CDS94 proofs
  psi_supplier_hmac_hex: string;   // 64 hex chars
  dscr_verified_ge_125: boolean;   // Verified cryptographically
  supplier_kyb_verified: boolean;  // KYB registry whitelist check
  collusion_entropy_pass: boolean; // H_st >= 0.65 check
  fate_survival_prob_p: number;    // Hetero-LR probability (e.g. 0.985)
}

export type CNPMessageType =
  | "CFP_BROADCAST"
  | "PROVISIONAL_BID"
  | "DEFICIT_REALLOCATION"
  | "NASH_EQUILIBRIUM_CLEARED";

export interface CNPWallMessage {
  round_num: number;
  sender_agent: string;
  message_type: CNPMessageType;
  proposed_alpha: number;
  proposed_yield_apr_bps: number;
  expected_utility_bdt: number;
  detail: string;
}

export type PeerAgentDecision =
  | "SIGNED_EIP712"
  | "ABSTAINED_CV_EXCEEDED"
  | "ABSTAINED_LOW_P";

export interface PeerAgentVote {
  agent_id: string;
  alpha_star: number;
  stake_bdt: number;
  expected_utility_bdt: number;
  decision: PeerAgentDecision;
  abstention_reason?: string | null;
}

export type TransactionMode =
  | "LIVE_RPC_BROADCAST"
  | "REPLAY_OF_VERIFIED_TESTNET_TX";

export interface EscrowExecutionResult {
  fsm_trace: FSMState[];
  cnp_negotiation_log: CNPWallMessage[];
  peer_votes: PeerAgentVote[];
  zk_proof: ZKCommitmentProof;
  dscr: number;                  // 1.6800 for AGT-01
  gross_repayment_bdt: number;   // 45,462.33 BDT
  net_supplier_payout_bdt: number; // 44,325.00 BDTc
  tx_mode: TransactionMode;
  tx_hash?: string | null;
  blockscout_url?: string | null;
}

export type ScenarioType =
  | "SCENARIO_A_VALID"
  | "SCENARIO_B_REDTEAM"
  | "SCENARIO_C_SYBIL_WASH";

export interface ExecuteScenarioRequest {
  scenario: ScenarioType;
}

export interface FlashBailoutRequest {
  facility_id: string;
  trigger_reason?: string;
}

export interface RepaymentSweepRequest {
  facility_id: string;
  amount_bdt?: number;
}

export interface ZeroTrustInterceptLog {
  incident_id: string;
  timestamp: string;
  threat_tier: string;
  reason: string;
  payload_digest: string;
  action_taken?: string;
}

export interface KendraAgent {
  agent_id: string;
  name: string;
  cluster: string;
  kyb_wallet_address: string;
  verified_kyb: boolean;
  credit_score_webank: number;
  buffer_capital_bdt: number;
  base_daily_inflow: number;
  cv_inflow: number;
}

export interface KYBSupplier {
  supplier_id: string;
  name: string;
  category: string;
  wallet_address: string;
  registration_number: string;
  whitelisted: boolean;
}
