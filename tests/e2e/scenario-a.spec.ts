// Policy: never modify code under test to make a test pass — stop and report instead.
// Policy: never skip or delete failing tests quietly — fix the test or report it blocked.
// Policy: external APIs are mocked (page.route fulfill); own contract data is the locked fixture below.
import { test, expect } from "@playwright/test";

// Length-safe hex builders for cryptographic-looking fixture blobs.
const hex = (seed: string, len: number) => `0x${(seed + "0".repeat(len)).slice(0, len)}`;

// Locked Scenario A numbers (CONTEXT.md §1/§4 — do not re-derive).
const SCENARIO_A_RESULT = {
  fsm_trace: [
    "IDLE_MONITORING",
    "INTENT_PERCEPTION",
    "DETERMINISTIC_AUDIT",
    "SYNDICATE_P2P_NEGOTIATION",
    "ESCROW_COSIGN_AND_SETTLE",
  ],
  cnp_negotiation_log: [
    {
      round_num: 1,
      sender_agent: "AGT-01",
      message_type: "CFP_BROADCAST",
      proposed_alpha: 0,
      proposed_yield_apr_bps: 0,
      expected_utility_bdt: 0,
      detail:
        "CreditGuaranteeRequest: principal 45,000.00 BDT, gross repayment R1 = 45,462.33 BDT (12.50% APR ACT/365, 30 days).",
    },
    {
      round_num: 1,
      sender_agent: "AGT-04",
      message_type: "PROVISIONAL_BID",
      proposed_alpha: 0.4,
      proposed_yield_apr_bps: 85,
      expected_utility_bdt: 169.85,
      detail: "Raw bid 51.6% capped to 40.0% by maxAlphaBps=4000 session-key bound; reservation yield 0.85% APR.",
    },
    {
      round_num: 2,
      sender_agent: "AGT-02",
      message_type: "DEFICIT_REALLOCATION",
      proposed_alpha: 0.35,
      proposed_yield_apr_bps: 100,
      expected_utility_bdt: 64.12,
      detail: "Steps up 28.2% -> 35.0% at clearing yield phi* = 1.00% APR (100 bps) to absorb the 11.6% deficit.",
    },
    {
      round_num: 2,
      sender_agent: "AGT-03",
      message_type: "DEFICIT_REALLOCATION",
      proposed_alpha: 0.25,
      proposed_yield_apr_bps: 100,
      expected_utility_bdt: 51.4,
      detail: "Steps up 20.2% -> 25.0%; 7:5 assortative ratio with AGT-02 preserved (E[U]=+51.40 BDT).",
    },
    {
      round_num: 3,
      sender_agent: "AGT-01",
      message_type: "NASH_EQUILIBRIUM_CLEARED",
      proposed_alpha: 1,
      proposed_yield_apr_bps: 100,
      expected_utility_bdt: 0,
      detail: "Nash quorum lock: 40/35/25 = 100.0% of R1 = 45,462.33 BDT; 4-of-5 EIP-712 signatures verified.",
    },
  ],
  peer_votes: [
    {
      agent_id: "AGT-04",
      alpha_star: 0.4,
      stake_bdt: 18184.93,
      expected_utility_bdt: 169.85,
      decision: "SIGNED_EIP712",
      abstention_reason: null,
    },
    {
      agent_id: "AGT-02",
      alpha_star: 0.35,
      stake_bdt: 15911.82,
      expected_utility_bdt: 64.12,
      decision: "SIGNED_EIP712",
      abstention_reason: null,
    },
    {
      agent_id: "AGT-03",
      alpha_star: 0.25,
      stake_bdt: 11365.58,
      expected_utility_bdt: 51.4,
      decision: "SIGNED_EIP712",
      abstention_reason: null,
    },
    {
      agent_id: "AGT-05",
      alpha_star: 0,
      stake_bdt: 0,
      expected_utility_bdt: -142.6,
      decision: "ABSTAINED_CV_EXCEEDED",
      abstention_reason: "CV=0.634 > 0.55 liquidity stress threshold",
    },
  ],
  zk_proof: {
    commitment_hex: hex("029f8a7e3d1c4b8a2e5f6d0c9b8a7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e", 66),
    display_short_hex: "0x029f8a...",
    excess_commitment_hex: hex("0245c3ea3a5a9186fde2eaced509efe564d612618fa29915462be54fd7b6b4af5e", 66),
    bit_range_proofs: [],
    psi_supplier_hmac_hex: hex("7c49b6b8b0e457f59d57a9f886f4cf91d7ad19fa5183dbfa048037dc9a9cfb01", 64),
    dscr_verified_ge_125: true,
    supplier_kyb_verified: true,
    collusion_entropy_pass: true,
    fate_survival_prob_p: 0.985,
  },
  dscr: 1.68,
  gross_repayment_bdt: 45462.33,
  net_supplier_payout_bdt: 44325.0,
  tx_mode: "LIVE_RPC_BROADCAST",
  tx_hash: hex("9c1a4d02b7e6f35a81c0d9a4e2b1f7c35d8a06e9b4c2f1d3e5a7b9c0d2f4e6a8", 64),
  blockscout_url: `https://base-sepolia.blockscout.com/tx/${hex("9c1a4d02b7e6f35a81c0d9a4e2b1f7c35d8a06e9b4c2f1d3e5a7b9c0d2f4e6a8", 64)}`,
  quorum_signatures: [
    hex("7c49b6b8b0e457f59d57a9f886f4cf91d7ad19fa5183dbfa048037dc9a9cfb01", 130),
    hex("3e18a452db1698fba0e0984dafc126b47c093a129ef387bc018a7c645398dbe2", 130),
    hex("892a0957dc162fb49021ebc87023da4091bc2e8471c26b485901d8ab439ef127", 130),
    hex("4a01c89db1548e23901caef470129bc83901ba238ce10984b5c70189de32091c", 130),
  ],
  // page.tsx consumes the nested tx_result for the settlement feed + tx-mode badge
  tx_result: {
    tx_mode: "LIVE_RPC_BROADCAST",
    tx_hash: hex("9c1a4d02b7e6f35a81c0d9a4e2b1f7c35d8a06e9b4c2f1d3e5a7b9c0d2f4e6a8", 64),
    explorer_url: `https://base-sepolia.blockscout.com/tx/${hex("9c1a4d02b7e6f35a81c0d9a4e2b1f7c35d8a06e9b4c2f1d3e5a7b9c0d2f4e6a8", 64)}`,
    net_supplier_payout_bdt: 44325.0,
    mdr_fee_bdt: 675.0,
  },
};

