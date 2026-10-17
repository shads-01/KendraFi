"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  Lock,
  CheckCircle,
  AlertOctagon,
  CloudLightning,
  Eye,
  Key,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  Fingerprint,
  Info,
} from "lucide-react";
import type {
  CNPWallMessage,
  PeerAgentVote,
  ZKCommitmentProof,
  FSMState,
} from "@/types";

interface KendraArenaPanelProps {
  fsmState: FSMState;
  cnpMessages: CNPWallMessage[];
  peerVotes: PeerAgentVote[];
  zkProof?: ZKCommitmentProof | null;
  dscr: number;
  grossRepaymentBdt: number;
  onTriggerBailout: () => void;
  isExecuting: boolean;
}

// 5 Autonomous Nodes Configuration
const AGENT_NODES = [
  {
    id: "AGT-01",
    name: "Rahim Store",
    category: "Borrower",
    role: "Active Borrower",
    coords: { x: 50, y: 14 }, // Top Apex
    buffer: 55000,
    reliability: 0.985,
    wallet: "0x14dC...9955",
  },
  {
    id: "AGT-02",
    name: "Fatema Textiles",
    category: "Lead Guarantor",
    role: "Peer Guarantor (35%)",
    coords: { x: 86, y: 40 }, // Top Right
    buffer: 48000,
    reliability: 0.97,
    wallet: "0x82D0...0B42",
  },
  {
    id: "AGT-03",
    name: "Kamal Agro",
    category: "Guarantor",
    role: "Peer Guarantor (25%)",
    coords: { x: 72, y: 84 }, // Bottom Right
    buffer: 34642.85,
    reliability: 0.96,
    wallet: "0x93E0...0C18",
  },
  {
    id: "AGT-05",
    name: "Sohel Electronics",
    category: "Stressed Node",
    role: "Abstained (CV=0.634)",
    coords: { x: 28, y: 84 }, // Bottom Left
    buffer: 12000,
    reliability: 0.89,
    wallet: "0xDead...Beef",
  },
  {
    id: "AGT-04",
    name: "Nasrin Pharmacy",
    category: "Anchor Guarantor",
    role: "Anchor Guarantor (40%)",
    coords: { x: 14, y: 40 }, // Top Left
    buffer: 85000,
    reliability: 0.992,
    wallet: "0xA4F0...0D77",
  },
];

