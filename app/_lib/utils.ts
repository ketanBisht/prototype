// ── Membership helpers ─────────────────────────────────────────────────────

export function daysRemaining(endDate: Date | string): number {
  const end = new Date(endDate);
  const now = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export type MembershipStatus = "active" | "expiring" | "expired";

export function membershipStatus(endDate: Date | string): MembershipStatus {
  const days = daysRemaining(endDate);
  if (days === 0) return "expired";
  if (days <= 7) return "expiring";
  return "active";
}

// ── Currency ──────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Date ──────────────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function toDateString(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function startOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ── Revenue ───────────────────────────────────────────────────────────────

export type MonthlyRevenue = { month: string; total: number };

export function groupRevenueByMonth(
  payments: { paidAt: Date; amount: number }[],
  months = 6
): MonthlyRevenue[] {
  const result: MonthlyRevenue[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const total = payments
      .filter((p) => {
        const pd = new Date(p.paidAt);
        return (
          pd.getFullYear() === d.getFullYear() &&
          pd.getMonth() === d.getMonth()
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
    result.push({ month: label, total });
  }

  return result;
}

// ── Misc ──────────────────────────────────────────────────────────────────

export function generateMemberPortalUrl(memberId: string): string {
  return `/member?id=${memberId}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}
