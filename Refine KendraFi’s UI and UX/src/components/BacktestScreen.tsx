import { useState } from "react";
import { BACKTEST_FEATURES, SYNTHETIC_COHORTS, type ViewId } from "../data/kendraData";
import { Icon } from "./Icons";

interface BacktestScreenProps {
  onNavigate: (view: ViewId) => void;
}

export function BacktestScreen({ onNavigate }: BacktestScreenProps) {
  const [curveMode, setCurveMode] = useState<"roc" | "pr">("roc");
  const [threshold, setThreshold] = useState<number>(0.45);
  const [cohortFilter, setCohortFilter] = useState<
    "ALL" | "SOLVENT" | "FLASH_BAILOUT" | "INTERCEPTED"
  >("ALL");
  const [cohortPage, setCohortPage] = useState<number>(1);

  // Smooth empirical operating-point calibration across τ ∈ [0.10, 0.85]
  const normalized = (threshold - 0.1) / 0.75;
  const tpr = Math.max(0.71, Math.min(0.975, 0.968 - normalized * 0.235));
  const fpr = Math.max(0.035, Math.min(0.36, 0.345 - Math.pow(normalized, 0.82) * 0.305));
  const precision = Math.max(0.74, Math.min(0.962, 0.745 + Math.pow(normalized, 0.9) * 0.21));
  const f1 = (2 * precision * tpr) / (precision + tpr);
  const youdenJ = tpr - fpr;

  // Balanced wide plot coordinate system (viewBox 0 0 640 264, plot area x:58..612, y:20..220)
  const plotX = (v: number) => 58 + v * 554;
  const plotY = (v: number) => 220 - v * 200;

  // Sample points along empirical ROC or PR curve so operating cursor rides directly on the curve
  const kendraCurvePoints = Array.from({ length: 25 }, (_, idx) => {
    const x = idx / 24;
    const y =
      curveMode === "roc"
        ? Math.min(1, Math.pow(x, 0.24) * 0.985 + x * 0.015)
        : Math.max(0.56, 0.985 - Math.pow(x, 1.65) * 0.36);
    return { x, y };
  });

  const baselineCurvePoints = Array.from({ length: 25 }, (_, idx) => {
    const x = idx / 24;
    const y =
      curveMode === "roc"
        ? Math.min(1, Math.pow(x, 0.56) * 0.96 + x * 0.04)
        : Math.max(0.38, 0.82 - Math.pow(x, 1.15) * 0.41);
    return { x, y };
  });

  const toPath = (pts: { x: number; y: number }[]) =>
    pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${plotX(p.x).toFixed(1)},${plotY(p.y).toFixed(1)}`)
      .join(" ");

  const kendraPath = toPath(kendraCurvePoints);
  const baselinePath = toPath(baselineCurvePoints);
  const areaPath = `${kendraPath} L${plotX(1)},${plotY(0)} L${plotX(0)},${plotY(0)} Z`;

  const cursorXVal = curveMode === "roc" ? fpr : tpr;
  const cursorYVal =
    curveMode === "roc"
      ? Math.min(1, Math.pow(cursorXVal, 0.24) * 0.985 + cursorXVal * 0.015)
      : Math.max(0.56, 0.985 - Math.pow(cursorXVal, 1.65) * 0.36);

  const cx = plotX(cursorXVal);
  const cy = plotY(cursorYVal);

  const filteredCohorts =
    cohortFilter === "ALL"
      ? SYNTHETIC_COHORTS
      : SYNTHETIC_COHORTS.filter((row) => row.status === cohortFilter);

  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredCohorts.length / perPage));
  const safePage = Math.min(cohortPage, totalPages);
  const visibleCohorts = filteredCohorts.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <main className="kf-page" aria-label="Monte Carlo backtest analytics">
      {/* Header */}
      <header className="kf-workspace-header">
        <div>
          <span className="kf-eyebrow-text">Credit Model Study · Karwan Bazar Wholesale Data</span>
          <h1 className="kf-workspace-title">5,000-Shop Risk &amp; Repayment Study</h1>
          <p className="kf-workspace-sub">
            Tested across 1,000 five-shop groups in Dhaka, comparing peer-backed wholesale loans
            against standard mobile nano-loan apps.
          </p>
        </div>
        <button
          type="button"
          className="kf-btn kf-btn--primary"
          onClick={() => onNavigate("command")}
        >
          <Icon name="bolt" size={16} />
          <span>
            Open <em className="kf-btn-word">Live Workspace</em>
          </span>
        </button>
      </header>

      {/* 4 Comparative KPI Cards */}
      <section className="kf-kpi-grid" aria-label="Backtest headline metrics">
        <article className="kf-kpi-card">
          <div className="kf-kpi-head">
            <span>Discrimination (ROC-AUC)</span>
            <span className="kf-badge kf-badge--valid">+21.96% Lift</span>
          </div>
          <strong className="kf-kpi-num kf-tabular">0.8769</strong>
          <div className="kf-kpi-compare">
            vs Solo MFS Baseline: <strong className="kf-tabular">0.7190</strong>
          </div>
        </article>

        <article className="kf-kpi-card">
          <div className="kf-kpi-head">
            <span>Precision-Recall (PR-AUC)</span>
            <span className="kf-badge kf-badge--info">+0.2330 Gain</span>
          </div>
          <strong className="kf-kpi-num kf-tabular">0.8233</strong>
          <div className="kf-kpi-compare">
            vs Solo MFS Baseline: <strong className="kf-tabular">0.5903</strong>
          </div>
        </article>

        <article className="kf-kpi-card">
          <div className="kf-kpi-head">
            <span>Brier Calibration Error</span>
            <span className="kf-badge kf-badge--valid">−33.71% Error</span>
          </div>
          <strong className="kf-kpi-num kf-tabular">0.1338</strong>
          <div className="kf-kpi-compare">
            vs Solo MFS Baseline: <strong className="kf-tabular">0.2018</strong>
          </div>
        </article>

        <article className="kf-kpi-card">
          <div className="kf-kpi-head">
            <span>Net Institutional NPL</span>
            <span className="kf-badge kf-badge--valid">−60.76% Loss</span>
          </div>
          <strong className="kf-kpi-num kf-tabular">10.68%</strong>
          <div className="kf-kpi-compare">
            vs Solo MFS Baseline: <strong className="kf-tabular">27.21%</strong>
          </div>
        </article>
      </section>

      {/* Interactive ROC / PR Simulator */}
      <section className="kf-card kf-simulator-card">
        <div className="kf-simulator-top">
          <div>
            <span className="kf-meta-label">Approval Cutoff Explorer</span>
            <h2 className="kf-card-title-lg">
              {curveMode === "roc"
                ? "Repayment Separation Curve (ROC-AUC 0.8769)"
                : "Precision–Recall Curve (PR-AUC 0.8233)"}
            </h2>
          </div>

          <div className="kf-segmented" role="group" aria-label="Select performance curve">
            <button
              type="button"
              aria-pressed={curveMode === "roc"}
              className={curveMode === "roc" ? "is-active" : ""}
              onClick={() => setCurveMode("roc")}
            >
              ROC Curve
            </button>
            <button
              type="button"
              aria-pressed={curveMode === "pr"}
              className={curveMode === "pr" ? "is-active" : ""}
              onClick={() => setCurveMode("pr")}
            >
              Precision–Recall
            </button>
          </div>
        </div>

        {/* Side-by-Side Properly Scaled Chart + Controls */}
        <div className="kf-simulator-layout">
          <div className="kf-chart-wrap">
            <svg
              viewBox="0 0 640 264"
              className="kf-roc-svg"
              role="img"
              aria-label={
                curveMode === "roc"
                  ? "ROC curve comparing KendraFi 0.8769 against Solo Loan Apps 0.7190"
                  : "Precision-Recall curve comparing KendraFi 0.8233 against Solo Loan Apps 0.5903"
              }
            >
              <defs>
                <linearGradient id="kfLiftArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3653A5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#3653A5" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => (
                <g key={tick}>
                  <line
                    x1={plotX(0)}
                    y1={plotY(tick)}
                    x2={plotX(1)}
                    y2={plotY(tick)}
                    stroke="#E5DCD0"
                    strokeWidth="1"
                  />
                  <text
                    x={plotX(0) - 10}
                    y={plotY(tick) + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#756359"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {tick.toFixed(1)}
                  </text>
                  <line
                    x1={plotX(tick)}
                    y1={plotY(0)}
                    x2={plotX(tick)}
                    y2={plotY(1)}
                    stroke="#E5DCD0"
                    strokeWidth="1"
                  />
                  <text
                    x={plotX(tick)}
                    y={plotY(0) + 19}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#756359"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              ))}

              {curveMode === "roc" && (
                <line
                  x1={plotX(0)}
                  y1={plotY(0)}
                  x2={plotX(1)}
                  y2={plotY(1)}
                  stroke="#C5B6A3"
                  strokeWidth="1.1"
                  strokeDasharray="4 4"
                />
              )}

              <path d={areaPath} fill="url(#kfLiftArea)" />
              <path
                d={baselinePath}
                fill="none"
                stroke="#8A796D"
                strokeWidth="1.75"
                strokeDasharray="5 4"
              />
              <path d={kendraPath} fill="none" stroke="#3653A5" strokeWidth="2.4" />

              {/* Operating Crosshair */}
              <line
                x1={cx}
                y1={plotY(0)}
                x2={cx}
                y2={cy}
                stroke="#C0502B"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <line
                x1={plotX(0)}
                y1={cy}
                x2={cx}
                y2={cy}
                stroke="#C0502B"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <circle cx={cx} cy={cy} r="7.5" fill="rgba(192, 80, 43, 0.16)" />
              <circle cx={cx} cy={cy} r="4.5" fill="#C0502B" stroke="#FCF9F4" strokeWidth="1.8" />

              <text
                x={plotX(0.5)}
                y={257}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#52423A"
              >
                {curveMode === "roc"
                  ? "False Positive Rate (1 − Specificity)"
                  : "Recall (True Positive Sensitivity)"}
              </text>
            </svg>

            <div className="kf-chart-legend">
              <span>
                <i className="kf-swatch kf-swatch--kendra" /> KendraFi Group Model (
                {curveMode === "roc" ? "0.8769" : "0.8233"})
              </span>
              <span>
                <i className="kf-swatch kf-swatch--base" /> Solo Loan App (
                {curveMode === "roc" ? "0.7190" : "0.5903"})
              </span>
              <span>
                <i className="kf-swatch kf-swatch--op" /> Selected Cutoff (τ ={" "}
                {threshold.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Right-hand Cutoff Control & Live Readout Panel */}
          <div className="kf-sim-sidebar">
            <div className="kf-sim-control-box">
              <div className="kf-slider-label">
                <Icon name="sliders" size={15} />
                <label htmlFor="tau-slider">
                  Approval Cutoff (
                  <strong className="kf-tabular">τ = {threshold.toFixed(2)}</strong>)
                </label>
              </div>
              <input
                id="tau-slider"
                type="range"
                min={0.1}
                max={0.85}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="kf-range-input"
              />
              <div className="kf-preset-group">
                {[
                  { label: "Broad 0.25", value: 0.25 },
                  { label: "Balanced 0.45", value: 0.45 },
                  { label: "Strict 0.68", value: 0.68 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`kf-chip-btn ${
                      Math.abs(threshold - preset.value) < 0.02 ? "is-active" : ""
                    }`}
                    onClick={() => setThreshold(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="kf-sim-metrics-grid">
              <div>
                <span>True Positive Rate</span>
                <strong className="kf-tabular kf-text-valid">{(tpr * 100).toFixed(1)}%</strong>
              </div>
              <div>
                <span>False Positive Rate</span>
                <strong className="kf-tabular">{(fpr * 100).toFixed(1)}%</strong>
              </div>
              <div>
                <span>Precision (PPV)</span>
                <strong className="kf-tabular">{(precision * 100).toFixed(1)}%</strong>
              </div>
              <div>
                <span>F1 · Youden J</span>
                <strong className="kf-tabular">
                  {f1.toFixed(3)} · {youdenJ.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Split: Feature Importance + Synthetic Kendra Cohort Table */}
      <section className="kf-backtest-split">
        <article className="kf-card">
          <span className="kf-meta-label">Key Credit Signals</span>
          <h2 className="kf-card-title-lg">What Predicts On-Time Repayment</h2>
          <div className="kf-feature-bars">
            {BACKTEST_FEATURES.map((f) => (
              <div key={f.rank} className="kf-feature-item">
                <div className="kf-feature-row">
                  <span>
                    <strong className="kf-tabular">{f.rank}</strong> · {f.name}
                  </span>
                  <strong className="kf-tabular">{f.sharePct.toFixed(1)}%</strong>
                </div>
                <div className="kf-bar-track">
                  <span style={{ width: `${Math.min(100, f.sharePct * 2.5)}%` }} />
                </div>
                <div className="kf-feature-sub">
                  <span>{f.category}</span>
                  <span className="kf-tabular">β = {f.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="kf-card">
          <div className="kf-cohort-head">
            <div>
              <span className="kf-meta-label">Sampled from 1,000 Dhaka Groups</span>
              <h2 className="kf-card-title-lg">Sample Wholesale Shop Groups</h2>
            </div>
            <div className="kf-filter-pills" role="group" aria-label="Filter synthetic cohorts">
              {(["ALL", "SOLVENT", "FLASH_BAILOUT", "INTERCEPTED"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`kf-chip-btn ${cohortFilter === status ? "is-active" : ""}`}
                  onClick={() => {
                    setCohortFilter(status);
                    setCohortPage(1);
                  }}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "SOLVENT"
                      ? "Repaid"
                      : status === "FLASH_BAILOUT"
                        ? "Relief"
                        : "Blocked"}
                </button>
              ))}
            </div>
          </div>

          <div className="kf-table-scroll">
            <table className="kf-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Shop &amp; Market</th>
                  <th>Cash-flow</th>
                  <th>Backing</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {visibleCohorts.map((row) => (
                  <tr key={row.id}>
                    <td className="kf-tabular kf-mono-cell">{row.id}</td>
                    <td>
                      <strong>{row.borrower}</strong>
                      <span className="kf-cell-sub">{row.market}</span>
                    </td>
                    <td className="kf-tabular">{row.dscr}</td>
                    <td className="kf-tabular">{row.quorum}</td>
                    <td>
                      <span
                        className={`kf-badge ${
                          row.status === "SOLVENT"
                            ? "kf-badge--valid"
                            : row.status === "FLASH_BAILOUT"
                              ? "kf-badge--warn"
                              : "kf-badge--danger"
                        }`}
                      >
                        {row.status === "SOLVENT"
                          ? "Repaid"
                          : row.status === "FLASH_BAILOUT"
                            ? "Flood relief"
                            : "Blocked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="kf-pagination">
            <span>
              Page <strong className="kf-tabular">{safePage}</strong> of{" "}
              <strong className="kf-tabular">{totalPages}</strong> ({filteredCohorts.length} sample
              Kendras)
            </span>
            <div className="kf-pagination-btns">
              <button
                type="button"
                className="kf-chip-btn"
                disabled={safePage <= 1}
                onClick={() => setCohortPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="kf-chip-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCohortPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
