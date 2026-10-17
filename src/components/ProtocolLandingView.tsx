"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  ArrowRight,
  TrendingUp,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Users,
  Coins,
  FileCheck2,
  CloudRain,
  Building2,
  Store,
  BadgeCheck,
} from "lucide-react";
import type { ScenarioType } from "@/types";

interface ProtocolLandingViewProps {
  onLaunchCommandCenter: () => void;
  onLaunchBacktest: () => void;
  onSelectScenarioAndLaunch: (scenario: ScenarioType) => void;
}

export default function ProtocolLandingView({
  onLaunchCommandCenter,
  onLaunchBacktest,
  onSelectScenarioAndLaunch,
}: ProtocolLandingViewProps) {
  const metrics = [
    { label: "Restock Facility", value: "45,000 BDT", sub: "30-Day Tenor ($400 USD)", color: "text-[#FF5C00]" },
    { label: "All-In Borrower APR", value: "12.50% APR", sub: "vs 24-27% Predatory MFI", color: "text-[#059669]" },
    { label: "Deterministic DSCR", value: "1.6800x", sub: "Threshold >= 1.25x", color: "text-[#0284C7]" },
    { label: "Peer Collateral Staked", value: "100.0%", sub: "45,462.33 BDT Locked", color: "text-[#7C3AED]" },
    { label: "Wholesaler MDR Rebate", value: "1.50% Flat", sub: "-675.00 BDT funds gas & reserve", color: "text-[#FF5C00]" },
    { label: "WeBank FATE AUC Uplift", value: "+21.96%", sub: "Target +12% Exceeded", color: "text-[#059669]" },
  ];

  const agents = [
    {
      id: "AGT-01",
      name: "Rahim Store",
      market: "Karwan Bazar Rice & Grocery",
      inflow: "8,500 BDT/day",
      role: "Active Borrower",
      roleColor: "chip-progress",
      avatarBg: "bg-[#FFF0E6]",
      avatarText: "text-[#FF5C00]",
      desc: "Solvent nano-grocer requiring 45,000 BDT to restock 50 sacks of Miniket rice from Meghna Group wholesale.",
    },
    {
      id: "AGT-04",
      name: "Nasrin Pharmacy",
      market: "Dhanmondi Medicine Depo",
      inflow: "11,200 BDT/day",
      role: "Anchor Guarantor (40% Cap)",
      roleColor: "chip-success",
      avatarBg: "bg-[#ECFDF5]",
      avatarText: "text-[#059669]",
      desc: "Highest liquidity anchor guarantor with 85,000 BDT excess buffer capital. Locks 40.0% max stake (18,184.93 BDT).",
    },
    {
      id: "AGT-02",
      name: "Fatema Textiles",
      market: "Islampur Cloth Market",
      inflow: "6,200 BDT/day",
      role: "Lead Peer Guarantor",
      roleColor: "chip-info",
      avatarBg: "bg-[#F0F9FF]",
      avatarText: "text-[#0284C7]",
      desc: "Reliable textile merchant with 48,000 BDT buffer. Expands stake from 28.2% to 35.0% (15,911.82 BDT) during Round 2.",
    },
    {
      id: "AGT-03",
      name: "Kamal Agro",
      market: "Shyamoli Spice & Cold Storage",
      inflow: "5,400 BDT/day",
      role: "Peer Guarantor",
      roleColor: "chip-purple",
      avatarBg: "bg-[#F5F3FF]",
      avatarText: "text-[#7C3AED]",
      desc: "Stable agricultural cold storage merchant. Absorbs 25.0% guarantee liability (11,365.58 BDT) under phi* = 1.00% APR.",
    },
    {
      id: "AGT-05",
      name: "Sohel Electronics",
      market: "Patuatuli Electronics Hub",
      inflow: "4,100 BDT/day",
      role: "Adversarial / Stressed Node",
      roleColor: "chip-attention",
      avatarBg: "bg-[#FEF2F2]",
      avatarText: "text-[#DC2626]",
      desc: "High volatility node (CV=0.634 > 0.55). Evaluates negative expected utility and prudently abstains from the syndicate.",
    },
  ];

  const layers = [
    {
      number: "L1",
      title: "Judge Command Center & BFF",
      tech: "Next.js 15 App Router",
      desc: "3-panel real-time operational cockpit displaying smartphone HUD, multi-round CNP pentagon arena, and on-chain Blockscout feed.",
    },
    {
      number: "L2",
      title: "Multi-Round LangGraph FSM",
      tech: "LangGraph Multi-Agent FSM",
      desc: "5-state finite state machine driving 3-round Contract Net Protocol (CNP) decentralized negotiation with cryptographic quorum lock.",
    },
    {
      number: "L3",
      title: "Deterministic Risk Engine",
      tech: "Pure NumPy Runtime (Zero-LLM)",
      desc: "100% mathematical audit without hallucinations: ACT/365 DSCR = 1.6800x, Besley-Coate Nash utility, and wash-trading entropy H_st >= 0.65.",
    },
    {
      number: "L4",
      title: "secp256k1 ZK Range Proof & FATE",
      tech: "Pedersen CDS94 + WeBank FATE",
      desc: "Zero-knowledge excess solvency range proof Delta_v = 19,548 in [0, 65535] (<15ms) paired with WeBank FATE Hetero-LR credit scoring.",
    },
    {
      number: "L5",
      title: "Paris EVM Escrow & Account Abstraction",
      tech: "Solidity 0.8.20 (Base & FISCO BCOS)",
      desc: "Direct-to-supplier escrow settlement with 1.50% MDR, on-chain 4-of-5 ECDSA.recover verification, and autonomous monsoon flash bailouts.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 max-w-[1500px] mx-auto px-4 sm:px-6">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-8 sm:pt-14 flex flex-col items-center text-center gap-6">
        {/* Competition Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] shadow-sm animate-pulse-glow-orange">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5C00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5C00]"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#111827]">
            2026 Shenzhen International FinTechathon · International Track
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF5C00]">
            Tsinghua PBCSF &times; WeBank
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] max-w-5xl leading-[1.15]">
          Zero-Trust Multi-Agent Protocol for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C00] via-[#FF7A00] to-[#E05200]">
            Global Micro-SME Finance
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#4B5563] max-w-3xl leading-relaxed">
          Bridging Nobel-winning <strong>Grameen 5-member peer syndicate economics</strong> with <strong>WeBank&apos;s AI-native ABCD architecture</strong>. Autonomous AI agents act as direct financial participants—guaranteeing restocking credit at <strong>12.50% APR</strong> while shielding institutional balance sheets.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onLaunchCommandCenter}
            className="btn-animated-primary text-base sm:text-lg px-8 py-4 font-bold shadow-lg"
          >
            <Zap className="h-5 w-5" />
            <span>Launch Command Center Cockpit</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={onLaunchBacktest}
            className="btn-animated-secondary text-base sm:text-lg px-7 py-4 font-bold"
          >
            <BarChart3 className="h-5 w-5 text-[#0284C7]" />
            <span>Explore 5k-Merchant Backtest</span>
          </button>
        </div>

        {/* Live Architecture Micro-Badge */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5 font-medium">
            <BadgeCheck className="h-4 w-4 text-[#059669]" />
            Zero LLM Math (NumPy Verified)
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
            16-Bit secp256k1 ZK Range Proof
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="h-4 w-4 text-[#7C3AED]" />
            Base Sepolia &amp; FISCO BCOS Quorum
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PROTOCOL METRICS TICKER                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="planora-card-interactive flex flex-col justify-between p-5 text-center bg-white"
          >
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              {m.label}
            </span>
            <div className={`text-2xl sm:text-3xl font-extrabold my-2 ${m.color}`}>
              {m.value}
            </div>
            <span className="text-xs text-[#4B5563] font-medium leading-tight">
              {m.sub}
            </span>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3 LIVE JUDGE SCENARIO LAUNCHPAD                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip-progress text-xs">Live Demonstration</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Interactive Demonstration Scenarios
              </h2>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Trigger genuine LangGraph multi-agent execution, ZK range proofs, and on-chain escrow settlements with 1-click.
            </p>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">
            Targeting Shenzhen Grand Finals Evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scenario A Card */}
          <div className="planora-card-interactive flex flex-col justify-between p-6 border-2 hover:border-[#059669]/50 group cursor-pointer"
               onClick={() => onSelectScenarioAndLaunch("SCENARIO_A_VALID")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="chip-success text-xs font-bold">
                  Scenario A · Valid Restock
                </span>
                <span className="font-mono text-sm font-bold text-[#059669]">45,000 BDT</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#059669] transition">
                Honest Restock &amp; 3-Round CNP
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Rahim Store (<code className="font-mono font-bold text-[#FF5C00]">AGT-01</code>) requests working capital. Peer agents negotiate 3-round Contract Net Protocol, verify 16-bit ZK proof, and cosign 4-of-5 on-chain escrow.
              </p>
            </div>
            <div className="pt-6 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-sm font-bold text-[#059669]">
              <span>Run Scenario A</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario B Card */}
          <div className="planora-card-interactive flex flex-col justify-between p-6 border-2 hover:border-[#DC2626]/50 group cursor-pointer"
               onClick={() => onSelectScenarioAndLaunch("SCENARIO_B_REDTEAM")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="chip-attention text-xs font-bold">
                  Scenario B · Red-Team Attack
                </span>
                <span className="font-mono text-sm font-bold text-[#DC2626]">AGT-05</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#DC2626] transition">
                Prompt Injection &amp; x402 Intercept
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Switches phone to Sohel Electronics (<code className="font-mono font-bold text-[#DC2626]">AGT-05</code>). Adversarial invoice contains injected directive and unverified wallet (<code className="font-mono">0xDead...Beef</code>), immediately triggering red firewall intercept.
              </p>
            </div>
            <div className="pt-6 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-sm font-bold text-[#DC2626]">
              <span>Run Red-Team Attack</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario C Card */}
          <div className="planora-card-interactive flex flex-col justify-between p-6 border-2 hover:border-[#FF5C00]/50 group cursor-pointer"
               onClick={() => onSelectScenarioAndLaunch("SCENARIO_C_SYBIL_WASH")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="chip-progress text-xs font-bold">
                  Scenario C · Weather Shock
                </span>
                <span className="font-mono text-sm font-bold text-[#FF5C00]">-44.2% Sales</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#FF5C00] transition">
                Monsoon Flash Bailout &amp; Wash Hold
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Simulates covariant monsoon shock across Karwan Bazar. Triggers automated <code className="font-mono font-bold text-[#FF5C00]">ySCT</code> parametric bailout, unlocking peer collateral without social reputation slashing.
              </p>
            </div>
            <div className="pt-6 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-sm font-bold text-[#FF5C00]">
              <span>Run Monsoon Bailout</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DUAL PROBLEM STATEMENT VISUALIZER                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="planora-card p-8 sm:p-12 space-y-8 bg-gradient-to-br from-white via-[#FAFBFD] to-[#FFF0E6]/30">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="chip-info text-xs">Architectural Foundation</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827]">
            The Dual Problem Statement We Solve
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563]">
            How KendraFi bridges Dhaka street realities with WeBank&apos;s international expansion frontiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Problem A: Dhaka Reality */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#DC2626]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    Perspective A: Dhaka Nano-Merchant Reality
                  </h3>
                  <span className="text-xs text-[#DC2626] font-semibold">High Operational Cost &amp; Predatory Rates</span>
                </div>
              </div>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                693 licensed MFIs in Bangladesh disburse over BDT 2.49 trillion annually, but spend <strong>12%–15% of their loan book</strong> on human field officers riding motorcycles to weekly village meetings—forcing merchants to pay <strong>24%–27% APR</strong>. Solo smartphone nano-loan apps lack peer monitoring and suffer <strong>10%–18% default rates</strong>, hitting Bangladesh&apos;s <strong>$119/day MFS cash-out limit</strong> and 1.85% fee.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB] text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Result: Formal credit trapped behind manual O&amp;M costs</span>
            </div>
          </div>

          {/* Problem B: WeBank Cold-Start Data Wall */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center text-[#0284C7]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    Perspective B: WeBank Cold-Start Data Wall
                  </h3>
                  <span className="text-xs text-[#0284C7] font-semibold">Overseas Expansion Frontier</span>
                </div>
              </div>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                WeBank serves <strong>424M retail users and 1.6M+ MSMEs</strong> at an astonishing annual IT O&amp;M cost of <strong>RMB 2 (~$0.30 USD)</strong> per account with a 1.46% overall NPL ratio. But when expanding across Belt-and-Road economies, WeBank hits a <strong>&quot;Cold-Start Data Wall&quot;</strong>: 85%–90% of informal merchants have <strong>zero digital VAT tax filings</strong> and <strong>zero central credit bureau histories</strong>.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB] text-xs font-semibold text-[#0284C7] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Result: Traditional underwriting models cannot evaluate informal merchants</span>
            </div>
          </div>
        </div>

        {/* The Solution Bridge Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FF5C00] to-[#FF7A00] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-cta">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-extrabold">
              The Solution: KendraFi Decentralized Micro-Guarantee Syndicates
            </h4>
            <p className="text-sm opacity-90">
              Autonomous AI agent wallets coordinate peer guarantees using Grameen game theory and settle on-chain to verified wholesalers.
            </p>
          </div>
          <button
            onClick={onLaunchCommandCenter}
            className="px-6 py-3 rounded-xl bg-white text-[#FF5C00] font-bold text-sm hover:bg-white/90 active:scale-95 transition shadow-sm whitespace-nowrap"
          >
            See Protocol in Action &rarr;
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5 AUTONOMOUS AGENT PERSONAS SHOWCASE                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip-purple text-xs">Autonomous Participants</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                The 5 Autonomous Agent Personas
              </h2>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Direct financial participants equipped with ERC-4337 smart accounts and bounded session keys.
            </p>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">
            Topic F (+5 Agent Wallet Bonus)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((a) => (
            <div key={a.id} className="planora-card-interactive flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl ${a.avatarBg} ${a.avatarText} font-bold flex items-center justify-center font-mono text-sm`}>
                      {a.id}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#111827]">{a.name}</h4>
                      <span className="text-xs text-[#6B7280]">{a.market}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={a.roleColor}>{a.role}</span>
                  <span className="text-xs font-mono font-bold text-[#111827]">{a.inflow}</span>
                </div>

                <p className="text-sm text-[#4B5563] leading-relaxed pt-1">
                  {a.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-xs font-mono text-[#6B7280]">
                <span>EIP-712 Session Key</span>
                <span className="text-[#059669] font-bold">Active &bull; maxAlpha &le; 40%</span>
              </div>
            </div>
          ))}

          {/* Quick Syndicate Topology Teaser Card */}
          <div className="planora-card p-6 bg-[#FAFBFD] border-2 border-dashed border-[#CBD5E1] flex flex-col justify-between text-center items-center">
            <div className="space-y-3 my-auto">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF0E6] text-[#FF5C00] flex items-center justify-center mx-auto">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#111827]">
                Interactive Pentagon Arena
              </h4>
              <p className="text-xs text-[#4B5563]">
                Watch all 5 nodes negotiate live with real-time SVG communication packets and dynamic Besley-Coate Nash tables.
              </p>
            </div>
            <button
              onClick={onLaunchCommandCenter}
              className="btn-animated-primary text-xs py-2.5 px-4 w-full mt-4"
            >
              Open Pentagon Cockpit
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5 MODULAR LAYERS (ABCD ARCHITECTURE)                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="chip-info text-xs">Full-Stack Implementation</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            5 Modular Protocol Layers
          </h2>
          <p className="text-sm text-[#4B5563]">
            Engineered from mathematical risk engines to Paris EVM smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {layers.map((l) => (
            <div key={l.number} className="planora-card p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#FFF0E6] text-[#FF5C00] inline-block">
                  {l.number}
                </span>
                <h4 className="text-sm font-bold text-[#111827]">{l.title}</h4>
                <span className="text-[11px] font-mono font-semibold text-[#0284C7] block">
                  {l.tech}
                </span>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {l.desc}
                </p>
              </div>
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified in Monorepo</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA BANNER                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="planora-card p-10 sm:p-14 text-center bg-gradient-to-b from-white to-[#F4F5F7] border-2 border-[#E5E7EB] shadow-lg space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] max-w-2xl mx-auto">
          Ready to Experience the Multi-Agent Syndicate in Action?
        </h2>
        <p className="text-base text-[#4B5563] max-w-xl mx-auto">
          Switch to the live Judge Command Center to run automated voice restock scenarios, audit ZK proofs, and verify Base Sepolia transactions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onLaunchCommandCenter}
            className="btn-animated-primary text-base px-8 py-3.5 font-bold"
          >
            <Zap className="h-5 w-5" />
            <span>Launch Command Center Cockpit</span>
          </button>
          <button
            onClick={onLaunchBacktest}
            className="btn-animated-secondary text-base px-7 py-3.5 font-bold"
          >
            <BarChart3 className="h-5 w-5 text-[#0284C7]" />
            <span>View 5,000-Merchant Backtest</span>
          </button>
        </div>
      </section>
    </div>
  );
}
