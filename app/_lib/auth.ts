import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

export type OwnerPayload = {
  sub: string; // gymId
  gymId: string;
  email: string;
  role: "owner";
};

export type MemberPayload = {
  sub: string; // memberId
  memberId: string;
  gymId: string;
  role: "member";
};

export type JWTPayload = OwnerPayload | MemberPayload;

// ── Sign ───────────────────────────────────────────────────────────────────

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// ── Verify ─────────────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ─────────────────────────────────────────────────────────

export async function setOwnerCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("owner_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function setMemberCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("member_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearOwnerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("owner_token");
}

export async function clearMemberCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("member_token");
}

// ── Session getters ────────────────────────────────────────────────────────

export async function getOwnerSession(
  req: NextRequest
): Promise<OwnerPayload | null> {
  const token = req.cookies.get("owner_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "owner") return null;
  return payload as OwnerPayload;
}

export async function getMemberSession(
  req: NextRequest
): Promise<MemberPayload | null> {
  const token = req.cookies.get("member_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "member") return null;
  return payload as MemberPayload;
}

// ── Guard helpers ──────────────────────────────────────────────────────────

export async function requireOwner(
  req: NextRequest
): Promise<OwnerPayload | NextResponse> {
  const session = await getOwnerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireMember(
  req: NextRequest
): Promise<MemberPayload | NextResponse> {
  const session = await getMemberSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
