import { NextResponse } from "next/server";
import { clearOwnerCookie } from "@/app/_lib/auth";

export async function POST() {
  await clearOwnerCookie();
  return NextResponse.json({ data: { success: true } });
}
