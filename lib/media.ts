export const MEDIA_PATH_PREFIX = "/api/media/";

const MEDIA_NAME_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|webp)$/i;
const MEDIA_SRC_RE = /^\/api\/media\/[a-f0-9-]{36}\.(jpg|png|webp)$/i;

export function isPrivateMediaSrc(value: string): boolean {
  return MEDIA_SRC_RE.test(value.trim());
}

export function mediaNameFromSrc(value: string): string | null {
  const src = value.trim();
  if (!isPrivateMediaSrc(src)) return null;
  const name = src.slice(MEDIA_PATH_PREFIX.length);
  return MEDIA_NAME_RE.test(name) ? name.toLowerCase() : null;
}

export function mediaContentType(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}
