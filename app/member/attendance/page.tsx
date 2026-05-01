"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { isSameDay } from "@/app/_lib/utils";

type AttendanceRecord = { id: string; date: string };

export default function MemberAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  const monthStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/member/attendance?month=${monthStr}`)
      .then(r => r.json()).then(d => { setRecords(d.data ?? []); setLoading(false); });
  }, [monthStr]);

  const changeMonth = (delta: number) => {
    setViewDate(d => { const nd = new Date(d); nd.setMonth(nd.getMonth() + delta); return nd; });
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const attendedDates = records.map(r => new Date(r.date));

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const attended = attendedDates.length;
  const streak = (() => {
    let s = 0; const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (attendedDates.some(a => isSameDay(a, d))) s++;
      else if (i > 0) break;
    }
    return s;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }} className="animate-fade-in">

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
        <div style={{ background: "#EDE9FF", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{attended}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>Visits this month</div>
        </div>
        <div style={{ background: "#E6F4EA", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{streak}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>Day streak 🔥</div>
        </div>
        <div style={{ background: "#FDF6E3", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1 }}>{Math.round((attended / daysInMonth) * 100)}%</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontWeight: 500 }}>Attendance rate</div>
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button className="icon-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
          <h2 style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
            {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </h2>
          <button className="icon-btn" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2.5rem" }}>
            <Loader2 size={24} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0.25rem" }}>{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.375rem" }}>
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const isAttended = attendedDates.some(a => isSameDay(a, date));
                const isToday = isSameDay(date, new Date());
                return (
                  <div key={i} style={{
                    aspectRatio: "1", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.82rem", fontWeight: isToday || isAttended ? 800 : 400,
                    background: isAttended ? "var(--text-primary)" : isToday ? "var(--gold)" : "transparent",
                    color: isAttended ? "#fff" : isToday ? "var(--text-primary)" : "var(--text-muted)",
                    transition: "transform 0.1s",
                    cursor: "default",
                  }}>
                    {isAttended ? <CalendarCheck size={14} /> : date.getDate()}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
