"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, AlertTriangle, CalendarCheck,
  Loader2, MoreHorizontal, Star, ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { formatINR, formatDate, daysRemaining, membershipStatus } from "@/app/_lib/utils";

type DashboardData = {
  activeMembers: number; totalMembers: number; expiringCount: number;
  monthlyRevenue: number; todayAttendance: number;
  recentPayments: Array<{ id: string; amount: number; paidAt: string; method: string; member: { name: string; phone: string } }>;
  expiringMembers: Array<{ id: string; name: string; phone: string; endDate: string; plan: { name: string } | null }>;
};

/* ── Sparkline with floating tooltip ── */
function PortfolioChart() {
  const pts = [22,30,25,38,28,20,32,42,36,50,44,38,55,48,62,56,70,64,58,72,66,78];
  const W = 300; const H = 90;
  const max = Math.max(...pts); const min = Math.min(...pts);
  const norm = pts.map(v => H - 8 - ((v - min) / (max - min)) * (H - 20));
  const d = norm.map((y, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * W} ${y}`).join(" ");
  const tipIdx = Math.floor(pts.length * 0.72);
  const tipX = (tipIdx / (pts.length - 1)) * W;
  const tipY = norm[tipIdx];
  return (
    <div style={{ position: "relative", width: "100%", height: 100 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="pfg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L${W} ${H} L0 ${H} Z`} fill="url(#pfg)" />
        <path d={d} fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={tipX} y1={tipY} x2={tipX} y2={H} stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <circle cx={tipX} cy={tipY} r="4" fill="#3B82F6" />
        <circle cx={tipX} cy={tipY} r="7" fill="#3B82F6" opacity="0.15" />
        <g transform={`translate(${Math.min(tipX - 42, W - 88)},${tipY - 32})`}>
          <rect x="0" y="0" width="88" height="22" rx="8" fill="#1A1A2E" />
          <text x="44" y="15" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="white" fontFamily="Inter,sans-serif">$ 27 483.00</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Asset Card ── */
function AssetCard({ value, label, sub, icon, bg, accent, change, positive, delay }: {
  value: string; label: string; sub: string; icon: React.ReactNode;
  bg: string; accent: string; change: string; positive: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}
      style={{ background: bg, borderRadius: 16, padding: "1.1rem 1rem", cursor: "default" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1A1A1A", marginTop: "0.1rem" }}>{label}</div>
          <div style={{ fontSize: "0.65rem", color: "#888", marginTop: "0.1rem" }}>{sub}</div>
        </div>
        <button style={{ border: "none", background: "none", cursor: "pointer", color: "#999", padding: 0 }}>
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: "rgba(255,255,255,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)", color: accent,
        }}>{icon}</div>
        <span style={{
          fontSize: "0.7rem", fontWeight: 700, borderRadius: 999,
          padding: "0.18rem 0.5rem",
          color: positive ? "#16a34a" : "#dc2626",
          background: positive ? "#dcfce7" : "#fee2e2",
        }}>{change}</span>
      </div>
    </motion.div>
  );
}

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
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
  if (!data) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "#dc2626", fontSize: "0.9rem" }}>Failed to load.</div>
  );

  const expiringRows = data.expiringMembers.slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ═══ ROW 1: Portfolio + Your Assets ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "42fr 58fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Portfolio card */}
        <motion.div {...fadeUp(0)}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A1A", marginBottom: "0.625rem" }}>Portfolio</div>
          <div style={{
            background: "#DCE8FF",
            borderRadius: 16, padding: "1.25rem 1.25rem 1rem",
            display: "flex", flexDirection: "column", gap: "0.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                  {formatINR(data.monthlyRevenue)}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#5a7ab0", marginTop: "0.2rem", fontWeight: 500 }}>Portfolio balance</div>
              </div>
              <button style={{ border: "none", background: "none", cursor: "pointer", color: "#7896c8" }}>
                <MoreHorizontal size={15} />
              </button>
            </div>
            <PortfolioChart />
            {/* Time pills */}
            <div style={{ display: "flex", gap: "0.15rem" }}>
              {["1H","24H","1W","1M","1Y","ALL"].map(t => (
                <button key={t} onClick={() => setActiveTime(t)} style={{
                  fontSize: "0.6rem", fontWeight: 700, padding: "0.18rem 0.42rem",
                  borderRadius: 999, border: "none", cursor: "pointer",
                  background: t === activeTime ? "#1A1A2E" : "transparent",
                  color: t === activeTime ? "#fff" : "#7896c8",
                  transition: "all 0.14s",
                }}>{t}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Your Assets */}
        <motion.div {...fadeUp(0.05)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A1A" }}>Your Assets</div>
            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#999" }}>
              <SlidersHorizontal size={15} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
            <AssetCard
              value={String(data.activeMembers)} label="Active Members" sub={`${data.totalMembers} total`}
              icon={<Users size={16} />} bg="#EDE9FF" accent="#7C3AED"
              change="+0.34%" positive={true} delay={0.08}
            />
            <AssetCard
              value={String(data.expiringCount)} label="Expiring Soon" sub="within 7 days"
              icon={<AlertTriangle size={16} />} bg="#E6F4EA" accent="#059669"
              change={data.expiringCount > 0 ? `${data.expiringCount} due` : "+0.31%"}
              positive={data.expiringCount === 0} delay={0.12}
            />
            <AssetCard
              value={String(data.todayAttendance)} label="Check-ins" sub="today"
              icon={<CalendarCheck size={16} />} bg="#FDF6E3" accent="#b45309"
              change="+0.27%" positive={true} delay={0.16}
            />
          </div>
        </motion.div>
      </div>

      {/* ═══ ROW 2: Market Table + Promo Card ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 285px", gap: "1.25rem", alignItems: "start" }}>

        {/* Market-style table */}
        <motion.div {...fadeUp(0.1)}>
          {/* Table header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1A1A1A" }}>
              {data.expiringCount > 0
                ? <>Market is <span style={{ color: "#dc2626" }}>down {data.expiringCount} renewals</span></>
                : <>Members <span style={{ color: "#16a34a" }}>{data.activeMembers} active</span></>
              }
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["This week", "Expiring soon"].map(label => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: "0.25rem",
                  fontSize: "0.72rem", fontWeight: 600, padding: "0.28rem 0.65rem",
                  border: "1px solid #E5E5E5", borderRadius: 999,
                  background: "#fff", color: "#333", cursor: "pointer",
                }}>
                  {label} <ChevronDown size={11} />
                </button>
              ))}
            </div>
          </div>

          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 32px", padding: "0 0.5rem 0.5rem", borderBottom: "1px solid #F0F0F0", gap: "0.5rem" }}>
            {["Name","Plan","Status","Revenue",""].map(h => (
              <div key={h} style={{ fontSize: "0.62rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {(expiringRows.length > 0 ? expiringRows : data.recentPayments.slice(0, 4).map(p => ({
            id: p.id, name: p.member.name, phone: p.member.phone, endDate: p.paidAt, plan: { name: "Paid" },
          }))).map((m, idx) => {
            const days = daysRemaining(m.endDate);
            const status = membershipStatus(m.endDate);
            const sc = status === "active" ? { color: "#16a34a", bg: "#dcfce7" } : status === "expiring" ? { color: "#d97706", bg: "#fef3c7" } : { color: "#dc2626", bg: "#fee2e2" };
            return (
              <motion.div key={m.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.06, duration: 0.28 }}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 32px",
                  padding: "0.75rem 0.5rem", borderBottom: "1px solid #F5F5F5",
                  alignItems: "center", gap: "0.5rem",
                  borderRadius: 8, transition: "background 0.12s", cursor: "default",
                }}
                whileHover={{ backgroundColor: "#FAFAFA" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <MemberIcon name={m.name} idx={idx} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.83rem", lineHeight: 1.2, color: "#1A1A1A" }}>{m.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "#aaa", marginTop: 1 }}>{m.phone}</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#333", fontWeight: 500 }}>{m.plan?.name ?? "—"}</div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: sc.color, background: sc.bg, padding: "0.18rem 0.5rem", borderRadius: 999, display: "inline-block" }}>
                  {days === 0 ? "Today" : days > 0 ? `+${days}d` : `${days}d`}
                </span>
                <div style={{ fontSize: "0.82rem", color: "#555", fontWeight: 500 }}>{formatINR(m.plan ? 1500 : 0)}</div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 0 }}>
                  <Star size={14} />
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Dark Promo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{
            background: "#18181F", borderRadius: 18,
            padding: "1.75rem 1.5rem", color: "#fff",
            display: "flex", flexDirection: "column", gap: "1rem",
            position: "relative", overflow: "hidden", minHeight: 260,
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", right: -40, bottom: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: -10, bottom: -10, width: 95, height: 95, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          {/* Diagonal lines */}
          <svg style={{ position: "absolute", bottom: 8, right: 8, opacity: 0.06, pointerEvents: "none" }} width="110" height="90" viewBox="0 0 110 90">
            {[0,14,28,42,56,70,84].map(i => <line key={i} x1={i} y1="0" x2={i+90} y2="90" stroke="white" strokeWidth="1.5" />)}
          </svg>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.3, marginBottom: "0.5rem" }}>
              Earn{" "}
              <span style={{
                display: "inline-flex", alignItems: "center",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: 999, padding: "0 0.45rem",
                fontSize: "1.2rem", lineHeight: "1.65",
              }}>free</span>{" "}
              revenue with Jacked!
            </div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>
              Track renewals, collect payments, and manage your members — all in one place.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <Link href="/dashboard/members" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontWeight: 700, fontSize: "0.82rem",
              padding: "0.55rem 1.4rem", borderRadius: 999, textDecoration: "none",
              backdropFilter: "blur(4px)", gap: "0.4rem", transition: "background 0.18s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.13)")}
            >
              <TrendingUp size={13} /> Earn Now
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative", zIndex: 2 }}>
            {[
              { href: "/dashboard/attendance", label: "Mark attendance", icon: <CalendarCheck size={12} /> },
              { href: "/dashboard/billing",    label: "Record payment",  icon: <TrendingUp size={12} /> },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: "0.75rem", color: "rgba(255,255,255,0.45)",
                textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem",
                transition: "color 0.15s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
