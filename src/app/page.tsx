"use client";

import { useEffect, useRef, useState } from "react";
import { BacktestScreen } from "@/components/BacktestScreen";
import { CommandCenterScreen } from "@/components/CommandCenterScreen";
import { Icon } from "@/components/Icons";
import { OverviewScreen } from "@/components/OverviewScreen";
import { SCENARIOS, type ScenarioId, type ViewId } from "@/data/kendraData";
import AuthNav from "@/components/AuthNav";
import SmoothScroll from "@/components/SmoothScroll";

const VIEW_INDEX: Record<ViewId, number> = {
  overview: 0,
  command: 1,
  backtest: 2,
};

export default function HomePage() {
  const [view, setView] = useState<ViewId>("overview");
  const [navDirection, setNavDirection] = useState<"forward" | "backward">("forward");
  const [scenario, setScenario] = useState<ScenarioId>("valid");
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [repaidSweep, setRepaidSweep] = useState<boolean>(false);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const handleNavigate = (next: ViewId) => {
    if (next !== view) {
      const dir = VIEW_INDEX[next] >= VIEW_INDEX[view] ? "forward" : "backward";
      setNavDirection(dir);
      setView(next);
    }
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number, opts?: { immediate?: boolean }) => void; resize: () => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.resize();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const runChoreographedScenario = (target: ScenarioId) => {
    clearTimers();
    setScenario(target);
    if (target !== "valid") {
      setRepaidSweep(false);
    }
    setIsSweeping(false);
    if (view !== "command") {
      setNavDirection(VIEW_INDEX.command >= VIEW_INDEX[view] ? "forward" : "backward");
      setView("command");
    }
    setMobileMenuOpen(false);

    // Synchronize with Next.js backend state machine in the background
    const scenarioApiMap: Record<ScenarioId, string> = {
      valid: "SCENARIO_A_VALID",
      blocked: "SCENARIO_B_REDTEAM",
      bailout: "SCENARIO_C_SYBIL_WASH",
    };
    void fetch("/api/kendra/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: scenarioApiMap[target] }),
    }).catch(() => {
      // Non-blocking fallback: UI choreography proceeds smoothly
    });

    // Step-by-step causal FSM progression (340ms per stage)
    setExecutionStep(1);
    const maxStage = target === "blocked" ? 2 : 4;

    for (let step = 2; step <= maxStage; step += 1) {
      const id = window.setTimeout(
        () => {
          setExecutionStep(step);
        },
        (step - 1) * 340,
      );
      timersRef.current.push(id);
    }

    const finishId = window.setTimeout(
      () => {
        setExecutionStep(0);
        setToast(SCENARIOS[target].outcomeHeadline);
      },
      maxStage * 340 + 180,
    );
    timersRef.current.push(finishId);
  };

  const handleRunRepaySweep = () => {
    if (isSweeping || executionStep > 0) return;
    setIsSweeping(true);

    // Call Next.js repayment sweep endpoint
    void fetch("/api/kendra/repay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ borrowerId: "AGT-01", days: 30 }),
    }).catch(() => {});

    const id = window.setTimeout(() => {
      setIsSweeping(false);
      setRepaidSweep(true);
      setToast("30-day repayment complete · ৳45,462.33 collected and ৳37.37 shared with backers");
    }, 900);
    timersRef.current.push(id);
  };

  const currentScenario = SCENARIOS[scenario];
  const headerStatusLabel =
    executionStep === 1
      ? "1 · Reading request"
      : executionStep === 2
        ? "2 · Checking cash flow"
        : executionStep === 3
          ? "3 · Confirming backers"
          : executionStep === 4
            ? "4 · Paying supplier"
            : scenario === "valid"
              ? "Approved · 4 of 5 signed"
              : scenario === "blocked"
                ? "Blocked · Unregistered seller"
                : "Flood relief active";

  return (
    <div className="kf-shell">
      <SmoothScroll />
      {/* Sovereign Persistent Header */}
      <header className="kf-header">
        <div className="kf-header-inner">
          <div className="kf-brand-cluster">
            <button
              type="button"
              className="kf-mobile-trigger"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Icon name="menu" size={18} />
            </button>

            <button type="button" className="kf-brand" onClick={() => handleNavigate("overview")}>
              <span className="kf-brand-mark" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polygon
                    points="12,3.2 20.4,9.3 17.2,19.2 6.8,19.2 3.6,9.3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="3.2" r="2.2" fill="#FFE4D1" />
                  <circle cx="20.4" cy="9.3" r="1.75" fill="#FFFDF9" />
                  <circle cx="17.2" cy="19.2" r="1.75" fill="#FFFDF9" />
                  <circle cx="6.8" cy="19.2" r="1.75" fill="#FFFDF9" />
                  <circle cx="3.6" cy="9.3" r="1.75" fill="#E8C7B4" />
                </svg>
              </span>
              <span className="kf-brand-text">
                <strong>
                  Kendra<span>Fi</span>
                </strong>
                <span className="kf-brand-divider" aria-hidden="true" />
                <small className="kf-bn">কেন্দ্রফাই</small>
              </span>
            </button>
          </div>

          {/* Primary 3-View Navigation */}
          <nav
            className={`kf-nav ${mobileMenuOpen ? "is-open" : ""}`}
            aria-label="Primary views"
            data-lenis-prevent
          >
            <div className="kf-mobile-nav-head">
              <span>Navigation</span>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <button
              type="button"
              aria-current={view === "overview" ? "page" : undefined}
              className={`kf-nav-tab ${view === "overview" ? "is-active" : ""}`}
              onClick={() => handleNavigate("overview")}
            >
              <Icon name="grid" size={16} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              aria-current={view === "command" ? "page" : undefined}
              className={`kf-nav-tab ${view === "command" ? "is-active" : ""}`}
              onClick={() => handleNavigate("command")}
            >
              <Icon name="command" size={16} />
              <span>Workspace</span>
            </button>

            <button
              type="button"
              aria-current={view === "backtest" ? "page" : undefined}
              className={`kf-nav-tab ${view === "backtest" ? "is-active" : ""}`}
              onClick={() => handleNavigate("backtest")}
            >
              <Icon name="chart" size={16} />
              <span>Risk Study</span>
            </button>
          </nav>

          {/* Live Protocol Status Cluster */}
          <div className="kf-header-status">
            <button
              type="button"
              className={`kf-fsm-pill is-${currentScenario.tone} ${
                executionStep > 0 ? "is-running" : ""
              }`}
              onClick={() => handleNavigate("command")}
              title="Open loan workspace"
            >
              <span className={`kf-dot kf-dot--${currentScenario.tone}`} />
              <span className="kf-fsm-single kf-tabular">{headerStatusLabel}</span>
            </button>

            {view !== "command" ? (
              <button
                type="button"
                className="kf-header-cta"
                onClick={() => runChoreographedScenario(scenario)}
              >
                <Icon name="bolt" size={14} />
                <span>
                  Open <em className="kf-btn-word">Workspace</em>
                </span>
              </button>
            ) : (
              <span className="kf-net-badge">
                <span className="kf-dot kf-dot--valid" />
                <span>Base Sepolia</span>
              </span>
            )}

            {/* Subtle, aligned account status */}
            <AuthNav />
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="kf-scrim"
          aria-label="Close navigation backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Active View with Directional Slide & Fade */}
      <div key={view} className={`kf-view-container kf-view-slide-${navDirection}`}>
        {view === "overview" && (
          <OverviewScreen onNavigate={handleNavigate} onLaunchScenario={runChoreographedScenario} />
        )}

        {view === "command" && (
          <CommandCenterScreen
            scenario={scenario}
            executionStep={executionStep}
            repaidSweep={repaidSweep}
            isSweeping={isSweeping}
            onSelectScenario={runChoreographedScenario}
            onReplayScenario={() => runChoreographedScenario(scenario)}
            onRunRepaySweep={handleRunRepaySweep}
          />
        )}

        {view === "backtest" && <BacktestScreen onNavigate={handleNavigate} />}
      </div>

      {/* Minimal Sovereign Footer */}
      <footer className="kf-footer">
        <div className="kf-footer-inner">
          <span>
            <strong>KendraFi</strong> · Peer-backed inventory credit &amp; direct supplier payments
          </span>
          <span className="kf-tabular">12.50% APR · 1.68× cash-flow ratio · Base Sepolia</span>
        </div>
      </footer>

      {/* Live Execution Toast */}
      {toast && (
        <div className="kf-toast" role="status" aria-live="polite">
          <span className="kf-toast-icon">
            <Icon name="check" size={14} />
          </span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
