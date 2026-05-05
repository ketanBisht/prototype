import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { createTrainerSchema } from "@/app/_lib/validations";

export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const trainers = await prisma.trainer.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: trainers });
}

export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createTrainerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const trainer = await prisma.trainer.create({
    data: { ...parsed.data, gymId: session.gymId },
  });

  return NextResponse.json({ data: trainer }, { status: 201 });
}
