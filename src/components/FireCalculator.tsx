"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FI_INPUTS, FiInputs, fmtUSD, projectFI } from "@/lib/coastfire";
import { drawFireChart } from "@/lib/chart";

const FIELD_DEFS: {
  key: keyof FiInputs;
  label: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  { key: "currentAge", label: "Current age", min: 16, max: 80 },
  { key: "currentSavings", label: "Current invested savings", prefix: "$", min: 0, step: 1000 },
  { key: "monthlyContribution", label: "Monthly contribution", prefix: "$", min: 0, step: 50 },
  { key: "annualReturn", label: "Expected annual return", suffix: "%", min: 0, max: 15, step: 0.1 },
  { key: "desiredSpending", label: "Desired annual spending in retirement", prefix: "$", min: 0, step: 1000 },
  { key: "swr", label: "Safe withdrawal rate", suffix: "%", min: 1, max: 10, step: 0.1 },
];

export default function FireCalculator({
  initialInputs = DEFAULT_FI_INPUTS,
}: {
  initialInputs?: FiInputs;
}) {
  const [vals, setVals] = useState<FiInputs>(initialInputs);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = useMemo(() => projectFI(vals), [vals]);

  useEffect(() => {
    if (canvasRef.current) drawFireChart(canvasRef.current, result, vals.currentAge);
    const onResize = () => {
      if (canvasRef.current) drawFireChart(canvasRef.current, result, vals.currentAge);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [result, vals.currentAge]);

  function updateField(key: keyof FiInputs, raw: string) {
    const parsed = parseFloat(raw);
    setVals((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? 0 : parsed }));
  }

  let statusClass = "pending";
  let statusText = "Calculating";
  let statusCopy: React.ReactNode = null;

  if (result.alreadyFI) {
    statusClass = "reached";
    statusText = "Financial independence reached";
    statusCopy = (
      <>
        Your current savings already cover your <strong>{fmtUSD(result.retirementNumber)}</strong>{" "}
        FI number. Growth (and any further contributions) only add margin from here.
      </>
    );
  } else if (result.fiAgeYears !== null) {
    statusClass = "pending";
    statusText = "On track";
    statusCopy = (
      <>
        At this savings rate, you&apos;ll reach financial independence around age{" "}
        <strong>{result.fiAgeYears.toFixed(1)}</strong> — about{" "}
        <strong>{result.yearsToFI!.toFixed(1)} years</strong> from now, with{" "}
        <strong>{fmtUSD(result.retirementNumber)}</strong> invested.
      </>
    );
  } else {
    statusClass = "pending";
    statusText = "Beyond 60-year horizon";
    statusCopy = (
      <>
        At this rate, you wouldn&apos;t reach your FI number within 60 years. Increasing
        contributions, expected return, or lowering desired spending will bring it into range.
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
              <label htmlFor={`fi-${field.key}`}>{field.label}</label>
              {field.prefix || field.suffix ? (
                <div className="input-row">
                  {field.prefix && <span className="prefix">{field.prefix}</span>}
                  <input
                    type="number"
                    id={`fi-${field.key}`}
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
                  id={`fi-${field.key}`}
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
            {result.fiAgeYears !== null ? result.fiAgeYears.toFixed(1) : "60+"}
          </div>
          <div className="big-number-label">the age you reach financial independence</div>
          <div className="status-copy">{statusCopy}</div>

          <canvas ref={canvasRef} width={600} height={260}></canvas>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--gold)" }}></span>
              Projected balance
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "var(--text-muted)", borderTop: "2px dashed var(--text-muted)", height: 0 }}
              ></span>
              FI number
            </div>
          </div>
        </div>
      </div>

      <p className="foot-note">
        Estimates only, based on a constant annual return and constant contributions — real markets
        don&apos;t move in a straight line. Not financial advice.
      </p>
    </div>
  );
}
