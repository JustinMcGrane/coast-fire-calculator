import { CoastInputs } from "./coastfire";

export interface ScenarioRow {
  id: string;
  user_id: string;
  name: string;
  inputs: CoastInputs;
  coast_number_today: number;
  created_at: string;
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
