import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireMember } from "@/app/_lib/auth";
import { daysRemaining, membershipStatus } from "@/app/_lib/utils";

// GET /api/member/profile
export async function GET(req: NextRequest) {
  const session = await requireMember(req);
  if (session instanceof NextResponse) return session;

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: {
      plan: true,
      gym: {
        select: { name: true, phone: true, address: true, logoUrl: true },
      },
      _count: {
        select: { attendance: true },
      },
    },
  });

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days = daysRemaining(member.endDate);
  const status = membershipStatus(member.endDate);

  // This month attendance count
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = await prisma.attendance.count({
    where: {
      memberId: session.memberId,
      date: { gte: monthStart },
    },
  });

  return NextResponse.json({
    data: {
      ...member,
      daysRemaining: days,
      status,
      thisMonthAttendance: thisMonthCount,
    },
  });
}
