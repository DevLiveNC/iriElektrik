import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { MEDIA_PATH_PREFIX } from "@/lib/media";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function detectType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(req: Request) {
  // Middleware'e ek olarak route içinde de oturum doğrulanır.
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Dosya en fazla 8 MB olmalı." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectType(buffer);
  if (!detected || ALLOWED[file.type] !== ALLOWED[detected]) {
    return NextResponse.json(
      { error: "Yalnızca JPEG, PNG veya WebP görselleri kabul edilir." },
      { status: 400 },
    );
  }
  const ext = ALLOWED[detected];
  const name = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Private blob; yalnızca /api/media erişim denetiminden sonra okunur.
    await put(`uploads/${name}`, buffer, {
      access: "private",
      contentType: detected,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: `${MEDIA_PATH_PREFIX}${name}` });
  }

  // Yerel geliştirme: public dışında, Git'e alınmayan özel klasöre yazılır.
  const dir = join(process.cwd(), "data", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buffer);
  return NextResponse.json({ url: `${MEDIA_PATH_PREFIX}${name}` });
}
