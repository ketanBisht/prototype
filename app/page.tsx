"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Dumbbell, Users, Award, TrendingUp, Check,
  Star, MapPin, Phone, Mail, Clock, ArrowUpRight, ChevronRight,
} from "lucide-react";

type Plan = { id: string; name: string; durationDays: number; price: number; features: string };

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => { cur += step; if (cur >= target) { setN(target); clearInterval(t); } else setN(cur); }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

const PLAN_COLORS = [
  { bg: "#EDE9FF", accent: "#7C3AED", text: "var(--text-primary)" },
  { bg: "#1A1A2E", accent: "#C8A96E", text: "#fff" },
  { bg: "#E6F4EA", accent: "#059669", text: "var(--text-primary)" },
];

const testimonials = [
  { name: "Arjun Sharma", role: "Lost 18 kg", text: "Iron Paradise completely transformed my lifestyle. The trainers are world-class and the results speak for themselves.", rating: 5 },
  { name: "Priya Patel", role: "Marathon Runner", text: "Best gym in Mumbai. The equipment and energy here are unmatched. I PR'd my marathon this year!", rating: 5 },
  { name: "Karan Mehta", role: "Powerlifter", text: "Serious equipment, serious people. This is where champions train.", rating: 5 },
];

const features = [
  { icon: <Dumbbell size={20} />, title: "Premium Equipment", desc: "5,000+ sq. ft. of state-of-the-art iron — barbells, cables, machines.", bg: "#EDE9FF", accent: "#7C3AED" },
  { icon: <Users size={20} />, title: "350+ Members", desc: "A growing community of motivated athletes and fitness enthusiasts.", bg: "#E6F4EA", accent: "#059669" },
  { icon: <Award size={20} />, title: "Expert Trainers", desc: "NASM & ACE certified coaches with 5+ years of experience each.", bg: "#FDF6E3", accent: "#b45309" },
  { icon: <TrendingUp size={20} />, title: "120+ Results", desc: "From first-timers to competitive athletes — real, lasting transformations.", bg: "#E0EEFF", accent: "#2563EB" },
];

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    fetch("/api/public/plans").then(r => r.json()).then(d => setPlans(d.data ?? [])).catch(() => {});
  }, []);

  return (
    <div style={{ background: "var(--bg-outer)", color: "var(--text-primary)", fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--sidebar-bg)", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, background: "var(--gold)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={17} color="#1A1A2E" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Iron Paradise</span>
        </Link>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Plans", "About", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.83rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/login?role=member" style={{
            fontSize: "0.8rem", fontWeight: 600, padding: "0.4rem 0.875rem",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999,
            color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "all 0.18s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}>
            Member Login
          </Link>
          <Link href="/login?role=owner" style={{
            fontSize: "0.8rem", fontWeight: 700, padding: "0.4rem 0.875rem",
            background: "var(--gold)", borderRadius: 999, color: "#1A1A2E",
            textDecoration: "none", transition: "all 0.18s",
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--gold-light)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--gold)")}>
            Owner Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 60, minHeight: "100vh", display: "flex", alignItems: "center", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>

          {/* Left text */}
          <div className="animate-fade-in">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "#FDF6E3", border: "1px solid #fde68a", borderRadius: 999,
              padding: "0.3rem 0.875rem", fontSize: "0.72rem", fontWeight: 700,
              color: "#b45309", marginBottom: "1.5rem", letterSpacing: "0.04em",
            }}>
              🏆 Mumbai's Premier Fitness Destination
            </div>
            <h1 style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
              Train.<br />
              <span style={{ color: "var(--gold-dark)" }}>Transform.</span><br />
              Triumph.
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: 380, lineHeight: 1.75 }}>
              State-of-the-art equipment, expert coaching, and a community built for people who refuse to settle.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <a href="#plans" style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "var(--text-primary)", color: "#fff",
                fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem 1.5rem",
                borderRadius: 999, textDecoration: "none", transition: "all 0.18s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#2d2d40")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--text-primary)")}>
                View Plans <ArrowUpRight size={15} />
              </a>
              <a href="#contact" style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "var(--bg-outer)", color: "var(--text-primary)",
                fontWeight: 600, fontSize: "0.875rem", padding: "0.75rem 1.5rem",
                borderRadius: 999, textDecoration: "none", border: "1px solid var(--border)",
                transition: "all 0.18s",
              }}>
                Visit Us <ChevronRight size={15} />
              </a>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              {[{ n: 350, s: "+", label: "Members" }, { n: 8, s: "yr", label: "Experience" }, { n: 5000, s: "+", label: "Sq. Ft." }].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 900, lineHeight: 1, color: "var(--text-primary)" }}>
                    <Counter target={item.n} suffix={item.s} />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.2rem" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: feature cards bento */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }} className="animate-fade-in">
            {features.map((f, i) => (
              <div key={f.title} style={{
                background: f.bg, borderRadius: 16, padding: "1.5rem",
                gridColumn: i === 0 ? "span 2" : "span 1",
                transition: "transform 0.18s",
                display: "flex", flexDirection: i === 0 ? "row" : "column",
                gap: "1rem", alignItems: i === 0 ? "center" : "flex-start",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: f.accent, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{f.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{f.desc}</div>
                </div>
              </div>
            ))}
            {/* Rating card */}
            <div style={{ background: "var(--sidebar-bg)", borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--gold)", lineHeight: 1 }}>4.9★</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>120+ reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: "var(--sidebar-bg)", overflow: "hidden", padding: "0.875rem 0" }}>
        <div style={{ display: "flex", gap: "3rem", animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
          {Array(3).fill(["STRENGTH TRAINING", "CARDIO", "PERSONAL TRAINING", "GROUP FITNESS", "NUTRITION COACHING", "OPEN 7 DAYS"]).flat().map((t, i) => (
            <span key={i} style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {t} <span style={{ color: "var(--gold)", marginLeft: "0.75rem" }}>★</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PLANS ── */}
      <section id="plans" style={{ background: "var(--bg-outer)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-dark)", marginBottom: "0.75rem" }}>Transparent Pricing</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "var(--text-primary)" }}>
              Choose your plan
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {plans.length === 0
              ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />)
              : plans.map((plan, idx) => {
                  const features: string[] = JSON.parse(plan.features || "[]");
                  const isPopular = idx === 1 || plans.length === 1;
                  const c = PLAN_COLORS[idx % PLAN_COLORS.length];
                  return (
                    <div key={plan.id} style={{
                      background: c.bg, borderRadius: 16, padding: "2rem",
                      position: "relative", transition: "transform 0.18s",
                      border: isPopular ? "2px solid var(--gold)" : "1px solid transparent",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                      {isPopular && (
                        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#1A1A2E", fontSize: "0.65rem", fontWeight: 800, padding: "0.2rem 0.75rem", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          Most Popular
                        </div>
                      )}
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: c.accent, marginBottom: "0.625rem" }}>{plan.name}</div>
                      <div style={{ fontSize: "2.5rem", fontWeight: 900, color: c.text === "#fff" ? "#fff" : "var(--text-primary)", lineHeight: 1, marginBottom: "0.25rem" }}>
                        ₹{plan.price.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: c.text === "#fff" ? "rgba(255,255,255,0.45)" : "var(--text-muted)", marginBottom: "1.5rem" }}>per {plan.durationDays} days</div>
                      <div style={{ height: 1, background: c.text === "#fff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", marginBottom: "1.25rem" }} />
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.75rem" }}>
                        {features.map(f => (
                          <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.83rem", color: c.text === "#fff" ? "rgba(255,255,255,0.7)" : "var(--text-primary)", alignItems: "center" }}>
                            <Check size={13} color={c.accent} style={{ flexShrink: 0 }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <a href="#contact" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: c.text === "#fff" ? "var(--gold)" : "var(--text-primary)",
                        color: c.text === "#fff" ? "#1A1A2E" : "#fff",
                        fontWeight: 700, fontSize: "0.83rem", padding: "0.65rem",
                        borderRadius: 999, textDecoration: "none", transition: "opacity 0.18s",
                      }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}>
                        Join Now
                      </a>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="about" style={{ background: "#fff", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-dark)", marginBottom: "0.75rem" }}>Real Results</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900 }}>Stories that inspire</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {testimonials.map((t, i) => (
              <div key={t.name} style={{
                background: i === 1 ? "var(--sidebar-bg)" : "var(--bg-outer)",
                border: `1px solid ${i === 1 ? "transparent" : "var(--border)"}`,
                borderRadius: 16, padding: "1.75rem",
                transition: "transform 0.18s",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} fill={i === 1 ? "var(--gold)" : "var(--text-primary)"} color={i === 1 ? "var(--gold)" : "var(--text-primary)"} />
                  ))}
                </div>
                <p style={{ color: i === 1 ? "rgba(255,255,255,0.6)" : "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ fontWeight: 800, color: i === 1 ? "#fff" : "var(--text-primary)", fontSize: "0.875rem" }}>{t.name}</div>
                <div style={{ color: "var(--gold-dark)", fontSize: "0.75rem", marginTop: "0.125rem" }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "var(--bg-outer)", borderTop: "1px solid var(--border)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-dark)", marginBottom: "0.75rem" }}>Find Us</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900 }}>Visit us anytime</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", display: "grid", gap: "1.25rem" }}>
            {[
              { icon: <MapPin size={16} />, label: "Address", value: "12, Fitness Nagar, Andheri West, Mumbai — 400053" },
              { icon: <Phone size={16} />, label: "Phone", value: "+91 98765 43210" },
              { icon: <Mail size={16} />, label: "Email", value: "ironparadise@gym.in" },
              { icon: <Clock size={16} />, label: "Hours", value: "Mon–Sat: 5:00 AM – 10:00 PM  ·  Sun: 6:00 AM – 6:00 PM" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FDF6E3", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark)", flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--sidebar-bg)", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
          <div style={{ width: 28, height: 28, background: "var(--gold)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={14} color="#1A1A2E" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.875rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Iron Paradise Gym</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>© 2024 Iron Paradise Gym. Powered by Jacked.</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          {[{ href: "#plans", label: "Plans" }, { href: "/login?role=member", label: "Member Login" }, { href: "/login?role=owner", label: "Owner Login" }].map(l => (
            <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "0.78rem", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
              {l.label}
            </Link>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
