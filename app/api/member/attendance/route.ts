import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireMember } from "@/app/_lib/auth";

// GET /api/member/attendance
export async function GET(req: NextRequest) {
  const session = await requireMember(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // YYYY-MM

  let dateFilter = {};
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    dateFilter = { gte: start, lte: end };
  } else {
    // Last 90 days
    const ago = new Date();
    ago.setDate(ago.getDate() - 90);
    dateFilter = { gte: ago };
  }

  const records = await prisma.attendance.findMany({
    where: { memberId: session.memberId, date: dateFilter },
    orderBy: { date: "asc" },
    select: { id: true, date: true },
  });

  return NextResponse.json({ data: records });
}
