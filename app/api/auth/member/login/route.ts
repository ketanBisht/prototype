import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/_lib/prisma";
import { memberLoginSchema } from "@/app/_lib/validations";
import { signToken, setMemberCookie } from "@/app/_lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = memberLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Phone number and 4-digit PIN required" },
        { status: 400 }
      );
    }

    const { phone, pin } = parsed.data;
    const member = await prisma.member.findFirst({ where: { phone } });
    if (!member) {
      return NextResponse.json(
        { error: "No member found with this phone number" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(pin, member.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const token = await signToken({
      sub: member.id,
      memberId: member.id,
      gymId: member.gymId,
      role: "member",
    });

    await setMemberCookie(token);

    return NextResponse.json({
      data: { memberId: member.id, name: member.name },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
