import { createClient } from "@/lib/supabase/server";
import { SubscriptionStatusValue } from "./types";

const ACTIVE_STATUSES: SubscriptionStatusValue[] = ["active", "trialing"];

// Server-side premium check — always re-reads subscription_status from Postgres,
// never trusts client state. Use this to gate every premium API route and page.
export async function getIsPremium(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_status")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return false;
  return ACTIVE_STATUSES.includes(data.status as SubscriptionStatusValue);
}
