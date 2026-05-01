"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Check, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";

type TodayMember = { id: string; name: string; phone: string; present: boolean };
type TodayData = { members: TodayMember[]; presentCount: number; totalActive: number; date: string };

const ICON_BG = ["#1A1A2E","#2D2D3F","#3D3D55","#252540","#1E1E30","#343448"];

export default function AttendancePage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    setLoading(true);
    if (isToday) {
      const res = await fetch("/api/owner/attendance/today");
      setData((await res.json()).data);
    } else {
      const res = await fetch(`/api/owner/attendance?date=${selectedDate}`);
      const json = await res.json();
      const records: Array<{ member: { id: string; name: string; phone: string } }> = json.data ?? [];
      setData({ members: records.map(r => ({ ...r.member, present: true })), presentCount: records.length, totalActive: records.length, date: selectedDate });
    }
    setLoading(false);
  }, [selectedDate, isToday]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (memberId: string) => {
    if (!isToday) return;
    setToggling(memberId);
    await fetch("/api/owner/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId }) });
    setData(prev => !prev ? prev : {
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, present: !m.present } : m),
      presentCount: prev.members.filter(m => m.id === memberId ? !m.present : m.present).length,
    });
    setToggling(null);
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate); d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const present = data?.members.filter(m => m.present).length ?? 0;
  const total = data?.members.length ?? 0;
  const absent = total - present;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
        <div style={{ background: "#E6F4EA", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{present}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
            <Check size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#059669" }} />Present today
          </div>
        </div>
        <div style={{ background: "#FDF6E3", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{absent}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>
            <CalendarCheck size={11} style={{ verticalAlign: "middle", marginRight: 3, color: "#d97706" }} />Absent today
          </div>
        </div>
        <div style={{ background: "#EDE9FF", borderRadius: 14, padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{total}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>Active members</div>
        </div>
      </div>

      {/* ── Date nav ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <button className="icon-btn" onClick={() => changeDate(-1)}><ChevronLeft size={16} /></button>
        <input className="input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          style={{ width: 160, fontSize: "0.82rem" }} />
        <button className="icon-btn" onClick={() => changeDate(1)} disabled={isToday}><ChevronRight size={16} /></button>
        {!isToday && (
          <button className="btn btn-cream btn-sm" onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}>
            Today
          </button>
        )}
        {data && (
          <div style={{
            background: "var(--bg-outer)", borderRadius: 999, padding: "0.375rem 1rem",
            fontSize: "0.82rem", fontWeight: 600, border: "1px solid var(--border)",
          }}>
            <span style={{ color: "var(--green)", fontWeight: 800 }}>{present}</span>
            {isToday && <span style={{ color: "var(--text-muted)" }}> / {total}</span>}
            {" "}present
          </div>
        )}
        {isToday && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            Click a card to mark attendance
          </div>
        )}
      </div>

      {/* ── Attendance grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Loader2 size={28} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : !data?.members.length ? (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No active members for this date.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {data.members.map((m, idx) => (
            <button key={m.id} onClick={() => toggle(m.id)}
              disabled={!!toggling || !isToday}
              style={{
                background: m.present ? "#E6F4EA" : "#fff",
                border: `1.5px solid ${m.present ? "#86efac" : "var(--border)"}`,
                borderRadius: 14, padding: "1rem", cursor: isToday ? "pointer" : "default",
                transition: "all 0.18s", display: "flex", alignItems: "center",
                gap: "0.75rem", textAlign: "left",
                boxShadow: m.present ? "0 2px 8px rgba(34,197,94,0.12)" : "none",
              }}
              onMouseEnter={e => { if (isToday) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: m.present ? "#16a34a" : ICON_BG[idx % ICON_BG.length],
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 800,
              }}>
                {toggling === m.id
                  ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  : m.present
                  ? <Check size={16} />
                  : m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.2, color: "var(--text-primary)" }}>{m.name}</div>
                <div style={{ fontSize: "0.68rem", marginTop: 2, fontWeight: 600, color: m.present ? "#16a34a" : "var(--text-muted)" }}>
                  {m.present ? "Present ✓" : "Absent"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
