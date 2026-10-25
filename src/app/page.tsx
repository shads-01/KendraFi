"use client";

import React, { useState } from "react";
import JudgeCommandHeader, { type HeaderViewType } from "@/components/JudgeCommandHeader";
import AuthNav from "@/components/AuthNav";
import MerchantMobilePanel from "@/components/MerchantMobilePanel";
import KendraArenaPanel from "@/components/KendraArenaPanel";
import SecurityEscrowPanel from "@/components/SecurityEscrowPanel";
import ProtocolLandingView from "@/components/ProtocolLandingView";
import MonteCarloAnalyticsView from "@/components/MonteCarloAnalyticsView";
import type {
  FSMState,
  TransactionMode,
  ScenarioType,
  CNPWallMessage,
  PeerAgentVote,
  ZKCommitmentProof,
} from "@/types";

export default function HomePage() {
  const [activeView, setActiveView] = useState<HeaderViewType>("landing");
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
  const [quorumSignatures, setQuorumSignatures] = useState<string[]>([]);
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

  // Last failed scenario/API call: banner message + retry closure re-invoking it with original args
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const apiErrorMessage = (res: Response, data: unknown): string => {
    const err = (data as { error?: unknown } | null)?.error;
    if (typeof err === "string" && err) return err;
    if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
    return `Request failed (HTTP ${res.status})`;
  };

  // Execute scenario via Next.js BFF route
  const handleSelectScenario = (scenario: ScenarioType) => {
    setRetryAction(() => () => handleSelectScenario(scenario));
    setLastError(null);
    void runScenario(scenario);
  };

  const runScenario = async (scenario: ScenarioType) => {
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
        if (data.quorum_signatures) setQuorumSignatures(data.quorum_signatures);
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
      } else {
        const errorData = await res.json().catch(() => ({}));
        const reqId = res.headers.get("x-request-id") || "none";
        console.error(`[API Error] Status ${res.status} (X-Request-ID: ${reqId}):`, errorData?.error?.message || errorData?.error || res.statusText);
        setLastError(apiErrorMessage(res, errorData));
      }
    } catch (err: unknown) {
      console.error("Execution error:", err);
      setLastError(err instanceof Error ? err.message : "Network error: could not reach the Kendra execution engine.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Launch scenario directly from landing page or anywhere else
  const handleLaunchScenarioFromLanding = (scenario: ScenarioType) => {
    setActiveView("command_center");
    handleSelectScenario(scenario);
  };

  // Trigger post-loan simulated 30-day MFS repayment sweep
  const handleTriggerRepaySweep = () => {
    setRetryAction(() => handleTriggerRepaySweep);
    setLastError(null);
    void runRepaySweep();
  };

  const runRepaySweep = async () => {
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
        await res.json();
        setRepaymentProgress({
          sweptBdt: 45462.33,
          days: 30,
          yieldPaidBdt: 37.37,
        });
        setFsmState("ESCROW_COSIGN_AND_SETTLE");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const reqId = res.headers.get("x-request-id") || "none";
        console.error(`[Repay Error] Status ${res.status} (X-Request-ID: ${reqId}):`, errorData?.error?.message || errorData?.error || res.statusText);
        setLastError(apiErrorMessage(res, errorData));
      }
    } catch (err: unknown) {
      console.error("Repay sweep error:", err);
      setLastError(err instanceof Error ? err.message : "Network error: could not reach the repayment sweep endpoint.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Trigger monsoon flash bailout
  const handleTriggerBailout = () => {
    setRetryAction(() => handleTriggerBailout);
    setLastError(null);
    void runBailout();
  };

  const runBailout = async () => {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const reqId = res.headers.get("x-request-id") || "none";
        console.error(`[Bailout Error] Status ${res.status} (X-Request-ID: ${reqId}):`, errorData?.error?.message || errorData?.error || res.statusText);
        setLastError(apiErrorMessage(res, errorData));
      }
    } catch (err: unknown) {
      console.error("Bailout error:", err);
      setLastError(err instanceof Error ? err.message : "Network error: could not reach the bailout endpoint.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col">
      {/* Auth-aware account nav (Part 4): login/signup links when signed out */}
      <AuthNav />

      {/* Top HUD Header with Multi-View Switcher */}
      <JudgeCommandHeader
        fsmState={fsmState}
        txMode={txMode}
        latencyMs={latencyMs}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        isExecuting={isExecuting}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content Area based on Active View */}
      {activeView === "landing" && (
        <main className="flex-1 w-full animate-fadeIn">
          <ProtocolLandingView
            onLaunchCommandCenter={() => setActiveView("command_center")}
            onLaunchBacktest={() => setActiveView("backtest")}
            onSelectScenarioAndLaunch={handleLaunchScenarioFromLanding}
          />
        </main>
      )}

      {activeView === "backtest" && (
        <main className="flex-1 w-full animate-fadeIn py-6">
          <MonteCarloAnalyticsView
            onBackToCommandCenter={() => setActiveView("command_center")}
          />
        </main>
      )}

      {activeView === "command_center" && (
        <main
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
          className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 transition-transform duration-300 animate-fadeIn"
        >
          <h1 className="sr-only">Judge Command Center</h1>
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
            <section className="lg:col-span-3 flex flex-col">
              <SecurityEscrowPanel
                fsmState={fsmState}
                activeScenario={activeScenario}
                securityAlert={securityAlert}
                txResult={txResult}
                txMode={txMode}
                quorumSignatures={quorumSignatures}
                grossRepaymentBdt={grossRepaymentBdt}
                dscr={dscr}
                isExecuting={isExecuting}
                lastError={lastError}
                onRetry={retryAction ?? undefined}
              />
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
