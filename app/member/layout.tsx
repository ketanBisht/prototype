"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, Home, Megaphone, CreditCard, LogOut, ChevronDown, Bell, Search } from "lucide-react";

const navItems = [
  { href: "/member",               label: "My Membership",  icon: Home },
  { href: "/member/announcements", label: "Announcements",  icon: Megaphone },
  { href: "/member/payments",      label: "Payments",       icon: CreditCard },
];

const PAGE_TITLES: Record<string, string> = {
  "/member":               "My Membership",
  "/member/announcements": "Announcements",
  "/member/payments":      "Payments",
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const pageTitle = Object.entries(PAGE_TITLES)
    .filter(([k]) => pathname === k)
    .map(([, v]) => v)[0] ?? "Member Portal";

  const handleLogout = async () => {
    await fetch("/api/auth/member/logout", { method: "POST" });
    router.push("/login?role=member");
  };

  return (
    <div className="dashboard-layout">
      {/* ── Slim Icon Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <Dumbbell size={18} color="#1A1A2E" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item${active ? " active" : ""}`}
                title={label}
              >
                <Icon size={19} />
                <span className="tip">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#ef4444",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
            title="Logout"
          >
            <LogOut size={19} />
            <span className="tip">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Right Panel ── */}
      <div className="dashboard-panel">
        <header className="dash-header">
          <h1 className="dash-header-title">{pageTitle}</h1>
          <div className="dash-header-actions">
            <button className="icon-btn" aria-label="Search">
              <Search size={16} />
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <div className="user-chip">
              <div className="user-avatar">M</div>
              <span className="desktop-only">Member</span>
              <ChevronDown size={13} className="desktop-only" style={{ color: "var(--text-muted)" }} />
            </div>
            <button
              onClick={handleLogout}
              className="desktop-only"
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.4rem 0.85rem", borderRadius: 99,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.07)", color: "#ef4444",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon size={20} />
              {label.split(" ")[0]}
            </Link>
          );
        })}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Out
        </button>
      </nav>
    </div>
  );
}
