"use client";

import React from "react";
import { ShieldCheck, Activity, Radio, ZoomIn, ZoomOut, Cpu, Sparkles, LayoutDashboard, BarChart3, Globe } from "lucide-react";
import type { FSMState, TransactionMode } from "@/types";

export type HeaderViewType = "landing" | "command_center" | "backtest";

interface JudgeCommandHeaderProps {
  fsmState: FSMState;
  txMode: TransactionMode;
  latencyMs: number;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  isExecuting?: boolean;
  activeView: HeaderViewType;
  onViewChange: (view: HeaderViewType) => void;
}

const STATE_CONFIG: Record<FSMState, { label: string; zh: string; chipBg: string; chipText: string; dotColor: string }> = {
  IDLE_MONITORING: {
    label: "IDLE_MONITORING",
    zh: "待命监测",
    chipBg: "bg-[#F3F4F6]",
    chipText: "text-[#4B5563]",
    dotColor: "bg-[#6B7280]",
  },
  INTENT_PERCEPTION: {
    label: "INTENT_PERCEPTION",
    zh: "意图感知",
    chipBg: "bg-[#F0F9FF]",
    chipText: "text-[#0284C7]",
    dotColor: "bg-[#0284C7]",
  },
  DETERMINISTIC_AUDIT: {
    label: "DETERMINISTIC_AUDIT",
    zh: "确定性风控审计",
    chipBg: "bg-[#F0F9FF]",
    chipText: "text-[#2563EB]",
    dotColor: "bg-[#2563EB]",
  },
  SYNDICATE_P2P_NEGOTIATION: {
    label: "SYNDICATE_P2P_NEGOTIATION",
    zh: "多方CNP撮合博弈",
    chipBg: "bg-[#FFF0E6]",
    chipText: "text-[#C2410C]",
    dotColor: "bg-[#FF5C00]",
  },
  ESCROW_COSIGN_AND_SETTLE: {
    label: "ESCROW_COSIGN_AND_SETTLE",
    zh: "链上托管会签交割",
    chipBg: "bg-[#ECFDF5]",
    chipText: "text-[#065F46]",
    dotColor: "bg-[#059669]",
  },
  BLOCKED_ADVERSARIAL: {
    label: "BLOCKED_ADVERSARIAL",
    zh: "零信任对抗拦截",
    chipBg: "bg-[#FEF2F2]",
    chipText: "text-[#991B1B]",
    dotColor: "bg-[#DC2626]",
  },
  FLASH_BAILOUT_ACTIVE: {
    label: "FLASH_BAILOUT_ACTIVE",
    zh: "季风外生冲击闪电解困",
    chipBg: "bg-[#FFF0E6]",
    chipText: "text-[#C2410C]",
    dotColor: "bg-[#FF5C00]",
  },
};

export const JudgeCommandHeader: React.FC<JudgeCommandHeaderProps> = ({
  fsmState,
  txMode,
  latencyMs,
  zoomLevel,
  onZoomChange,
  isExecuting = false,
  activeView,
  onViewChange,
}) => {
  const stateMeta = STATE_CONFIG[fsmState] || STATE_CONFIG.IDLE_MONITORING;
  const zoomPercentages = [1.0, 1.25, 1.5, 2.0, 2.5];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 py-3 transition-all shadow-sm">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 max-w-[1720px]">
        {/* Brand & Technical Badges */}
        <div className="flex items-center gap-3.5">
          {/* Brand Mark with Pulse Ring */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5C00] to-[#E05200] shadow-md shadow-orange-500/20 cursor-pointer"
               onClick={() => onViewChange("landing")}>
            <Cpu className="h-6 w-6 text-white" />
            {isExecuting && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5C00] opacity-75"></span>
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#FF5C00] border-2 border-white"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                onClick={() => onViewChange("landing")}
                className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827] cursor-pointer hover:text-[#FF5C00] transition"
              >
                KendraFi
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#4B5563] hidden md:inline">
                Weiyedai-Global &bull; 微业贷全球化
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FFF0E6] px-3 py-1 text-xs font-bold text-[#FF5C00] border border-[#FFD8BF]">
                2026 Shenzhen FinTechathon
              </span>
            </div>
            <p className="text-xs text-[#6B7280] flex items-center gap-2 flex-wrap pt-0.5">
              <span>清华大学五道口金融学院 (PBCSF) &amp; 微众银行 (WeBank) 联合主办</span>
              <span className="text-[#D1D5DB]">|</span>
              <span className="text-[#0284C7] font-semibold">Topic E: SME Copilot</span>
              <span className="text-[#D1D5DB]">+</span>
              <span className="text-[#FF5C00] font-semibold">Topic F: Agent Wallet (+5 Bonus)</span>
            </p>
          </div>
        </div>

        {/* Center View Switcher: Landing vs Command Center vs Analytics */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB]">
          <button
            id="nav-tab-overview"
            onClick={() => onViewChange("landing")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeView === "landing"
                ? "bg-white text-[#111827] shadow-sm border border-[#E5E7EB]"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <Globe className="h-4 w-4 text-[#FF5C00]" />
            <span>Overview</span>
          </button>

          <button
            id="nav-tab-command-center"
            onClick={() => onViewChange("command_center")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeView === "command_center"
                ? "bg-white text-[#FF5C00] shadow-sm border border-[#E5E7EB]"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Command Center</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => onViewChange("backtest")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeView === "backtest"
                ? "bg-white text-[#0284C7] shadow-sm border border-[#E5E7EB]"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <BarChart3 className="h-4 w-4 text-[#0284C7]" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Live Indicators & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 5-State FSM Status Pill */}
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 border ${stateMeta.chipBg} ${stateMeta.chipText}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${stateMeta.dotColor}`}
              ></span>
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${stateMeta.dotColor}`}
              ></span>
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-xs">{stateMeta.label}</span>
              <span className="text-[10px] opacity-80">{stateMeta.zh}</span>
            </div>
          </div>

          {/* Latency Counter */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F4F6] text-xs font-mono text-[#111827] border border-[#E5E7EB]">
            <Activity className="h-4 w-4 text-[#0284C7]" />
            <span>Latency:</span>
            <span className="text-[#0284C7] font-bold">{latencyMs.toFixed(1)}ms</span>
          </div>

          {/* Transaction Mode Badge */}
          <div className="flex items-center text-xs font-mono">
            {txMode === "LIVE_RPC_BROADCAST" ? (
              <span className="flex items-center gap-1.5 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-bold px-3 py-1.5 rounded-full">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#059669]" />
                <span>LIVE TESTNET</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] font-bold px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>TESTNET REPLAY</span>
              </span>
            )}
          </div>

          {/* 2.5x Judge Camera Zoom Bar */}
          <div className="hidden md:flex items-center gap-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] p-1 text-xs">
            <span className="text-xs uppercase font-mono text-[#6B7280] px-2">
              Zoom:
            </span>
            <button
              onClick={() => onZoomChange(Math.max(1.0, zoomLevel - 0.25))}
              className="p-1 hover:bg-white rounded-full text-[#4B5563] hover:text-[#111827] transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-0.5">
              {zoomPercentages.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onZoomChange(lvl)}
                  className={`px-2 py-0.5 rounded-full text-xs font-mono transition ${
                    Math.abs(zoomLevel - lvl) < 0.05
                      ? "bg-[#FFF0E6] text-[#FF5C00] font-bold shadow-xs"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
            <button
              onClick={() => onZoomChange(Math.min(2.5, zoomLevel + 0.25))}
              className="p-1 hover:bg-white rounded-full text-[#4B5563] hover:text-[#111827] transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default JudgeCommandHeader;
