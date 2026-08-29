import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getIsPremium } from "@/lib/subscription";
import UpgradeButtons from "@/components/UpgradeButtons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Premium",
  description:
    "Coast FIRE Premium: unlimited saved scenarios with side-by-side comparison, net worth check-ins with actual-vs-projected tracking, and Monte Carlo probability bands.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPremium = user ? await getIsPremium(user.id) : false;

  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <div className="content-section" style={{ margin: "0 auto 40px", textAlign: "center" }}>
        <h2>Coast FIRE Premium</h2>
        <p>
          The calculator itself is free forever, no account required. Premium adds the tools for
          tracking your plan over time and seeing a realistic range of outcomes instead of one
          straight line.
        </p>
      </div>

      <div className="grid" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="panel">
          <div className="section-title">Free</div>
          <p className="section-sub">$0 forever</p>
          <ul style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 2, paddingLeft: 18 }}>
            <li>Full Coast FIRE calculator, unlimited use</li>
            <li>No account required</li>
            <li>Save 1 scenario with a free account</li>
          </ul>
        </div>
        <div className="results-panel">
          <div className="section-title">Premium</div>
          <p className="section-sub">$8/mo or $69/yr</p>
          <ul style={{ color: "var(--text)", fontSize: 14, lineHeight: 2, paddingLeft: 18 }}>
            <li>Unlimited saved scenarios, compared side by side</li>
            <li>Net worth check-ins: actual vs. projected over time</li>
            <li>Monte Carlo probability bands (10th/50th/90th percentile)</li>
            <li>Quarterly email reminders to log your net worth</li>
          </ul>
          {isPremium ? (
            <p className="status-copy" style={{ marginBottom: 0 }}>
              You&apos;re on Premium. Manage your billing from the{" "}
              <Link href="/dashboard">dashboard</Link>.
            </p>
          ) : user ? (
            <UpgradeButtons />
          ) : (
            <p className="section-sub" style={{ marginBottom: 0 }}>
              <Link href="/login">Sign in</Link> first, then upgrade.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
