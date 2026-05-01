import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/_lib/prisma";
import { ownerLoginSchema } from "@/app/_lib/validations";
import { signToken, setOwnerCookie } from "@/app/_lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ownerLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const gym = await prisma.gym.findUnique({ where: { ownerEmail: email } });
    if (!gym) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, gym.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      sub: gym.id,
      gymId: gym.id,
      email: gym.ownerEmail,
      role: "owner",
    });

    await setOwnerCookie(token);

    return NextResponse.json({
      data: { gymId: gym.id, gymName: gym.name, ownerName: gym.ownerName },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
