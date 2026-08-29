"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CoastInputs, DEFAULT_INPUTS, fmtUSD, project } from "@/lib/coastfire";
import { drawChart } from "@/lib/chart";
import { ScenarioRow } from "@/lib/types";

const FIELD_DEFS: {
  key: keyof CoastInputs;
  label: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  { key: "currentAge", label: "Current age", min: 16, max: 80 },
  { key: "retireAge", label: "Target retirement age", min: 17, max: 90 },
  { key: "currentSavings", label: "Current invested savings", prefix: "$", min: 0, step: 1000 },
  { key: "monthlyContribution", label: "Monthly contribution", prefix: "$", min: 0, step: 50 },
  { key: "annualReturn", label: "Expected annual return", suffix: "%", min: 0, max: 15, step: 0.1 },
  { key: "desiredSpending", label: "Desired annual spending in retirement", prefix: "$", min: 0, step: 1000 },
  { key: "swr", label: "Safe withdrawal rate", suffix: "%", min: 1, max: 10, step: 0.1 },
];

export default function CoastCalculator({
  initialInputs = DEFAULT_INPUTS,
  isSignedIn = false,
}: {
  initialInputs?: CoastInputs;
  isSignedIn?: boolean;
}) {
  const [vals, setVals] = useState<CoastInputs>(initialInputs);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState<ScenarioRow[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(isSignedIn);

  const result = useMemo(() => project(vals), [vals]);

  useEffect(() => {
    if (canvasRef.current) drawChart(canvasRef.current, result, vals);
    const onResize = () => {
      if (canvasRef.current) drawChart(canvasRef.current, result, vals);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [result, vals]);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      setLoadingSaved(true);
      const res = await fetch("/api/scenarios");
      if (res.ok) {
        const data = await res.json();
        setSaved(data.scenarios);
      }
      setLoadingSaved(false);
    })();
  }, [isSignedIn]);

  function updateField(key: keyof CoastInputs, raw: string) {
    const parsed = parseFloat(raw);
    setVals((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? 0 : parsed }));
  }

  async function handleSave() {
    if (!scenarioName.trim()) return;
    setSaveState("saving");
    setSaveError("");
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: scenarioName.trim(),
        inputs: vals,
        coastNumberToday: result.coastNumberToday,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSaved((prev) => [data.scenario, ...prev]);
      setScenarioName("");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setSaveError(data.error || "Couldn't save scenario.");
      setSaveState("error");
    }
  }

  async function handleDelete(id: string) {
    setSaved((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
  }

  function handleLoad(scenario: ScenarioRow) {
    setVals(scenario.inputs);
    setScenarioName(scenario.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let statusClass = "pending";
  let statusText = "Calculating";
  let statusCopy: React.ReactNode = null;

  if (result.alreadyCoasting) {
    statusClass = "reached";
    statusText = "Coast FIRE reached";
    const projectedAtRetirement = result.yearlyCoastOnly.length
      ? result.yearlyCoastOnly[result.yearlyCoastOnly.length - 1].value
      : vals.currentSavings;
    statusCopy = (
      <>
        You already have more than your coast number. If you stopped contributing today, you&apos;d
        have roughly <strong>{fmtUSD(projectedAtRetirement)}</strong> by age {vals.retireAge} — above
        your <strong>{fmtUSD(result.retirementNumber)}</strong> target.
      </>
    );
  } else if (result.coastAgeYears !== null) {
    statusClass = "pending";
    statusText = "On track to coast";
    const yearsAway = (result.coastAgeYears - vals.currentAge).toFixed(1);
    statusCopy = (
      <>
        At this contribution rate, you&apos;ll reach your coast number around age{" "}
        <strong>{result.coastAgeYears.toFixed(1)}</strong> — about {yearsAway} years from now. After
        that, growth alone can carry you to <strong>{fmtUSD(result.retirementNumber)}</strong> by{" "}
        {vals.retireAge}.
      </>
    );
  } else {
    statusClass = "pending";
    statusText = "No early coast point yet";
    statusCopy = (
      <>
        At this rate, you&apos;d be contributing all the way to age {vals.retireAge} with no early
        coast point. Increasing contributions or return, or pushing retirement age out, will surface
        one.
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
              <label htmlFor={field.key}>{field.label}</label>
              {field.prefix || field.suffix ? (
                <div className="input-row">
                  {field.prefix && <span className="prefix">{field.prefix}</span>}
                  <input
                    type="number"
                    id={field.key}
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
                  id={field.key}
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
          <div className="big-number">{fmtUSD(result.coastNumberToday)}</div>
          <div className="big-number-label">what you need invested today to coast the rest of the way</div>
          <div className="status-copy">{statusCopy}</div>

          <canvas ref={canvasRef} width={600} height={260}></canvas>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--teal)" }}></span>
              Keep contributing
            </div>
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--gold)" }}></span>
              Coast plan
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "var(--text-muted)", borderTop: "2px dashed var(--text-muted)", height: 0 }}
              ></span>
              Retirement target
            </div>
          </div>

          <div className="save-row">
            <input
              type="text"
              placeholder='Name this scenario (e.g. "Base case")'
              maxLength={60}
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
            <button
              className="primary"
              onClick={handleSave}
              disabled={saveState === "saving" || !scenarioName.trim()}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save scenario"}
            </button>
          </div>
          {!isSignedIn && (
            <p className="section-sub" style={{ marginTop: 10, marginBottom: 0 }}>
              <a href="/login">Sign in</a> to save this scenario and come back to it later — free, no
              card required.
            </p>
          )}
          {isSignedIn && saveState === "error" && (
            <p className="section-sub" style={{ marginTop: 10, marginBottom: 0, color: "var(--gold)" }}>
              {saveError}{" "}
              {saveError.includes("Premium") || saveError.includes("plan") ? (
                <a href="/pricing">Upgrade to Premium</a>
              ) : null}
            </p>
          )}
        </div>
      </div>

      {isSignedIn && (
        <div className="saved-section">
          <div className="top-row">
            <div>
              <div className="section-title">Saved scenarios</div>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                Come back anytime — your numbers change, so it&apos;s worth rechecking.
              </p>
            </div>
          </div>
          <div className="saved-list">
            {loadingSaved ? (
              <div className="saved-empty">Loading…</div>
            ) : saved.length === 0 ? (
              <div className="saved-empty">No saved scenarios yet. Save one above to track it over time.</div>
            ) : (
              saved.map((item) => (
                <div className="saved-item" key={item.id}>
                  <div>
                    <div className="saved-item-name">{item.name}</div>
                    <div className="saved-item-meta">
                      Coast number {fmtUSD(item.coast_number_today)} · saved{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="saved-item-actions">
                    <button className="ghost" onClick={() => handleLoad(item)}>
                      Load
                    </button>
                    <button className="ghost" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <p className="foot-note">
        Estimates only, based on a constant annual return and constant contributions — real markets
        don&apos;t move in a straight line. Not financial advice.
      </p>
    </div>
  );
}
