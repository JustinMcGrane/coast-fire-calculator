import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";
import { CalculatorType } from "@/lib/types";

const FREE_SCENARIO_LIMIT = 1;
const CALCULATOR_TYPES: CalculatorType[] = ["coast", "fire", "longevity", "barista"];

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const type = new URL(request.url).searchParams.get("type");
  let query = supabase.from("scenarios").select("*").order("created_at", { ascending: false });
  if (type && CALCULATOR_TYPES.includes(type as CalculatorType)) {
    query = query.eq("calculator_type", type);
  }
  const { data, error } = await query;

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
  const { name, inputs, headlineValue, calculatorType } = body ?? {};
  if (!name || typeof name !== "string" || !inputs) {
    return NextResponse.json({ error: "Missing name or inputs" }, { status: 400 });
  }
  if (!CALCULATOR_TYPES.includes(calculatorType)) {
    return NextResponse.json({ error: "Invalid or missing calculatorType" }, { status: 400 });
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
      calculator_type: calculatorType,
      inputs,
      headline_value: headlineValue ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenario: data }, { status: 201 });
}
