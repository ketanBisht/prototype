import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { renewSchema } from "@/app/_lib/validations";

type Params = { params: Promise<{ id: string }> };

// POST /api/owner/members/[id]/renew
export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await req.json();
  const parsed = renewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { planId, amount, method, startDate } = parsed.data;

  const [member, plan] = await Promise.all([
    prisma.member.findFirst({ where: { id, gymId: session.gymId } }),
    prisma.plan.findFirst({ where: { id: planId, gymId: session.gymId } }),
  ]);

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const newStart = startDate ? new Date(startDate) : new Date();
  const newEnd = new Date(newStart);
  newEnd.setDate(newEnd.getDate() + plan.durationDays);

  const [payment, updatedMember] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        memberId: id,
        planId,
        amount,
        method,
        paidAt: newStart,
      },
    }),
    prisma.member.update({
      where: { id },
      data: {
        planId,
        startDate: newStart,
        endDate: newEnd,
        isActive: true,
      },
      include: { plan: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({ data: { member: updatedMember, payment } });
}
