import { get } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "@/lib/auth";
import { getHeroPhoto } from "@/lib/content";
import { mediaContentType, MEDIA_PATH_PREFIX } from "@/lib/media";
import { getBusiness, listPublishedJobs } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notFound() {
  return new Response("Görsel bulunamadı.", {
    status: 404,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

function mediaHeaders(contentType: string, isPublic: boolean, size?: number, etag?: string) {
  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "X-Robots-Tag": isPublic ? "index, follow" : "noindex, nofollow",
    "Cache-Control": isPublic
      ? "public, max-age=31536000, immutable"
      : "private, no-store",
  });
  if (typeof size === "number") headers.set("Content-Length", String(size));
  if (etag) headers.set("ETag", etag);
  return headers;
}

async function resolve(
  name: string,
): Promise<{ body: BodyInit; headers: Headers } | Response> {
  const contentType = mediaContentType(name);
  if (!contentType) return notFound();

  const mediaPath = `${MEDIA_PATH_PREFIX}${name}`;
  const [business, jobs, session] = await Promise.all([
    getBusiness(),
    listPublishedJobs(),
    getSession(),
  ]);
  const hero = getHeroPhoto(business, false);
  const isPublic =
    hero?.src === mediaPath ||
    jobs.some((job) => job.cover === mediaPath || job.gallery.includes(mediaPath));
  if (!isPublic && !session) return notFound();

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const result = await get(`uploads/${name}`, { access: "private" });
    if (!result || result.statusCode !== 200) return notFound();
    return {
      body: result.stream,
      headers: mediaHeaders(
        contentType,
        isPublic,
        result.blob.size,
        result.blob.etag,
      ),
    };
  }

  const file = await readFile(join(process.cwd(), "data", "uploads", name)).catch(() => null);
  if (!file) return notFound();
  return {
    body: new Uint8Array(file),
    headers: mediaHeaders(contentType, isPublic, file.byteLength),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const result = await resolve(name.toLowerCase());
  if (result instanceof Response) return result;
  return new Response(result.body, { status: 200, headers: result.headers });
}

export async function HEAD(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const result = await resolve(name.toLowerCase());
  if (result instanceof Response) return result;
  return new Response(null, { status: 200, headers: result.headers });
}
