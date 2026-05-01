"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell, LayoutDashboard, Users, CalendarCheck,
  CreditCard, Package, Settings, LogOut, Search, Bell, ChevronDown,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Overview"   },
  { href: "/dashboard/members",    icon: Users,           label: "Members"    },
  { href: "/dashboard/attendance", icon: CalendarCheck,   label: "Attendance" },
  { href: "/dashboard/billing",    icon: CreditCard,      label: "Billing"    },
  { href: "/dashboard/plans",      icon: Package,         label: "Plans"      },
  { href: "/dashboard/settings",   icon: Settings,        label: "Settings"   },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":            "Overview",
  "/dashboard/members":    "Members",
  "/dashboard/attendance": "Attendance",
  "/dashboard/billing":    "Billing",
  "/dashboard/plans":      "Plans",
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
    <div style={{
      minHeight: "100vh",
      background: "#E8EDF5",
      display: "flex",
      alignItems: "stretch",
      padding: "1rem",
      gap: "0",
      fontFamily: "var(--font-body)",
    }}>

      {/* ── SIDEBAR (narrow dark pill) ── */}
      <aside style={{
        width: 64,
        background: "#1C1C1E",
        borderRadius: "18px 0 0 18px",
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
          background: "transparent", color: "rgba(255,255,255,0.3)",
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* ── CONTENT PANEL (white, rounded right) ── */}
      <div style={{
        flex: 1, background: "#fff",
        borderRadius: "0 18px 18px 0",
        display: "flex", flexDirection: "column",
        overflow: "hidden", minWidth: 0,
      }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 2rem", borderBottom: "1px solid #F0F0F0",
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>{pageTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              <Search size={15} />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              <Bell size={15} />
            </button>
            {/* User chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "#F5F5F5", borderRadius: 99, padding: "0.35rem 0.75rem 0.35rem 0.35rem",
              cursor: "pointer",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#C8A96E", color: "#1A1A2E",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.68rem", fontWeight: 800,
              }}>OP</div>
              <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "#1A1A1A" }}>Owner</span>
              <ChevronDown size={13} color="#999" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ flex: 1, padding: "2rem", overflowY: "auto" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
