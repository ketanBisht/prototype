"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Clock, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/app/_lib/utils";

type Announcement = { id: string; title: string; body: string; createdAt: string };

export default function BroadcastsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [successMsg, setSuccessMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/owner/announcements");
    const data = await res.json();
    setAnnouncements(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setSuccessMsg("");
    try {
      await fetch("/api/owner/announcements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setForm({ title: "", body: "" });
      setSuccessMsg("Broadcast sent successfully! Members will see this in their portal.");
      setTimeout(() => setSuccessMsg(""), 5000);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this broadcast from the member portal?")) return;
    await fetch(`/api/owner/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid-cols-dashboard-mid animate-fade-in" style={{ maxWidth: 1100 }}>
      
      {/* ── Left: Composer ── */}
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={20} color="var(--gold-dark)" /> New Broadcast
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Send an update to all active members. It will appear on their dashboard.
          </p>
        </div>

        <div style={{ background: "#fff", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          {successMsg && (
            <div style={{ background: "var(--green-bg)", color: "var(--green)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="label">Subject / Title</label>
              <input className="input" placeholder="e.g., Gym closed for maintenance on Sunday" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Message Body</label>
              <textarea className="input" rows={6} placeholder="Write your message here..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ resize: "vertical" }} required />
            </div>
            
            <button type="submit" disabled={sending} style={{
              background: "var(--sidebar-bg)", color: "#fff", border: "none",
              padding: "1rem", borderRadius: "12px", fontWeight: 800, fontSize: "0.95rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1,
              marginTop: "0.5rem"
            }}>
              {sending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
              {sending ? "Sending..." : "Send Broadcast"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right: History ── */}
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={18} color="var(--text-muted)" /> Broadcast History
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}><Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : announcements.length === 0 ? (
          <div style={{ background: "var(--bg-outer)", padding: "3rem", borderRadius: "20px", border: "1px dashed var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No broadcasts sent yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {announcements.map(a => (
              <div key={a.id} style={{
                background: "#fff", padding: "1.5rem", borderRadius: "16px",
                border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>{a.title}</div>
                  <button className="icon-btn" style={{ color: "var(--red)", marginTop: "-4px", marginRight: "-4px" }} onClick={() => handleDelete(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{a.body}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.5rem" }}>
                  Sent on {formatDate(a.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
