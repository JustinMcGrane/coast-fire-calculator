import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";
import ScenarioComparison from "@/components/ScenarioComparison";
import NetWorthTracker from "@/components/NetWorthTracker";
import MonteCarloView from "@/components/MonteCarloView";
import ManageBillingButton from "@/components/ManageBillingButton";
import UpgradeButtons from "@/components/UpgradeButtons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isPremium = await getIsPremium(user.id);
  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <div className="top-row">
        <div>
          <div className="section-title">Your dashboard</div>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            Signed in as {user.email}
          </p>
        </div>
        {isPremium ? <ManageBillingButton /> : null}
      </div>

      {!isPremium && (
        <div className="panel" style={{ marginBottom: 40 }}>
          <div className="section-title">You&apos;re on the free plan</div>
          <p className="section-sub">
            Upgrade for unlimited scenario comparison, net worth tracking, and Monte Carlo
            probability bands.
          </p>
          <UpgradeButtons />
        </div>
      )}

      {!scenarios?.length ? (
        <div className="saved-empty">
          No saved scenarios yet. <Link href="/">Build one on the calculator</Link> and save it to see
          it here.
        </div>
      ) : isPremium ? (
        <>
          <ScenarioComparison scenarios={scenarios} />
          <NetWorthTracker scenarios={scenarios} />
          <MonteCarloView scenarios={scenarios} />
        </>
      ) : (
        <div className="saved-list">
          {scenarios.map((s) => (
            <div className="saved-item" key={s.id}>
              <div>
                <div className="saved-item-name">{s.name}</div>
                <div className="saved-item-meta">
                  Coast number ${Math.round(s.coast_number_today).toLocaleString("en-US")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
