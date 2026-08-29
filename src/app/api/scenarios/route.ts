import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";

const FREE_SCENARIO_LIMIT = 1;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenarios: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json();
  const { name, inputs, coastNumberToday } = body ?? {};
  if (!name || typeof name !== "string" || !inputs) {
    return NextResponse.json({ error: "Missing name or inputs" }, { status: 400 });
  }

  // Server-side gate: free accounts may save exactly one scenario. This check
  // must live here (not just client UI) since it decides what gets written.
  const isPremium = await getIsPremium(user.id);
  if (!isPremium) {
    const { count } = await supabase
      .from("scenarios")
      .select("*", { count: "exact", head: true });
    if ((count ?? 0) >= FREE_SCENARIO_LIMIT) {
      return NextResponse.json(
        {
          error:
            "Free plan is limited to 1 saved scenario. Delete your saved scenario or upgrade to Premium for unlimited scenarios.",
          code: "SCENARIO_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      user_id: user.id,
      name: name.slice(0, 60),
      inputs,
      coast_number_today: coastNumberToday,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenario: data }, { status: 201 });
}
