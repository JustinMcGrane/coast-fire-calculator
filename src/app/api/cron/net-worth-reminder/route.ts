import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { SITE_URL } from "@/lib/site";

const QUARTER_DAYS = 90;

// Vercel Cron calls this on a schedule (see vercel.json). Protected by CRON_SECRET
// so the endpoint can't be triggered by anyone who finds the URL.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - QUARTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: premiumUsers, error } = await admin
    .from("subscription_status")
    .select("user_id")
    .in("status", ["active", "trialing"]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const row of premiumUsers ?? []) {
    const { data: scenarios } = await admin
      .from("scenarios")
      .select("id")
      .eq("user_id", row.user_id)
      .limit(1);
    if (!scenarios?.length) continue;

    const { data: recentCheckin } = await admin
      .from("net_worth_checkins")
      .select("created_at")
      .eq("user_id", row.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isDue = !recentCheckin || recentCheckin.created_at < cutoff;
    if (!isDue) continue;

    const { data: userData } = await admin.auth.admin.getUserById(row.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Time for your quarterly net worth check-in",
      html: `
        <p>Hi,</p>
        <p>It's been a while since you logged your invested balance on Coast. A quick check-in keeps your actual-vs-projected chart accurate and helps you spot early if you're off track.</p>
        <p><a href="${SITE_URL}/dashboard">Log your net worth now</a></p>
        <p>— Coast</p>
      `,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
