"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

const PERKS = ["Track member renewals", "Collect payments digitally", "Daily attendance check-in", "Expiry alerts & reports"];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "member" ? "member" : "owner";

  const [role, setRole] = useState<"owner" | "member">(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (role === "owner") {
        const res = await fetch("/api/auth/owner/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Login failed");
        router.push("/dashboard");
      } else {
        const res = await fetch("/api/auth/member/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, pin }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Login failed");
        router.push("/member");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-outer)" }}>

      {/* LEFT: Dark brand panel */}
      <div style={{ background: "var(--sidebar-bg)", display: "flex", flexDirection: "column", padding: "2.5rem", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: "var(--gold)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={18} color="#1A1A2E" />
          </div>
          <span style={{ fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.9rem" }}>Iron Paradise</span>
        </Link>

        <div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: "1rem" }}>
            Built for gym owners
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: "2rem" }}>
            Run your gym<br />
            <span style={{ color: "var(--gold)" }}>smarter.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {PERKS.map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={12} color="var(--gold)" />
                </div>
                <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat pills */}
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          {["350+ Members", "8 Years", "5,000 Sq. Ft."].map(s => (
            <div key={s} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "0.3rem 0.75rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="animate-fade-in">

          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.78rem", fontWeight: 600, marginBottom: "2.5rem", transition: "color 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}>
            <ArrowLeft size={13} /> Back to home
          </Link>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.375rem", color: "var(--text-primary)" }}>Welcome back.</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Sign in to your account below.</p>

          {/* Role tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-outer)", borderRadius: 12, padding: "4px", marginBottom: "2rem", border: "1px solid var(--border)" }}>
            {(["owner", "member"] as const).map(r => (
              <button key={r} onClick={() => { setRole(r); setError(""); }} style={{
                padding: "0.5rem", borderRadius: 9, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "0.83rem", transition: "all 0.18s",
                background: role === r ? "var(--sidebar-bg)" : "transparent",
                color: role === r ? "#fff" : "var(--text-muted)",
                boxShadow: role === r ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              }}>
                {r === "owner" ? "🏋️ Owner" : "👤 Member"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {role === "owner" ? (
              <>
                <div className="form-group">
                  <label className="label">Email Address</label>
                  <input id="owner-email" className="input" type="email" placeholder="owner@gym.in" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input id="owner-password" className="input" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: "2.75rem" }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="label">Phone Number</label>
                  <input id="member-phone" className="input" type="tel" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">4-Digit PIN</label>
                  <input id="member-pin" className="input" type="password" placeholder="••••" value={pin} onChange={e => setPin(e.target.value.slice(0, 4))} maxLength={4} inputMode="numeric" pattern="\d{4}" required />
                </div>
              </>
            )}

            {error && (
              <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "0.625rem 0.875rem", color: "var(--red)", fontSize: "0.83rem" }}>
                {error}
              </div>
            )}

            <button id="login-submit" type="submit" disabled={loading} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              background: "var(--sidebar-bg)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "0.9rem", padding: "0.875rem", borderRadius: 12,
              transition: "opacity 0.18s", opacity: loading ? 0.7 : 1,
            }}>
              {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "0.5rem", background: "var(--bg-outer)", borderRadius: 8, border: "1px solid var(--border)" }}>
              Demo: {role === "owner" ? "owner@jacked.gym / demo1234" : "9876543210 / 1234"}
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
