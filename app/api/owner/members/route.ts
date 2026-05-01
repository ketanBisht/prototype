import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/_lib/prisma";
import { requireOwner } from "@/app/_lib/auth";
import { createMemberSchema } from "@/app/_lib/validations";

// GET /api/owner/members — list all members with optional filter/search
export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status"); // active | expiring | expired
  const planId = searchParams.get("planId");

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Build date filters
  let endDateFilter: Record<string, Date> | undefined;
  if (status === "active") endDateFilter = { gt: weekEnd };
  else if (status === "expiring") endDateFilter = { gte: now, lte: weekEnd };
  else if (status === "expired") endDateFilter = { lt: now };

  const members = await prisma.member.findMany({
    where: {
      gymId: session.gymId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
      ...(endDateFilter ? { endDate: endDateFilter } : {}),
      ...(planId ? { planId } : {}),
    },
    include: {
      plan: { select: { id: true, name: true, price: true } },
      _count: { select: { attendance: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: members });
}

// POST /api/owner/members — create new member
export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = createMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { pin, ...data } = parsed.data;
  const passwordHash = await bcrypt.hash(pin, 10);

  const member = await prisma.member.create({
    data: {
      ...data,
      gymId: session.gymId,
      passwordHash,
      email: data.email || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
    include: { plan: { select: { name: true } } },
  });

  return NextResponse.json({ data: member }, { status: 201 });
}
