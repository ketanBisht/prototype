"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell, LayoutDashboard, Users, BarChart3,
  CreditCard, Package, Settings, LogOut, Search, Bell, ChevronDown,
  Contact, Send,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Overview"   },
  { href: "/dashboard/members",   icon: Users,           label: "Members"    },
  { href: "/dashboard/analytics", icon: BarChart3,       label: "Analytics"  },
  { href: "/dashboard/billing",   icon: CreditCard,      label: "Billing"    },
  { href: "/dashboard/plans",     icon: Package,         label: "Plans"      },
  { href: "/dashboard/trainers",  icon: Contact,         label: "Trainers"   },
  { href: "/dashboard/broadcasts",icon: Send,            label: "Broadcasts" },
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings"   },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":            "Overview",
  "/dashboard/members":    "Members",
  "/dashboard/analytics":  "Analytics",
  "/dashboard/billing":    "Billing",
  "/dashboard/plans":      "Plans",
  "/dashboard/trainers":   "Trainers",
  "/dashboard/broadcasts": "Broadcasts",
  "/dashboard/settings":   "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const pageTitle = Object.entries(PAGE_TITLES)
    .filter(([k]) => pathname === k || (k !== "/dashboard" && pathname.startsWith(k)))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Overview";

  const handleLogout = async () => {
    await fetch("/api/auth/owner/logout", { method: "POST" });
    router.push("/login?role=owner");
  };

  return (
    /* Outer page: light-blue tinted background like the screenshot */
    <div className="dashboard-wrapper" style={{
      minHeight: "100vh",
      background: "#E8EDF5",
      display: "flex",
      alignItems: "stretch",
      padding: "0",
      gap: "0",
      fontFamily: "var(--font-body)",
    }}>

      {/* ── SIDEBAR (narrow dark pill — hidden on mobile) ── */}
      <aside className="dashboard-sidebar dashboard-sidebar-desktop" style={{
        width: 64,
        background: "#1C1C1E",
        borderRadius: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.25rem 0",
        gap: 0,
        flexShrink: 0,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 38, height: 38, background: "#C8A96E", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "2rem",
        }}>
          <Dumbbell size={18} color="#1C1C1E" />
        </div>

        {/* Nav icons */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, width: "100%", padding: "0 0.5rem", alignItems: "center" }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} title={label} style={{
                width: 44, height: 44, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "all 0.18s",
                position: "relative",
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, background: "#C8A96E", borderRadius: 2,
                  }} />
                )}
                <Icon size={19} />
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <button onClick={handleLogout} title="Logout" style={{
          width: 44, height: 44, borderRadius: 12, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(239,68,68,0.1)", color: "#ef4444",
          transition: "all 0.18s",
          marginBottom: "0.25rem",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* ── CONTENT PANEL (white, rounded right) ── */}
      <div className="dashboard-content" style={{
        flex: 1, background: "#fff",
        borderRadius: "0",
        display: "flex", flexDirection: "column",
        overflow: "hidden", minWidth: 0,
      }}>
        {/* Header */}
        <header className="dashboard-header" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 2rem", borderBottom: "1px solid #F0F0F0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div className="mobile-only" style={{ width: 32, height: 32, background: "#C8A96E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={16} color="#1C1C1E" />
            </div>
            <h1 className="dash-header-title" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{pageTitle}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              <Search size={15} />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              <Bell size={15} />
            </button>
            {/* User chip + Logout */}
            <div className="user-chip">
              <div className="user-avatar">OP</div>
              <span className="desktop-only">Owner</span>
              <ChevronDown size={13} className="desktop-only" style={{ color: "#999" }} />
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

        {/* Page content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="dashboard-main-area"
          style={{ flex: 1, padding: "2rem", overflowY: "auto", overflowX: "hidden" }}
        >
          {children}
        </motion.main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon size={20} />
              {label.length > 7 ? label.slice(0, 7) : label}
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
