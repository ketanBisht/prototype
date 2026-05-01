import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { createAnnouncementSchema } from "@/app/_lib/validations";

// GET /api/owner/announcements
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const announcements = await prisma.announcement.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: announcements });
}

// POST /api/owner/announcements
export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const announcement = await prisma.announcement.create({
    data: { ...parsed.data, gymId: session.gymId },
  });

  return NextResponse.json({ data: announcement }, { status: 201 });
}
