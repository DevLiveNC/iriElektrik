function cleanHost(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function absoluteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const configured = absoluteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "");
  if (configured) return configured;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    const candidate = absoluteUrl(`https://${cleanHost(productionHost)}`);
    if (candidate) return candidate;
  }

  const deploymentHost = process.env.VERCEL_URL?.trim();
  if (deploymentHost) {
    const candidate = absoluteUrl(`https://${cleanHost(deploymentHost)}`);
    if (candidate) return candidate;
  }

  return "http://localhost:3000";
}

/** Yalnızca Vercel production dağıtımı indekslenebilir; build/preview noindex kalır. */
export function isIndexableProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function isProductionBuild(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
}

/** Temsili fotoğraf yalnızca yerel geliştirme, Vercel preview veya açıkça istenen önizlemede görünür. */
export function isDesignPreview(): boolean {
  if (process.env.DESIGN_PREVIEW === "1") return true;
  if (process.env.DESIGN_PREVIEW === "0") return false;
  if (process.env.VERCEL_ENV === "preview") return true;
  return process.env.NODE_ENV !== "production";
}

const GOOGLE_MAPS_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
  "g.page",
]);

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return GOOGLE_MAPS_HOSTS.has(host) || host === "www.google.com.tr" || host.endsWith(".google.com");
}

/** Yöneticinin girdiği Google Maps hedefini doğrudan yol tarifi URL'sine çevirir. */
export function safeGoogleMapsDirectionsUrl(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }
  if (url.protocol !== "https:" || !isGoogleMapsHost(url.hostname)) return "";

  const path = url.pathname.toLowerCase();
  const hasDestination =
    url.searchParams.has("destination") ||
    url.searchParams.has("destination_place_id") ||
    path.startsWith("/maps/dir");
  if (hasDestination) return url.toString();

  const isPlaceTarget =
    path.startsWith("/maps/place") ||
    path.startsWith("/maps/search") ||
    url.searchParams.has("q") ||
    url.hostname.includes("goo.gl") ||
    url.hostname === "g.page";
  if (isPlaceTarget) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(url.toString())}`;
  }
  return "";
}

export function mapsDirectionsUrl(
  lat: number | null,
  lng: number | null,
  address: string,
  mapsUrl = "",
): string {
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
  }

  const supplied = safeGoogleMapsDirectionsUrl(mapsUrl);
  if (supplied) return supplied;

  const cleanAddress = address.trim();
  if (cleanAddress) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanAddress)}`;
  }
  return "";
}
