import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { updatePlanSchema } from "@/app/_lib/validations";

type Params = { params: Promise<{ id: string }> };

// PUT /api/owner/plans/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await req.json();
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { features, ...data } = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (features !== undefined) updateData.features = JSON.stringify(features);

  const count = await prisma.plan.updateMany({
    where: { id, gymId: session.gymId },
    data: updateData,
  });

  if (!count.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const plan = await prisma.plan.findUnique({ where: { id } });
  return NextResponse.json({ data: plan });
}

// DELETE /api/owner/plans/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const exists = await prisma.plan.findFirst({
    where: { id, gymId: session.gymId },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.plan.deleteMany({ where: { id, gymId: session.gymId } });
  return NextResponse.json({ data: { success: true } });
}
