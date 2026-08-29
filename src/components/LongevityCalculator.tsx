"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LONGEVITY_INPUTS, LongevityInputs, projectLongevity } from "@/lib/coastfire";
import { drawLongevityChart } from "@/lib/chart";

const FIELD_DEFS: {
  key: keyof LongevityInputs;
  label: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  { key: "currentAge", label: "Current age", min: 16, max: 100 },
  { key: "currentSavings", label: "Current invested savings", prefix: "$", min: 0, step: 1000 },
  { key: "annualWithdrawal", label: "Annual withdrawal / spending", prefix: "$", min: 0, step: 1000 },
  { key: "annualReturn", label: "Expected annual return", suffix: "%", min: 0, max: 15, step: 0.1 },
];

export default function LongevityCalculator({
  initialInputs = DEFAULT_LONGEVITY_INPUTS,
}: {
  initialInputs?: LongevityInputs;
}) {
  const [vals, setVals] = useState<LongevityInputs>(initialInputs);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = useMemo(() => projectLongevity(vals), [vals]);

  useEffect(() => {
    if (canvasRef.current) drawLongevityChart(canvasRef.current, result, vals.currentAge);
    const onResize = () => {
      if (canvasRef.current) drawLongevityChart(canvasRef.current, result, vals.currentAge);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [result, vals.currentAge]);

  function updateField(key: keyof LongevityInputs, raw: string) {
    const parsed = parseFloat(raw);
    setVals((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? 0 : parsed }));
  }

  let statusClass = "pending";
  let statusText = "Calculating";
  let statusCopy: React.ReactNode = null;

  if (result.lastsIndefinitely) {
    statusClass = "reached";
    statusText = "Lasts indefinitely";
    statusCopy = (
      <>
        At this withdrawal rate, your growth outpaces your spending — your balance doesn&apos;t run
        out within 60 years; it holds steady or keeps growing.
      </>
    );
  } else if (result.ageMoneyRunsOut !== null) {
    statusClass = "pending";
    statusText = "Runs out";
    statusCopy = (
      <>
        At this withdrawal rate, your savings run out around age{" "}
        <strong>{result.ageMoneyRunsOut.toFixed(1)}</strong> — about{" "}
        <strong>{result.yearsLasting!.toFixed(1)} years</strong> from now.
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
              <label htmlFor={`lv-${field.key}`}>{field.label}</label>
              {field.prefix || field.suffix ? (
                <div className="input-row">
                  {field.prefix && <span className="prefix">{field.prefix}</span>}
                  <input
                    type="number"
                    id={`lv-${field.key}`}
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
                  id={`lv-${field.key}`}
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
          <div className="big-number">
            {result.lastsIndefinitely ? "60+ yrs" : result.ageMoneyRunsOut!.toFixed(1)}
          </div>
          <div className="big-number-label">
            {result.lastsIndefinitely ? "your money lasts at least this long" : "the age your money runs out"}
          </div>
          <div className="status-copy">{statusCopy}</div>

          <canvas ref={canvasRef} width={600} height={260}></canvas>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--gold)" }}></span>
              Projected balance
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
