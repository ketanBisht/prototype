import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { startOfDay, endOfDay } from "@/app/_lib/utils";

// GET /api/owner/attendance/today
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const now = new Date();

  // All active members
  const [allMembers, presentRecords] = await Promise.all([
    prisma.member.findMany({
      where: { gymId: session.gymId, isActive: true },
      select: { id: true, name: true, phone: true, planId: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: {
        member: { gymId: session.gymId },
        date: { gte: startOfDay(now), lte: endOfDay(now) },
      },
      select: { memberId: true },
    }),
  ]);

  const presentSet = new Set(presentRecords.map((r) => r.memberId));

  const members = allMembers.map((m) => ({
    ...m,
    present: presentSet.has(m.id),
  }));

  return NextResponse.json({
    data: {
      members,
      presentCount: presentSet.size,
      totalActive: allMembers.length,
      date: now.toISOString(),
    },
  });
}
