import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { startOfMonth, endOfMonth } from "@/app/_lib/utils";

export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const { gymId } = session;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [
    activeMembers,
    totalMembers,
    expiringCount,
    monthPayments,
    todayAttendance,
    recentPayments,
    expiringMembers,
  ] = await Promise.all([
    prisma.member.count({ where: { gymId, isActive: true } }),
    prisma.member.count({ where: { gymId } }),
    prisma.member.count({
      where: {
        gymId,
        isActive: true,
        endDate: { gte: now, lte: weekEnd },
      },
    }),
    prisma.payment.aggregate({
      where: {
        member: { gymId },
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.attendance.count({
      where: {
        member: { gymId },
        date: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.payment.findMany({
      where: { member: { gymId } },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: { member: { select: { name: true, phone: true } } },
    }),
    prisma.member.findMany({
      where: {
        gymId,
        isActive: true,
        endDate: { gte: now, lte: weekEnd },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { endDate: "asc" },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    data: {
      activeMembers,
      totalMembers,
      expiringCount,
      monthlyRevenue: monthPayments._sum.amount ?? 0,
      todayAttendance,
      recentPayments,
      expiringMembers,
    },
  });
}
