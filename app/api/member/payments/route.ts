import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireMember } from "@/app/_lib/auth";

// GET /api/member/payments
export async function GET(req: NextRequest) {
  const session = await requireMember(req);
  if (session instanceof NextResponse) return session;

  const payments = await prisma.payment.findMany({
    where: { memberId: session.memberId },
    include: { plan: { select: { name: true } } },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({ data: payments });
}
