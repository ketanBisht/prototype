"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Phone, MoreHorizontal, Activity, CreditCard, Clock, Star, Scale } from "lucide-react";
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

/* ── Progress Ring ── */
function ProgressRing({ days, total, status }: { days: number; total: number; status: string }) {
  const size = 160;
  const r = 68;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, days / total) : 0;
  const dash = pct * circ;
  const strokeColor = status === "expired" ? "var(--red)" : status === "expiring" ? "var(--yellow)" : "var(--green)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cream-darker)" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, color: strokeColor, lineHeight: 1 }}>{days}</div>
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.2rem" }}>days left</div>
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

  // Calculate BMI if height and weight exist
  let bmi = 0;
  if (profile.weight && profile.height) {
    const heightInMeters = profile.height / 100;
    bmi = Number((profile.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  const bmiStatus = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">

      {/* ── Top Row: Identity & Membership ── */}
      <div className="flex-row-desktop" style={{ alignItems: "stretch" }}>
        {/* Main card */}
        <div style={{
          background: profile.status === "expired" ? "var(--sidebar-bg)" : "#EAF0FF",
          borderRadius: "var(--radius-card)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span className={`badge badge-${profile.status}`} style={{ marginBottom: "0.625rem", display: "inline-flex" }}>
                {profile.status.toUpperCase()}
              </span>
              <div style={{ fontSize: "1.85rem", fontWeight: 900, lineHeight: 1.15, color: profile.status === "expired" ? "#fff" : "var(--text-primary)" }}>
                {profile.plan?.name ?? "No Active Plan"}
              </div>
              <div style={{ fontSize: "0.85rem", color: profile.status === "expired" ? "rgba(255,255,255,0.5)" : "var(--text-secondary)", marginTop: "0.25rem" }}>
                {profile.gym.name}
              </div>
            </div>
            <button style={{ border: "none", background: "none", cursor: "pointer", color: profile.status === "expired" ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}>
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="grid-cols-member-mid">
            {[
              { label: "Start Date", value: formatDate(profile.startDate) },
              { label: "Expires",    value: formatDate(profile.endDate) },
              { label: "Plan Price", value: profile.plan ? formatINR(profile.plan.price) : "—" },
            ].map(item => (
              <div key={item.label} style={{ background: profile.status === "expired" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)", borderRadius: 12, padding: "0.875rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: profile.status === "expired" ? "rgba(255,255,255,0.4)" : "var(--text-muted)", marginBottom: "0.25rem" }}>{item.label}</div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: profile.status === "expired" ? "#fff" : "var(--text-primary)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ring */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 220 }}>
          <ProgressRing days={profile.daysRemaining} total={totalDays} status={profile.status} />
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "center", marginTop: "1rem" }}>
            of {totalDays}-day plan
          </div>
        </div>
      </div>

      {/* ── Middle Row: Vitals, Payments, Gym Info ── */}
      <div className="grid-cols-member-mid">
        
        {/* Vitals Tracker */}
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
              <div style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current BMI</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--blue-dark)", lineHeight: 1 }}>{bmi}</div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", background: "var(--blue)", padding: "0.2rem 0.6rem", borderRadius: 999 }}>{bmiStatus}</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "0.5rem" }}>
              <Scale size={24} color="var(--border-dark)" />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Ask your gym owner to log<br/>your weight and height.</p>
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

        {/* Contact / Gym Schedule */}
        <div style={{ background: "var(--sidebar-bg)", borderRadius: "var(--radius-card)", padding: "1.5rem", color: "#fff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, bottom: -30, width: 130, height: 130, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", position: "relative", zIndex: 2 }}>
            <Clock size={16} color="var(--gold)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>Gym Hours</span>
          </div>
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Mon - Sat</span>
              <span style={{ fontWeight: 600 }}>6:00 AM - 10:00 PM</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Sunday</span>
              <span style={{ fontWeight: 600 }}>8:00 AM - 1:00 PM</span>
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

      {/* ── Bottom Row: Trainers & Announcements ── */}
      <div className="grid-cols-member-bot">
        
        {/* Trainers Directory */}
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
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: colors[cIdx], color: textColors[cIdx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800 }}>
                      {t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>{t.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{t.specialty || "General Trainer"}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Announcements Bulletin */}
        <div style={{ background: "var(--pastel-purple)", border: "1px solid rgba(124,58,237,0.1)", borderRadius: "var(--radius-card)", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Megaphone size={16} color="var(--purple)" />
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Notice Board</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", flex: 1, overflowY: "auto", maxHeight: 300, paddingRight: "0.5rem" }} className="custom-scroll">
            {announcements.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                No recent announcements.
              </div>
            ) : announcements.map(a => (
              <div key={a.id} style={{ background: "#fff", padding: "1rem", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{a.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{a.body}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.5rem", textTransform: "uppercase" }}>{formatDate(a.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
