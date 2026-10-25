"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  CloudLightning,
  Eye,
  Fingerprint,
  Zap,
  ChevronLeft,
  ChevronRight,
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
    color: "#FF5C00",
    bg: "bg-[#FFF0E6]",
    borderColor: "border-[#FF5C00]",
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
    color: "#0284C7",
    bg: "bg-[#F0F9FF]",
    borderColor: "border-[#0284C7]",
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
    color: "#7C3AED",
    bg: "bg-[#F5F3FF]",
    borderColor: "border-[#7C3AED]",
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
    color: "#DC2626",
    bg: "bg-[#FEF2F2]",
    borderColor: "border-[#DC2626]",
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
    color: "#059669",
    bg: "bg-[#ECFDF5]",
    borderColor: "border-[#059669]",
  },
];

export const KendraArenaPanel: React.FC<KendraArenaPanelProps> = ({
  cnpMessages,
  zkProof,
  dscr,
  grossRepaymentBdt,
  onTriggerBailout,
  isExecuting,
}) => {
  const [activeTab, setActiveTab] = useState<"pentagon" | "cnp" | "zk">("pentagon");
  const [showFullCommitment, setShowFullCommitment] = useState(false);

  // Pagination & Filter States
  const [cnpRoundFilter, setCnpRoundFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [cnpPage, setCnpPage] = useState<number>(1);
  const [nashPage, setNashPage] = useState<number>(1);

  // Default fallback values if backend hasn't populated yet
  const displayDscr = dscr || 1.68;
  const displayR1 = grossRepaymentBdt || 45462.33;
  const commitmentDisplay = zkProof?.display_short_hex || "0x029f8a7e3d1c4b8a...";
  const commitmentFull =
    zkProof?.commitment_hex ||
    "0x029f8a7e3d1c4b8a2e5f6d0c9b8a7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e";
  const fateScore = zkProof?.fate_survival_prob_p ?? 0.985;

  const tabItems = [
    { key: "pentagon" as const, label: "5-Node Topology" },
    { key: "cnp" as const, label: `CNP Rounds (${cnpMessages.length})` },
    { key: "zk" as const, label: "ZK Solvency Proof" },
  ];

  // CNP Filter & Pagination
  const filteredCnpMessages = cnpRoundFilter === "all"
    ? cnpMessages
    : cnpMessages.filter((m) => m.round_num === cnpRoundFilter);

  const cnpPerPage = 2;
  const totalCnpPages = Math.max(1, Math.ceil(filteredCnpMessages.length / cnpPerPage));
  const displayedCnpMessages = filteredCnpMessages.slice((cnpPage - 1) * cnpPerPage, cnpPage * cnpPerPage);

  // Nash Equilibrium Table Rows
  const nashRows = [
    { id: "AGT-04", name: "Nasrin Pharmacy", share: "40.0% (Cap)", stake: "18,184.93 BDT", utility: "+169.85 BDT", status: "SIGNED (EIP-712)", statusChip: "chip-success" },
    { id: "AGT-02", name: "Fatema Textiles", share: "35.0%", stake: "15,911.82 BDT", utility: "+64.12 BDT", status: "SIGNED (EIP-712)", statusChip: "chip-success" },
    { id: "AGT-03", name: "Kamal Agro", share: "25.0%", stake: "11,365.58 BDT", utility: "+51.40 BDT", status: "SIGNED (EIP-712)", statusChip: "chip-success" },
    { id: "AGT-05", name: "Sohel Electronics", share: "0.0%", stake: "0.00 BDT", utility: "-142.60 BDT", status: "ABSTAINED (CV>0.55)", statusChip: "chip-neutral", isAbstained: true },
  ];

  const displayedNashRows = nashPage === 1 ? nashRows.slice(0, 3) : nashRows.slice(3);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF0E6] text-[#FF5C00] shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Kendra Arena Multi-Agent Pentagon
            </h2>
            <p className="text-xs text-[#6B7280]">
              Decentralized Contract Net Protocol (CNP) &bull; Nash Equilibrium Staking
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1 ${
                activeTab === tab.key
                  ? "bg-white text-[#FF5C00] shadow-xs"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pentagon Network Arena Visualizer */}
      <div className="relative planora-card flex flex-col items-center justify-center min-h-[380px] overflow-hidden bg-gradient-to-b from-white via-white to-[#FAFBFD]">
        {/* Ambient Halo Glows */}
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-[#FF5C00]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[#0284C7]/10 blur-3xl pointer-events-none"></div>

        {/* SVG Network Canvas Connecting the 5 Nodes */}
        <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
            {/* Pentagon Edge Lines with Animated Data Flow */}
            <polygon
              points="50,14 86,40 72,84 28,84 14,40"
              fill="rgba(255, 92, 0, 0.04)"
              stroke="#FF5C00"
              strokeWidth="1.2"
              className="animate-data-flow"
              opacity="0.75"
            />
            {/* Cross-Syndicate Peer Chords */}
            <line x1="50" y1="14" x2="72" y2="84" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="14" x2="28" y2="84" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="14" y1="40" x2="86" y2="40" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="14" y1="40" x2="72" y2="84" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="86" y1="40" x2="28" y2="84" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />

            {/* Glowing Active Communication Lines */}
            {isExecuting && (
              <>
                <line x1="50" y1="14" x2="14" y2="40" stroke="#FF5C00" strokeWidth="2.5" className="animate-pulse" />
                <line x1="14" y1="40" x2="86" y2="40" stroke="#059669" strokeWidth="2" className="animate-pulse" />
              </>
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
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
              >
                {/* Node Orb with Pulsing Halo */}
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-md group-hover:scale-115 ${
                    isBorrower
                      ? "bg-white border-[#FF5C00] shadow-orange-500/20 ring-4 ring-[#FF5C00]/20"
                      : isAbstained
                      ? "bg-[#F3F4F6] border-[#E5E7EB] opacity-70 group-hover:opacity-100"
                      : "bg-white border-[#059669] shadow-emerald-500/20 ring-4 ring-[#059669]/15"
                  }`}
                >
                  <span className={`text-xs font-extrabold font-mono ${
                    isBorrower ? "text-[#FF5C00]" : isAbstained ? "text-[#6B7280]" : "text-[#059669]"
                  }`}>
                    {agent.id}
                  </span>

                  {/* Pulsing Status Dot */}
                  <span
                    className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isBorrower
                        ? "bg-[#FF5C00] animate-ping"
                        : isAbstained
                        ? "bg-[#D1D5DB]"
                        : "bg-[#059669]"
                    }`}
                  ></span>
                  <span
                    className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isBorrower
                        ? "bg-[#FF5C00]"
                        : isAbstained
                        ? "bg-[#9CA3AF]"
                        : "bg-[#059669]"
                    }`}
                  ></span>
                </div>

                {/* Node Info Label Card */}
                <div className="mt-2 flex flex-col items-center bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB] shadow-md group-hover:shadow-lg transition-all text-center">
                  <span className="text-xs font-extrabold text-[#111827] whitespace-nowrap">
                    {agent.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#6B7280] whitespace-nowrap pt-0.5">
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
          <div className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#A7F3D0] p-4 shadow-xl text-center max-w-[170px] z-20">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest">
              Syndicate Quorum
            </span>
            <span className="text-base font-extrabold text-[#059669] font-mono mt-0.5">
              4-of-5 Cosigned
            </span>
            <span className="text-xs font-mono font-bold text-[#111827] mt-1 bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              {displayR1.toLocaleString()} BDT (100%)
            </span>
          </div>
        </div>

          {/* Empty State: no trace populated yet */}
          {!isExecuting && cnpMessages.length === 0 && (
            <div
              role="status"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-[#F3F4F6]/95 border border-[#E5E7EB] px-4 py-1.5 text-xs font-bold text-[#6B7280] whitespace-nowrap"
            >
              Run a scenario to populate the live CNP trace
            </div>
          )}

        {/* Tab Sub-View: Multi-Round CNP Negotiation Feed */}
        {activeTab === "cnp" && (
          <div className="w-full mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] p-4 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
              <span className="text-xs font-bold text-[#FF5C00] flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Live 3-Round Contract Net Protocol (CNP) Timeline
              </span>

              {/* Round Filters */}
              <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl text-xs font-bold">
                {(["all", 1, 2, 3] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCnpRoundFilter(r);
                      setCnpPage(1);
                    }}
                    aria-pressed={cnpRoundFilter === r}
                    className={`px-2.5 py-1 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1 ${
                      cnpRoundFilter === r
                        ? "bg-white text-[#FF5C00] shadow-xs"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {r === "all" ? "All Rounds" : `R${r}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Skeleton Loading State or Message Feed */}
            {isExecuting ? (
              <div className="space-y-2.5 py-1">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="skeleton-shimmer h-4 w-32"></div>
                    <div className="skeleton-shimmer h-4 w-24"></div>
                  </div>
                  <div className="skeleton-shimmer h-3 w-full"></div>
                  <div className="skeleton-shimmer h-3 w-2/3"></div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="skeleton-shimmer h-4 w-28"></div>
                    <div className="skeleton-shimmer h-4 w-20"></div>
                  </div>
                  <div className="skeleton-shimmer h-3 w-full"></div>
                </div>
              </div>
            ) : filteredCnpMessages.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic text-center py-4">
                Click [Scenario A: Valid Restock] to trigger the multi-agent negotiation loop.
              </p>
            ) : (
              <div className="space-y-2.5">
                {displayedCnpMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs font-mono space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827] flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF5C00] border border-[#FFD8BF] text-xs font-extrabold">
                          Round {msg.round_num}
                        </span>
                        <span>{msg.sender_agent} &bull; {msg.message_type}</span>
                      </span>
                      <span className="text-[#059669] font-extrabold text-xs">
                        {(msg.proposed_alpha * 100).toFixed(1)}% @ {msg.proposed_yield_apr_bps} bps
                      </span>
                    </div>
                    <p className="text-[#4B5563] text-xs leading-relaxed">{msg.detail}</p>
                  </div>
                ))}

                {/* CNP Pagination Controls */}
                {filteredCnpMessages.length > cnpPerPage && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                    <span className="text-[11px] text-[#6B7280]">
                      Showing {displayedCnpMessages.length} of {filteredCnpMessages.length} messages (Page {cnpPage} of {totalCnpPages})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCnpPage((p) => Math.max(1, p - 1))}
                        disabled={cnpPage === 1}
                        aria-label="Previous CNP page"
                        className="pagination-btn !h-7 !px-2 text-xs"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      {Array.from({ length: totalCnpPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setCnpPage(p)}
                          aria-label={`Go to CNP page ${p}`}
                          className={`pagination-btn !h-7 !px-2.5 text-xs ${cnpPage === p ? "pagination-btn-active" : ""}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setCnpPage((p) => Math.min(totalCnpPages, p + 1))}
                        disabled={cnpPage === totalCnpPages}
                        aria-label="Next CNP page"
                        className="pagination-btn !h-7 !px-2 text-xs"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Layer-4 secp256k1 ZK Solvency & WeBank FATE Card */}
      <div className="planora-card flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0F9FF] text-[#0284C7]">
              <Fingerprint className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#111827]">
              Layer-4 Cryptographic ZK Solvency &amp; WeBank FATE Scorer
            </h3>
          </div>
          <span className="chip-info text-xs font-bold">
            secp256k1 CDS94 Proof
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Pedersen Commitment Point */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] p-4 space-y-2">
            <div className="flex items-center justify-between text-[#6B7280] text-xs">
              <span className="font-semibold">Pedersen Curve Commitment (C₁):</span>
              <button
                onClick={() => setShowFullCommitment(!showFullCommitment)}
                aria-pressed={showFullCommitment}
                className="text-[#0284C7] hover:underline flex items-center gap-1 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-1 rounded"
              >
                <Eye className="h-3.5 w-3.5" />
                {showFullCommitment ? "Short View" : "Full 66-Hex"}
              </button>
            </div>
            {isExecuting ? (
              <div className="skeleton-shimmer h-8 w-full rounded-xl"></div>
            ) : (
              <p className="font-extrabold text-[#0284C7] text-xs sm:text-sm break-all font-mono bg-white p-2.5 rounded-xl border border-[#E5E7EB]">
                {showFullCommitment ? commitmentFull : commitmentDisplay}
              </p>
            )}
            <p className="text-xs text-[#6B7280]">
              C₁ = v&bull;G + r₁&bull;H (v = 76,376 BDT, T = 56,828 BDT)
            </p>
          </div>

          {/* Range Proof & FATE Score */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] text-xs font-semibold">DSCR Solvency Verification:</span>
              <span className="chip-success text-xs font-bold">16-Bit VERIFIED</span>
            </div>
            {isExecuting ? (
              <div className="space-y-2 py-1">
                <div className="skeleton-shimmer h-5 w-40"></div>
                <div className="skeleton-shimmer h-4 w-48"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[#111827] font-extrabold text-sm sm:text-base">DSCR = {displayDscr.toFixed(4)}x</span>
                  <span className="text-xs text-[#059669] font-mono font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                    &Delta;v = 19,548 &isin; [0, 2¹⁶-1]
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <span className="text-[#6B7280] text-xs font-semibold">WeBank FATE Hetero-LR Score:</span>
                  <span className="text-[#FF5C00] font-extrabold text-sm sm:text-base font-mono">
                    p₁ = {(fateScore * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zero-Trust RLS Privacy Isolation Badge */}
        <div className="rounded-2xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 flex items-center justify-between text-xs font-mono text-[#0369A1] flex-wrap gap-2">
          <span className="font-semibold">Raw MFS Cash Flows &amp; Family Subsistence:</span>
          <span className="font-extrabold bg-white px-3 py-1 rounded-full border border-[#BAE6FD] text-[#111827]">
            [ZERO-TRUST RLS ISOLATED &mdash; SERVER/EDGE ONLY]
          </span>
        </div>
      </div>

      {/* Besley-Coate Nash Equilibrium Table */}
      <div className="planora-card flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E7EB] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#111827]">
              Besley-Coate (1995) Nash Equilibrium Staking Table
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#111827] bg-[#F3F4F6] px-3 py-1 rounded-full border border-[#E5E7EB]">
              100.0% Coverage ({displayR1.toLocaleString()} BDT)
            </span>
            {/* Table Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNashPage(1)}
                aria-pressed={nashPage === 1}
                className={`pagination-btn !h-7 !px-2.5 text-xs ${nashPage === 1 ? "pagination-btn-active" : ""}`}
              >
                P1
              </button>
              <button
                onClick={() => setNashPage(2)}
                aria-pressed={nashPage === 2}
                className={`pagination-btn !h-7 !px-2.5 text-xs ${nashPage === 2 ? "pagination-btn-active" : ""}`}
              >
                P2
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] text-xs font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Node</th>
                <th className="py-2.5 px-3">Merchant Name</th>
                <th className="py-2.5 px-3 text-right">Share (&alpha;_j*)</th>
                <th className="py-2.5 px-3 text-right">Stake (BDT)</th>
                <th className="py-2.5 px-3 text-right">Utility (E[U_j])</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {displayedNashRows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-[#FAFBFD] transition ${row.isAbstained ? "opacity-70" : ""}`}
                >
                  <td className={`py-3 px-3 font-extrabold font-mono ${row.isAbstained ? "text-[#6B7280]" : "text-[#111827]"}`}>
                    {row.id}
                  </td>
                  <td className={`py-3 px-3 font-semibold ${row.isAbstained ? "text-[#6B7280]" : "text-[#1F2937]"}`}>
                    {row.name}
                  </td>
                  <td className={`py-3 px-3 text-right font-extrabold ${row.isAbstained ? "text-[#6B7280]" : "text-[#FF5C00]"}`}>
                    {row.share}
                  </td>
                  <td className={`py-3 px-3 text-right font-extrabold ${row.isAbstained ? "text-[#6B7280]" : "text-[#111827]"}`}>
                    {row.stake}
                  </td>
                  <td className={`py-3 px-3 text-right font-extrabold ${row.isAbstained ? "text-[#DC2626]" : "text-[#059669]"}`}>
                    {row.utility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`${row.statusChip} text-xs font-bold`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="font-extrabold border-t-2 border-[#E5E7EB] bg-[#F3F4F6] text-xs sm:text-sm">
                <td colSpan={2} className="py-3 px-3 text-[#111827]">
                  Total Syndicate Liability Locked:
                </td>
                <td className="py-3 px-3 text-right text-[#059669]">100.0%</td>
                <td className="py-3 px-3 text-right text-[#111827]">{displayR1.toLocaleString()} BDT</td>
                <td className="py-3 px-3 text-right text-[#059669]">+285.37 BDT</td>
                <td className="py-3 px-3 text-center">
                  <span className="chip-success text-xs font-bold">4-of-5 QUORUM</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>


        {/* Monsoon Shock & Flash Bailout Button */}
        <div className="pt-3 flex items-center justify-between border-t border-[#E5E7EB] flex-wrap gap-3">
          <p className="text-xs text-[#6B7280] max-w-md leading-relaxed">
            Exogenous Covariant Shock Discrimination: market-wide drop drops credit stress without slashing social collateral.
          </p>
          <button
            onClick={onTriggerBailout}
            disabled={isExecuting}
            className="btn-animated-primary text-xs sm:text-sm px-5 py-2.5 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-1"
          >
            <CloudLightning className="h-4 w-4" />
            <span>Simulate Monsoon Shock &rarr; Flash Bailout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KendraArenaPanel;
