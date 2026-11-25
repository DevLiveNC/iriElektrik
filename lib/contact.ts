import type { Business, BusinessHours } from "./types";
import { mapsDirectionsUrl } from "./seo";

const PLACEHOLDER_RE =
  /(örnek|doğrulanacak|eklenecek|placeholder|example|temsili|0\s*\(000\)|000[\s).-]*000)/i;

export function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_RE.test(value.trim());
}

function cleanVerified(value: string | null | undefined, verified: boolean): string {
  if (!verified) return "";
  const clean = (value ?? "").trim();
  if (!clean || looksLikePlaceholder(clean)) return "";
  return clean;
}

function safeTelHref(href: string, label: string): string {
  const rawHref = href.trim();
  const rawLabel = label.trim();

  if (rawHref) {
    if (!/^tel:/i.test(rawHref)) return "";
    const after = rawHref.slice(4);
    const plus = after.trim().startsWith("+") ? "+" : "";
    const digits = after.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return "";
    if (/^(\d)\1+$/.test(digits) || /000000/.test(digits)) return "";
    return `tel:${plus}${digits}`;
  }

  const digits = rawLabel.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "";
  if (/^(\d)\1+$/.test(digits) || /000000/.test(digits)) return "";
  return `tel:${digits}`;
}

function safeExternalUrl(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw || looksLikePlaceholder(raw)) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeEmail(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw || looksLikePlaceholder(raw)) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : "";
}

function cleanHours(hours: BusinessHours[] | undefined, verified: boolean): BusinessHours[] {
  if (!verified || !Array.isArray(hours)) return [];
  return hours
    .map((h) => ({
      day: cleanVerified(h?.day, verified),
      open: cleanVerified(h?.open, verified),
      close: cleanVerified(h?.close, verified),
    }))
    .filter((h) => h.day && h.open && h.close);
}

export interface VerifiedContact {
  verified: boolean;
  name: string;
  address: string;
  district: string;
  city: string;
  region: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  whatsapp: string;
  profileUrl: string;
  mapsUrl: string;
  hours: BusinessHours[];
  hasPhone: boolean;
  hasMaps: boolean;
  hasAddress: boolean;
  hasHours: boolean;
  hasDetails: boolean;
  hasActions: boolean;
}

export function getVerifiedContact(business: Business): VerifiedContact {
  const verified = business.verified === true;
  const name = (business.name ?? "").trim() || "İri Oto Elektrik";
  const address = cleanVerified(business.address, verified);
  const district = cleanVerified(business.district, verified);
  const city = cleanVerified(business.city, verified);
  const phone = cleanVerified(business.phone, verified);
  const phoneHrefRaw = cleanVerified(business.phoneHref, verified);
  const phoneHref = safeTelHref(phoneHrefRaw, phone);
  const email = verified ? safeEmail(business.email) : "";
  const whatsapp = verified ? safeExternalUrl(business.whatsapp) : "";
  const profileUrl = verified ? safeExternalUrl(business.profileUrl) : "";
  const hours = cleanHours(business.hours, verified);
  const mapsUrl = verified
    ? mapsDirectionsUrl(business.lat, business.lng, address, business.mapsUrl)
    : "";

  const hasPhone = Boolean(phone && phoneHref);
  const hasMaps = Boolean(mapsUrl);
  const hasAddress = Boolean(address || district || city);
  const hasHours = hours.length > 0;
  const hasActions = hasPhone || hasMaps;

  return {
    verified,
    name,
    address,
    district,
    city,
    region: [district, city].filter(Boolean).join(", "),
    phone,
    phoneHref,
    email,
    emailHref: email ? `mailto:${email}` : "",
    whatsapp,
    profileUrl,
    mapsUrl,
    hours,
    hasPhone,
    hasMaps,
    hasAddress,
    hasHours,
    hasDetails: hasAddress || hasPhone || Boolean(email) || hasHours || hasMaps,
    hasActions,
  };
}
