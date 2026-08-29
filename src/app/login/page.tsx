import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save Coast FIRE scenarios and track your progress over time.",
};

export default function LoginPage() {
  return (
    <div className="wrap" style={{ maxWidth: 440, paddingTop: 64 }}>
      <h1 className="section-title" style={{ fontSize: 28 }}>
        Sign in
      </h1>
      <p className="section-sub">Save scenarios and track your coast plan over time.</p>
      <div className="panel" style={{ marginTop: 24 }}>
        <LoginForm />
      </div>
    </div>
  );
}
