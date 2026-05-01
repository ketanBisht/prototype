"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  Search, Plus, Download, Edit2, Trash2,
  Loader2, X, Star, ChevronDown, Users,
} from "lucide-react";
import { formatDate, daysRemaining, membershipStatus } from "@/app/_lib/utils";

type Member = {
  id: string; name: string; phone: string; email?: string;
  endDate: string; startDate: string; isActive: boolean;
  plan: { id: string; name: string; price: number } | null;
  _count: { attendance: number; payments: number };
};
type Plan = { id: string; name: string; durationDays: number; price: number };

/* ── Member icon (dark square like coin rows) ── */
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

/* ── Add Member Modal ── */
function AddMemberModal({ plans, onClose, onAdded }: { plans: Plan[]; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", planId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "", pin: "1234", weight: "", height: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePlanDates = (planId: string, startStr: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || !startStr) return;
    const end = new Date(startStr);
    end.setDate(end.getDate() + plan.durationDays);
    setForm(f => ({ ...f, planId, endDate: end.toISOString().split("T")[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/owner/members", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          weight: form.weight ? Number(form.weight) : undefined,
          height: form.height ? Number(form.height) : undefined,
          planId: form.planId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      onAdded(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Add New Member</h2>
          <button onClick={onClose} className="icon-btn"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group"><label className="label">Phone *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group"><label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group"><label className="label">Membership Plan</label>
            <select className="input" value={form.planId} onChange={e => updatePlanDates(e.target.value, form.startDate)}>
              <option value="">No Plan</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} / {p.durationDays}d</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">Start Date *</label>
              <input className="input" type="date" value={form.startDate}
                onChange={e => { setForm(f => ({ ...f, startDate: e.target.value })); updatePlanDates(form.planId, e.target.value); }} required />
            </div>
            <div className="form-group"><label className="label">End Date *</label>
              <input className="input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">Weight (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="form-group"><label className="label">Height (cm)</label>
              <input className="input" type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
            <div className="form-group"><label className="label">Member PIN *</label>
              <input className="input" type="text" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.slice(0, 4) }))} maxLength={4} pattern="\d{4}" required />
            </div>
          </div>
          <div className="form-group"><label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
          {error && <div style={{ color: "var(--red)", fontSize: "0.8rem", background: "var(--red-bg)", padding: "0.5rem 0.75rem", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-cream btn-sm">Cancel</button>
            <button type="submit" className="btn btn-ink btn-sm" disabled={loading}>
              {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              Add Member
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

function MembersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [showModal, setShowModal] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const [mr, pr] = await Promise.all([fetch(`/api/owner/members?${params}`), fetch("/api/owner/plans")]);
    const [md, pd] = await Promise.all([mr.json(), pr.json()]);
    setMembers(md.data ?? []); setPlans(pd.data ?? []); setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/owner/members/${id}`, { method: "DELETE" }); load();
  };

  const exportCSV = () => {
    const header = "Name,Phone,Email,Plan,Start Date,End Date,Days Left,Status";
    const rows = members.map(m => {
      const days = daysRemaining(m.endDate); const status = membershipStatus(m.endDate);
      return `"${m.name}","${m.phone}","${m.email ?? ""}","${m.plan?.name ?? ""}","${formatDate(m.startDate)}","${formatDate(m.endDate)}","${days}","${status}"`;
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "members.csv"; a.click();
  };

  const statusColors: Record<string, { color: string; bg: string }> = {
    active:   { color: "#16a34a", bg: "#dcfce7" },
    expiring: { color: "#d97706", bg: "#fef3c7" },
    expired:  { color: "#dc2626", bg: "#fee2e2" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">
      {showModal && <AddMemberModal plans={plans} onClose={() => setShowModal(false)} onAdded={load} />}

      {/* ── Stat row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem" }}>
        {[
          { label: "Total Members", value: members.length, bg: "#EDE9FF", color: "#7C3AED" },
          { label: "Active", value: members.filter(m => membershipStatus(m.endDate) === "active").length, bg: "#E6F4EA", color: "#059669" },
          { label: "Expiring Soon", value: members.filter(m => membershipStatus(m.endDate) === "expiring").length, bg: "#FDF6E3", color: "#b45309" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters + Actions bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input id="member-search" className="input" style={{ paddingLeft: "2.25rem" }}
            placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "0.25rem",
          fontSize: "0.75rem", fontWeight: 600, padding: "0.5rem 0.75rem",
          border: "1px solid var(--border)", borderRadius: 999,
          background: "var(--bg-outer)", color: "var(--text-primary)", cursor: "pointer",
        }} onClick={() => setStatusFilter(statusFilter === "active" ? "" : statusFilter === "expiring" ? "expired" : statusFilter === "expired" ? "" : "active")}>
          {statusFilter || "All Status"} <ChevronDown size={12} />
        </button>
        {(search || statusFilter) && (
          <button className="icon-btn" onClick={() => { setSearch(""); setStatusFilter(""); }}><X size={14} /></button>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn btn-cream btn-sm" onClick={exportCSV}><Download size={13} /> Export</button>
        <button id="add-member-btn" className="btn btn-ink btn-sm" onClick={() => setShowModal(true)}><Plus size={13} /> Add Member</button>
      </div>

      {/* ── Market-style list ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
          padding: "0.6rem 1.25rem", borderBottom: "1px solid var(--border)",
          background: "var(--bg-outer)",
        }}>
          {["Member", "Plan", "Start", "Expires", "Status", "Actions"].map(h => (
            <div key={h} style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No members found.{" "}
            <button className="btn btn-ink btn-sm" onClick={() => setShowModal(true)} style={{ marginLeft: "0.5rem" }}>
              <Users size={13} /> Add first member
            </button>
          </div>
        ) : members.map((m, idx) => {
          const days = daysRemaining(m.endDate);
          const status = membershipStatus(m.endDate);
          const sc = statusColors[status] ?? statusColors.active;
          return (
            <div key={m.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)",
                alignItems: "center", transition: "background 0.12s", cursor: "default",
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
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{m.plan?.name ?? "—"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{formatDate(m.startDate)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{formatDate(m.endDate)}</div>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: sc.color, background: sc.bg, padding: "0.18rem 0.55rem", borderRadius: 999 }}>
                  {days === 0 ? "Expired" : days > 0 ? `${days}d left` : status}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                <button className="icon-btn" style={{ width: 30, height: 30 }}
                  onClick={() => setStarred(s => { const n = new Set(s); n.has(m.id) ? n.delete(m.id) : n.add(m.id); return n; })}>
                  <Star size={13} fill={starred.has(m.id) ? "var(--gold)" : "none"} color={starred.has(m.id) ? "var(--gold)" : "var(--text-muted)"} />
                </button>
                <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => router.push(`/dashboard/members/${m.id}`)}>
                  <Edit2 size={13} />
                </button>
                <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--red)" }} onClick={() => handleDelete(m.id, m.name)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

export default function MembersPage() {
  return <Suspense><MembersContent /></Suspense>;
}
