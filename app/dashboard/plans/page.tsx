"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit2, Trash2, Check, X, Package } from "lucide-react";
import { formatINR } from "@/app/_lib/utils";

type Plan = { id: string; name: string; durationDays: number; price: number; features: string; isActive: boolean; _count: { members: number } };
const BLANK = { name: "", durationDays: 30, price: 1500, features: "", isActive: true };

const PLAN_COLORS = [
  { bg: "#EDE9FF", accent: "#7C3AED" },
  { bg: "#E6F4EA", accent: "#059669" },
  { bg: "#FDF6E3", accent: "#b45309" },
  { bg: "#E0EEFF", accent: "#2563EB" },
  { bg: "#FDEAEA", accent: "#dc2626" },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/owner/plans");
    setPlans((await res.json()).data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const features = form.features.split("\n").map(s => s.trim()).filter(Boolean);
    const body = { ...form, features };
    if (editing) {
      await fetch(`/api/owner/plans/${editing}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setEditing(null);
    } else {
      await fetch("/api/owner/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setShowNew(false);
    }
    setForm(BLANK); setSaving(false); load();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/owner/plans/${id}`, { method: "DELETE" }); load();
  };

  const startEdit = (p: Plan) => {
    setEditing(p.id);
    setForm({ name: p.name, durationDays: p.durationDays, price: p.price, features: JSON.parse(p.features || "[]").join("\n"), isActive: p.isActive });
    setShowNew(false);
  };

  const PlanForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={save} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group"><label className="label">Plan Name *</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="form-group"><label className="label">Price (₹) *</label>
          <input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
        </div>
      </div>
      <div className="form-group"><label className="label">Duration (Days) *</label>
        <input className="input" type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: Number(e.target.value) }))} required />
      </div>
      <div className="form-group"><label className="label">Features (one per line)</label>
        <textarea className="input" rows={4} value={form.features}
          onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
          placeholder={"Full Gym Access\nLocker Room\nFree WiFi"} style={{ resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn btn-ink btn-sm" disabled={saving}>
          {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />} Save Plan
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
            Pricing
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>Membership Plans</div>
        </div>
        <button className="btn btn-ink btn-sm" onClick={() => { setShowNew(true); setEditing(null); }}>
          <Plus size={13} /> New Plan
        </button>
      </div>

      {/* ── New plan inline form ── */}
      {showNew && (
        <div style={{ background: "#fff", border: "1.5px solid var(--gold)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "0.95rem" }}>New Plan</div>
          <PlanForm onCancel={() => { setShowNew(false); setForm(BLANK); }} />
        </div>
      )}

      {/* ── Plans grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Loader2 size={28} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : plans.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "4rem", textAlign: "center" }}>
          <Package size={40} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No plans yet</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Create your first membership plan to get started.</div>
          <button className="btn btn-ink btn-sm" onClick={() => setShowNew(true)}><Plus size={13} /> Create Plan</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {plans.map((p, idx) => {
            const features: string[] = JSON.parse(p.features || "[]");
            const c = PLAN_COLORS[idx % PLAN_COLORS.length];
            const isEditing = editing === p.id;
            return (
              <div key={p.id} style={{
                background: isEditing ? "#fff" : c.bg,
                border: `1.5px solid ${isEditing ? c.accent : "transparent"}`,
                borderRadius: 16, padding: "1.5rem",
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
                onMouseEnter={e => { if (!isEditing) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {isEditing ? (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "0.95rem" }}>Edit Plan</div>
                    <PlanForm onCancel={() => { setEditing(null); setForm(BLANK); }} />
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "rgba(255,255,255,0.7)", display: "flex",
                        alignItems: "center", justifyContent: "center", color: c.accent,
                      }}>
                        <Package size={18} />
                      </div>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => startEdit(p)}><Edit2 size={13} /></button>
                        <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--red)" }} onClick={() => deletePlan(p.id)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.2rem", color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: c.accent, lineHeight: 1.1, marginBottom: "0.25rem" }}>
                      {formatINR(p.price)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 500 }}>
                      {p.durationDays} days · {p._count.members} members
                    </div>
                    <div style={{ height: 1, background: "rgba(0,0,0,0.08)", marginBottom: "1rem" }} />
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {features.map(f => (
                        <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                          <Check size={13} color={c.accent} style={{ flexShrink: 0, marginTop: 2 }} />{f}
                        </li>
                      ))}
                      {features.length === 0 && (
                        <li style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No features listed.</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
