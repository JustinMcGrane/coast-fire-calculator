"use client";

import { useState } from "react";

export default function UpgradeButtons() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function upgrade(plan: "monthly" | "yearly") {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button className="primary" onClick={() => upgrade("monthly")} disabled={loading !== null}>
        {loading === "monthly" ? "Redirecting…" : "Upgrade — $9/mo"}
      </button>
      <button className="ghost" onClick={() => upgrade("yearly")} disabled={loading !== null}>
        {loading === "yearly" ? "Redirecting…" : "Upgrade — $79/yr"}
      </button>
    </div>
  );
}
