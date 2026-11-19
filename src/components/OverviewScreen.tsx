"use client";

import { useState } from "react";
import { KENDRA_AGENTS, SCENARIOS, type ScenarioId, type ViewId } from "../data/kendraData";
import { Icon } from "./Icons";
import { StackedBarChart, type BarRow, type LegendItem } from "./StackedBarChart";

interface OverviewScreenProps {
  onNavigate: (view: ViewId) => void;
  onLaunchScenario: (scenario: ScenarioId) => void;
}

export function OverviewScreen({ onNavigate, onLaunchScenario }: OverviewScreenProps) {
  const [heroScenario, setHeroScenario] = useState<ScenarioId>("valid");
  const preview = SCENARIOS[heroScenario];

  const overviewLegend: LegendItem[] =
    heroScenario === "blocked"
      ? [
          { label: "Protected (Zero Risk)", color: "#C0502B", pattern: "hatch", hatchColor: "#C0502B" },
        ]
      : [
          { label: "Nasrin 40%", color: "#3653A5" },
          { label: "Fatema 35%", color: "#5271C2" },
          { label: "Kamal 25%", color: "#7B96D9" },
        ];

  const overviewRows: BarRow[] =
    heroScenario === "blocked"
      ? [
          {
            id: "blocked-row",
            label: "Syndicate",
            totalValueFormatted: "৳0 Risk",
            segments: [
              {
                id: "blocked-seg",
                label: "Protected (Intercepted)",
                sharePct: 100,
                formattedValue: "৳45,462.33 Protected",
                color: "#C0502B",
                pattern: "hatch",
                hatchColor: "#C0502B",
                description: "Security gate blocked unapproved payee before neighboring shops pledged capital.",
              },
            ],
          },
        ]
      : heroScenario === "bailout"
        ? [
            {
              id: "bailout-row",
              label: "Relief Pool",
              totalValueFormatted: "100%",
              segments: [
                {
                  id: "bailout-seg",
                  label: "Monsoon Cushion",
                  sharePct: 100,
                  formattedValue: "৳45,462.33 Co-Staked",
                  color: "#3653A5",
                  pattern: "solid",
                  description: "Automated monsoon relief protocol redistributing repayment obligations.",
                },
              ],
            },
          ]
        : [
            {
              id: "co-signers-row",
              label: "Backers",
              totalValueFormatted: "100%",
              segments: [
                {
                  id: "nasrin",
                  label: "Nasrin Pharmacy",
                  sharePct: 40.0,
                  formattedValue: "৳18,184.93 (40%)",
                  color: "#3653A5",
                  pattern: "solid",
                  description: "Anchor Guarantor: 40% statutory session cap. Expected utility: +৳169.85.",
                },
                {
                  id: "fatema",
                  label: "Fatema Textiles",
                  sharePct: 35.0,
                  formattedValue: "৳15,911.82 (35%)",
                  color: "#5271C2",
                  pattern: "solid",
                  description: "Lead Peer: 35% liability at 1.00% APR clearing yield. Expected utility: +৳64.12.",
                },
                {
                  id: "kamal",
                  label: "Kamal Agro",
                  sharePct: 25.0,
                  formattedValue: "৳11,365.58 (25%)",
                  color: "#7B96D9",
                  pattern: "solid",
                  description: "Peer Guarantor: 25% absorbed to achieve exact 100% Nash equilibrium. Expected utility: +৳51.40.",
                },
              ],
            },
          ];

  return (
    <main className="kf-page" aria-label="Protocol overview">
      {/* Editorial Sovereign Hero + Live Reconciled Facility Ticket */}
      <section className="kf-hero-stage">
        <div className="kf-hero-grid-bg" aria-hidden="true" />
        <div className="kf-hero">
          <div className="kf-hero-copy">
            <button
              type="button"
              className="kf-hero-pill"
              onClick={() => onLaunchScenario("valid")}
            >
              <span className="kf-hero-pill-tag">Dhaka Pilot</span>
              <span>30-day wholesale stock credit for local retailers</span>
              <Icon name="arrowRight" size={14} />
            </button>

            <h1 className="kf-hero-title">
              Stock financing at <span className="kf-hero-rate kf-tabular">12.50% APR,</span> backed
              by <span className="kf-hero-phrase">neighboring shops.</span>
            </h1>

            <p className="kf-hero-lead">
              KendraFi helps small shopkeepers in Bangladesh restock inventory on fair 30-day terms.
              Neighboring merchants share the guarantee and payment goes straight to the supplier,
              cutting borrowing costs in half compared with 27% informal loans.
            </p>

            <div className="kf-hero-actions">
              <button
                type="button"
                className="kf-btn kf-btn--brand"
                onClick={() => onLaunchScenario(heroScenario)}
              >
                <span>
                  Open <em className="kf-btn-word">Live Workspace</em>
                </span>
                <Icon name="arrowRight" size={16} />
              </button>
              <button
                type="button"
                className="kf-btn kf-btn--secondary"
                onClick={() => onNavigate("backtest")}
              >
                <Icon name="chart" size={16} />
                <span>
                  Read <strong className="kf-btn-word-subtle">5,000-Shop Study</strong>
                </span>
              </button>
            </div>

            <div className="kf-hero-inline-metrics" aria-label="Headline protocol metrics">
              <div>
                <strong className="kf-tabular">1.68×</strong>
                <span>Cash-flow coverage</span>
              </div>
              <div>
                <strong className="kf-tabular">+21.96%</strong>
                <span>Better risk accuracy</span>
              </div>
              <div>
                <strong className="kf-tabular">100%</strong>
                <span>Backed by local peers</span>
              </div>
            </div>
          </div>

          {/* Botanical Vault + Alabaster Interactive Facility Ticket */}
          <aside className="kf-ledger-ticket" aria-label="Interactive facility preview">
            <div className={`kf-ticket-vault is-${preview.tone}`}>
              <div className="kf-ticket-vault-top">
                <span className="kf-vault-id kf-tabular">
                  Loan #2026-001 · {preview.merchant.name}
                </span>
                <div
                  className="kf-vault-switch"
                  role="group"
                  aria-label="Preview scenario on hero card"
                >
                  {(
                    [
                      { id: "valid", label: "Approved" },
                      { id: "blocked", label: "Blocked" },
                      { id: "bailout", label: "Relief" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={heroScenario === tab.id}
                      className={heroScenario === tab.id ? "is-active" : ""}
                      onClick={() => setHeroScenario(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="kf-vault-main">
                <div>
                  <span className="kf-vault-caption">
                    {heroScenario === "blocked"
                      ? "Flagged invoice request"
                      : "30-day wholesale stock loan"}
                  </span>
                  <div className="kf-vault-amount kf-tabular">
                    <span className="kf-currency-mark">৳</span>
                    {preview.merchant.invoice.principalBdt.toLocaleString()}
                    <span className="kf-decimals">.00</span>
                  </div>
                </div>
                <span className={`kf-vault-status is-${preview.tone}`}>
                  <Icon
                    name={
                      heroScenario === "blocked"
                        ? "shieldAlert"
                        : heroScenario === "bailout"
                          ? "cloudRain"
                          : "check"
                    }
                    size={14}
                  />
                  <span>{preview.quorum.signedCount}</span>
                </span>
              </div>

              <div className="kf-vault-meta">
                <span>
                  {preview.merchant.name} <em className="kf-bn">({preview.merchant.nameBn})</em>
                </span>
                <span className="kf-tabular">
                  → {preview.merchant.invoice.supplier.split(" (")[0]}
                </span>
              </div>
            </div>

            <div className="kf-ticket-body">
              <div className="kf-coverage-block">
                <StackedBarChart
                  title="Co-signer backing"
                  subtitle={heroScenario === "blocked" ? "Stopped before backing" : "100% covered (৳45,462.33)"}
                  legend={overviewLegend}
                  rows={overviewRows}
                  labelWidth={62}
                  compact={true}
                />
              </div>

              <dl className="kf-ticket-math">
                <div>
                  <dt>Cash-flow ratio</dt>
                  <dd
                    className={`kf-tabular ${
                      heroScenario === "blocked" ? "kf-text-danger" : "kf-text-valid"
                    }`}
                  >
                    {preview.merchant.dscrLabel}
                  </dd>
                </div>
                <div>
                  <dt>Supplier discount (1.50%)</dt>
                  <dd className="kf-tabular">−৳{preview.settlement.mdrRebateBdt.toFixed(2)}</dd>
                </div>
                <div className="kf-ticket-math-total">
                  <dt>
                    {heroScenario === "blocked"
                      ? "Sent to unregistered seller"
                      : "Paid directly to supplier"}
                  </dt>
                  <dd
                    className={`kf-tabular ${
                      heroScenario === "blocked" ? "kf-text-danger" : "kf-text-valid"
                    }`}
                  >
                    ৳
                    {preview.settlement.netSupplierPayoutBdt.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                className="kf-ticket-cta"
                onClick={() => onLaunchScenario(heroScenario)}
              >
                <span>
                  Review{" "}
                  <em
                    className={`kf-btn-word ${
                      heroScenario === "blocked"
                        ? "is-rose"
                        : heroScenario === "bailout"
                          ? "is-aqua"
                          : ""
                    }`}
                  >
                    {preview.shortTitle}
                  </em>{" "}
                  in Workspace
                </span>
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* Reconciled 4-Metric Sovereign Benchmark Strip */}
      <section className="kf-proof-strip" aria-label="Protocol economic benchmarks">
        <div className="kf-proof-cell">
          <span className="kf-proof-label">Borrower rate</span>
          <strong className="kf-proof-value kf-tabular">12.50% APR</strong>
          <span className="kf-proof-note">Compared with 24–27% informal lenders</span>
        </div>
        <div className="kf-proof-cell">
          <span className="kf-proof-label">Risk model lift</span>
          <strong className="kf-proof-value kf-tabular">+21.96% AUC</strong>
          <span className="kf-proof-note">0.8769 vs 0.7190 solo loan apps</span>
        </div>
        <div className="kf-proof-cell">
          <span className="kf-proof-label">Daily installment</span>
          <strong className="kf-proof-value kf-tabular">৳1,515.41</strong>
          <span className="kf-proof-note">Collected automatically over 30 days</span>
        </div>
        <div className="kf-proof-cell">
          <span className="kf-proof-label">Default loss drop</span>
          <strong className="kf-proof-value kf-tabular">−60.76%</strong>
          <span className="kf-proof-note">Cushioned by 40 / 35 / 25% peer backing</span>
        </div>
      </section>

      {/* Interactive 3-Scenario Launchpad */}
      <section className="kf-section">
        <div className="kf-section-header">
          <div>
            <span className="kf-eyebrow-text">Sample Cases</span>
            <h2 className="kf-section-title">
              Walk through an approval, a blocked scam receipt, and flood relief.
            </h2>
          </div>
          <p className="kf-section-desc">
            Pick any case below to open the workspace and see each verification check run step by
            step.
          </p>
        </div>

        <div className="kf-scenario-cards">
          {(["valid", "blocked", "bailout"] as ScenarioId[]).map((key) => {
            const item = SCENARIOS[key];
            return (
              <article
                key={item.id}
                tabIndex={0}
                role="button"
                aria-label={`Open case: ${item.title}`}
                onClick={() => onLaunchScenario(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onLaunchScenario(key);
                  }
                }}
                className={`kf-scenario-card kf-scenario-card--${item.tone}`}
              >
                <div className="kf-scenario-card-top">
                  <div className={`kf-icon-box kf-icon-box--${item.tone}`}>
                    <Icon
                      name={
                        key === "valid" ? "store" : key === "blocked" ? "shieldAlert" : "cloudRain"
                      }
                      size={18}
                    />
                  </div>
                  <span className={`kf-badge kf-badge--${item.tone}`}>{item.fsmLabel}</span>
                </div>

                <div className="kf-scenario-num kf-tabular">Case {item.number}</div>
                <h3 className="kf-card-title">{item.title}</h3>
                <p className="kf-card-body">{item.summary}</p>

                <div className="kf-scenario-card-foot">
                  <span className="kf-outcome-line">{item.outcomeHeadline}</span>
                  <button
                    type="button"
                    className="kf-inline-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchScenario(key);
                    }}
                  >
                    <span>Open this case</span>
                    <Icon name="arrowRight" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Dhaka Kendra 5-Member Cooperative Roster */}
      <section className="kf-section">
        <div className="kf-section-header">
          <div>
            <span className="kf-eyebrow-text">Karwan Bazar Group #01</span>
            <h2 className="kf-section-title">
              Five neighboring businesses that know each other&apos;s trade.
            </h2>
          </div>
          <p className="kf-section-desc">
            Each shop sets a strict cap on how much it will guarantee and only backs a loan when the
            borrower&apos;s daily sales are steady.
          </p>
        </div>

        <div className="kf-roster-grid">
          {KENDRA_AGENTS.map((agent) => (
            <article key={agent.id} className="kf-roster-card">
              <div className="kf-roster-top">
                <div className={`kf-avatar kf-avatar--${agent.status}`}>{agent.initials}</div>
                <span className="kf-mono-id">{agent.id}</span>
              </div>
              <h3 className="kf-roster-name">
                {agent.name} <span className="kf-bn">{agent.nameBn}</span>
              </h3>
              <p className="kf-roster-market">{agent.market}</p>

              <dl className="kf-roster-stats">
                <div>
                  <dt>Daily sales</dt>
                  <dd className="kf-tabular">৳{agent.dailyInflowBdt.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Group role</dt>
                  <dd className="kf-tabular">
                    {agent.status === "borrower"
                      ? "Borrower"
                      : agent.status === "abstained"
                        ? "Sat out"
                        : `${agent.sharePct}% backer`}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
