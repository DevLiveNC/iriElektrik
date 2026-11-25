import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, getSecretKey, verifySessionToken } from "./session";

export { SESSION_COOKIE };
export { verifySessionToken };

const SESSION_MAX_AGE = 60 * 60 * 12; // 12 saat

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !safeEqual(email.trim(), adminEmail.trim())) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) return safeEqual(password, plain);
  return false;
}

export async function createSession(): Promise<string> {
  const key = getSecretKey();
  if (!key) throw new Error("AUTH_SECRET en az 32 karakter olmalı.");
  const email = process.env.ADMIN_EMAIL ?? "admin";
  return new SignJWT({ sub: email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);
}

export async function getSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) return null;
  return { email: process.env.ADMIN_EMAIL ?? "admin" };
}

export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz erişim.");
  return session;
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD),
  );
}
