"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, TrendingUp, CreditCard, ChevronDown } from "lucide-react";
import { formatINR, formatDate } from "@/app/_lib/utils";

type Payment = { id: string; amount: number; paidAt: string; method: string; plan?: { name: string } | null };

const METHOD_STYLE: Record<string, { color: string; bg: string }> = {
  upi:  { color: "#3B82F6", bg: "#DBEAFE" },
  card: { color: "#059669", bg: "#D1FAE5" },
  cash: { color: "#b45309", bg: "#FEF3C7" },
};

export default function MemberPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/member/payments").then(r => r.json()).then(d => { setPayments(d.data ?? []); setLoading(false); });
  }, []);

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">

      {/* ── Stat cards ── */}
      {!loading && payments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
          <div style={{ background: "#E6F4EA", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{formatINR(total)}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
              <TrendingUp size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#059669" }} />Total paid
            </div>
          </div>
          <div style={{ background: "#EDE9FF", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{formatINR(payments[0]?.amount ?? 0)}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>Last payment</div>
          </div>
          <div style={{ background: "#FDF6E3", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{payments.length}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
              <CreditCard size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#b45309" }} />Transactions
            </div>
          </div>
        </div>
      )}

      {/* ── Payment history table ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>Transaction History</div>
          <button style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.65rem",
            border: "1px solid var(--border)", borderRadius: 999,
            background: "var(--bg-outer)", color: "var(--text-primary)", cursor: "pointer",
          }}>
            All methods <ChevronDown size={11} />
          </button>
        </div>

        {/* Col headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 32px",
          padding: "0.5rem 1.25rem", borderBottom: "1px solid var(--border)",
          background: "var(--bg-outer)",
        }}>
          {["Date", "Plan", "Method", "Amount", ""].map(h => (
            <div key={h} style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No payment records found.
          </div>
        ) : payments.map(p => {
          const mc = METHOD_STYLE[p.method] ?? METHOD_STYLE.cash;
          return (
            <div key={p.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 32px",
                padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)",
                alignItems: "center", gap: "0.5rem", transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-outer)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{formatDate(p.paidAt)}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{p.plan?.name ?? "—"}</div>
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
