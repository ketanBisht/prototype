import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { startOfDay, endOfDay } from "@/app/_lib/utils";

// GET /api/owner/attendance?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const target = dateParam ? new Date(dateParam) : new Date();

  const records = await prisma.attendance.findMany({
    where: {
      member: { gymId: session.gymId },
      date: { gte: startOfDay(target), lte: endOfDay(target) },
    },
    include: {
      member: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ data: records });
}

// POST /api/owner/attendance — mark a member present
export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const { memberId, date } = await req.json();
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId: session.gymId },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const target = date ? new Date(date) : new Date();

  // Check for duplicate
  const existing = await prisma.attendance.findFirst({
    where: {
      memberId,
      date: { gte: startOfDay(target), lte: endOfDay(target) },
    },
  });

  if (existing) {
    // Toggle off — remove attendance
    await prisma.attendance.delete({ where: { id: existing.id } });
    return NextResponse.json({ data: { action: "removed" } });
  }

  const record = await prisma.attendance.create({
    data: { memberId, date: target },
  });

  return NextResponse.json({ data: { action: "added", record } }, { status: 201 });
}
