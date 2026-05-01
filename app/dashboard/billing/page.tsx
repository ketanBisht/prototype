"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Star, ChevronDown, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { formatINR, formatDate } from "@/app/_lib/utils";

type Payment = {
  id: string; amount: number; paidAt: string; method: string; notes?: string;
  member: { id: string; name: string; phone: string };
  plan: { name: string } | null;
};
type ExpiringMember = { id: string; name: string; phone: string; endDate: string; plan: { name: string } | null };

const ICON_BG = ["#1A1A2E","#2D2D3F","#3D3D55","#252540","#1E1E30","#343448"];
function MemberIcon({ name, idx }: { name: string; idx: number }) {
  const init = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: ICON_BG[idx % ICON_BG.length], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.68rem", fontWeight: 800,
    }}>{init}</div>
  );
}

const METHOD_STYLE: Record<string, { color: string; bg: string }> = {
  upi:  { color: "#3B82F6", bg: "#DBEAFE" },
  card: { color: "#059669", bg: "#D1FAE5" },
  cash: { color: "#b45309", bg: "#FEF3C7" },
};

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [expiring, setExpiring] = useState<ExpiringMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [pr, dr] = await Promise.all([fetch(`/api/owner/payments?month=${month}`), fetch("/api/owner/dashboard")]);
    const [pd, dd] = await Promise.all([pr.json(), dr.json()]);
    setPayments(pd.data?.payments ?? []); setTotal(pd.data?.total ?? 0);
    setExpiring(dd.data?.expiringMembers ?? []);
    setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
        <div style={{ background: "#E6F4EA", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{formatINR(total)}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
            <TrendingUp size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#059669" }} />
            Collected this month
          </div>
        </div>
        <div style={{ background: "#FDF6E3", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{expiring.length}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
            <AlertTriangle size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#d97706" }} />
            Outstanding dues
          </div>
        </div>
        <div style={{ background: "#EDE9FF", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{payments.length}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
            <CreditCard size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#7C3AED" }} />
            Transactions
          </div>
        </div>
      </div>

      {/* ── Outstanding dues ── */}
      {expiring.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800 }}>
              Outstanding Dues
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#d97706", background: "#fef3c7", borderRadius: 999, padding: "0.15rem 0.5rem", marginLeft: "0.5rem" }}>
                {expiring.length} pending
              </span>
            </div>
          </div>
          {expiring.map((m, idx) => (
            <div key={m.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto",
                padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)",
                alignItems: "center", gap: "0.5rem", transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-outer)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <MemberIcon name={m.name} idx={idx} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: 1 }}>{m.phone}</div>
                </div>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{m.plan?.name ?? "No Plan"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Expires {formatDate(m.endDate)}</div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "0.18rem 0.55rem", borderRadius: 999 }}>
                Due
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Payment History ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800 }}>Payment History</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input className="input" type="month" value={month} onChange={e => setMonth(e.target.value)}
              style={{ width: 160, fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} />
            <button style={{
              display: "flex", alignItems: "center", gap: "0.25rem",
              fontSize: "0.72rem", fontWeight: 600, padding: "0.35rem 0.65rem",
              border: "1px solid var(--border)", borderRadius: 999,
              background: "var(--bg-outer)", color: "var(--text-primary)", cursor: "pointer",
            }}>
              All methods <ChevronDown size={11} />
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 32px",
          padding: "0.5rem 1.25rem", borderBottom: "1px solid var(--border)",
          background: "var(--bg-outer)",
        }}>
          {["Member", "Plan", "Date", "Method", "Amount", ""].map(h => (
            <div key={h} style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No payments this month.
          </div>
        ) : payments.map((p, idx) => {
          const mc = METHOD_STYLE[p.method] ?? METHOD_STYLE.cash;
          return (
            <div key={p.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 32px",
                padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)",
                alignItems: "center", gap: "0.5rem", transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-outer)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <MemberIcon name={p.member.name} idx={idx} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.2 }}>{p.member.name}</div>
                  <div style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: 1 }}>{p.member.phone}</div>
                </div>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{p.plan?.name ?? "—"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{formatDate(p.paidAt)}</div>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: mc.color, background: mc.bg, padding: "0.18rem 0.55rem", borderRadius: 999 }}>
                  {p.method.toUpperCase()}
                </span>
              </div>
              <div style={{ fontWeight: 800, color: "var(--green)", fontSize: "0.875rem" }}>{formatINR(p.amount)}</div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
                onClick={() => setStarred(s => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}>
                <Star size={13} fill={starred.has(p.id) ? "var(--gold)" : "none"} color={starred.has(p.id) ? "var(--gold)" : "var(--text-muted)"} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
