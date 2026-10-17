"use client";

import React, { useState } from "react";
import JudgeCommandHeader from "@/components/JudgeCommandHeader";
import MerchantMobilePanel from "@/components/MerchantMobilePanel";
import KendraArenaPanel from "@/components/KendraArenaPanel";
import type {
  FSMState,
  TransactionMode,
  ScenarioType,
  CNPWallMessage,
  PeerAgentVote,
  ZKCommitmentProof,
} from "@/types";
import { ShieldAlert, ExternalLink, CheckCircle2, Lock, Cpu, Server } from "lucide-react";

export default function HomePage() {
  const [fsmState, setFsmState] = useState<FSMState>("IDLE_MONITORING");
  const [txMode, setTxMode] = useState<TransactionMode>("LIVE_RPC_BROADCAST");
  const [latencyMs, setLatencyMs] = useState<number>(14.2);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("SCENARIO_A_VALID");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Dynamic Execution State
  const [cnpMessages, setCnpMessages] = useState<CNPWallMessage[]>([]);
  const [peerVotes, setPeerVotes] = useState<PeerAgentVote[]>([]);
  const [zkProof, setZkProof] = useState<ZKCommitmentProof | null>(null);
  const [dscr, setDscr] = useState<number>(1.68);
  const [grossRepaymentBdt, setGrossRepaymentBdt] = useState<number>(45462.33);
  const [repaymentProgress, setRepaymentProgress] = useState<{
    sweptBdt: number;
    days: number;
    yieldPaidBdt: number;
  } | null>(null);

  // Right Panel Live Intercept Alert
  const [securityAlert, setSecurityAlert] = useState<{
    active: boolean;
    tier: string;
    message: string;
    color: string;
  } | null>(null);

  const [txResult, setTxResult] = useState<{
    txHash?: string;
    explorerUrl?: string;
    netPayoutBdt?: number;
    mdrFeeBdt?: number;
  } | null>(null);

  // Execute scenario via Next.js BFF route
  const handleSelectScenario = async (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    setIsExecuting(true);
    const startTime = performance.now();

    if (scenario === "SCENARIO_B_REDTEAM") {
      setFsmState("BLOCKED_ADVERSARIAL");
      setSecurityAlert({
        active: true,
        tier: "Tier-0 OCR + x402 Firewall Intercept",
        message:
          "TIER0_PROMPT_INJECTION_DETECTED: Stamped invoice contains adversarial instructions. X402_UNVERIFIED_SUPPLIER_ADDRESS: Patuatuli Parts Hub (0xDead...Beef) is not on KYB corporate whitelist.",
        color: "rose",
      });
    } else if (scenario === "SCENARIO_C_SYBIL_WASH") {
      setFsmState("FLASH_BAILOUT_ACTIVE");
      setSecurityAlert({
        active: true,
        tier: "Spatio-Temporal & Wash-Trading Entropy Intercept",
        message:
          "SYBIL_WASH_COLLUSION_HOLD: Circular A→B→A MFS transaction graph detected. Spatial-temporal collusion entropy H_st dropped below 0.65 threshold.",
        color: "purple",
      });
    } else {
      setFsmState("INTENT_PERCEPTION");
      setSecurityAlert(null);
    }

    try {
      const res = await fetch("/api/kendra/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const elapsed = performance.now() - startTime;
      setLatencyMs(elapsed);

      if (res.ok) {
        const data = await res.json();
        if (data.cnp_negotiation_log) setCnpMessages(data.cnp_negotiation_log);
        if (data.peer_votes) setPeerVotes(data.peer_votes);
        if (data.zk_proof) setZkProof(data.zk_proof);
        if (data.dscr) setDscr(data.dscr);
        if (data.gross_repayment_bdt) setGrossRepaymentBdt(data.gross_repayment_bdt);
        if (data.tx_result) {
          setTxResult({
            txHash: data.tx_result.tx_hash,
            explorerUrl: data.tx_result.explorer_url,
            netPayoutBdt: data.tx_result.net_supplier_payout_bdt,
            mdrFeeBdt: data.tx_result.mdr_fee_bdt,
          });
          if (data.tx_result.tx_mode) setTxMode(data.tx_result.tx_mode);
        }

        if (scenario === "SCENARIO_A_VALID") {
          setFsmState("ESCROW_COSIGN_AND_SETTLE");
        }
      }
    } catch (err) {
      console.error("Execution error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Trigger post-loan simulated 30-day MFS repayment sweep
  const handleTriggerRepaySweep = async () => {
    setIsExecuting(true);
    setFsmState("INTENT_PERCEPTION");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/kendra/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facility_id: "FAC-AGT01-2026-001", amount_bdt: 45462.33 }),
      });

      const elapsed = performance.now() - startTime;
      setLatencyMs(elapsed);

      if (res.ok) {
        const data = await res.json();
        setRepaymentProgress({
          sweptBdt: 45462.33,
          days: 30,
          yieldPaidBdt: 37.37,
        });
        setFsmState("ESCROW_COSIGN_AND_SETTLE");
      }
    } catch (err) {
      console.error("Repay sweep error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Trigger monsoon flash bailout
  const handleTriggerBailout = async () => {
    setIsExecuting(true);
    setFsmState("FLASH_BAILOUT_ACTIVE");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/kendra/bailout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facility_id: "FAC-AGT01-2026-001",
          trigger_reason: "Covariant Monsoon Shock: market-wide Karwan Bazar sales drop -44.2%",
        }),
      });

      const elapsed = performance.now() - startTime;
      setLatencyMs(elapsed);
    } catch (err) {
      console.error("Bailout error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col">
      {/* Top HUD Header */}
      <JudgeCommandHeader
        fsmState={fsmState}
        txMode={txMode}
        latencyMs={latencyMs}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        isExecuting={isExecuting}
      />

      {/* Main 3-Panel Split-Screen Container with Dynamic Judge Zoom */}
      <main
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
        className="flex-1 w-full max-w-[1720px] mx-auto p-5 transition-transform duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: Merchant Mobile & Scenarios (4 Cols) */}
          <section className="lg:col-span-4 flex flex-col">
            <MerchantMobilePanel
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              onTriggerRepaySweep={handleTriggerRepaySweep}
              isExecuting={isExecuting}
              repaymentProgress={repaymentProgress}
            />
          </section>

          {/* CENTER PANEL: 5-Agent Pentagon Arena & ZK Solvency (5 Cols) */}
          <section className="lg:col-span-5 flex flex-col">
            <KendraArenaPanel
              fsmState={fsmState}
              cnpMessages={cnpMessages}
              peerVotes={peerVotes}
              zkProof={zkProof}
              dscr={dscr}
              grossRepaymentBdt={grossRepaymentBdt}
              onTriggerBailout={handleTriggerBailout}
              isExecuting={isExecuting}
            />
          </section>

          {/* RIGHT PANEL: Zero-Trust Security & On-Chain Settlement (3 Cols) */}
          <section className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#E8F8F0]">
                  <Lock className="h-4 w-4 text-[#00A35C]" />
                </div>
                <h2 className="text-sm font-bold text-[#1A1D1F]">
                  Security &amp; Settlement
                </h2>
              </div>
              <span className="chip-info text-[10px]">
                Prompt 10 Ready
              </span>
            </div>

            {/* High-Visibility Security Intercept Alert — Planora blush/peach elevated card */}
            {securityAlert && (
              <div
                className={`planora-card-elevated flex flex-col gap-2 animate-pulse ${
                  securityAlert.color === "rose"
                    ? "!bg-[#FEECEE] !border-[#FF1744]/30"
                    : "!bg-[#FFF0E6] !border-[#FF5C00]/30"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className={`h-4 w-4 ${
                    securityAlert.color === "rose" ? "text-[#FF1744]" : "text-[#FF5C00]"
                  }`} />
                  <span className={
                    securityAlert.color === "rose" ? "text-[#FF1744]" : "text-[#FF5C00]"
                  }>{securityAlert.tier}</span>
                </div>
                <p className="text-[11px] text-[#2D3135] leading-relaxed">{securityAlert.message}</p>
              </div>
            )}

            {/* 4-Tier Security Gate Summary Card */}
            <div className="planora-card space-y-2.5 text-[12px]">
              <span className="text-[13px] font-bold text-[#1A1D1F] block border-b border-[#EDEFF2] pb-2">
                4-Tier Zero-Trust Guardrails
              </span>
              <div className="flex justify-between items-center">
                <span className="text-[#717579]">Tier 0: Multimodal Prompt Sanitizer:</span>
                <span className="chip-success">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#717579]">Tier 1: Bounded ERC-4337 Session Keys:</span>
                <span className="chip-progress">40% CAP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#717579]">Tier 2: NumPy Zero-LLM Risk Engine:</span>
                <span className="chip-info">DSCR 1.68x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#717579]">Tier 3: KendraEscrow EIP-712 Quorum:</span>
                <span className="chip-success">PARIS EVM</span>
              </div>
            </div>

            {/* On-Chain Settlement Card */}
            <div className="planora-card space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between border-b border-[#EDEFF2] pb-2">
                <span className="text-[13px] font-bold text-[#1A1D1F]">
                  Direct B2B Escrow Settlement
                </span>
                <span className="chip-success text-[9px]">
                  Topic F (+5 Bonus)
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#717579]">Loan Principal:</span>
                  <span className="text-[#1A1D1F] font-bold">45,000.00 BDTc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717579]">Wholesaler MDR (1.5%):</span>
                  <span className="text-[#FF1744] font-bold">-675.00 BDTc</span>
                </div>
                <div className="flex justify-between border-t border-[#EDEFF2] pt-1.5">
                  <span className="text-[#717579]">Net Supplier Direct Payout:</span>
                  <span className="text-[#00A35C] font-bold">44,325.00 BDTc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717579]">Gross Borrower Repayment:</span>
                  <span className="text-[#1A1D1F] font-bold">45,462.33 BDTc</span>
                </div>
              </div>

              {/* Blockscout Link — Planora pill button */}
              <div className="pt-2 border-t border-[#EDEFF2] flex flex-col gap-1.5">
                <span className="text-[10px] text-[#717579]">Base Sepolia / FISCO BCOS Receipt:</span>
                <a
                  href={
                    txResult?.explorerUrl ||
                    "https://base-sepolia.blockscout.com/tx/0x23f5b7b576f863dd1dc2c7032a151363aa3d4ad9f1af91017502753aea21c5b9"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-[#EBF5FF] bg-[#EBF5FF] hover:bg-[#D6EBFF] text-[#0084FF] text-[10px] font-mono transition group"
                >
                  <span className="truncate max-w-[210px]">
                    {txResult?.txHash || "0x23f5b7b576f863dd1dc2c7032a151363aa3d4ad9f1af91017502753aea21c5b9"}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
