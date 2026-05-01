import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { createPlanSchema } from "@/app/_lib/validations";

// GET /api/owner/plans
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const plans = await prisma.plan.findMany({
    where: { gymId: session.gymId },
    include: { _count: { select: { members: true } } },
    orderBy: { price: "asc" },
  });

  return NextResponse.json({ data: plans });
}

// POST /api/owner/plans
export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { features, ...data } = parsed.data;
  const plan = await prisma.plan.create({
    data: {
      ...data,
      gymId: session.gymId,
      features: JSON.stringify(features),
    },
  });

  return NextResponse.json({ data: plan }, { status: 201 });
}
