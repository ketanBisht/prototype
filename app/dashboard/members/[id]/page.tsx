"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Loader2, Edit2, Check, X } from "lucide-react";
import { formatDate, formatINR, daysRemaining, membershipStatus } from "@/app/_lib/utils";
import { isSameDay } from "@/app/_lib/utils";

type MemberDetail = {
  id: string; name: string; phone: string; email?: string;
  weight?: number; height?: number; notes?: string;
  startDate: string; endDate: string; isActive: boolean;
  plan: { id: string; name: string; price: number; durationDays: number } | null;
  payments: Array<{ id: string; amount: number; paidAt: string; method: string; plan?: { name: string } | null }>;
  attendance: Array<{ id: string; date: string }>;
};

type Plan = { id: string; name: string; durationDays: number; price: number };

function AttendanceHeatmap({ attendance }: { attendance: Array<{ date: string }> }) {
  const days = 90;
  const cells: { date: Date; attended: boolean }[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    cells.push({
      date: d,
      attended: attendance.some(a => isSameDay(a.date, d)),
    });
  }
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
        {cells.map((c, i) => (
          <div key={i} title={c.date.toLocaleDateString("en-IN")}
            style={{
              width: "12px", height: "12px", borderRadius: "2px",
              background: c.attended ? "var(--color-orange)" : "var(--color-surface-3)",
              transition: "transform 0.1s",
              cursor: "default",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-faint)" }}>Less</span>
        {[0.2, 0.5, 0.8, 1].map(o => (
          <div key={o} style={{ width: "10px", height: "10px", borderRadius: "2px", background: `rgba(249,115,22,${o})` }} />
        ))}
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-faint)" }}>More</span>
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewLoading, setRenewLoading] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [renewForm, setRenewForm] = useState({ planId: "", amount: "", method: "cash" });

  const load = async () => {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      fetch(`/api/owner/members/${id}`),
      fetch("/api/owner/plans"),
    ]);
    const [mData, pData] = await Promise.all([mRes.json(), pRes.json()]);
    setMember(mData.data);
    setPlans(pData.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewLoading(true);
    try {
      const res = await fetch(`/api/owner/members/${id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...renewForm, amount: Number(renewForm.amount) }),
      });
      if (res.ok) { setShowRenew(false); load(); }
    } finally {
      setRenewLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={28} color="var(--color-orange)" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!member) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>Member not found.</div>;

  const days = daysRemaining(member.endDate);
  const status = membershipStatus(member.endDate);
  const planDays = member.plan?.durationDays ?? 30;
  const elapsed = planDays - days;
  const progress = Math.min(100, Math.max(0, (elapsed / planDays) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}><ArrowLeft size={16} /> Back</button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{member.name}</h1>
        <span className={`badge badge-${status}`}>{status}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="avatar" style={{ width: "56px", height: "56px", fontSize: "1.25rem" }}>
              {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 style={{ fontWeight: 700 }}>{member.name}</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{member.phone}</p>
              {member.email && <p style={{ color: "var(--color-text-faint)", fontSize: "0.8rem" }}>{member.email}</p>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[
              { label: "Weight", value: member.weight ? `${member.weight} kg` : "—" },
              { label: "Height", value: member.height ? `${member.height} cm` : "—" },
              { label: "Plan", value: member.plan?.name ?? "No Plan" },
              { label: "Visits", value: member.attendance.length },
            ].map(item => (
              <div key={item.label} style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius)", padding: "0.875rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                <div style={{ fontWeight: 700, marginTop: "0.25rem" }}>{item.value}</div>
              </div>
            ))}
          </div>
          {member.notes && (
            <div style={{ marginTop: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius)", padding: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              📝 {member.notes}
            </div>
          )}
        </div>

        {/* Membership Card */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Membership Status</h3>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "4rem", color: status === "expired" ? "var(--color-red)" : status === "expiring" ? "var(--color-amber)" : "var(--color-green)", lineHeight: 1 }}>
              {days === 0 ? "EXP" : days}
            </div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              {days === 0 ? "Membership Expired" : "days remaining"}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: "var(--color-surface-2)", borderRadius: "999px", height: "8px", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{
              height: "100%", borderRadius: "999px",
              background: status === "expired" ? "var(--color-red)" : status === "expiring" ? "var(--color-amber)" : "var(--color-green)",
              width: `${progress}%`, transition: "width 0.5s ease",
            }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-faint)", marginBottom: "1.5rem" }}>
            <span>{formatDate(member.startDate)}</span>
            <span>{formatDate(member.endDate)}</span>
          </div>

          {showRenew ? (
            <form onSubmit={handleRenew} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <select className="input" value={renewForm.planId}
                onChange={e => {
                  const plan = plans.find(p => p.id === e.target.value);
                  setRenewForm(f => ({ ...f, planId: e.target.value, amount: plan?.price.toString() ?? "" }));
                }} required>
                <option value="">Select Plan</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
              </select>
              <input className="input" type="number" placeholder="Amount (₹)" value={renewForm.amount}
                onChange={e => setRenewForm(f => ({ ...f, amount: e.target.value }))} required />
              <select className="input" value={renewForm.method} onChange={e => setRenewForm(f => ({ ...f, method: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={renewLoading}>
                  {renewLoading && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />} Confirm Renew
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRenew(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowRenew(true)}>
              Renew Membership
            </button>
          )}
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Attendance (Last 90 Days)</h3>
        <AttendanceHeatmap attendance={member.attendance} />
      </div>

      {/* Payment History */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Payment History</h3>
        {member.payments.length === 0 ? (
          <p style={{ color: "var(--color-text-faint)", fontSize: "0.875rem" }}>No payments recorded.</p>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead><tr><th>Date</th><th>Plan</th><th>Method</th><th>Amount</th></tr></thead>
              <tbody>
                {member.payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{formatDate(p.paidAt)}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{p.plan?.name ?? "—"}</td>
                    <td><span className="badge badge-blue">{p.method}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--color-green)" }}>{formatINR(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
