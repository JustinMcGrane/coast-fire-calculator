"use client";

import { useState } from "react";
import { project, fmtUSD } from "@/lib/coastfire";
import { ScenarioRow } from "@/lib/types";

export default function ScenarioComparison({ scenarios }: { scenarios: ScenarioRow[] }) {
  const [selected, setSelected] = useState<string[]>(scenarios.slice(0, 3).map((s) => s.id));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const compared = scenarios.filter((s) => selected.includes(s.id));

  return (
    <div className="saved-section" style={{ marginTop: 0 }}>
      <div className="section-title">Compare scenarios</div>
      <p className="section-sub">Select scenarios to compare side by side.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {scenarios.map((s) => (
          <label
            key={s.id}
            className="legend-item"
            style={{
              border: "1px solid var(--line)",
              borderRadius: 100,
              padding: "6px 14px",
              cursor: "pointer",
              background: selected.includes(s.id) ? "rgba(232,163,61,0.12)" : "transparent",
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={() => toggle(s.id)}
              style={{ marginRight: 6 }}
            />
            {s.name}
          </label>
        ))}
      </div>

      {compared.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle}>Scenario</th>
                <th style={thStyle}>Coast number today</th>
                <th style={thStyle}>Retirement number</th>
                <th style={thStyle}>Coast age</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {compared.map((s) => {
                const result = project(s.inputs);
                return (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{fmtUSD(result.coastNumberToday)}</td>
                    <td style={tdStyle}>{fmtUSD(result.retirementNumber)}</td>
                    <td style={tdStyle}>
                      {result.coastAgeYears !== null ? result.coastAgeYears.toFixed(1) : "—"}
                    </td>
                    <td style={tdStyle}>
                      {result.alreadyCoasting
                        ? "Reached"
                        : result.coastAgeYears !== null
                          ? "On track"
                          : "No early coast point"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  color: "var(--text-muted)",
  fontFamily: "var(--font-plex-mono)",
  fontSize: 12,
  borderBottom: "1px solid var(--line)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid var(--line)",
};
