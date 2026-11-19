import { useEffect, useRef, useState } from "react";
import {
  CNP_MESSAGES,
  EIP712_SIGNERS,
  KENDRA_AGENTS,
  SCENARIOS,
  ZK_PROOF_SUMMARY,
  type PipelineStepStatus,
  type ScenarioId,
} from "../data/kendraData";
import { Icon } from "./Icons";

interface CommandCenterScreenProps {
  scenario: ScenarioId;
  executionStep: number; // 0 = complete/idle, 1..4 = live stage progression
  repaidSweep: boolean;
  isSweeping: boolean;
  onSelectScenario: (scenario: ScenarioId) => void;
  onReplayScenario: () => void;
  onRunRepaySweep: () => void;
}

const WAVE_BARS = [12, 22, 16, 28, 18, 30, 14, 26, 20, 29, 15, 24, 17, 21];

export function CommandCenterScreen({
  scenario,
  executionStep,
  repaidSweep,
  isSweeping,
  onSelectScenario,
  onReplayScenario,
  onRunRepaySweep,
}: CommandCenterScreenProps) {
  const active = SCENARIOS[scenario];
  const isExecuting = executionStep > 0;

  // Progressive disclosure states
  const [arenaTab, setArenaTab] = useState<"pentagon" | "cnp" | "zk">("pentagon");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    scenario === "blocked" ? "AGT-05" : "AGT-04",
  );
  const [cnpFilter, setCnpFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [showZkHex, setShowZkHex] = useState(false);
  const [showSigners, setShowSigners] = useState(false);

  // Studio Voice Note state
  const [voiceLang, setVoiceLang] = useState<"bn" | "en">("bn");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(active.merchant.voiceDuration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep selected node synced cleanly on scenario change
  useEffect(() => {
    setSelectedAgentId(scenario === "blocked" ? "AGT-05" : "AGT-04");
  }, [scenario]);

  // Stop audio cleanly on scenario change or unmount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(false);
    setVoiceTimer(active.merchant.voiceDuration);
  }, [scenario, active.merchant.voiceDuration]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(false);
    setVoiceTimer(active.merchant.voiceDuration);
  };

  const fallbackSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlayingVoice(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = voiceLang === "bn" ? active.merchant.quoteBn : active.merchant.quoteEn;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang === "bn" ? "bn-BD" : "en-US";
    utterance.rate = voiceLang === "bn" ? 0.94 : 1.0;
    utterance.onstart = () => setIsPlayingVoice(true);
    utterance.onend = () => {
      setIsPlayingVoice(false);
      setVoiceTimer(active.merchant.voiceDuration);
    };
    utterance.onerror = () => {
      setIsPlayingVoice(false);
      setVoiceTimer(active.merchant.voiceDuration);
    };
    window.speechSynthesis.speak(utterance);
    setIsPlayingVoice(true);
  };

  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      stopVoice();
      return;
    }

    const src =
      voiceLang === "bn"
        ? voiceGender === "female"
          ? active.merchant.audioFiles.bnFemale
          : active.merchant.audioFiles.bnMale
        : voiceGender === "female"
          ? active.merchant.audioFiles.enFemale
          : active.merchant.audioFiles.enMale;

    try {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        const cur = Math.floor(audio.currentTime);
        const dur = Math.max(1, Math.round(audio.duration || 5));
        setVoiceTimer(`0:${String(cur).padStart(2, "0")} / 0:${String(dur).padStart(2, "0")}`);
      };
      audio.onplay = () => setIsPlayingVoice(true);
      audio.onended = () => {
        setIsPlayingVoice(false);
        setVoiceTimer(active.merchant.voiceDuration);
      };
      audio.onerror = () => fallbackSpeech();
      audio.play().catch(() => fallbackSpeech());
    } catch {
      fallbackSpeech();
    }
  };

  // Compute 4-stage pipeline status for causal choreography
  const getStageStatus = (stageIndex: 1 | 2 | 3 | 4): PipelineStepStatus => {
    if (isExecuting) {
      if (executionStep === stageIndex) return "active";
      if (executionStep > stageIndex) {
        if (scenario === "blocked" && stageIndex >= 2) return "blocked";
        return "complete";
      }
      return "pending";
    }
    // Finished state
    if (scenario === "blocked") {
      if (stageIndex === 1) return "complete";
      if (stageIndex === 2) return "blocked";
      return "pending";
    }
    if (scenario === "bailout" && stageIndex >= 3) {
      return "warn";
    }
    return "complete";
  };

  const pipelineStages = [
    {
      index: 1 as const,
      num: "01",
      title: "Loan request",
      sub: "Voice note & supplier invoice",
    },
    {
      index: 2 as const,
      num: "02",
      title: "Cash-flow check",
      sub: scenario === "blocked" ? "Stopped · Tampered receipt" : "1.68× coverage verified",
    },
    {
      index: 3 as const,
      num: "03",
      title: "Peer backing",
      sub: scenario === "blocked" ? "Not requested (0%)" : "3 shops · 40 / 35 / 25%",
    },
    {
      index: 4 as const,
      num: "04",
      title: "Supplier payment",
      sub:
        scenario === "blocked"
          ? "Locked · ৳0 paid"
          : scenario === "bailout"
            ? "Flood reserve active"
            : repaidSweep
              ? "30-day loan repaid"
              : "৳44,325 sent to supplier",
    },
  ];

  const selectedAgent = KENDRA_AGENTS.find((a) => a.id === selectedAgentId) ?? KENDRA_AGENTS[1];

  const visibleCnp =
    cnpFilter === "all" ? CNP_MESSAGES : CNP_MESSAGES.filter((msg) => msg.round === cnpFilter);

  return (
    <main className="kf-page" aria-label="Live protocol command center">
      {/* Top Scenario & Reconciled Deal Command Deck */}
      <section className="kf-command-deck">
        <div className="kf-deck-top">
          <div className="kf-scenario-tabs" role="group" aria-label="Select protocol scenario">
            {(["valid", "blocked", "bailout"] as ScenarioId[]).map((id) => {
              const item = SCENARIOS[id];
              const isCurrent = scenario === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isCurrent}
                  disabled={isExecuting}
                  className={`kf-scenario-tab ${isCurrent ? `is-active is-${item.tone}` : ""}`}
                  onClick={() => onSelectScenario(id)}
                >
                  <span className={`kf-dot kf-dot--${item.tone}`} />
                  <span className="kf-tabular">{item.number}</span>
                  <span>{item.shortTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="kf-deck-controls">
            <span className="kf-telemetry-pill kf-tabular">
              {isExecuting ? "Running checks…" : `${active.latencyMs.toFixed(1)} ms · Base Sepolia`}
            </span>
            <button
              type="button"
              className="kf-btn kf-btn--secondary kf-btn--sm"
              disabled={isExecuting}
              onClick={onReplayScenario}
            >
              <Icon name="refresh" size={15} />
              <span>Run check again</span>
            </button>
          </div>
        </div>

        {/* Choreographed 4-Stage Pipeline Rail */}
        <ol className="kf-pipeline" aria-label="Protocol finite-state progression">
          {pipelineStages.map((st) => {
            const status = getStageStatus(st.index);
            return (
              <li key={st.num} className={`kf-pipeline-step is-${status}`}>
                <div className="kf-pipeline-indicator">
                  <span className="kf-pipeline-num kf-tabular">
                    {status === "complete" ? (
                      <Icon name="check" size={14} />
                    ) : status === "blocked" ? (
                      <Icon name="shieldAlert" size={14} />
                    ) : (
                      st.num
                    )}
                  </span>
                </div>
                <div className="kf-pipeline-text">
                  <strong>{st.title}</strong>
                  <span>{st.sub}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Main 3-Column Synchronized Workspace */}
      <section className="kf-command-grid">
        {/* =============================================================== */}
        {/* COLUMN 01 · MERCHANT INTENT & STUDIO VOICE PLAYER                */}
        {/* =============================================================== */}
        <article className="kf-stage-card">
          <header className="kf-stage-head">
            <div className="kf-stage-title-wrap">
              <span className="kf-stage-num kf-tabular">Step 1 · Borrower Request</span>
              <h2 className="kf-stage-title">
                {active.merchant.name} <span className="kf-bn">· {active.merchant.nameBn}</span>
              </h2>
            </div>
            <span className={`kf-badge kf-badge--${active.tone}`}>{active.merchant.badge}</span>
          </header>

          <div className="kf-merchant-meta">
            <div
              className={`kf-avatar kf-avatar--${scenario === "blocked" ? "abstained" : "borrower"}`}
            >
              {active.merchant.initials}
            </div>
            <div>
              <strong>{active.merchant.owner}</strong>
              <span>
                {active.merchant.market} · {active.merchant.agentId}
              </span>
            </div>
          </div>

          {/* Bilingual Studio Voice Note Box */}
          <div className="kf-voice-card">
            <div className="kf-voice-toolbar">
              <span className="kf-meta-label">
                <Icon name="volume" size={14} /> Merchant voice note
              </span>
              <div className="kf-mini-toggles">
                <div className="kf-mini-seg" role="group" aria-label="Voice language">
                  <button
                    type="button"
                    aria-pressed={voiceLang === "bn"}
                    className={voiceLang === "bn" ? "is-active" : ""}
                    onClick={() => {
                      stopVoice();
                      setVoiceLang("bn");
                    }}
                  >
                    বাংলা
                  </button>
                  <button
                    type="button"
                    aria-pressed={voiceLang === "en"}
                    className={voiceLang === "en" ? "is-active" : ""}
                    onClick={() => {
                      stopVoice();
                      setVoiceLang("en");
                    }}
                  >
                    EN
                  </button>
                </div>
                <div className="kf-mini-seg" role="group" aria-label="Studio voice timbre">
                  <button
                    type="button"
                    aria-pressed={voiceGender === "female"}
                    className={voiceGender === "female" ? "is-active" : ""}
                    onClick={() => {
                      stopVoice();
                      setVoiceGender("female");
                    }}
                  >
                    F
                  </button>
                  <button
                    type="button"
                    aria-pressed={voiceGender === "male"}
                    className={voiceGender === "male" ? "is-active" : ""}
                    onClick={() => {
                      stopVoice();
                      setVoiceGender("male");
                    }}
                  >
                    M
                  </button>
                </div>
              </div>
            </div>

            <div className="kf-voice-player">
              <button
                type="button"
                className={`kf-play-btn ${isPlayingVoice ? "is-playing" : ""}`}
                onClick={toggleVoicePlayback}
                aria-label={isPlayingVoice ? "Stop voice note" : "Play merchant voice note"}
              >
                <Icon name={isPlayingVoice ? "stop" : "play"} size={16} />
              </button>
              <div
                className={`kf-waveform ${isPlayingVoice ? "is-playing" : ""}`}
                aria-hidden="true"
              >
                {WAVE_BARS.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: `${h}px`,
                      animationDelay: `${(i % 5) * 90}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="kf-voice-time kf-tabular">{voiceTimer}</span>
            </div>

            <blockquote className="kf-voice-quote">
              {voiceLang === "bn" ? active.merchant.quoteBn : active.merchant.quoteEn}
            </blockquote>
          </div>

          {/* Extracted Wholesale Invoice Summary */}
          <dl className="kf-kv-list">
            <div>
              <dt>Requested amount</dt>
              <dd className="kf-tabular">
                ৳{active.merchant.invoice.principalBdt.toLocaleString()}.00 (
                {active.merchant.invoice.tenorDays}d)
              </dd>
            </div>
            <div>
              <dt>Supplier</dt>
              <dd>{active.merchant.invoice.supplier}</dd>
            </div>
            <div>
              <dt>Average daily sales</dt>
              <dd className="kf-tabular">{active.merchant.dailyInflow}</dd>
            </div>
            <div>
              <dt>Cash-flow coverage</dt>
              <dd
                className={`kf-tabular ${
                  scenario === "blocked" ? "kf-text-danger" : "kf-text-valid"
                }`}
              >
                {active.merchant.dscrLabel}
              </dd>
            </div>
          </dl>

          {/* Progressive Disclosure: Raw OCR Payload */}
          <div className="kf-drawer">
            <button
              type="button"
              className="kf-drawer-toggle"
              aria-expanded={showRawOcr}
              onClick={() => setShowRawOcr((v) => !v)}
            >
              <span className="kf-drawer-label">
                <Icon name="fileText" size={15} />
                <span>
                  {showRawOcr ? "Hide scanned invoice text" : "Show scanned invoice text"}
                </span>
              </span>
              <Icon name="chevronDown" size={16} className={showRawOcr ? "kf-rot-180" : ""} />
            </button>
            {showRawOcr && <pre className="kf-code-box">{active.merchant.invoice.rawOcr}</pre>}
          </div>
        </article>

        {/* =============================================================== */}
        {/* COLUMN 02 · 5-NODE KENDRA PENTAGON & PROGRESSIVE PROOF TABS     */}
        {/* =============================================================== */}
        <article className="kf-stage-card">
          <header className="kf-stage-head">
            <div className="kf-stage-title-wrap">
              <span className="kf-stage-num kf-tabular">Step 2 · Peer Backing</span>
              <h2 className="kf-stage-title">5-Shop Group Guarantee</h2>
            </div>
            <span className={`kf-badge kf-badge--${active.tone}`}>
              {active.quorum.coveragePct}% Backed
            </span>
          </header>

          <div
            className="kf-segmented kf-segmented--full"
            role="tablist"
            aria-label="Syndicate view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={arenaTab === "pentagon"}
              className={arenaTab === "pentagon" ? "is-active" : ""}
              onClick={() => setArenaTab("pentagon")}
            >
              Group map
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={arenaTab === "cnp"}
              className={arenaTab === "cnp" ? "is-active" : ""}
              onClick={() => setArenaTab("cnp")}
            >
              Bidding log (9)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={arenaTab === "zk"}
              className={arenaTab === "zk" ? "is-active" : ""}
              onClick={() => setArenaTab("zk")}
            >
              Privacy check
            </button>
          </div>

          {arenaTab === "pentagon" && (
            <div className="kf-arena-body">
              {/* Interactive SVG Pentagon */}
              <div className="kf-pentagon-stage">
                <svg viewBox="0 0 100 100" className="kf-pentagon-svg" aria-hidden="true">
                  {/* Outer Pentagon Ring */}
                  <polygon
                    points="50,14 84,38 72,76 28,76 16,38"
                    fill={
                      scenario === "blocked"
                        ? "rgba(158, 43, 59, 0.04)"
                        : "rgba(54, 83, 165, 0.045)"
                    }
                    stroke="#C5B6A3"
                    strokeWidth="0.65"
                  />

                  {/* Active Cosigning Chords (AGT-01 <-> AGT-04, AGT-02, AGT-03) */}
                  {scenario !== "blocked" ? (
                    <>
                      <line x1="50" y1="14" x2="16" y2="38" className="kf-chord-active" />
                      <line x1="50" y1="14" x2="84" y2="38" className="kf-chord-active" />
                      <line x1="50" y1="14" x2="72" y2="76" className="kf-chord-active" />
                      <line
                        x1="16"
                        y1="38"
                        x2="84"
                        y2="38"
                        stroke="#C5D1F0"
                        strokeWidth="0.65"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="84"
                        y1="38"
                        x2="72"
                        y2="76"
                        stroke="#C5D1F0"
                        strokeWidth="0.65"
                        strokeDasharray="2 2"
                      />
                    </>
                  ) : (
                    <line
                      x1="28"
                      y1="76"
                      x2="50"
                      y2="48"
                      stroke="#9E2B3B"
                      strokeWidth="1"
                      strokeDasharray="2.5 2.5"
                    />
                  )}
                </svg>

                {/* 5 Clickable Merchant Nodes */}
                {KENDRA_AGENTS.map((node) => {
                  const isSelected = selectedAgent.id === node.id;
                  const isBlockedTarget = scenario === "blocked" && node.id === "AGT-05";
                  const nodeStateClass = isBlockedTarget
                    ? "is-danger"
                    : scenario === "blocked"
                      ? "is-muted"
                      : `is-${node.status}`;

                  const posMap: Record<string, { x: number; y: number }> = {
                    "AGT-01": { x: 50, y: 14 },
                    "AGT-04": { x: 16, y: 38 },
                    "AGT-02": { x: 84, y: 38 },
                    "AGT-03": { x: 72, y: 76 },
                    "AGT-05": { x: 28, y: 76 },
                  };
                  const pt = posMap[node.id] ?? node.coords;

                  return (
                    <button
                      key={node.id}
                      type="button"
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      onClick={() => setSelectedAgentId(node.id)}
                      aria-pressed={isSelected}
                      className={`kf-pnode ${nodeStateClass} ${isSelected ? "is-selected" : ""}`}
                    >
                      <span className="kf-pnode-orb kf-tabular">{node.initials}</span>
                      <span className="kf-pnode-caption">
                        <strong>{node.name.split(" ")[0]}</strong>
                        <small className="kf-tabular">
                          {scenario === "blocked"
                            ? node.id === "AGT-05"
                              ? "Blocked"
                              : "0%"
                            : node.status === "borrower"
                              ? "Borrower"
                              : node.status === "abstained"
                                ? "Sat out"
                                : `${node.sharePct}%`}
                        </small>
                      </span>
                    </button>
                  );
                })}

                {/* Central Quorum Hub */}
                <div className={`kf-quorum-hub is-${active.tone}`}>
                  <span className="kf-hub-label">Backed</span>
                  <strong className="kf-hub-val kf-tabular">{active.quorum.coveragePct}%</strong>
                  <span className="kf-hub-sub">{active.quorum.signedCount}</span>
                </div>
              </div>

              {/* Interactive Selected Node Inspector */}
              <div className="kf-node-inspector" aria-live="polite">
                <div className="kf-inspector-head">
                  <div>
                    <span className="kf-mono-id">{selectedAgent.id} · Select any shop above</span>
                    <h3>
                      {selectedAgent.name} <span className="kf-bn">· {selectedAgent.nameBn}</span>
                    </h3>
                  </div>
                  <span
                    className={`kf-badge ${
                      selectedAgent.status === "abstained"
                        ? "kf-badge--danger"
                        : selectedAgent.status === "borrower"
                          ? "kf-badge--accent"
                          : "kf-badge--valid"
                    }`}
                  >
                    {selectedAgent.status === "borrower"
                      ? "Borrower"
                      : selectedAgent.status === "abstained"
                        ? "Sat out"
                        : `${selectedAgent.sharePct}% share`}
                  </span>
                </div>
                <p className="kf-inspector-note">{selectedAgent.note}</p>
                <div className="kf-inspector-metrics">
                  <div>
                    <span>Cash reserve</span>
                    <strong className="kf-tabular">
                      ৳{selectedAgent.bufferBdt.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span>Amount backed</span>
                    <strong className="kf-tabular">
                      {scenario === "blocked" || selectedAgent.stakeBdt === 0
                        ? "৳0.00"
                        : `৳${selectedAgent.stakeBdt.toLocaleString()}`}
                    </strong>
                  </div>
                  <div>
                    <span>Net return</span>
                    <strong
                      className={`kf-tabular ${
                        selectedAgent.expectedUtilityBdt < 0 ? "kf-text-danger" : "kf-text-valid"
                      }`}
                    >
                      {selectedAgent.expectedUtilityBdt >= 0 ? "+" : "−"}৳
                      {Math.abs(selectedAgent.expectedUtilityBdt).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {arenaTab === "cnp" && (
            <div className="kf-tab-panel">
              <div className="kf-cnp-toolbar">
                <span className="kf-meta-label">3-Round Group Bidding Log</span>
                <div className="kf-mini-seg" role="group" aria-label="Filter CNP rounds">
                  {(["all", 1, 2, 3] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={cnpFilter === r ? "is-active" : ""}
                      onClick={() => setCnpFilter(r)}
                    >
                      {r === "all" ? "All" : `R${r}`}
                    </button>
                  ))}
                </div>
              </div>

              {scenario === "blocked" ? (
                <div className="kf-empty-callout is-danger">
                  <Icon name="shieldAlert" size={18} />
                  <div>
                    <strong>Stopped before peer bidding</strong>
                    <p>
                      The tampered receipt was rejected upfront, so neighboring shops were never
                      asked to risk their capital.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="kf-cnp-feed">
                  {visibleCnp.map((msg) => (
                    <div key={msg.id} className="kf-cnp-item">
                      <div className="kf-cnp-item-top">
                        <span className="kf-mono-id">
                          R{msg.round} · {msg.senderName}
                        </span>
                        <span className="kf-tabular kf-cnp-share">{msg.shareLabel}</span>
                      </div>
                      <p>{msg.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {arenaTab === "zk" && (
            <div className="kf-tab-panel">
              <div className="kf-zk-summary">
                <div className="kf-zk-head">
                  <span className="kf-meta-label">Private balance verification</span>
                  <span className="kf-badge kf-badge--valid">{ZK_PROOF_SUMMARY.provingTimeMs}</span>
                </div>
                <p className="kf-zk-copy">
                  Confirms Rahim Store has{" "}
                  <strong className="kf-tabular">
                    ৳{ZK_PROOF_SUMMARY.excessDeltaBdt.toLocaleString()}
                  </strong>{" "}
                  in spare repayment capacity without revealing his private account balance to other
                  shopkeepers.
                </p>

                <dl className="kf-kv-list">
                  <div>
                    <dt>On-time repayment odds</dt>
                    <dd className="kf-tabular kf-text-valid">
                      {active.quorum.fateSurvivalPct.toFixed(1)}%
                    </dd>
                  </div>
                  <div>
                    <dt>Minimum 1.25× cash-flow rule</dt>
                    <dd className="kf-tabular">
                      {scenario === "blocked" ? "Not run (blocked)" : "Verified"}
                    </dd>
                  </div>
                  <div>
                    <dt>Proof reference</dt>
                    <dd className="kf-tabular">0x0360ff8c...a2f42f</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="kf-drawer-toggle"
                  aria-expanded={showZkHex}
                  onClick={() => setShowZkHex((v) => !v)}
                >
                  <span>{showZkHex ? "Hide math proof details" : "Show math proof details"}</span>
                  <Icon name="chevronDown" size={16} className={showZkHex ? "kf-rot-180" : ""} />
                </button>

                {showZkHex && (
                  <div className="kf-bit-list">
                    {ZK_PROOF_SUMMARY.sampleBits.map((b) => (
                      <div key={b.bit} className="kf-bit-row kf-tabular">
                        <span>Bit #{String(b.bit).padStart(2, "0")}</span>
                        <code>{b.point}</code>
                        <span className="kf-text-valid">Valid</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </article>

        {/* =============================================================== */}
        {/* COLUMN 03 · ZERO-TRUST FIREWALL & PROGRAMMABLE ESCROW           */}
        {/* =============================================================== */}
        <article className="kf-stage-card">
          <header className="kf-stage-head">
            <div className="kf-stage-title-wrap">
              <span className="kf-stage-num kf-tabular">Step 3 · Safety &amp; Payment</span>
              <h2 className="kf-stage-title">Verification &amp; Supplier Payout</h2>
            </div>
            <span className={`kf-badge kf-badge--${active.tone}`}>{active.fsmLabel}</span>
          </header>

          {/* Conditional Security Quarantine / Monsoon Alert */}
          {active.alert && (
            <div className={`kf-alert-banner is-${active.tone}`} role="alert">
              <Icon name={scenario === "blocked" ? "shieldAlert" : "cloudRain"} size={18} />
              <div>
                <strong>{active.alert.title}</strong>
                <p>{active.alert.detail}</p>
                <span className="kf-alert-meta">{active.alert.ruleRef}</span>
              </div>
            </div>
          )}

          {/* 4-Tier Zero-Trust Gateways */}
          <div className="kf-firewall-list" aria-label="Zero-trust firewall checks">
            {active.firewall.map((gate) => (
              <div key={gate.tier} className={`kf-gate-row is-${gate.status}`}>
                <div className="kf-gate-main">
                  <span className="kf-mono-id">{gate.tier}</span>
                  <div>
                    <strong>{gate.title}</strong>
                    <span>{gate.detail}</span>
                  </div>
                </div>
                <span
                  className={`kf-badge ${
                    gate.status === "pass"
                      ? "kf-badge--valid"
                      : gate.status === "blocked"
                        ? "kf-badge--danger"
                        : gate.status === "warn"
                          ? "kf-badge--warn"
                          : "kf-badge--neutral"
                  }`}
                >
                  {gate.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Reconciled Settlement Ledger */}
          <div className="kf-settlement-box">
            <div className="kf-settlement-row">
              <span>Total 30-day repayment (12.50% APR)</span>
              <strong className="kf-tabular">
                ৳
                {active.settlement.grossRepaymentBdt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>
            <div className="kf-settlement-row">
              <span>Supplier discount (1.50%)</span>
              <strong className="kf-tabular">−৳{active.settlement.mdrRebateBdt.toFixed(2)}</strong>
            </div>
            <div className="kf-settlement-total">
              <div>
                <span>
                  {scenario === "blocked"
                    ? "Paid to unregistered wallet"
                    : scenario === "bailout"
                      ? "Protected supplier payout"
                      : "Paid directly to supplier"}
                </span>
                <small>
                  {scenario === "blocked"
                    ? "No funds left the vault"
                    : `Block #${active.settlement.blockNumber} · Base Sepolia`}
                </small>
              </div>
              <strong className="kf-tabular">
                ৳
                {active.settlement.netSupplierPayoutBdt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          {/* Post-Settlement 30-Day MFS Repayment Sweep Status */}
          {scenario === "valid" && repaidSweep && (
            <div className="kf-sweep-receipt" role="status">
              <div className="kf-sweep-head">
                <Icon name="check" size={16} />
                <strong>30-day loan repaid in full (৳45,462.33)</strong>
              </div>
              <p>
                ৳1,515.41 collected daily over 30 days. Backing shops earned{" "}
                <strong className="kf-tabular">৳37.37</strong> in fees (Nasrin ৳14.95 · Fatema
                ৳13.08 · Kamal ৳9.34), raising Rahim Store&apos;s next credit limit by 15%.
              </p>
            </div>
          )}

          {/* Primary Lifecycle Actions */}
          <div className="kf-escrow-actions">
            {scenario === "valid" ? (
              <button
                type="button"
                className="kf-btn kf-btn--primary kf-btn--full"
                disabled={isExecuting || isSweeping}
                onClick={onRunRepaySweep}
              >
                <Icon name={repaidSweep ? "check" : "bolt"} size={16} />
                <span>
                  {isSweeping ? (
                    "Collecting 30 daily installments…"
                  ) : repaidSweep ? (
                    <>
                      Run <em className="kf-btn-word">30-day repayment</em> again
                    </>
                  ) : (
                    <>
                      Run <em className="kf-btn-word">30-day repayment</em>
                    </>
                  )}
                </span>
              </button>
            ) : scenario === "blocked" ? (
              <button
                type="button"
                className="kf-btn kf-btn--secondary kf-btn--full"
                onClick={() => onSelectScenario("valid")}
              >
                <Icon name="arrowRight" size={16} />
                <span>Back to approved rice restock</span>
              </button>
            ) : (
              <button
                type="button"
                className="kf-btn kf-btn--primary kf-btn--full"
                disabled={isExecuting}
                onClick={onReplayScenario}
              >
                <Icon name="cloudRain" size={16} />
                <span>
                  Review <em className="kf-btn-word is-aqua">flood relief protection</em>
                </span>
              </button>
            )}

            <a
              href={active.settlement.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="kf-explorer-link"
            >
              <span className="kf-tabular">
                Tx {active.settlement.txHash.slice(0, 12)}…{active.settlement.txHash.slice(-6)}
              </span>
              <span className="kf-explorer-cta">
                View receipt <Icon name="arrowUpRight" size={14} />
              </span>
            </a>
          </div>

          {/* Progressive Disclosure: EIP-712 Session Quorum Signatures */}
          <div className="kf-drawer">
            <button
              type="button"
              className="kf-drawer-toggle"
              aria-expanded={showSigners}
              onClick={() => setShowSigners((v) => !v)}
            >
              <span className="kf-drawer-label">
                <Icon name="lock" size={15} />
                <span>
                  {showSigners ? "Hide" : "Show"} co-signer approvals (
                  {scenario === "blocked" ? "0 of 5" : "4 of 5"})
                </span>
              </span>
              <Icon name="chevronDown" size={16} className={showSigners ? "kf-rot-180" : ""} />
            </button>
            {showSigners && (
              <div className="kf-signer-list">
                {EIP712_SIGNERS.map((s) => (
                  <div key={s.agentId} className="kf-signer-item">
                    <div className="kf-signer-top">
                      <strong>
                        {s.agentId} · {s.name}
                      </strong>
                      <span className="kf-tabular">
                        {scenario === "blocked" ? "Not Signed" : s.stake}
                      </span>
                    </div>
                    <code className="kf-signer-hex">
                      {scenario === "blocked"
                        ? "Halted prior to session-key signing"
                        : `${s.signature.slice(0, 26)}…${s.signature.slice(-12)}`}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
