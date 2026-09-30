import { CalculatorType, ScenarioRow } from "./types";
import { fmtUSD } from "./coastfire";

export const CALCULATOR_LABELS: Record<CalculatorType, string> = {
  coast: "Coast FIRE",
  fire: "FIRE",
  longevity: "Savings longevity",
  barista: "Barista FIRE",
};

export function formatHeadline(scenario: ScenarioRow): string {
  const v = scenario.headline_value;
  switch (scenario.calculator_type) {
    case "coast":
      return v !== null ? `Coast number ${fmtUSD(v)}` : "Coast number —";
    case "fire":
      return v !== null ? `FI age ${v.toFixed(1)}` : "Beyond 60-year horizon";
    case "longevity":
      return v !== null ? `Runs out at age ${v.toFixed(1)}` : "Lasts indefinitely";
    case "barista":
      return v !== null ? `Projected balance ${fmtUSD(v)}` : "Projected balance —";
  }
}
