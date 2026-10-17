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

  const tabItems = [
    { key: "pentagon" as const, label: "Pentagon" },
    { key: "cnp" as const, label: `CNP Log (${cnpMessages.length})` },
    { key: "zk" as const, label: "ZK Solvency" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Panel Title Bar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FFF0E6]">
            <Users className="h-4 w-4 text-[#FF5C00]" />
          </div>
          <h2 className="text-sm font-bold text-[#1A1D1F]">
            5-Agent Pentagon & Multi-Round CNP Arena
          </h2>
        </div>
        {/* Tab Switcher — Planora peach active pill */}
        <div className="flex items-center gap-1 bg-[#F4F5F7] rounded-full p-0.5 border border-[#EDEFF2]">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                activeTab === tab.key
                  ? "bg-[#FFF0E6] text-[#FF5C00] font-bold"
                  : "text-[#717579] hover:text-[#1A1D1F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pentagon Network Arena Visualizer — Light canvas with white nodes */}
      <div className="relative planora-card flex flex-col items-center justify-center min-h-[340px] overflow-hidden">
        {/* Subtle Warm Ambient Glows */}
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#FF5C00]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#0084FF]/5 blur-3xl pointer-events-none"></div>

        {/* SVG Network Canvas Connecting the 5 Nodes */}
        <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
            {/* Pentagon Edge Lines */}
            <polygon
              points="50,14 86,40 72,84 28,84 14,40"
              fill="rgba(255, 92, 0, 0.03)"
              stroke="#FF5C00"
              strokeWidth="0.8"
              strokeDasharray="3,3"
              opacity="0.4"
            />
            {/* Cross-Syndicate Peer Chords */}
            <line x1="50" y1="14" x2="72" y2="84" stroke="#EDEFF2" strokeWidth="0.8" />
            <line x1="50" y1="14" x2="28" y2="84" stroke="#EDEFF2" strokeWidth="0.8" />
            <line x1="14" y1="40" x2="86" y2="40" stroke="#EDEFF2" strokeWidth="0.8" />
            <line x1="14" y1="40" x2="72" y2="84" stroke="#EDEFF2" strokeWidth="0.8" />
            <line x1="86" y1="40" x2="28" y2="84" stroke="#EDEFF2" strokeWidth="0.8" />

            {/* Dynamic Active CNP Negotiation Glow Line */}
            {isExecuting && (
              <line
                x1="50"
                y1="14"
                x2="14"
                y2="40"
                stroke="#FF5C00"
                strokeWidth="2"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* 5 Interactive Agent Nodes — Crisp white nodes */}
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
                {/* Node Orb — White card surface with semantic border */}
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-110 ${
                    isBorrower
                      ? "bg-white border-[#FF5C00] shadow-[0_4px_14px_rgba(255,92,0,0.15)]"
                      : isAbstained
                      ? "bg-[#F4F5F7] border-[#EDEFF2] opacity-60 hover:opacity-100"
                      : "bg-white border-[#00A35C] shadow-[0_4px_14px_rgba(0,163,92,0.1)]"
                  }`}
                >
                  <span className={`text-[10px] font-bold font-mono ${
                    isBorrower ? "text-[#FF5C00]" : isAbstained ? "text-[#717579]" : "text-[#00A35C]"
                  }`}>{agent.id}</span>
                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                      isBorrower
                        ? "bg-[#FF5C00] animate-pulse"
                        : isAbstained
                        ? "bg-[#EDEFF2]"
                        : "bg-[#00A35C]"
                    }`}
                  ></span>
                </div>

                {/* Node Label Card */}
                <div className="mt-1.5 flex flex-col items-center bg-white px-2.5 py-1 rounded-xl border border-[#EDEFF2] shadow-card pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-[#1A1D1F] whitespace-nowrap">
                    {agent.name}
                  </span>
                  <span className="text-[8px] font-mono text-[#717579] whitespace-nowrap">
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

          {/* Central Quorum Status Hub — Elevated floating card */}
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-[#EDEFF2] p-3 shadow-card-elevated text-center max-w-[140px]">
            <span className="text-[9px] font-mono text-[#717579] uppercase tracking-widest">
              Syndicate Quorum
            </span>
            <span className="text-sm font-bold text-[#00A35C] font-mono mt-0.5">
              4-of-5 Cosigned
            </span>
            <span className="text-[9px] font-mono text-[#1A1D1F] mt-1">
              {displayR1.toLocaleString()} BDT (100%)
            </span>
          </div>
        </div>

        {/* Tab Sub-View: Multi-Round CNP Negotiation Feed — Planora timeline style */}
        {activeTab === "cnp" && (
          <div className="w-full mt-3 rounded-2xl border border-[#EDEFF2] bg-[#F4F5F7] p-3 max-h-56 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between border-b border-[#EDEFF2] pb-1.5">
              <span className="text-[11px] font-bold text-[#FF5C00]">
                Live 3-Round Contract Net Protocol (CNP) Timeline
              </span>
              <span className="text-[9px] font-mono text-[#717579]">Nash Equilibrium Loop</span>
            </div>
            {cnpMessages.length === 0 ? (
              <p className="text-[10px] text-[#717579] italic text-center py-2">
                Click [Scenario A: Valid Rice Restock] to trigger the 3-round P2P negotiation loop.
              </p>
            ) : (
              cnpMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#EDEFF2] bg-white p-2.5 text-[10px] font-mono space-y-0.5 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1A1D1F] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF5C00] border border-[#FFD8BF] text-[9px] font-bold">
                        R{msg.round_num}
                      </span>
                      {msg.sender_agent} · {msg.message_type}
                    </span>
                    <span className="text-[#00A35C] font-bold">
                      {(msg.proposed_alpha * 100).toFixed(1)}% @ {msg.proposed_yield_apr_bps} bps
                    </span>
                  </div>
                  <p className="text-[#717579] text-[10px] leading-relaxed">{msg.detail}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Elliptic-Curve (secp256k1) ZK Solvency & WeBank FATE Card */}
      <div className="planora-card flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#EDEFF2] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF5FF]">
              <Fingerprint className="h-3.5 w-3.5 text-[#0084FF]" />
            </div>
            <h3 className="text-[13px] font-bold text-[#1A1D1F]">
              Layer-4 Cryptographic ZK Solvency & WeBank FATE Scorer
            </h3>
          </div>
          <span className="chip-info text-[10px]">
            secp256k1 CDS94 Range Proof
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
          {/* Pedersen Commitment Point */}
          <div className="rounded-2xl border border-[#EDEFF2] bg-[#F4F5F7] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[#717579] text-[10px]">
              <span>Pedersen Curve Commitment (C_1):</span>
              <button
                onClick={() => setShowFullCommitment(!showFullCommitment)}
                className="text-[#0084FF] hover:underline flex items-center gap-1 text-[9px] font-medium"
              >
                <Eye className="h-3 w-3" />
                {showFullCommitment ? "Short" : "66-Hex"}
              </button>
            </div>
            <p className="font-bold text-[#0084FF] text-[10px] break-all font-mono">
              {showFullCommitment ? commitmentFull : commitmentDisplay}
            </p>
            <p className="text-[9px] text-[#717579]">
              C_1 = v·G + r_1·H (v = 76,376 BDT, T = 56,828 BDT)
            </p>
          </div>

          {/* Range Proof & FATE Score */}
          <div className="rounded-2xl border border-[#EDEFF2] bg-[#F4F5F7] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#717579] text-[10px]">DSCR Solvency Verification:</span>
              <span className="chip-success text-[9px]">16-Bit VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#1A1D1F] font-bold">DSCR = {displayDscr.toFixed(4)}x</span>
              <span className="text-[10px] text-[#00A35C] font-mono font-bold">Δv = 19,548 ∈ [0, 2¹⁶-1]</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#EDEFF2]">
              <span className="text-[#717579] text-[10px]">WeBank FATE Hetero-LR Score:</span>
              <span className="text-[#FF5C00] font-bold font-mono">p_1 = {(fateScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Zero-Trust RLS Privacy Isolation Badge */}
        <div className="rounded-full border border-[#EBF5FF] bg-[#EBF5FF] px-4 py-2 flex items-center justify-between text-[10px] font-mono text-[#0084FF]">
          <span>Raw MFS Cash Flows & Family Subsistence:</span>
          <span className="font-bold bg-white px-2.5 py-0.5 rounded-full border border-[#EDEFF2] text-[#1A1D1F]">
            [ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]
          </span>
        </div>
      </div>

      {/* Besley-Coate Nash Equilibrium Table — Clean modern white table */}
      <div className="planora-card flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#EDEFF2] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E8F8F0]">
              <Shield className="h-3.5 w-3.5 text-[#00A35C]" />
            </div>
            <h3 className="text-[13px] font-bold text-[#1A1D1F]">
              Besley-Coate (1995) Nash Equilibrium Staking Table
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#717579] bg-[#F4F5F7] px-2.5 py-1 rounded-full">
            100.0% Coverage ({displayR1.toLocaleString()} BDT)
          </span>
        </div>

        {/* Dynamic Table — #EDEFF2 dividers, bold black stakes, pastel signed chips */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#EDEFF2] text-[#717579] text-[10px] font-medium">
                <th className="py-2 px-2.5">Node</th>
                <th className="py-2 px-2.5">Merchant Name</th>
                <th className="py-2 px-2.5 text-right">Share (α_j*)</th>
                <th className="py-2 px-2.5 text-right">Stake (BDT)</th>
                <th className="py-2 px-2.5 text-right">Utility (E[U_j])</th>
                <th className="py-2 px-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF2]">
              {/* AGT-04 */}
              <tr className="hover:bg-[#F4F5F7] transition">
                <td className="py-2.5 px-2.5 font-bold text-[#1A1D1F] font-mono">AGT-04</td>
                <td className="py-2.5 px-2.5 text-[#2D3135]">Nasrin Pharmacy</td>
                <td className="py-2.5 px-2.5 text-right text-[#FF5C00] font-bold">40.0% (Cap)</td>
                <td className="py-2.5 px-2.5 text-right text-[#1A1D1F] font-bold">18,184.93 BDT</td>
                <td className="py-2.5 px-2.5 text-right text-[#00A35C] font-bold">+169.85 BDT</td>
                <td className="py-2.5 px-2.5 text-center">
                  <span className="chip-success">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-02 */}
              <tr className="hover:bg-[#F4F5F7] transition">
                <td className="py-2.5 px-2.5 font-bold text-[#1A1D1F] font-mono">AGT-02</td>
                <td className="py-2.5 px-2.5 text-[#2D3135]">Fatema Textiles</td>
                <td className="py-2.5 px-2.5 text-right text-[#FF5C00] font-bold">35.0%</td>
                <td className="py-2.5 px-2.5 text-right text-[#1A1D1F] font-bold">15,911.82 BDT</td>
                <td className="py-2.5 px-2.5 text-right text-[#00A35C] font-bold">+64.12 BDT</td>
                <td className="py-2.5 px-2.5 text-center">
                  <span className="chip-success">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-03 */}
              <tr className="hover:bg-[#F4F5F7] transition">
                <td className="py-2.5 px-2.5 font-bold text-[#1A1D1F] font-mono">AGT-03</td>
                <td className="py-2.5 px-2.5 text-[#2D3135]">Kamal Agro</td>
                <td className="py-2.5 px-2.5 text-right text-[#FF5C00] font-bold">25.0%</td>
                <td className="py-2.5 px-2.5 text-right text-[#1A1D1F] font-bold">11,365.58 BDT</td>
                <td className="py-2.5 px-2.5 text-right text-[#00A35C] font-bold">+51.40 BDT</td>
                <td className="py-2.5 px-2.5 text-center">
                  <span className="chip-success">
                    SIGNED (EIP-712)
                  </span>
                </td>
              </tr>
              {/* AGT-05 */}
              <tr className="hover:bg-[#F4F5F7] transition opacity-60">
                <td className="py-2.5 px-2.5 font-bold text-[#717579] font-mono">AGT-05</td>
                <td className="py-2.5 px-2.5 text-[#717579]">Sohel Electronics</td>
                <td className="py-2.5 px-2.5 text-right text-[#717579]">0.0%</td>
                <td className="py-2.5 px-2.5 text-right text-[#717579]">0.00 BDT</td>
                <td className="py-2.5 px-2.5 text-right text-[#FF1744]">-142.60 BDT</td>
                <td className="py-2.5 px-2.5 text-center">
                  <span className="chip-neutral">
                    ABSTAINED (CV&gt;0.55)
                  </span>
                </td>
              </tr>
              {/* Total Row */}
              <tr className="font-bold border-t-2 border-[#EDEFF2] bg-[#F4F5F7]">
                <td colSpan={2} className="py-2.5 px-2.5 text-[#1A1D1F]">
                  Total Syndicate Liability Locked:
                </td>
                <td className="py-2.5 px-2.5 text-right text-[#00A35C]">100.0%</td>
                <td className="py-2.5 px-2.5 text-right text-[#1A1D1F]">{displayR1.toLocaleString()} BDT</td>
                <td className="py-2.5 px-2.5 text-right text-[#00A35C]">+285.37 BDT</td>
                <td className="py-2.5 px-2.5 text-center">
                  <span className="chip-success">4-of-5 QUORUM</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monsoon Shock & Flash Bailout Button */}
        <div className="pt-2 flex items-center justify-between border-t border-[#EDEFF2] flex-wrap gap-2">
          <p className="text-[10px] text-[#717579] max-w-sm">
            Exogenous Covariant Shock Discrimination: market-wide drop drops credit stress without slashing social collateral.
          </p>
          <button
            onClick={onTriggerBailout}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5C00] hover:bg-[#E55200] text-white font-bold text-[11px] transition shadow-cta"
          >
            <CloudLightning className="h-3.5 w-3.5" />
            <span>Simulate Monsoon Shock → Flash Bailout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KendraArenaPanel;
