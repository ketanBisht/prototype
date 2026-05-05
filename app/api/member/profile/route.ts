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
      payments: {
        orderBy: { paidAt: "desc" },
        take: 3,
        select: { id: true, amount: true, paidAt: true, method: true },
      }
    },
  });

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const trainers = await prisma.trainer.findMany({
    where: { gymId: session.gymId, isActive: true },
    select: { id: true, name: true, specialty: true },
    orderBy: { createdAt: "desc" }
  });

  const days = daysRemaining(member.endDate);
  const status = membershipStatus(member.endDate);

  return NextResponse.json({
    data: {
      ...member,
      daysRemaining: days,
      status,
      trainers,
    },
  });
}
