"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Users, CreditCard, AlertTriangle, Zap, Target, Award, BarChart2 } from "lucide-react";
import { formatINR, daysRemaining, membershipStatus } from "@/app/_lib/utils";

type Member = {
  id: string; name: string; phone: string; endDate: string; startDate: string; isActive: boolean;
  plan: { id: string; name: string; price: number; durationDays: number } | null;
};
type Payment = { id: string; amount: number; paidAt: string; method: string; member: { name: string } };

type DashData = {
  activeMembers: number; totalMembers: number; monthlyRevenue: number;
  expiringMembers: Member[]; recentPayments: Payment[];
};

/* ── Mini bar chart ── */
function BarChart({ bars, color }: { bars: { label: string; value: number; max: number }[]; color: string }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: 80 }}>
      {bars.map(b => (
        <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 6, height: 64, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
            <div style={{
              width: "100%",
              height: `${b.max > 0 ? Math.round((b.value / b.max) * 100) : 0}%`,
              background: color,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.8s ease",
              minHeight: b.value > 0 ? 4 : 0,
            }} />
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "center" }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Stat KPI card ── */
function KPI({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
        {sub && (
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color, background: bg, padding: "0.2rem 0.6rem", borderRadius: 999 }}>{sub}</span>
        )}
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem", fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/owner/dashboard").then(r => r.json()),
      fetch("/api/owner/members").then(r => r.json()),
    ]).then(([dash, mem]) => {
      setData(dash.data);
      setMembers(mem.data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={28} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!data) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--red)" }}>Failed to load analytics.</div>;

  /* ── Derived stats ── */
  const expiredCount   = members.filter(m => membershipStatus(m.endDate) === "expired").length;
  const expiringCount  = members.filter(m => membershipStatus(m.endDate) === "expiring").length;
  const activeCount    = members.filter(m => membershipStatus(m.endDate) === "active").length;
  const retentionRate  = data.totalMembers > 0 ? Math.round((activeCount / data.totalMembers) * 100) : 0;
  const avgRevPerMember = activeCount > 0 ? Math.round(data.monthlyRevenue / activeCount) : 0;
  const churnRisk      = expiringCount + expiredCount;

  /* ── Plan distribution ── */
  const planCounts: Record<string, { count: number; revenue: number }> = {};
  members.forEach(m => {
    if (!m.plan) return;
    if (!planCounts[m.plan.name]) planCounts[m.plan.name] = { count: 0, revenue: 0 };
    planCounts[m.plan.name].count++;
    planCounts[m.plan.name].revenue += m.plan.price;
  });
  const planEntries = Object.entries(planCounts).sort((a, b) => b[1].count - a[1].count);
  const maxPlanCount = Math.max(...planEntries.map(e => e[1].count), 1);

  /* ── Monthly sign-ups (last 6 months) ── */
  const monthlySignups: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short" });
    monthlySignups[key] = 0;
  }
  members.forEach(m => {
    const d = new Date(m.startDate);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const key = d.toLocaleDateString("en-IN", { month: "short" });
      monthlySignups[key] = (monthlySignups[key] ?? 0) + 1;
    }
  });
  const signupBars = Object.entries(monthlySignups).map(([label, value]) => ({
    label, value, max: Math.max(...Object.values(monthlySignups), 1),
  }));

  /* ── Payment method breakdown ── */
  const methodCounts: Record<string, number> = {};
  data.recentPayments.forEach(p => {
    methodCounts[p.method] = (methodCounts[p.method] ?? 0) + 1;
  });
  const totalPay = data.recentPayments.length;

  /* ── Expiring soon (next 7 days) ── */
  const urgentMembers = members
    .filter(m => { const d = daysRemaining(m.endDate); return d >= 0 && d <= 7; })
    .sort((a, b) => daysRemaining(a.endDate) - daysRemaining(b.endDate))
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} className="animate-fade-in">

      {/* ── Hero KPIs ── */}
      <div className="grid-cols-4">
        <KPI label="Active Members"      value={String(activeCount)}         sub={`${retentionRate}% retention`} icon={Users}        color="#6366f1" bg="#EEF2FF" />
        <KPI label="Monthly Revenue"     value={formatINR(data.monthlyRevenue)} sub="this month"               icon={CreditCard}   color="#10b981" bg="#D1FAE5" />
        <KPI label="Avg. Rev / Member"   value={formatINR(avgRevPerMember)}  sub="per active"                   icon={TrendingUp}   color="#f59e0b" bg="#FEF3C7" />
        <KPI label="Churn Risk Members"  value={String(churnRisk)}           sub={`${expiringCount} expiring`} icon={AlertTriangle} color="#ef4444" bg="#FEE2E2" />
      </div>

      {/* ── Row 2: Sign-up trend + Plan mix ── */}
      <div className="grid-cols-dashboard-mid">

        {/* Sign-up trend */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <BarChart2 size={16} color="#6366f1" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>New Member Sign-ups</span>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Last 6 months</span>
          </div>
          <BarChart bars={signupBars} color="#6366f1" />
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f8fafc", borderRadius: 12, display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total new members</span>
            <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{members.length}</span>
          </div>
        </div>

        {/* Plan mix */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Target size={16} color="#10b981" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Plan Distribution</span>
          </div>
          {planEntries.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No plan data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {planEntries.slice(0, 5).map(([name, { count, revenue }], i) => {
                const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"];
                const pct = Math.round((count / maxPlanCount) * 100);
                return (
                  <div key={name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{name}</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{count} member{count !== 1 ? "s" : ""} · {formatINR(revenue)}</span>
                    </div>
                    <div style={{ background: "#f1f5f9", borderRadius: 999, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: colors[i % colors.length], borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Membership health + Payment methods ── */}
      <div className="grid-cols-dashboard-mid">

        {/* Membership health donut */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Zap size={16} color="#f59e0b" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Membership Health</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Visual donut substitute - horizontal stacked bar */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", height: 28, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                {activeCount > 0    && <div title="Active"   style={{ flex: activeCount,   background: "#10b981" }} />}
                {expiringCount > 0  && <div title="Expiring" style={{ flex: expiringCount, background: "#f59e0b" }} />}
                {expiredCount > 0   && <div title="Expired"  style={{ flex: expiredCount,  background: "#ef4444" }} />}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                {[
                  { label: "Active",   count: activeCount,   color: "#10b981", bg: "#D1FAE5" },
                  { label: "Expiring", count: expiringCount, color: "#f59e0b", bg: "#FEF3C7" },
                  { label: "Expired",  count: expiredCount,  color: "#ef4444", bg: "#FEE2E2" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{s.label}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-primary)" }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retention rate */}
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: retentionRate >= 80 ? "#D1FAE5" : retentionRate >= 60 ? "#FEF3C7" : "#FEE2E2", borderRadius: 12 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: retentionRate >= 80 ? "#059669" : retentionRate >= 60 ? "#d97706" : "#dc2626", marginBottom: "0.25rem" }}>Retention Rate</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: retentionRate >= 80 ? "#059669" : retentionRate >= 60 ? "#d97706" : "#dc2626", lineHeight: 1 }}>{retentionRate}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              {retentionRate >= 80 ? "Excellent! Keep up the great work." : retentionRate >= 60 ? "Good, but room to improve. Focus on renewals." : "Needs attention — reach out to inactive members."}
            </div>
          </div>
        </div>

        {/* Payment method breakdown */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <CreditCard size={16} color="#ec4899" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Payment Methods</span>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Recent transactions</span>
          </div>
          {totalPay === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No payment data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {Object.entries(methodCounts).map(([method, count]) => {
                const pct = Math.round((count / totalPay) * 100);
                const colors: Record<string, string> = { cash: "#10b981", upi: "#6366f1", card: "#ec4899", online: "#f59e0b" };
                const color = colors[method.toLowerCase()] ?? "#64748b";
                return (
                  <div key={method}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>{method}</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{count} txn · {pct}%</span>
                    </div>
                    <div style={{ background: "#f1f5f9", borderRadius: 999, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Revenue total */}
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Total collected (recent)</span>
            <span style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-primary)" }}>
              {formatINR(data.recentPayments.reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 4: Urgent renewals ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Award size={16} color="#ef4444" />
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>🔥 Urgent Renewals</span>
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Expiring within 7 days</span>
        </div>
        {urgentMembers.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "#D1FAE5", borderRadius: 12, color: "#059669", fontWeight: 700, fontSize: "0.875rem" }}>
            ✅ No urgent renewals right now — you&apos;re all good!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {urgentMembers.map(m => {
              const days = daysRemaining(m.endDate);
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.875rem 1rem", borderRadius: 12,
                  background: days === 0 ? "#FEE2E2" : days <= 3 ? "#FEF3C7" : "#f8fafc",
                  border: `1px solid ${days === 0 ? "rgba(239,68,68,0.2)" : days <= 3 ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A2E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, flexShrink: 0 }}>
                      {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{m.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.phone} · {m.plan?.name ?? "No plan"}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: "0.875rem", color: days === 0 ? "#dc2626" : days <= 3 ? "#d97706" : "var(--text-primary)" }}>
                      {days === 0 ? "Expired today" : `${days}d left`}
                    </div>
                    {m.plan && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatINR(m.plan.price)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 5: Business insights chips ── */}
      <div className="grid-cols-3">
        {[
          { icon: TrendingUp,   color: "#6366f1", bg: "#EEF2FF", title: "Peak Season Tip", body: "Members who join in Jan–Mar tend to have the highest retention rates. Consider launch offers during this window." },
          { icon: TrendingDown, color: "#ef4444", bg: "#FEE2E2", title: "Reduce Churn",    body: `You have ${churnRisk} members at risk. Send them a personalised renewal offer via Broadcasts to recover revenue.` },
          { icon: Zap,          color: "#f59e0b", bg: "#FEF3C7", title: "Upsell Opportunity", body: `${activeCount > 0 ? Math.round(activeCount * 0.3) : 0} of your active members may be eligible for an upgrade to a longer-duration plan.` },
        ].map(c => (
          <div key={c.title} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.icon size={18} color={c.color} />
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-primary)" }}>{c.title}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.body}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
