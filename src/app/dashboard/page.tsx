import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";
import ScenarioComparison from "@/components/ScenarioComparison";
import NetWorthTracker from "@/components/NetWorthTracker";
import MonteCarloView from "@/components/MonteCarloView";
import ReportExport from "@/components/ReportExport";
import ManageBillingButton from "@/components/ManageBillingButton";
import UpgradeButtons from "@/components/UpgradeButtons";
import Link from "next/link";
import { CALCULATOR_LABELS, formatHeadline } from "@/lib/scenarioDisplay";
import { CalculatorType } from "@/lib/types";

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

  // The comparison/net-worth/Monte Carlo/PDF tools below are Coast FIRE-specific
  // (they call project() on the saved inputs) — scope them to Coast scenarios
  // only, and list scenarios from the other three calculators separately.
  const coastScenarios = scenarios?.filter((s) => s.calculator_type === "coast") ?? [];
  const otherScenarios = scenarios?.filter((s) => s.calculator_type !== "coast") ?? [];

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
      ) : (
        <>
          {coastScenarios.length > 0 &&
            (isPremium ? (
              <>
                <ScenarioComparison scenarios={coastScenarios} />
                <NetWorthTracker scenarios={coastScenarios} />
                <MonteCarloView scenarios={coastScenarios} />
                <ReportExport scenarios={coastScenarios} />
              </>
            ) : (
              <div className="saved-list">
                {coastScenarios.map((s) => (
                  <div className="saved-item" key={s.id}>
                    <div>
                      <div className="saved-item-name">{s.name}</div>
                      <div className="saved-item-meta">{formatHeadline(s)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {otherScenarios.length > 0 && (
            <div className="saved-section">
              <div className="section-title">Other calculators</div>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                Comparison, net worth tracking, and Monte Carlo are Coast FIRE-only for now.
              </p>
              <div className="saved-list">
                {otherScenarios.map((s) => (
                  <div className="saved-item" key={s.id}>
                    <div>
                      <div className="saved-item-name">{s.name}</div>
                      <div className="saved-item-meta">
                        {CALCULATOR_LABELS[s.calculator_type as CalculatorType]} · {formatHeadline(s)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
