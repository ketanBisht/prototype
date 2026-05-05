"use client";

import { useEffect, useState } from "react";
import { Loader2, Bell, Megaphone, ChevronDown } from "lucide-react";
import { formatDate } from "@/app/_lib/utils";

type Announcement = { id: string; title: string; body: string; createdAt: string };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/member/announcements")
      .then(r => r.json())
      .then(d => { setAnnouncements(d.data ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
      <Loader2 size={28} color="var(--gold-dark)" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 800, margin: "0 auto" }} className="animate-fade-in">

      {/* Header strip */}
      <div style={{
        background: "linear-gradient(135deg, #18181F 0%, #2D2D4F 100%)",
        borderRadius: "var(--radius-card)", padding: "1.75rem 2rem",
        display: "flex", alignItems: "center", gap: "1rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: "50%", border: "1.5px solid rgba(200,169,110,0.1)" }} />
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(200,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bell size={22} color="var(--gold)" />
        </div>
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fff" }}>Announcements</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>
            {announcements.length === 0 ? "No updates yet" : `${announcements.length} update${announcements.length !== 1 ? "s" : ""} from your gym`}
          </div>
        </div>
        {announcements.length > 0 && (
          <div style={{ marginLeft: "auto", background: "var(--gold)", color: "#1c1c1e", fontSize: "0.7rem", fontWeight: 900, padding: "0.25rem 0.75rem", borderRadius: 999, letterSpacing: "0.05em" }}>
            {announcements.length} NEW
          </div>
        )}
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-card)",
          padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--bg-outer)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Megaphone size={26} color="var(--text-muted)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.3rem" }}>All caught up!</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>Your gym owner hasn&apos;t posted any updates yet.<br />Check back later.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {announcements.map((a, idx) => {
            const isOpen = openId === a.id;
            const isFirst = idx === 0;
            return (
              <div
                key={a.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${isFirst ? "rgba(200,169,110,0.4)" : "var(--border)"}`,
                  borderRadius: "var(--radius-card)",
                  overflow: "hidden",
                  boxShadow: isFirst ? "0 4px 20px rgba(200,169,110,0.1)" : "none",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Row header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : a.id)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "1.25rem 1.5rem", textAlign: "left",
                  }}
                >
                  {/* Dot + index */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isFirst ? "rgba(200,169,110,0.12)" : "var(--bg-outer)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isFirst ? (
                      <Bell size={16} color="var(--gold-dark)" />
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>{idx + 1}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{a.title}</span>
                      {isFirst && (
                        <span style={{ fontSize: "0.6rem", fontWeight: 900, background: "var(--gold)", color: "#1c1c1e", padding: "0.1rem 0.5rem", borderRadius: 999, letterSpacing: "0.06em" }}>LATEST</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {formatDate(a.createdAt)}
                    </div>
                  </div>

                  <ChevronDown
                    size={16} color="var(--text-muted)"
                    style={{ flexShrink: 0, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>

                {/* Expandable body */}
                {isOpen && (
                  <div style={{
                    padding: "0 1.5rem 1.5rem",
                    borderTop: "1px solid var(--bg-outer)",
                    paddingTop: "1rem",
                    marginTop: 0,
                  }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
                      {a.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
