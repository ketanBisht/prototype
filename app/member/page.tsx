"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Phone, Activity, CreditCard, Clock, Star, Scale, Bell, ChevronRight } from "lucide-react";
import { formatDate, formatINR } from "@/app/_lib/utils";

type Trainer = { id: string; name: string; specialty: string | null };
type Payment = { id: string; amount: number; paidAt: string; method: string };

type ProfileData = {
  id: string; name: string; phone: string; email?: string;
  weight?: number; height?: number;
  startDate: string; endDate: string; isActive: boolean;
  daysRemaining: number; status: "active" | "expiring" | "expired";
  plan: { name: string; durationDays: number; price: number } | null;
  gym: { name: string; phone: string; address: string };
  trainers: Trainer[];
  payments: Payment[];
};

type Announcement = { id: string; title: string; body: string; createdAt: string };

export default function MemberHomePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/member/profile"), fetch("/api/member/announcements")])
      .then(([pr, ar]) => Promise.all([pr.json(), ar.json()]))
      .then(([pd, ad]) => { setProfile(pd.data); setAnnouncements(ad.data ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={32} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!profile) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Could not load profile.</div>;

  const totalDays = profile.plan?.durationDays ?? 30;
  const pct = totalDays > 0 ? Math.min(100, Math.round((profile.daysRemaining / totalDays) * 100)) : 0;
  const statusColor = profile.status === "expired" ? "var(--red)" : profile.status === "expiring" ? "#f59e0b" : "var(--green)";
  const statusBg = profile.status === "expired" ? "#fee2e2" : profile.status === "expiring" ? "#fef3c7" : "#dcfce7";

  let bmi = 0;
  if (profile.weight && profile.height) {
    const h = profile.height / 100;
    bmi = Number((profile.weight / (h * h)).toFixed(1));
  }
  const bmiStatus = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 18.5 ? "#3b82f6" : bmi < 25 ? "#10b981" : bmi < 30 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">

      {/* ── TOP: Membership Hero Card ── */}
      <div style={{
        background: profile.status === "expired" ? "#18181F" : "linear-gradient(135deg, #1C1C2E 0%, #2D2D5F 100%)",
        borderRadius: "var(--radius-card)", padding: "2rem",
        display: "flex", flexDirection: "column", gap: "1.5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: -20, top: -20, width: 140, height: 140, borderRadius: "50%", border: "1.5px solid rgba(200,169,110,0.12)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2, flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{
              display: "inline-block", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 999,
              background: statusBg, color: statusColor, marginBottom: "0.75rem",
            }}>
              {profile.status}
            </span>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
              {profile.plan?.name ?? "No Active Plan"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginTop: "0.3rem" }}>
              {profile.gym.name}
            </div>
          </div>

          {/* Progress bar pill */}
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "1rem 1.25rem", minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>Plan Progress</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 900, color: statusColor }}>{profile.daysRemaining}d</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 999, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: statusColor, borderRadius: 999, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "0.35rem" }}>
              {pct}% of {totalDays}-day plan remaining
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid-cols-member-mid" style={{ position: "relative", zIndex: 2 }}>
          {[
            { label: "Start Date", value: formatDate(profile.startDate) },
            { label: "Expires", value: formatDate(profile.endDate) },
            { label: "Plan Price", value: profile.plan ? formatINR(profile.plan.price) : "—" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "0.875rem" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", marginBottom: "0.25rem" }}>{item.label}</div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MIDDLE: Vitals + Payments + Hours ── */}
      <div className="grid-cols-member-mid">

        {/* Body Vitals */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Activity size={16} color="var(--blue)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>Body Vitals</span>
          </div>
          {profile.weight && profile.height ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
              <div className="grid-cols-2">
                <div style={{ background: "var(--bg-outer)", padding: "0.75rem", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>{profile.weight}<span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>kg</span></div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Weight</div>
                </div>
                <div style={{ background: "var(--bg-outer)", padding: "0.75rem", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>{profile.height}<span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>cm</span></div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Height</div>
                </div>
              </div>
              <div style={{ background: "#EFF6FF", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>BMI</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1d4ed8", lineHeight: 1 }}>{bmi}</div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", background: bmiColor, padding: "0.25rem 0.7rem", borderRadius: 999 }}>{bmiStatus}</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "0.5rem" }}>
              <Scale size={24} color="#d1d5db" />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Ask your gym owner to log<br />your weight and height.</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <CreditCard size={16} color="var(--green)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>Recent Payments</span>
          </div>
          {profile.payments.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>No payments recorded.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {profile.payments.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid var(--bg-outer)" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{formatINR(p.amount)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{formatDate(p.paidAt)}</div>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: 6, background: "var(--bg-outer)", color: "var(--text-secondary)" }}>
                    {p.method}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gym Hours */}
        <div style={{ background: "var(--sidebar-bg)", borderRadius: "var(--radius-card)", padding: "1.5rem", color: "#fff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, bottom: -30, width: 130, height: 130, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", position: "relative", zIndex: 2 }}>
            <Clock size={16} color="var(--gold)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>Gym Hours</span>
          </div>
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Mon – Sat</span>
              <span style={{ fontWeight: 600 }}>6:00 AM – 10:00 PM</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Sunday</span>
              <span style={{ fontWeight: 600 }}>8:00 AM – 1:00 PM</span>
            </div>
          </div>
          <div style={{ marginTop: "auto", position: "relative", zIndex: 2, paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.25rem" }}>Support</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
              <Phone size={14} /> {profile.gym.phone}
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM: Trainers + Announcements ── */}
      <div className="grid-cols-member-bot">

        {/* Trainers */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Star size={16} color="var(--gold-dark)" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Our Trainers</span>
          </div>
          {profile.trainers.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", background: "var(--bg-outer)", borderRadius: 12 }}>
              No active trainers listed.
            </div>
          ) : (
            <div className="grid-cols-2">
              {profile.trainers.map((t, idx) => {
                const colors = ["#EAF0FF", "#FDF6E3", "#E6F4EA", "#F3E8FF"];
                const textColors = ["#2563EB", "#D97706", "#059669", "#7C3AED"];
                const cIdx = idx % colors.length;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem", border: "1px solid var(--border)", borderRadius: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: colors[cIdx], color: textColors[cIdx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800, flexShrink: 0 }}>
                      {t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{t.specialty || "General Trainer"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements — redesigned as a notification feed */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.625rem", background: "#18181F" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(200,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={15} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#fff" }}>Announcements</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                {announcements.length} update{announcements.length !== 1 ? "s" : ""} from your gym
              </div>
            </div>
            {announcements.length > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--gold)", color: "#1c1c1e", fontSize: "0.6rem", fontWeight: 900, padding: "0.15rem 0.5rem", borderRadius: 999 }}>
                {announcements.length} NEW
              </span>
            )}
          </div>

          {/* Feed */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 340 }} className="custom-scroll">
            {announcements.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem", gap: "0.75rem", color: "var(--text-muted)" }}>
                <Megaphone size={28} strokeWidth={1.5} />
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>No announcements yet</div>
                <div style={{ fontSize: "0.75rem", textAlign: "center", lineHeight: 1.5 }}>Your gym owner will post updates here</div>
              </div>
            ) : announcements.map((a, idx) => (
              <div
                key={a.id}
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                style={{
                  padding: "1rem 1.5rem", borderBottom: "1px solid var(--bg-outer)",
                  cursor: "pointer", transition: "background 0.12s",
                  background: expandedId === a.id ? "#fafafa" : "#fff",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = expandedId === a.id ? "#fafafa" : "#fff")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: "var(--gold)",
                    flexShrink: 0, marginTop: "0.35rem",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{a.title}</div>
                      <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, transition: "transform 0.2s", transform: expandedId === a.id ? "rotate(90deg)" : "none" }} />
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {formatDate(a.createdAt)}
                    </div>
                    {expandedId === a.id && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid var(--bg-outer)" }}>
                        {a.body}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}
