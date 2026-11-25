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
    const response = isLogin && ok
      ? NextResponse.redirect(new URL("/admin", req.url))
      : !isLogin && !ok
        ? NextResponse.redirect(new URL("/admin/giris", req.url))
        : NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};
