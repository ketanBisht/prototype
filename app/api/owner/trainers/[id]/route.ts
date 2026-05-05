import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { updateTrainerSchema } from "@/app/_lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer || trainer.gymId !== session.gymId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateTrainerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await prisma.trainer.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer || trainer.gymId !== session.gymId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trainer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
