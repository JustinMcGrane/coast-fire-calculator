"use client";

import { useMemo, useState } from "react";
import { project, fmtUSD } from "@/lib/coastfire";
import { ScenarioRow } from "@/lib/types";

export default function ReportExport({ scenarios }: { scenarios: ScenarioRow[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id);
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const result = useMemo(() => (scenario ? project(scenario.inputs) : null), [scenario]);

  if (!scenario || !result) return null;

  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="saved-section">
      <div className="top-row">
        <div>
          <div className="section-title">Export report</div>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            A clean, printable summary of a scenario — hand it to a partner or advisor, or save it as
            a PDF from the print dialog.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        <div className="field" style={{ maxWidth: 320, marginBottom: 0 }}>
          <label htmlFor="reportScenario">Scenario</label>
          <select
            id="reportScenario"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-panel-2)",
              border: "1px solid var(--line)",
              borderRadius: 9,
              color: "var(--text)",
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              padding: "12px 14px",
            }}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="primary" onClick={() => window.print()}>
            Download PDF report
          </button>
        </div>
      </div>

      <div id="printable-report" className="report-preview">
        <div className="report-header">
          <div className="report-brand">Coast</div>
          <div className="report-generated">Generated {generatedOn}</div>
        </div>
        <h2 style={{ marginBottom: 4 }}>{scenario.name}</h2>
        <p className="section-sub" style={{ marginTop: 0 }}>
          Coast FIRE scenario report
        </p>

        <div className="report-grid">
          <div>
            <div className="report-label">Current age</div>
            <div className="report-value">{scenario.inputs.currentAge}</div>
          </div>
          <div>
            <div className="report-label">Target retirement age</div>
            <div className="report-value">{scenario.inputs.retireAge}</div>
          </div>
          <div>
            <div className="report-label">Current invested savings</div>
            <div className="report-value">{fmtUSD(scenario.inputs.currentSavings)}</div>
          </div>
          <div>
            <div className="report-label">Monthly contribution</div>
            <div className="report-value">{fmtUSD(scenario.inputs.monthlyContribution)}</div>
          </div>
          <div>
            <div className="report-label">Expected annual return</div>
            <div className="report-value">{scenario.inputs.annualReturn}%</div>
          </div>
          <div>
            <div className="report-label">Desired annual spending</div>
            <div className="report-value">{fmtUSD(scenario.inputs.desiredSpending)}</div>
          </div>
          <div>
            <div className="report-label">Safe withdrawal rate</div>
            <div className="report-value">{scenario.inputs.swr}%</div>
          </div>
        </div>

        <div className="report-divider" />

        <div className="report-grid">
          <div>
            <div className="report-label">Coast FIRE number (today)</div>
            <div className="report-value report-big">{fmtUSD(result.coastNumberToday)}</div>
          </div>
          <div>
            <div className="report-label">Retirement number</div>
            <div className="report-value report-big">{fmtUSD(result.retirementNumber)}</div>
          </div>
          <div>
            <div className="report-label">Status</div>
            <div className="report-value">
              {result.alreadyCoasting
                ? "Coast FIRE already reached"
                : result.coastAgeYears !== null
                  ? `On track to coast at age ${result.coastAgeYears.toFixed(1)}`
                  : "No early coast point at this rate"}
            </div>
          </div>
        </div>

        <p className="report-footnote">
          Estimates only, based on a constant annual return and constant contributions — real
          markets don&apos;t move in a straight line. Not financial advice.
        </p>
      </div>
    </div>
  );
}
