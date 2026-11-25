import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/giris";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);

  if (pathname.startsWith("/api/upload")) {
    if (!ok) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (isLogin) {
      if (ok) return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }
    if (!ok) return NextResponse.redirect(new URL("/admin/giris", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};
