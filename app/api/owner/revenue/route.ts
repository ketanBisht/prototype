import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { groupRevenueByMonth } from "@/app/_lib/utils";

// GET /api/owner/revenue
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const payments = await prisma.payment.findMany({
    where: {
      member: { gymId: session.gymId },
      paidAt: { gte: sixMonthsAgo },
    },
    select: { paidAt: true, amount: true, plan: { select: { name: true } } },
  });

  const monthly = groupRevenueByMonth(payments, 6);

  // Revenue by plan
  const byPlan: Record<string, number> = {};
  for (const p of payments) {
    const key = p.plan?.name ?? "Unknown";
    byPlan[key] = (byPlan[key] ?? 0) + p.amount;
  }

  return NextResponse.json({ data: { monthly, byPlan } });
}
