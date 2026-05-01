import { NextResponse } from "next/server";
import { clearMemberCookie } from "@/app/_lib/auth";

export async function POST() {
  await clearMemberCookie();
  return NextResponse.json({ data: { success: true } });
}
