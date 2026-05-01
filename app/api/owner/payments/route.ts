import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { createPaymentSchema } from "@/app/_lib/validations";
import { startOfMonth, endOfMonth } from "@/app/_lib/utils";

// GET /api/owner/payments?month=YYYY-MM
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // e.g. "2024-03"

  let dateFilter = {};
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    dateFilter = { gte: startOfMonth(start), lte: endOfMonth(start) };
  }

  const payments = await prisma.payment.findMany({
    where: {
      member: { gymId: session.gymId },
      ...(monthParam ? { paidAt: dateFilter } : {}),
    },
    include: {
      member: { select: { id: true, name: true, phone: true } },
      plan: { select: { name: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({ data: { payments, total } });
}

// POST /api/owner/payments — record a payment
export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { paidAt, ...data } = parsed.data;

  const member = await prisma.member.findFirst({
    where: { id: data.memberId, gymId: session.gymId },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      ...data,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
    include: {
      member: { select: { name: true } },
      plan: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: payment }, { status: 201 });
}
