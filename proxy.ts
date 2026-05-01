import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/_lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/member/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("owner_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login?role=owner", req.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "owner") {
      const res = NextResponse.redirect(new URL("/login?role=owner", req.url));
      res.cookies.delete("owner_token");
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/member")) {
    const token = req.cookies.get("member_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login?role=member", req.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "member") {
      const res = NextResponse.redirect(new URL("/login?role=member", req.url));
      res.cookies.delete("member_token");
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
