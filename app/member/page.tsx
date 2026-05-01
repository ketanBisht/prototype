"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Phone, MoreHorizontal, Zap, TrendingUp } from "lucide-react";
import { formatDate, formatINR, membershipStatus } from "@/app/_lib/utils";

type ProfileData = {
  id: string; name: string; phone: string; email?: string;
  weight?: number; height?: number;
  startDate: string; endDate: string; isActive: boolean;
  daysRemaining: number; status: "active" | "expiring" | "expired";
  thisMonthAttendance: number;
  plan: { name: string; durationDays: number; price: number } | null;
  gym: { name: string; phone: string; address: string };
};

type Announcement = { id: string; title: string; body: string; createdAt: string };

/* ── Mini sparkline ── */
function MiniSparkline({ color = "#10B981" }: { color?: string }) {
  const pts = [40, 55, 45, 62, 50, 70, 58, 65, 72, 68, 75, 70, 78];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map(v => 60 - ((v - min) / (max - min)) * 50);
  const d = norm.map((y, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 200} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{ width: "100%", height: 60 }}>
      <defs>
        <linearGradient id={`mg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L200 60 L0 60 Z`} fill={`url(#mg-${color.replace("#", "")})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Progress Ring ── */
function ProgressRing({ days, total, status }: { days: number; total: number; status: string }) {
  const size = 180;
  const r = 72;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, days / total) : 0;
  const dash = pct * circ;
  const strokeColor = status === "expired" ? "var(--red)" : status === "expiring" ? "var(--yellow)" : "var(--green)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cream-darker)" strokeWidth="12" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "3rem", fontWeight: 900, color: strokeColor, lineHeight: 1 }}>{days}</div>
        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>days left</div>
      </div>
    </div>
  );
}

export default function MemberHomePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/member/profile"), fetch("/api/member/announcements")])
      .then(([pr, ar]) => Promise.all([pr.json(), ar.json()]))
      .then(([pd, ad]) => { setProfile(pd.data); setAnnouncements(ad.data ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={32} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
  if (!profile) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Could not load profile.</div>;

  const totalDays = profile.plan?.durationDays ?? 30;
  const statusColor = profile.status === "expired" ? "var(--red)" : profile.status === "expiring" ? "var(--yellow)" : "var(--green)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="animate-fade-in">

      {/* ── Row 1: Membership card + Ring ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.25rem", alignItems: "stretch" }}>

        {/* Main membership card */}
        <div style={{
          background: profile.status === "expired" ? "var(--sidebar-bg)" : "#EAF0FF",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span className={`badge badge-${profile.status}`} style={{ marginBottom: "0.625rem", display: "inline-flex" }}>
                {profile.status.toUpperCase()}
              </span>
              <div style={{
                fontSize: "1.75rem", fontWeight: 900, lineHeight: 1.15,
                color: profile.status === "expired" ? "#fff" : "var(--text-primary)",
              }}>
                {profile.plan?.name ?? "No Active Plan"}
              </div>
              <div style={{ fontSize: "0.8rem", color: profile.status === "expired" ? "rgba(255,255,255,0.5)" : "var(--text-secondary)", marginTop: "0.25rem" }}>
                {profile.gym.name}
              </div>
            </div>
            <button style={{ border: "none", background: "none", cursor: "pointer", color: profile.status === "expired" ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}>
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Start Date",    value: formatDate(profile.startDate) },
              { label: "Expires",       value: formatDate(profile.endDate) },
              { label: "Plan Price",    value: profile.plan ? formatINR(profile.plan.price) : "—" },
              { label: "Monthly Visits", value: `${profile.thisMonthAttendance}` },
            ].map(item => (
              <div key={item.label} style={{
                background: profile.status === "expired" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
                borderRadius: 10, padding: "0.75rem",
              }}>
                <div style={{
                  fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                  color: profile.status === "expired" ? "rgba(255,255,255,0.35)" : "var(--text-muted)",
                  marginBottom: "0.2rem",
                }}>{item.label}</div>
                <div style={{
                  fontWeight: 800, fontSize: "0.9rem",
                  color: profile.status === "expired" ? "#fff" : "var(--text-primary)",
                }}>{item.value}</div>
              </div>
            ))}
          </div>

          {profile.status !== "active" && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: `${statusColor}20`, border: `1px solid ${statusColor}40`,
              borderRadius: 10, padding: "0.625rem 0.875rem",
              color: statusColor, fontSize: "0.82rem", fontWeight: 600,
            }}>
              <Phone size={13} />
              {profile.status === "expired" ? "Expired — Contact gym: " : "Expiring soon! Call: "}{profile.gym.phone}
            </div>
          )}
        </div>

        {/* Progress Ring card */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.5rem",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "0.5rem",
          minWidth: 220,
        }}>
          <ProgressRing days={profile.daysRemaining} total={totalDays} status={profile.status} />
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>
            of {totalDays}-day plan
          </div>
        </div>
      </div>

      {/* ── Row 2: Visit Sparkline + Days Card + Promo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: "1.25rem" }}>

        {/* Visits card with sparkline */}
        <div style={{
          background: "var(--pastel-green)", borderRadius: "var(--radius-card)",
          padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                {profile.thisMonthAttendance}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.2rem" }}>
                gym visits this month
              </div>
            </div>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700, color: "var(--green)",
              background: "rgba(16,185,129,0.12)", padding: "0.2rem 0.5rem", borderRadius: 999,
              alignSelf: "flex-start",
            }}>
              <TrendingUp size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
              Active
            </span>
          </div>
          <MiniSparkline color="#059669" />
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Attendance</div>
        </div>

        {/* Days remaining card */}
        <div style={{
          background: "var(--pastel-purple)", borderRadius: "var(--radius-card)",
          padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                {profile.daysRemaining}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.2rem" }}>
                days remaining
              </div>
            </div>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700,
              color: profile.status === "active" ? "var(--green)" : "var(--yellow)",
              background: profile.status === "active" ? "var(--green-bg)" : "var(--yellow-bg)",
              padding: "0.2rem 0.5rem", borderRadius: 999, alignSelf: "flex-start",
            }}>
              {profile.status === "active" ? "+0.27%" : "Renew"}
            </span>
          </div>
          <MiniSparkline color="#7C3AED" />
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Membership</div>
        </div>

        {/* Dark promo / announcements card */}
        <div style={{
          background: "var(--sidebar-bg)", borderRadius: "var(--radius-card)",
          padding: "1.5rem", color: "#fff",
          display: "flex", flexDirection: "column", gap: "0.875rem",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -30, bottom: -30,
            width: 130, height: 130, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.06)",
          }} />
          <div style={{
            position: "absolute", right: 0, bottom: 0,
            width: 75, height: 75, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.06)",
          }} />

          {announcements.length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Megaphone size={14} color="var(--gold)" />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Announcements
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, position: "relative", zIndex: 2 }}>
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} style={{
                    background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "0.75rem",
                    borderLeft: "2px solid var(--gold)",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.2rem" }}>{a.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{a.body}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <Zap size={12} color="var(--gold)" fill="var(--gold)" />
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Stay Consistent
                </span>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.3, position: "relative", zIndex: 2 }}>
                Every rep<br />counts! 💪
              </h3>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", position: "relative", zIndex: 2 }}>
                Keep showing up and track your progress right here.
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
