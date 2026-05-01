"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, Home, CalendarCheck, CreditCard, LogOut, ChevronDown, Bell, Search } from "lucide-react";

const navItems = [
  { href: "/member",            label: "My Membership", icon: Home },
  { href: "/member/attendance", label: "Attendance",    icon: CalendarCheck },
  { href: "/member/payments",   label: "Payments",      icon: CreditCard },
];

const PAGE_TITLES: Record<string, string> = {
  "/member":            "My Membership",
  "/member/attendance": "Attendance",
  "/member/payments":   "Payments",
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
            style={{ background: "none", cursor: "pointer" }}
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
              Member
              <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