test("Scenario A renders locked CNP negotiation, ZK solvency and settlement from mocked execute API", async ({
  page,
}) => {
  // Route-mock ONLY the execute endpoint; everything else stays real.
  await page.route("**/api/kendra/execute", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCENARIO_A_RESULT),
    });
  });

  await page.goto("/");

  // Landing is the default view; switch to the 3-panel cockpit via the header tab.
  await page.getByRole("button", { name: "Command Center", exact: true }).click();

  // Scenario A button lives in MerchantMobilePanel.
  await page.getByRole("button", { name: /Scenario A: Valid Restock/ }).click();

  // DSCR renders as "DSCR = 1.6800x" in the ZK Solvency card.
  await expect(page.getByText("DSCR = 1.6800x")).toBeVisible();

  // Gross repayment R1 renders in several containers (quorum hub, table total, settlement).
  await expect(page.getByText("45,462.33").first()).toBeVisible();

  // Three SIGNED stakes in the Besley-Coate Nash table (page 1 = AGT-04/02/03).
  const signedStakes: Array<[string, string]> = [
    ["AGT-04", "18,184.93"],
    ["AGT-02", "15,911.82"],
    ["AGT-03", "11,365.58"],
  ];
  for (const [agent, stake] of signedStakes) {
    const row = page.getByRole("row", { name: new RegExp(agent) });
    await expect(row).toContainText(stake);
    await expect(row).toContainText("SIGNED (EIP-712)");
  }
  await expect(page.getByText("SIGNED (EIP-712)")).toHaveCount(3);

  // Tx-mode badge: header pill + settlement panel badge for LIVE_RPC_BROADCAST.
  await expect(page.getByText("LIVE TESTNET")).toBeVisible();
  await expect(page.getByText("[LIVE RPC BROADCAST]")).toBeVisible();

  // The Part 6 retry/error banner must NOT appear — mock returns 200.
  // (getByRole("alert") also matches the empty Next.js dev route announcer, so target banner text.)
  await expect(page.getByText("Scenario Execution Failed")).toHaveCount(0);
});
