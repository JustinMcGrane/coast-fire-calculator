"use client";

import { ScenarioRow } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "error";

// The input row + sign-in CTA, placed inside a calculator's results panel.
export function ScenarioSaveRow({
  isSignedIn,
  scenarioName,
  setScenarioName,
  saveState,
  saveError,
  onSave,
}: {
  isSignedIn: boolean;
  scenarioName: string;
  setScenarioName: (v: string) => void;
  saveState: SaveState;
  saveError: string;
  onSave: () => void;
}) {
  return (
    <>
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
          onClick={onSave}
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
    </>
  );
}

// The saved-scenarios list, placed as its own section below a calculator.
export function SavedScenariosList({
  isSignedIn,
  saved,
  loadingSaved,
  formatMeta,
  onLoad,
  onDelete,
}: {
  isSignedIn: boolean;
  saved: ScenarioRow[];
  loadingSaved: boolean;
  formatMeta: (scenario: ScenarioRow) => string;
  onLoad: (scenario: ScenarioRow) => void;
  onDelete: (id: string) => void;
}) {
  if (!isSignedIn) return null;

  return (
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
                  {formatMeta(item)} · saved {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="saved-item-actions">
                <button className="ghost" onClick={() => onLoad(item)}>
                  Load
                </button>
                <button className="ghost" onClick={() => onDelete(item.id)}>
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
