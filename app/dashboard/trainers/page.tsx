"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Star } from "lucide-react";
import { formatINR } from "@/app/_lib/utils";

type Trainer = { id: string; name: string; phone: string; specialty?: string; salary?: number; isActive: boolean };

function TrainerModal({ trainer, onClose, onSaved }: { trainer?: Trainer | null, onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState(trainer ?? { name: "", phone: "", specialty: "", salary: "", isActive: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const url = trainer ? `/api/owner/trainers/${trainer.id}` : "/api/owner/trainers";
      const method = trainer ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, salary: form.salary ? Number(form.salary) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      onSaved(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{trainer ? "Edit Trainer" : "Add Trainer"}</h2>
          <button onClick={onClose} className="icon-btn"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div className="form-group"><label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group"><label className="label">Phone *</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
          </div>
          <div className="form-group"><label className="label">Specialty</label>
            <input className="input" placeholder="e.g. Zumba, Powerlifting" value={form.specialty || ""} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
          </div>
          <div className="form-group"><label className="label">Monthly Salary (₹)</label>
            <input className="input" type="number" value={form.salary || ""} onChange={e => setForm(f => ({ ...f, salary: e.target.value as any }))} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            Active Trainer
          </label>
          {error && <div style={{ color: "var(--red)", fontSize: "0.8rem", background: "var(--red-bg)", padding: "0.5rem", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-cream btn-sm">Cancel</button>
            <button type="submit" className="btn btn-ink btn-sm" disabled={loading}>
              {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />} Save Trainer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTrainer, setModalTrainer] = useState<Trainer | null | "new">(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/owner/trainers");
    const data = await res.json();
    setTrainers(data.data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete trainer "${name}"?`)) return;
    await fetch(`/api/owner/trainers/${id}`, { method: "DELETE" }); load();
  };

  const ICON_BG = ["#1A1A2E","#2D2D3F","#3D3D55","#252540","#1E1E30"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: 900 }} className="animate-fade-in">
      {modalTrainer && <TrainerModal trainer={modalTrainer === "new" ? null : modalTrainer} onClose={() => setModalTrainer(null)} onSaved={load} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Manage Trainers</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Add and organize your gym staff.</p>
        </div>
        <button className="btn btn-ink btn-sm" onClick={() => setModalTrainer("new")}><Plus size={13} /> Add Trainer</button>
      </div>

      <div className="table-wrapper" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflowX: "auto" }}>
        <div style={{ minWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "0.6rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-outer)" }}>
          {["Trainer", "Specialty", "Salary", "Status", "Actions"].map(h => (
            <div key={h} style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}><Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : trainers.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No trainers added yet.
          </div>
        ) : trainers.map((t, idx) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.12s" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-outer)")} onMouseLeave={e => (e.currentTarget.style.background = "")}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: ICON_BG[idx % ICON_BG.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800 }}>
                {t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.2 }}>{t.name}</div>
                <div style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: 1 }}>{t.phone}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>{t.specialty || "—"}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{t.salary ? formatINR(t.salary) : "—"}</div>
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: t.isActive ? "var(--green)" : "var(--text-muted)", background: t.isActive ? "var(--green-bg)" : "var(--bg-outer)", padding: "0.18rem 0.55rem", borderRadius: 999, border: `1px solid ${t.isActive ? "transparent" : "var(--border)"}` }}>
                {t.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setModalTrainer(t)}><Edit2 size={13} /></button>
              <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--red)" }} onClick={() => handleDelete(t.id, t.name)}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
