"use client";

import { useEffect, useState } from "react";
import { CalculatorType, ScenarioRow } from "./types";

export function useScenarioSave({
  calculatorType,
  isSignedIn,
  inputs,
  headlineValue,
}: {
  calculatorType: CalculatorType;
  isSignedIn: boolean;
  inputs: unknown;
  headlineValue: number | null;
}) {
  const [scenarioName, setScenarioName] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState<ScenarioRow[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(isSignedIn);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      setLoadingSaved(true);
      const res = await fetch(`/api/scenarios?type=${calculatorType}`);
      if (res.ok) {
        const data = await res.json();
        setSaved(data.scenarios);
      }
      setLoadingSaved(false);
    })();
  }, [isSignedIn, calculatorType]);

  async function handleSave() {
    if (!scenarioName.trim()) return;
    setSaveState("saving");
    setSaveError("");
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: scenarioName.trim(),
        calculatorType,
        inputs,
        headlineValue,
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

  return {
    scenarioName,
    setScenarioName,
    saveState,
    saved,
    saveError,
    loadingSaved,
    handleSave,
    handleDelete,
  };
}
