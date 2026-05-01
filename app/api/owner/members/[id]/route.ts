import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { updateMemberSchema } from "@/app/_lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/owner/members/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const member = await prisma.member.findFirst({
    where: { id, gymId: session.gymId },
    include: {
      plan: true,
      payments: { orderBy: { paidAt: "desc" } },
      attendance: { orderBy: { date: "desc" }, take: 90 },
    },
  });

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: member });
}

// PUT /api/owner/members/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await req.json();
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { pin, ...data } = parsed.data;
  const updateData: Record<string, unknown> = { ...data };

  if (data.startDate) updateData.startDate = new Date(data.startDate as string);
  if (data.endDate) updateData.endDate = new Date(data.endDate as string);
  if (data.email === "") updateData.email = null;
  if (pin) updateData.passwordHash = await bcrypt.hash(pin, 10);

  const member = await prisma.member.updateMany({
    where: { id, gymId: session.gymId },
    data: updateData,
  });

  if (!member.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.member.findUnique({
    where: { id },
    include: { plan: { select: { name: true } } },
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/owner/members/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const exists = await prisma.member.findFirst({
    where: { id, gymId: session.gymId },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete related records first
  await prisma.attendance.deleteMany({ where: { memberId: id } });
  await prisma.payment.deleteMany({ where: { memberId: id } });
  await prisma.member.delete({ where: { id } });

  return NextResponse.json({ data: { success: true } });
}
