import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";

// GET /api/public/plans — public endpoint for marketing page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get("gymId");

  const plans = await prisma.plan.findMany({
    where: {
      isActive: true,
      ...(gymId ? { gymId } : {}),
    },
    orderBy: { price: "asc" },
    select: {
      id: true, name: true, durationDays: true,
      price: true, features: true,
    },
  });

  return NextResponse.json({ data: plans });
}
