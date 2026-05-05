"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, AlertTriangle, CalendarCheck,
  Loader2, MoreHorizontal, Star, ChevronDown, SlidersHorizontal,
  CreditCard,
} from "lucide-react";
import { formatINR, formatDate, daysRemaining, membershipStatus } from "@/app/_lib/utils";
import { KPICard, AreaChart, DonutChart } from "./_components/AnalyticsComponents";

type DashboardData = {
  activeMembers: number; totalMembers: number; expiringCount: number;
  monthlyRevenue: number; todayAttendance: number;
  recentPayments: Array<{ id: string; amount: number; paidAt: string; method: string; member: { name: string; phone: string } }>;
  expiringMembers: Array<{ id: string; name: string; phone: string; endDate: string; plan: { name: string } | null }>;
};



/* ── Member row icon ── */
const ICON_BG = ["#1A1A2E","#2D2D3F","#3D3D55","#252540","#1E1E30"];
function MemberIcon({ name, idx }: { name: string; idx: number }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: ICON_BG[idx % ICON_BG.length], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.68rem", fontWeight: 800,
    }}>
      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ── Animation variants ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: "easeOut" as const },
});

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTime, setActiveTime] = useState("1W");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/owner/dashboard");
        if (!res.ok) throw new Error();
        setData((await res.json()).data);
      } catch { /* no-op */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={26} color="#C8A96E" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!data) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "#dc2626", fontSize: "0.9rem" }}>Failed to load.</div>
  );

  const expiringRows = data.expiringMembers.slice(0, 4);

  const revenueData = [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 85000, 78000, 92000, 88000];
  const planDistribution = [
    { label: "Monthly", value: 45, color: "#6366f1" },
    { label: "Quarterly", value: 30, color: "#10b981" },
    { label: "Yearly", value: 25, color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ═══ Top KPI Row ═══ */}
      <div className="grid-cols-4">
        <KPICard 
          label="Total Revenue" value={formatINR(data.monthlyRevenue * 12)} 
          change="+12.5%" trend="up" icon={CreditCard} color="#6366f1" delay={0}
        />
        <KPICard 
          label="Active Members" value={String(data.activeMembers)} 
          change="+3.2%" trend="up" icon={Users} color="#10b981" delay={0.1}
        />
        <KPICard 
          label="Retention Rate" value="94.2%" 
          change="+1.5%" trend="up" icon={TrendingUp} color="#f59e0b" delay={0.2}
        />
        <KPICard 
          label="Avg. Revenue" value={formatINR(Math.round(data.monthlyRevenue / (data.activeMembers || 1)))} 
          change="-0.8%" trend="down" icon={Star} color="#ec4899" delay={0.3}
        />
      </div>

      {/* ═══ Main Analytics Grid ═══ */}
      <div className="grid-cols-dashboard-mid">
        
        {/* Revenue Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            background: "#fff", padding: "2rem", borderRadius: "24px",
            border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Revenue Growth</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Monthly earnings over the past year</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["6M", "1Y", "ALL"].map(t => (
                <button key={t} style={{
                  padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid #e2e8f0",
                  background: t === "1Y" ? "#1e293b" : "#fff", color: t === "1Y" ? "#fff" : "#64748b",
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer"
                }}>{t}</button>
              ))}
            </div>
          </div>
          <AreaChart data={revenueData} color="#6366f1" />
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            background: "#fff", padding: "2rem", borderRadius: "24px",
            border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex", flexDirection: "column"
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0, marginBottom: "2rem" }}>Member Plans</h3>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DonutChart segments={planDistribution} />
          </div>
          <div style={{ marginTop: "2rem", padding: "1rem", background: "#f8fafc", borderRadius: "16px" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.5rem" }}>Quick Insight</div>
            <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
              Your <strong>Monthly</strong> plan is the most popular, accounting for 45% of your total membership.
            </p>
          </div>
        </motion.div>

      </div>

      {/* ═══ Bottom Row: Recent Activity & Renewals ═══ */}
      <div className="grid-cols-dashboard-top">
        
        {/* Market-style table (Simplified) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            background: "#fff", padding: "1.5rem", borderRadius: "24px",
            border: "1px solid #f1f5f9"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Upcoming Renewals</h3>
            <Link href="/dashboard/members" style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>View all</Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(expiringRows.length > 0 ? expiringRows : data.recentPayments.slice(0, 4)).map((m: any, idx: number) => {
              const dateVal = m.endDate || m.paidAt;
              const days = daysRemaining(dateVal);
              const status = membershipStatus(dateVal);
              const sc = status === "active" ? { color: "#16a34a", bg: "#dcfce7" } : status === "expiring" ? { color: "#d97706", bg: "#fef3c7" } : { color: "#dc2626", bg: "#fee2e2" };
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem", borderRadius: "12px", background: "#f8fafc"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <MemberIcon name={m.name || m.member.name} idx={idx} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>{m.name || m.member.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{m.phone || m.member.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: sc.color, background: sc.bg, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                      {days === 0 ? "Today" : days > 0 ? `+${days}d` : `${days}d`}
                    </span>
                    <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>{formatINR(1500)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Promo Card (Preserved) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{
            background: "#18181F", borderRadius: "24px",
            padding: "1.75rem", color: "#fff",
            position: "relative", overflow: "hidden", minHeight: 260,
          }}
        >
          <div style={{ position: "absolute", right: -40, bottom: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.5rem" }}>Boost Revenue!</div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              Use our automated billing system to reduce churn and increase renewals.
            </p>
            <Link href="/dashboard/billing" style={{
              marginTop: "1.5rem", display: "inline-flex", alignItems: "center",
              background: "#C8A96E", color: "#1c1c1e", fontWeight: 700, fontSize: "0.8rem",
              padding: "0.6rem 1.2rem", borderRadius: "12px", textDecoration: "none"
            }}>Get Started</Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
