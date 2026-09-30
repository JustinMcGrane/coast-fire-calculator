import { BaristaInputs, CoastInputs, FiInputs, LongevityInputs } from "./coastfire";

export type CalculatorType = "coast" | "fire" | "longevity" | "barista";

export interface ScenarioRow {
  id: string;
  user_id: string;
  name: string;
  calculator_type: CalculatorType;
  inputs: CoastInputs | FiInputs | LongevityInputs | BaristaInputs;
  headline_value: number | null;
  created_at: string;
}

// The comparison/net-worth/Monte Carlo/PDF tools only ever operate on Coast
// FIRE scenarios (they call project(), which expects CoastInputs) — this
// narrows ScenarioRow for callers that have already filtered to
// calculator_type === "coast".
export interface CoastScenarioRow extends Omit<ScenarioRow, "inputs"> {
  inputs: CoastInputs;
}

export interface NetWorthCheckinRow {
  id: string;
  user_id: string;
  scenario_id: string;
  checkin_date: string;
  balance: number;
  created_at: string;
}

export type SubscriptionStatusValue = "free" | "active" | "trialing" | "past_due" | "canceled";

export interface SubscriptionStatusRow {
  user_id: string;
  status: SubscriptionStatusValue;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}
