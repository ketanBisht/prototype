import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { updateGymSchema, changePasswordSchema } from "@/app/_lib/validations";

// GET /api/owner/gym
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const gym = await prisma.gym.findUnique({
    where: { id: session.gymId },
    select: {
      id: true, name: true, tagline: true, address: true,
      phone: true, email: true, logoUrl: true,
      ownerName: true, ownerEmail: true, createdAt: true,
    },
  });

  return NextResponse.json({ data: gym });
}

// PUT /api/owner/gym
export async function PUT(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();

  // Password change
  if (body.currentPassword) {
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const gym = await prisma.gym.findUnique({ where: { id: session.gymId } });
    const valid = await bcrypt.compare(parsed.data.currentPassword, gym!.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.gym.update({
      where: { id: session.gymId },
      data: { passwordHash: newHash },
    });
    return NextResponse.json({ data: { success: true } });
  }

  // Gym info update
  const parsed = updateGymSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const gym = await prisma.gym.update({
    where: { id: session.gymId },
    data: parsed.data,
    select: {
      id: true, name: true, tagline: true, address: true,
      phone: true, email: true, logoUrl: true, ownerName: true,
    },
  });

  return NextResponse.json({ data: gym });
}
