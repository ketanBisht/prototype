import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? `SET (starts with: ${process.env.DATABASE_URL.slice(0, 20)}...)`
    : "❌ NOT SET";
  checks.JWT_SECRET = process.env.JWT_SECRET ? "SET ✅" : "❌ NOT SET";

  // 2. Try prisma import
  let prismaImport = "ok";
  try {
    const { prisma } = await import("@/app/_lib/prisma");
    checks.prismaImport = "✅ imported";

    // 3. Try DB query
    try {
      const count = await prisma.gym.count();
      checks.dbQuery = `✅ gyms in db: ${count}`;
    } catch (e) {
      checks.dbQuery = `❌ ${e instanceof Error ? e.message : String(e)}`;
    }
  } catch (e) {
    prismaImport = `❌ ${e instanceof Error ? e.message : String(e)}`;
    checks.prismaImport = prismaImport;
  }

  return NextResponse.json(checks, { status: 200 });
}
