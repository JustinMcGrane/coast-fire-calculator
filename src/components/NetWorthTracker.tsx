"use client";

import { useEffect, useRef, useState } from "react";
import { project, fmtUSD } from "@/lib/coastfire";
import { drawActualVsProjected } from "@/lib/chartExtra";
import { ScenarioRow, NetWorthCheckinRow } from "@/lib/types";

function ageAtDate(scenario: ScenarioRow, dateStr: string): number {
  const start = new Date(scenario.created_at).getTime();
  const at = new Date(dateStr).getTime();
  const yearsElapsed = (at - start) / (1000 * 60 * 60 * 24 * 365.25);
  return scenario.inputs.currentAge + yearsElapsed;
}

export default function NetWorthTracker({ scenarios }: { scenarios: ScenarioRow[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id);
  const [checkins, setCheckins] = useState<NetWorthCheckinRow[]>([]);
  const [balance, setBalance] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scenario = scenarios.find((s) => s.id === scenarioId);

  useEffect(() => {
    if (!scenarioId) return;
    setLoading(true);
    fetch(`/api/checkins?scenarioId=${scenarioId}`)
      .then((r) => r.json())
      .then((data) => setCheckins(data.checkins || []))
      .finally(() => setLoading(false));
  }, [scenarioId]);

  useEffect(() => {
    if (!scenario || !canvasRef.current) return;
    const result = project(scenario.inputs);
    const actual = checkins.map((c) => ({
      age: ageAtDate(scenario, c.checkin_date),
      value: c.balance,
    }));
    drawActualVsProjected(
      canvasRef.current,
      result.yearlyWithContributions,
      actual,
      scenario.inputs.currentAge,
      scenario.inputs.retireAge
    );
  }, [scenario, checkins]);

  async function addCheckin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = parseFloat(balance);
    if (Number.isNaN(value) || !scenarioId) return;
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId, balance: value, checkinDate: date }),
    });
    if (res.ok) {
      const data = await res.json();
      setCheckins((prev) => [...prev, data.checkin]);
      setBalance("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't save check-in.");
    }
  }

  async function deleteCheckin(id: string) {
    setCheckins((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/checkins/${id}`, { method: "DELETE" });
  }

  if (!scenario) return null;

  return (
    <div className="saved-section">
      <div className="section-title">Net worth check-ins</div>
      <p className="section-sub">
        Log your actual invested balance periodically to see how it tracks against this plan.
      </p>

      <div className="field" style={{ maxWidth: 320 }}>
        <label htmlFor="scenarioSelect">Scenario</label>
        <select
          id="scenarioSelect"
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

      <canvas ref={canvasRef} width={600} height={260}></canvas>
      <div className="legend">
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--teal)", borderTop: "2px dashed var(--teal)", height: 0 }}
          ></span>
          Projected
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--gold)" }}></span>
          Actual
        </div>
      </div>

      <form className="save-row" onSubmit={addCheckin}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            background: "var(--bg-panel-2)",
            border: "1px solid var(--line)",
            borderRadius: 9,
            color: "var(--text)",
            fontFamily: "var(--font-plex-mono)",
            fontSize: 14,
            padding: "12px 14px",
          }}
        />
        <input
          type="text"
          placeholder="Current balance ($)"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <button className="primary" type="submit">
          Log check-in
        </button>
      </form>
      {error && (
        <p className="section-sub" style={{ color: "var(--gold)" }}>
          {error}
        </p>
      )}

      <div className="saved-list" style={{ marginTop: 20 }}>
        {loading ? (
          <div className="saved-empty">Loading…</div>
        ) : checkins.length === 0 ? (
          <div className="saved-empty">No check-ins logged yet for this scenario.</div>
        ) : (
          checkins.map((c) => (
            <div className="saved-item" key={c.id}>
              <div>
                <div className="saved-item-name">{fmtUSD(c.balance)}</div>
                <div className="saved-item-meta">{c.checkin_date}</div>
              </div>
              <div className="saved-item-actions">
                <button className="ghost" onClick={() => deleteCheckin(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
