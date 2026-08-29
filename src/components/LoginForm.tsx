"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (status === "sent") {
    return (
      <p className="status-copy" style={{ marginBottom: 0 }}>
        Check <strong>{email}</strong> for a sign-in link.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="ghost"
        style={{ width: "100%", marginBottom: 16 }}
        onClick={handleGoogle}
      >
        Continue with Google
      </button>
      <div className="section-sub" style={{ textAlign: "center", margin: "12px 0" }}>
        or
      </div>
      <form onSubmit={handleMagicLink}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-panel-2)",
              border: "1px solid var(--line)",
              borderRadius: 9,
              color: "var(--text)",
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              padding: "12px 14px",
            }}
          />
        </div>
        {status === "error" && (
          <p className="section-sub" style={{ color: "var(--gold)" }}>
            {errorMessage}
          </p>
        )}
        <button type="submit" className="primary" style={{ width: "100%" }} disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send magic link"}
        </button>
      </form>
    </div>
  );
}
