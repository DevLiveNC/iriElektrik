// Minimal HS256 JWT (sign/verify) implemented on Web Crypto so the same code
// runs in the Edge middleware and in the Node server runtime without native
// Node APIs.

export const SESSION_COOKIE = "iri_admin";
const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function importKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

export function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

// Kept for callers that previously needed the raw key bytes.
export function getSecretKey(): Uint8Array | null {
  const secret = getSecret();
  return secret ? encoder.encode(secret) : null;
}

export async function signSessionToken(subject: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = base64UrlEncode(
    encoder.encode(
      JSON.stringify({ sub: subject, role: "admin", exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }),
    ),
  );
  const data = `${header}.${payload}`;
  const key = await importKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data) as unknown as BufferSource);
  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const signatureBytes = base64UrlDecode(signature);
  if (!signatureBytes) return false;
  try {
    const key = await importKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(`${header}.${payload}`) as unknown as BufferSource,
    );
    if (!valid) return false;
    const payloadBytes = base64UrlDecode(payload);
    if (!payloadBytes) return false;
    const claims = JSON.parse(new TextDecoder().decode(payloadBytes)) as { role?: string; exp?: number };
    return claims.role === "admin" && typeof claims.exp === "number" && claims.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
