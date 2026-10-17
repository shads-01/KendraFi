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

const STATE_CONFIG: Record<FSMState, { label: string; zh: string; color: string; border: string; bg: string }> = {
  IDLE_MONITORING: {
    label: "IDLE_MONITORING",
    zh: "待命监测",
    color: "text-slate-400",
    border: "border-slate-700/60",
    bg: "bg-slate-900/60",
  },
  INTENT_PERCEPTION: {
    label: "INTENT_PERCEPTION",
    zh: "意图感知",
    color: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-950/40",
  },
  DETERMINISTIC_AUDIT: {
    label: "DETERMINISTIC_AUDIT",
    zh: "确定性风控审计",
    color: "text-indigo-400",
    border: "border-indigo-500/40",
    bg: "bg-indigo-950/40",
  },
  SYNDICATE_P2P_NEGOTIATION: {
    label: "SYNDICATE_P2P_NEGOTIATION",
    zh: "多方CNP撮合博弈",
    color: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-950/40",
  },
  ESCROW_COSIGN_AND_SETTLE: {
    label: "ESCROW_COSIGN_AND_SETTLE",
    zh: "链上托管会签交割",
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/40",
  },
  BLOCKED_ADVERSARIAL: {
    label: "BLOCKED_ADVERSARIAL",
    zh: "零信任对抗拦截",
    color: "text-rose-400",
    border: "border-rose-500/50",
    bg: "bg-rose-950/50",
  },
  FLASH_BAILOUT_ACTIVE: {
    label: "FLASH_BAILOUT_ACTIVE",
    zh: "季风外生冲击闪电解困",
    color: "text-amber-400",
    border: "border-amber-500/50",
    bg: "bg-amber-950/50",
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070B14]/90 backdrop-blur-md px-4 py-3 transition-all">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Technical Subtitles */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070B14]">
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
            {isExecuting && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono sm:text-xl">
                KendraFi <span className="text-xs font-normal text-indigo-400 font-sans">(Weiyedai-Global · 微业贷全球化)</span>
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                2026 Shenzhen FinTechathon
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>清华大学五道口金融学院 (PBCSF) & 微众银行 (WeBank) 联合主办</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-mono">Topic E: SME Copilot</span>
              <span className="text-slate-600">+</span>
              <span className="text-purple-400 font-mono">Topic F: Agent Wallet (+5 Bonus)</span>
            </p>
          </div>
        </div>

        {/* Live Indicators & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 5-State FSM Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 ${stateMeta.bg} ${stateMeta.border}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  fsmState === "BLOCKED_ADVERSARIAL"
                    ? "bg-rose-400"
                    : fsmState === "FLASH_BAILOUT_ACTIVE"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  fsmState === "BLOCKED_ADVERSARIAL"
                    ? "bg-rose-500"
                    : fsmState === "FLASH_BAILOUT_ACTIVE"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              ></span>
            </span>
            <div className="flex flex-col">
              <span className={`font-semibold ${stateMeta.color}`}>{stateMeta.label}</span>
              <span className="text-[9px] text-slate-400">{stateMeta.zh}</span>
            </div>
          </div>

          {/* Latency Counter */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-[11px] font-mono text-slate-300">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>FSM Latency:</span>
            <span className="text-cyan-400 font-semibold">{latencyMs.toFixed(1)}ms</span>
          </div>

          {/* Transaction Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono">
            {txMode === "LIVE_RPC_BROADCAST" ? (
              <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 rounded">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>LIVE TESTNET BROADCAST</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 border-amber-500/30 bg-amber-950/30 px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3" />
                <span>VERIFIED TESTNET REPLAY</span>
              </span>
            )}
          </div>

          {/* 2.5x Judge Camera Zoom Bar */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 px-1 hidden sm:inline">
              Judge Zoom:
            </span>
            <button
              onClick={() => onZoomChange(Math.max(1.0, zoomLevel - 0.25))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1">
              {zoomPercentages.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onZoomChange(lvl)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                    Math.abs(zoomLevel - lvl) < 0.05
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
            <button
              onClick={() => onZoomChange(Math.min(2.5, zoomLevel + 0.25))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
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
