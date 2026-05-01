"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Building2, KeyRound, Megaphone } from "lucide-react";

type Gym = { id: string; name: string; tagline?: string; address?: string; phone?: string; email?: string; logoUrl?: string; ownerName: string; ownerEmail: string };
type Announcement = { id: string; title: string; body: string; createdAt: string };

export default function SettingsPage() {
  const [gym, setGym] = useState<Gym | null>(null);
  const [gymForm, setGymForm] = useState<Partial<Gym>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnn, setNewAnn] = useState({ title: "", body: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    const [gr, ar] = await Promise.all([fetch("/api/owner/gym"), fetch("/api/owner/announcements")]);
    const [gd, ad] = await Promise.all([gr.json(), ar.json()]);
    setGym(gd.data); setGymForm(gd.data ?? {}); setAnnouncements(ad.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000);
  };

  const saveGym = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving("gym");
    const res = await fetch("/api/owner/gym", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gymForm) });
    if (res.ok) showMsg("ok", "Gym info saved!"); else showMsg("err", "Failed to save.");
    setSaving(null);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { showMsg("err", "Passwords do not match"); return; }
    setSaving("pw");
    const res = await fetch("/api/owner/gym", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) });
    const json = await res.json();
    if (res.ok) { showMsg("ok", "Password changed!"); setPwForm({ currentPassword: "", newPassword: "", confirm: "" }); }
    else showMsg("err", json.error ?? "Failed");
    setSaving(null);
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving("ann");
    await fetch("/api/owner/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAnn) });
    setNewAnn({ title: "", body: "" }); load(); setSaving(null);
  };

  const deleteAnn = async (id: string) => {
    await fetch(`/api/owner/announcements/${id}`, { method: "DELETE" }); load();
  };

  if (!gym) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={28} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-outer)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
          {icon}
        </div>
        <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{title}</div>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 720 }} className="animate-fade-in">

      {msg && (
        <div style={{
          padding: "0.75rem 1rem", borderRadius: 10,
          background: msg.type === "ok" ? "var(--green-bg)" : "var(--red-bg)",
          color: msg.type === "ok" ? "var(--green)" : "var(--red)",
          border: `1px solid ${msg.type === "ok" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          fontSize: "0.875rem", fontWeight: 600,
        }}>{msg.text}</div>
      )}

      {/* Gym Info */}
      <SectionCard icon={<Building2 size={16} />} title="Gym Information">
        <form onSubmit={saveGym} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">Gym Name</label>
              <input className="input" value={gymForm.name ?? ""} onChange={e => setGymForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group"><label className="label">Owner Name</label>
              <input className="input" value={gymForm.ownerName ?? ""} onChange={e => setGymForm(f => ({ ...f, ownerName: e.target.value }))} />
            </div>
          </div>
          <div className="form-group"><label className="label">Tagline</label>
            <input className="input" value={gymForm.tagline ?? ""} onChange={e => setGymForm(f => ({ ...f, tagline: e.target.value }))} />
          </div>
          <div className="form-group"><label className="label">Address</label>
            <textarea className="input" rows={2} value={gymForm.address ?? ""} onChange={e => setGymForm(f => ({ ...f, address: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">Phone</label>
              <input className="input" value={gymForm.phone ?? ""} onChange={e => setGymForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group"><label className="label">Email</label>
              <input className="input" type="email" value={gymForm.email ?? ""} onChange={e => setGymForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-ink btn-sm" disabled={saving === "gym"}>
              {saving === "gym" && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              <Save size={13} /> Save Info
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard icon={<KeyRound size={16} />} title="Change Password">
        <form onSubmit={savePassword} style={{ display: "grid", gap: "1rem" }}>
          <div className="form-group"><label className="label">Current Password</label>
            <input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="label">New Password</label>
              <input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
            </div>
            <div className="form-group"><label className="label">Confirm</label>
              <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-ink btn-sm" disabled={saving === "pw"}>
              {saving === "pw" && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />} Update Password
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Announcements */}
      <SectionCard icon={<Megaphone size={16} />} title="Announcements">
        <form onSubmit={addAnnouncement} style={{ display: "grid", gap: "0.875rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <div className="form-group"><label className="label">Title</label>
            <input className="input" value={newAnn.title} onChange={e => setNewAnn(a => ({ ...a, title: e.target.value }))} required />
          </div>
          <div className="form-group"><label className="label">Message</label>
            <textarea className="input" rows={3} value={newAnn.body} onChange={e => setNewAnn(a => ({ ...a, body: e.target.value }))} style={{ resize: "vertical" }} required />
          </div>
          <div>
            <button type="submit" className="btn btn-ink btn-sm" disabled={saving === "ann"}>
              {saving === "ann" && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              <Plus size={13} /> Post Announcement
            </button>
          </div>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {announcements.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No announcements yet.</p>
          )}
          {announcements.map(a => (
            <div key={a.id} style={{
              background: "var(--bg-outer)", borderRadius: 10, padding: "0.875rem 1rem",
              display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start",
              border: "1px solid var(--border)",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{a.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem", lineHeight: 1.5 }}>{a.body}</div>
              </div>
              <button className="icon-btn" style={{ color: "var(--red)", flexShrink: 0 }} onClick={() => deleteAnn(a.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
