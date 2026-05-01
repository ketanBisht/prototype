import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireMember } from "@/app/_lib/auth";

// GET /api/member/announcements
export async function GET(req: NextRequest) {
  const session = await requireMember(req);
  if (session instanceof NextResponse) return session;

  const announcements = await prisma.announcement.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ data: announcements });
}
