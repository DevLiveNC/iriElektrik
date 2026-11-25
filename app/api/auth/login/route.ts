import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession, isAdminConfigured, verifyCredentials, SESSION_COOKIE } from "@/lib/auth";

const attempts = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  rec.count += 1;
  return rec.count > 10;
}

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Yönetici girişi henüz yapılandırılmadı. README'deki ilk kurulum adımlarını izleyin." },
      { status: 503 },
    );
  }
  const ip = req.headers.get("x-forwarded-for") ?? "bilinmiyor";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Çok fazla deneme. Bir dakika sonra tekrar deneyin." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const ok = await verifyCredentials(email, password);
  if (!ok) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }
  const token = await createSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return NextResponse.json({ ok: true });
}