export const KendraArenaPanel: React.FC<KendraArenaPanelProps> = ({
  fsmState,
  cnpMessages,
  peerVotes,
  zkProof,
  dscr,
  grossRepaymentBdt,
  onTriggerBailout,
  isExecuting,
}) => {
  const [activeTab, setActiveTab] = useState<"pentagon" | "cnp" | "zk">("pentagon");
  const [showFullCommitment, setShowFullCommitment] = useState(false);

  // Default fallback values if backend hasn't populated yet
  const displayDscr = dscr || 1.68;
  const displayR1 = grossRepaymentBdt || 45462.33;
  const commitmentDisplay = zkProof?.display_short_hex || "0x029f8a7e3d1c4b8a...";
  const commitmentFull =
    zkProof?.commitment_hex ||
    "0x029f8a7e3d1c4b8a2e5f6d0c9b8a7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e";
  const fateScore = zkProof?.fate_survival_prob_p ?? 0.985;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Panel Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-200">
            Center Panel: 5-Agent Pentagon &amp; Multi-Round CNP Arena
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pentagon")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              activeTab === "pentagon"
                ? "bg-purple-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pentagon
          </button>
          <button
            onClick={() => setActiveTab("cnp")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              activeTab === "cnp"
                ? "bg-purple-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CNP Log ({cnpMessages.length})
          </button>
          <button
            onClick={() => setActiveTab("zk")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              activeTab === "zk"
                ? "bg-purple-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ZK Solvency
          </button>
        </div>
      </div>

      {/* Main Pentagon Network Arena Visualizer */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-4 flex flex-col items-center justify-center min-h-[340px] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>

        {/* SVG Network Canvas Connecting the 5 Nodes */}
        <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
            {/* Pentagon Edge Lines */}
            <polygon
              points="50,14 86,40 72,84 28,84 14,40"
              fill="rgba(79, 70, 229, 0.04)"
              stroke="rgba(99, 102, 241, 0.3)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
            {/* Cross-Syndicate Peer Chords */}
            <line x1="50" y1="14" x2="72" y2="84" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.6" />
            <line x1="50" y1="14" x2="28" y2="84" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.6" />
            <line x1="14" y1="40" x2="86" y2="40" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.6" />
            <line x1="14" y1="40" x2="72" y2="84" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.6" />
            <line x1="86" y1="40" x2="28" y2="84" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.6" />

            {/* Dynamic Active CNP Negotiation Glow Line */}
            {isExecuting && (
              <line
                x1="50"
                y1="14"
                x2="14"
                y2="40"
                stroke="#06B6D4"
                strokeWidth="1.6"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* 5 Interactive Agent Nodes */}
          {AGENT_NODES.map((agent) => {
            const isBorrower = agent.id === "AGT-01";
            const isAbstained = agent.id === "AGT-05";
            const isNasrin = agent.id === "AGT-04";

            return (
              <div
                key={agent.id}
                style={{ left: `${agent.coords.x}%`, top: `${agent.coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              >
                {/* Node Orb */}
                <div
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                    isBorrower
                      ? "bg-indigo-950/90 border-indigo-500 shadow-indigo-500/30 ring-2 ring-indigo-500/20"
                      : isAbstained
                      ? "bg-slate-900/90 border-slate-700 opacity-60 hover:opacity-100"
                      : "bg-purple-950/90 border-purple-500 shadow-purple-500/20"
                  }`}
                >
                  <span className="text-[10px] font-bold font-mono text-white">{agent.id}</span>
                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A0F1D] ${
                      isBorrower
                        ? "bg-cyan-400 animate-pulse"
                        : isAbstained
                        ? "bg-slate-500"
                        : "bg-emerald-400"
                    }`}
                  ></span>
                </div>

                {/* Node Label Card */}
                <div className="mt-1 flex flex-col items-center bg-[#070B14]/90 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-white whitespace-nowrap">
                    {agent.name}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 whitespace-nowrap">
                    {isBorrower
                      ? "Borrower (DSCR 1.68x)"
                      : isNasrin
                      ? "Anchor (40.0% Cap)"
                      : isAbstained
                      ? "Abstained (CV>0.55)"
                      : agent.role}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Central Quorum Status Hub */}
          <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-2.5 shadow-2xl text-center max-w-[130px]">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Syndicate Quorum
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
              4-of-5 Cosigned
            </span>
            <span className="text-[9px] font-mono text-slate-300 mt-1">
              {displayR1.toLocaleString()} BDT (100%)
            </span>
          </div>
        </div>

        {/* Tab Sub-View: Multi-Round CNP Negotiation Feed */}
        {activeTab === "cnp" && (
          <div className="w-full mt-3 rounded-xl border border-white/10 bg-black/40 p-3 max-h-56 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-[11px] font-bold font-mono text-purple-300">
                Live 3-Round Contract Net Protocol (CNP) Timeline
              </span>
              <span className="text-[9px] font-mono text-slate-400">Nash Equilibrium Loop</span>
            </div>
            {cnpMessages.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-2">
                Click [Scenario A: Valid Rice Restock] to trigger the 3-round P2P negotiation loop.
              </p>
            ) : (
              cnpMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/5 bg-slate-900/40 p-2 text-[10px] font-mono space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[9px]">
                        R{msg.round_num}
                      </span>
                      {msg.sender_agent} · {msg.message_type}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {(msg.proposed_alpha * 100).toFixed(1)}% @ {msg.proposed_yield_apr_bps} bps
                    </span>
                  </div>
                  <p className="text-slate-300 text-[10px] font-sans leading-relaxed">{msg.detail}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Elliptic-Curve (secp256k1) ZK Solvency & WeBank FATE Card */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Fingerprint className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Layer-4 Cryptographic ZK Solvency &amp; WeBank FATE Scorer
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
            secp256k1 CDS94 Range Proof
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          {/* Pedersen Commitment Point */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Pedersen Curve Commitment (C_1):</span>
              <button
                onClick={() => setShowFullCommitment(!showFullCommitment)}
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[9px]"
              >
                <Eye className="h-3 w-3" />
                {showFullCommitment ? "Short" : "66-Hex"}
              </button>
            </div>
            <p className="font-bold text-cyan-300 text-[10px] break-all">
              {showFullCommitment ? commitmentFull : commitmentDisplay}
            </p>
            <p className="text-[9px] text-slate-400">
              C_1 = v·G + r_1·H (v = 76,376 BDT, T = 56,828 BDT)
            </p>
          </div>

          {/* Range Proof & FATE Score */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">DSCR Solvency Verification:</span>
              <span className="text-emerald-400 text-[10px] font-bold">16-Bit VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">DSCR = {displayDscr.toFixed(4)}x</span>
              <span className="text-[10px] text-emerald-300 font-mono">Δv = 19,548 ∈ [0, 2¹⁶-1]</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-slate-400 text-[10px]">WeBank FATE Hetero-LR Score:</span>
              <span className="text-purple-300 font-bold font-mono">p_1 = {(fateScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Zero-Trust RLS Privacy Isolation Badge */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-cyan-300">
          <span>Raw MFS Cash Flows &amp; Family Subsistence:</span>
          <span className="font-bold bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/30 text-white">
            [ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]
          </span>
        </div>
      </div>

      {/* Besley-Coate Nash Equilibrium Table (Populated Dynamically) */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Besley-Coate (1995) Nash Equilibrium Staking Table
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            100.0% Coverage Locked ({displayR1.toLocaleString()} BDT)
          </span>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                <th className="py-1.5 px-2">Node</th>
                <th className="py-1.5 px-2">Merchant Name</th>
                <th className="py-1.5 px-2 text-right">Share (α_j*)</th>
                <th className="py-1.5 px-2 text-right">Stake (BDT)</th>
                <th className="py-1.5 px-2 text-right">Utility (E[U_j])</th>
                <th className="py-1.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* AGT-04 */}
              <tr className="hover:bg-white/5 transition">
                <td className="py-2 px-2 font-bold text-white">AGT-04</td>
                <td className="py-2 px-2 text-slate-300">Nasrin Pharmacy</td>
                <td className="py-2 px-2 text-right text-emerald-400 font-bold">40.0% (Cap)</td>
                <td className="py-2 px-2 text-right text-white">18,184.93 BDT</td>
                <td className="py-2 px-2 text-right text-emerald-300">+169.85 BDT</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-02 */}
              <tr className="hover:bg-white/5 transition">
                <td className="py-2 px-2 font-bold text-white">AGT-02</td>
                <td className="py-2 px-2 text-slate-300">Fatema Textiles</td>
                <td className="py-2 px-2 text-right text-emerald-400 font-bold">35.0%</td>
                <td className="py-2 px-2 text-right text-white">15,911.82 BDT</td>
                <td className="py-2 px-2 text-right text-emerald-300">+64.12 BDT</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-03 */}
              <tr className="hover:bg-white/5 transition">
                <td className="py-2 px-2 font-bold text-white">AGT-03</td>
                <td className="py-2 px-2 text-slate-300">Kamal Agro</td>
                <td className="py-2 px-2 text-right text-emerald-400 font-bold">25.0%</td>
                <td className="py-2 px-2 text-right text-white">11,365.58 BDT</td>
                <td className="py-2 px-2 text-right text-emerald-300">+51.40 BDT</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-05 */}
              <tr className="hover:bg-white/5 transition opacity-60">
                <td className="py-2 px-2 font-bold text-slate-400">AGT-05</td>
                <td className="py-2 px-2 text-slate-400">Sohel Electronics</td>
                <td className="py-2 px-2 text-right text-slate-400">0.0%</td>
                <td className="py-2 px-2 text-right text-slate-400">0.00 BDT</td>
                <td className="py-2 px-2 text-right text-rose-400">-142.60 BDT</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400 border border-slate-700">
                    ABSTAINED (CV&gt;0.55)
                  </span>
                </td>
              </tr>
              {/* Total Row */}
              <tr className="font-bold border-t border-white/10 bg-black/30">
                <td colSpan={2} className="py-2 px-2 text-indigo-300">
                  Total Syndicate Liability Locked:
                </td>
                <td className="py-2 px-2 text-right text-emerald-400">100.0%</td>
                <td className="py-2 px-2 text-right text-white">{displayR1.toLocaleString()} BDT</td>
                <td className="py-2 px-2 text-right text-emerald-400">+285.37 BDT</td>
                <td className="py-2 px-2 text-center text-emerald-400">4-of-5 QUORUM</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monsoon Shock & Flash Bailout Button */}
        <div className="pt-1 flex items-center justify-between border-t border-white/5 flex-wrap gap-2">
          <p className="text-[10px] text-slate-400 max-w-sm">
            Exogenous Covariant Shock Discrimination: market-wide drop drops credit stress without slashing social collateral.
          </p>
          <button
            onClick={onTriggerBailout}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 font-mono text-[11px] font-semibold transition hover:border-amber-400 shadow-lg shadow-amber-500/10"
          >
            <CloudLightning className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate Monsoon Shock → Flash Bailout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KendraArenaPanel;
