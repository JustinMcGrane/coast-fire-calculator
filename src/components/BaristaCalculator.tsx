"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_BARISTA_INPUTS, BaristaInputs, fmtUSD, projectBarista } from "@/lib/coastfire";
import { drawBaristaChart } from "@/lib/chart";

const FIELD_DEFS: {
  key: keyof BaristaInputs;
  label: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  { key: "currentAge", label: "Current age", min: 16, max: 80 },
  { key: "retireAge", label: "Target full-retirement age", min: 17, max: 90 },
  { key: "currentSavings", label: "Current invested savings", prefix: "$", min: 0, step: 1000 },
  {
    key: "annualWithdrawal",
    label: "Annual withdrawal to cover the gap (spending minus barista income)",
    prefix: "$",
    min: 0,
    step: 500,
  },
  { key: "annualReturn", label: "Expected annual return", suffix: "%", min: 0, max: 15, step: 0.1 },
  { key: "desiredSpending", label: "Desired annual spending in full retirement", prefix: "$", min: 0, step: 1000 },
  { key: "swr", label: "Safe withdrawal rate", suffix: "%", min: 1, max: 10, step: 0.1 },
];

export default function BaristaCalculator({
  initialInputs = DEFAULT_BARISTA_INPUTS,
}: {
  initialInputs?: BaristaInputs;
}) {
  const [vals, setVals] = useState<BaristaInputs>(initialInputs);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = useMemo(() => projectBarista(vals), [vals]);

  useEffect(() => {
    if (canvasRef.current) drawBaristaChart(canvasRef.current, result, vals.currentAge);
    const onResize = () => {
      if (canvasRef.current) drawBaristaChart(canvasRef.current, result, vals.currentAge);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [result, vals.currentAge]);

  function updateField(key: keyof BaristaInputs, raw: string) {
    const parsed = parseFloat(raw);
    setVals((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? 0 : parsed }));
  }

  let statusClass = "pending";
  let statusText = "On track";
  let statusCopy: React.ReactNode = null;

  if (result.depletesBeforeRetirement) {
    statusClass = "pending";
    statusText = "Runs out early";
    statusCopy = (
      <>
        At this withdrawal rate, your savings run out around age{" "}
        <strong>{result.depletionAge!.toFixed(1)}</strong> — before your target retirement age. You&apos;d
        need a smaller gap withdrawal, more part-time income, or a later full-retirement age.
      </>
    );
  } else if (result.meetsTarget) {
    statusClass = "reached";
    statusText = "Barista FIRE works";
    statusCopy = (
      <>
        Withdrawing the gap each year, your savings still reach{" "}
        <strong>{fmtUSD(result.projectedBalanceAtRetirement)}</strong> by age {vals.retireAge} —
        above your <strong>{fmtUSD(result.retirementNumber)}</strong> full-retirement target.
      </>
    );
  } else {
    statusClass = "pending";
    statusText = "Falls short";
    statusCopy = (
      <>
        Your savings survive to age {vals.retireAge}, reaching{" "}
        <strong>{fmtUSD(result.projectedBalanceAtRetirement)}</strong> — but that&apos;s below your{" "}
        <strong>{fmtUSD(result.retirementNumber)}</strong> full-retirement target. A smaller gap
        withdrawal or more part-time income would close it.
      </>
    );
  }

  return (
    <div className="wrap">
      <div className="grid">
        <div className="panel">
          <div className="section-title">Your numbers</div>
          <p className="section-sub">Adjust anything — results update as you go.</p>

          {FIELD_DEFS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`ba-${field.key}`}>{field.label}</label>
              {field.prefix || field.suffix ? (
                <div className="input-row">
                  {field.prefix && <span className="prefix">{field.prefix}</span>}
                  <input
                    type="number"
                    id={`ba-${field.key}`}
                    className={field.prefix ? "has-prefix" : "has-suffix"}
                    value={vals[field.key]}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                  {field.suffix && <span className="suffix">{field.suffix}</span>}
                </div>
              ) : (
                <input
                  type="number"
                  id={`ba-${field.key}`}
                  value={vals[field.key]}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(e) => updateField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="results-panel">
          <div className={`status-badge ${statusClass}`}>
            <span className="status-dot"></span>
            <span>{statusText}</span>
          </div>
          <div className="big-number">{fmtUSD(result.projectedBalanceAtRetirement)}</div>
          <div className="big-number-label">projected balance at your full-retirement age</div>
          <div className="status-copy">{statusCopy}</div>

          <canvas ref={canvasRef} width={600} height={260}></canvas>
          <div className="legend">
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: result.meetsTarget ? "var(--gold)" : "#c96a4a" }}
              ></span>
              Projected balance
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "var(--text-muted)", borderTop: "2px dashed var(--text-muted)", height: 0 }}
              ></span>
              Full-retirement target
            </div>
          </div>
        </div>
      </div>

      <p className="foot-note">
        Estimates only, based on a constant annual return and constant withdrawals — real markets
        don&apos;t move in a straight line. Not financial advice.
      </p>
    </div>
  );
}
