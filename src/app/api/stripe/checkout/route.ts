import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { plan } = (await request.json().catch(() => ({}))) as { plan?: "monthly" | "yearly" };
  const priceId = plan === "yearly" ? PRICE_IDS.yearly : PRICE_IDS.monthly;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const { data: sub } = await supabase
    .from("subscription_status")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer: sub?.stripe_customer_id || undefined,
    customer_email: sub?.stripe_customer_id ? undefined : user.email,
    success_url: `${SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${SITE_URL}/pricing?checkout=canceled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
