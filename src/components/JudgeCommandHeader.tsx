"use client";

import React from "react";
import { ShieldCheck, Activity, Radio, ZoomIn, ZoomOut, Maximize2, Cpu } from "lucide-react";
import type { FSMState, TransactionMode } from "@/types";

interface JudgeCommandHeaderProps {
  fsmState: FSMState;
  txMode: TransactionMode;
  latencyMs: number;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  isExecuting?: boolean;
}

const STATE_CONFIG: Record<FSMState, { label: string; zh: string; chipBg: string; chipText: string }> = {
  IDLE_MONITORING: {
    label: "IDLE_MONITORING",
    zh: "待命监测",
    chipBg: "bg-[#F4F5F7]",
    chipText: "text-[#717579]",
  },
  INTENT_PERCEPTION: {
    label: "INTENT_PERCEPTION",
    zh: "意图感知",
    chipBg: "bg-[#EBF5FF]",
    chipText: "text-[#0084FF]",
  },
  DETERMINISTIC_AUDIT: {
    label: "DETERMINISTIC_AUDIT",
    zh: "确定性风控审计",
    chipBg: "bg-[#EBF5FF]",
    chipText: "text-[#2563EB]",
  },
  SYNDICATE_P2P_NEGOTIATION: {
    label: "SYNDICATE_P2P_NEGOTIATION",
    zh: "多方CNP撮合博弈",
    chipBg: "bg-[#FFF0E6]",
    chipText: "text-[#FF5C00]",
  },
  ESCROW_COSIGN_AND_SETTLE: {
    label: "ESCROW_COSIGN_AND_SETTLE",
    zh: "链上托管会签交割",
    chipBg: "bg-[#E8F8F0]",
    chipText: "text-[#00A35C]",
  },
  BLOCKED_ADVERSARIAL: {
    label: "BLOCKED_ADVERSARIAL",
    zh: "零信任对抗拦截",
    chipBg: "bg-[#FEECEE]",
    chipText: "text-[#FF1744]",
  },
  FLASH_BAILOUT_ACTIVE: {
    label: "FLASH_BAILOUT_ACTIVE",
    zh: "季风外生冲击闪电解困",
    chipBg: "bg-[#FFF0E6]",
    chipText: "text-[#FF5C00]",
  },
};

export const JudgeCommandHeader: React.FC<JudgeCommandHeaderProps> = ({
  fsmState,
  txMode,
  latencyMs,
  zoomLevel,
  onZoomChange,
  isExecuting = false,
}) => {
  const stateMeta = STATE_CONFIG[fsmState] || STATE_CONFIG.IDLE_MONITORING;
  const zoomPercentages = [1.0, 1.25, 1.5, 2.0, 2.5];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#EDEFF2] px-5 py-3 transition-all">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Technical Subtitles */}
        <div className="flex items-center gap-3">
          {/* Brand Mark — Interlocking Orange Nodes */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5C00] shadow-cta">
            <Cpu className="h-5 w-5 text-white" />
            {isExecuting && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5C00] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF5C00] border-2 border-white"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#1A1D1F] sm:text-xl">
                KendraFi{" "}
                <span className="text-xs font-medium text-[#717579]">
                  Weiyedai-Global · 微业贷全球化
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-[#FFF0E6] px-2.5 py-0.5 text-[10px] font-bold text-[#FF5C00] border border-[#FFD8BF]">
                2026 Shenzhen FinTechathon
              </span>
            </div>
            <p className="text-[11px] text-[#717579] flex items-center gap-1.5 flex-wrap">
              <span>清华大学五道口金融学院 (PBCSF) & 微众银行 (WeBank) 联合主办</span>
              <span className="text-[#EDEFF2]">|</span>
              <span className="text-[#0084FF] font-mono font-medium">Topic E: SME Copilot</span>
              <span className="text-[#EDEFF2]">+</span>
              <span className="text-[#FF5C00] font-mono font-medium">Topic F: Agent Wallet (+5 Bonus)</span>
            </p>
          </div>
        </div>

        {/* Live Indicators & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 5-State FSM Status Pill — Planora pastel chip */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300 ${stateMeta.chipBg} ${stateMeta.chipText}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  fsmState === "BLOCKED_ADVERSARIAL"
                    ? "bg-[#FF1744]"
                    : fsmState === "FLASH_BAILOUT_ACTIVE"
                    ? "bg-[#FF5C00]"
                    : "bg-[#00A35C]"
                }`}
              ></span>
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  fsmState === "BLOCKED_ADVERSARIAL"
                    ? "bg-[#FF1744]"
                    : fsmState === "FLASH_BAILOUT_ACTIVE"
                    ? "bg-[#FF5C00]"
                    : "bg-[#00A35C]"
                }`}
              ></span>
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-[11px]">{stateMeta.label}</span>
              <span className="text-[9px] text-[#717579]">{stateMeta.zh}</span>
            </div>
          </div>

          {/* Latency Counter */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F4F5F7] text-[11px] font-mono text-[#1A1D1F]">
            <Activity className="h-3.5 w-3.5 text-[#0084FF]" />
            <span>FSM Latency:</span>
            <span className="text-[#0084FF] font-bold">{latencyMs.toFixed(1)}ms</span>
          </div>

          {/* Transaction Mode Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {txMode === "LIVE_RPC_BROADCAST" ? (
              <span className="flex items-center gap-1.5 bg-[#E8F8F0] text-[#00A35C] font-bold px-3 py-1.5 rounded-full">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>LIVE TESTNET</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#EBF5FF] text-[#0084FF] font-bold px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                <span>TESTNET REPLAY</span>
              </span>
            )}
          </div>

          {/* 2.5x Judge Camera Zoom Bar — Planora segmented pill */}
          <div className="flex items-center gap-1 rounded-full bg-[#F4F5F7] border border-[#EDEFF2] p-1 text-xs">
            <span className="text-[10px] uppercase font-mono text-[#717579] px-1.5 hidden sm:inline">
              Zoom:
            </span>
            <button
              onClick={() => onZoomChange(Math.max(1.0, zoomLevel - 0.25))}
              className="p-1 hover:bg-white rounded-full text-[#717579] hover:text-[#1A1D1F] transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-0.5">
              {zoomPercentages.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onZoomChange(lvl)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition ${
                    Math.abs(zoomLevel - lvl) < 0.05
                      ? "bg-[#FFF0E6] text-[#FF5C00] font-bold"
                      : "text-[#717579] hover:bg-white hover:text-[#1A1D1F]"
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
            <button
              onClick={() => onZoomChange(Math.min(2.5, zoomLevel + 0.25))}
              className="p-1 hover:bg-white rounded-full text-[#717579] hover:text-[#1A1D1F] transition"
              title="Zoom In (up to 2.5x for presentation cameras)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default JudgeCommandHeader;
