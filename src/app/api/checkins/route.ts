import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenarioId");

  let query = supabase
    .from("net_worth_checkins")
    .select("*")
    .order("checkin_date", { ascending: true });
  if (scenarioId) query = query.eq("scenario_id", scenarioId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ checkins: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  // Net worth check-ins are a premium feature — gate server-side, not just in the UI.
  const isPremium = await getIsPremium(user.id);
  if (!isPremium) {
    return NextResponse.json(
      { error: "Net worth check-ins require Premium.", code: "PREMIUM_REQUIRED" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { scenarioId, balance, checkinDate } = body ?? {};
  if (!scenarioId || typeof balance !== "number") {
    return NextResponse.json({ error: "Missing scenarioId or balance" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("net_worth_checkins")
    .insert({
      user_id: user.id,
      scenario_id: scenarioId,
      balance,
      checkin_date: checkinDate || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ checkin: data }, { status: 201 });
}
