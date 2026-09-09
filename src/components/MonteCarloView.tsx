"use client";

import { useEffect, useRef, useState } from "react";
import { project } from "@/lib/coastfire";
import { runMonteCarlo, SequenceRiskResult } from "@/lib/montecarlo";
import { drawMonteCarloBand } from "@/lib/chartExtra";
import { ScenarioRow } from "@/lib/types";

export default function MonteCarloView({ scenarios }: { scenarios: ScenarioRow[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id);
  const [stdDev, setStdDev] = useState(15);
  const [probability, setProbability] = useState<number | null>(null);
  const [sequenceRisk, setSequenceRisk] = useState<SequenceRiskResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scenario = scenarios.find((s) => s.id === scenarioId);

  useEffect(() => {
    if (!scenario || !canvasRef.current) return;
    const result = project(scenario.inputs);
    const mc = runMonteCarlo(scenario.inputs, result.coastAgeMonths, result.retirementNumber, 500, stdDev);
    setProbability(mc.probabilityOfSuccess);
    setSequenceRisk(mc.sequenceRisk);
    drawMonteCarloBand(canvasRef.current, mc.contributing, result.retirementNumber);
  }, [scenario, stdDev]);

  if (!scenario) return null;

  return (
    <div className="saved-section">
      <div className="section-title">Monte Carlo simulation</div>
      <p className="section-sub">
        500 simulated paths with randomized annual returns instead of one fixed line — showing the
        10th/50th/90th percentile range of outcomes for staying the full contribution course.
      </p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        <div className="field" style={{ maxWidth: 280, marginBottom: 0 }}>
          <label htmlFor="mcScenario">Scenario</label>
          <select
            id="mcScenario"
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
        <div className="field" style={{ maxWidth: 200, marginBottom: 0 }}>
          <label htmlFor="stdDev">Return volatility (stddev)</label>
          <div className="input-row">
            <input
              className="has-suffix"
              type="number"
              id="stdDev"
              value={stdDev}
              min={1}
              max={30}
              step={1}
              onChange={(e) => setStdDev(parseFloat(e.target.value) || 15)}
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width={600} height={280}></canvas>
      <div className="legend">
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--gold)" }}></span>
          Median (50th)
        </div>
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--gold)", opacity: 0.5, borderTop: "2px dashed var(--gold)", height: 0 }}
          ></span>
          10th / 90th percentile
        </div>
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--text-muted)", borderTop: "2px dashed var(--text-muted)", height: 0 }}
          ></span>
          Retirement target
        </div>
      </div>

      {probability !== null && (
        <p className="status-copy" style={{ marginTop: 16 }}>
          Across 500 simulated return paths, staying the full contribution course reached your
          retirement target in <strong>{probability.toFixed(0)}%</strong> of runs.
        </p>
      )}

      {sequenceRisk && (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <div className="section-title" style={{ fontSize: 16 }}>
            Sequence-of-returns risk
          </div>
          <p className="section-sub">
            A market downturn hits differently depending on when it happens. Once you stop
            contributing at your coast point, there&apos;s no more buffer to average through a bad
            stretch — so a weak run of returns in the first 5 years after coasting matters more than
            the same weak years would earlier on.
          </p>
          <p className="status-copy" style={{ marginBottom: 0 }}>
            Across your simulated coast plans: when the first 5 post-coast years land in the{" "}
            <strong>weakest third</strong> of simulated outcomes, you still reach your retirement
            number in <strong>{sequenceRisk.badSequenceSuccessRate.toFixed(0)}%</strong> of those
            runs — versus <strong>{sequenceRisk.goodSequenceSuccessRate.toFixed(0)}%</strong> when
            those years land in the <strong>strongest third</strong>, and{" "}
            <strong>{sequenceRisk.overallSuccessRate.toFixed(0)}%</strong> across all coast-plan runs
            overall.
          </p>
        </div>
      )}
    </div>
  );
}
