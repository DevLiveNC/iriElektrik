import type { BusinessHours } from "./types";

interface StructuredBusinessInput {
  siteUrl: string;
  name: string;
  telephone?: string;
  streetAddress?: string;
  district?: string;
  city?: string;
  region?: string;
  hours?: BusinessHours[];
  image?: string;
}

const DAY_MAP: Record<string, string> = {
  pazartesi: "Monday",
  pzt: "Monday",
  salı: "Tuesday",
  sali: "Tuesday",
  çarşamba: "Wednesday",
  carsamba: "Wednesday",
  perşembe: "Thursday",
  persembe: "Thursday",
  cuma: "Friday",
  cumartesi: "Saturday",
  cmt: "Saturday",
  pazar: "Sunday",
  pzr: "Sunday",
};

function schemaDay(day: string): string | null {
  const key = day.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "");
  const mapped = DAY_MAP[key];
  return mapped ? `https://schema.org/${mapped}` : null;
}

function absoluteAsset(siteUrl: string, asset: string): string {
  try {
    return new URL(asset, siteUrl).toString();
  } catch {
    return "";
  }
}

/**
 * AutoRepair JSON-LD yalnızca iletişim bandında veya hero'da görünen,
 * doğrulanmış alanlardan oluşturulur. Puan, yorum, gizli koordinat veya
 * tahmini hizmet alanı eklenmez.
 */
export function buildAutoRepairJsonLd(
  input: StructuredBusinessInput,
): Record<string, unknown> | null {
  const telephone = input.telephone?.trim() ?? "";
  const streetAddress = input.streetAddress?.trim() ?? "";
  const openingHours = (input.hours ?? [])
    .map((h) => {
      const day = schemaDay(h.day);
      const open = h.open.trim();
      const close = h.close.trim();
      if (!day || !open || !close) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: open,
        closes: close,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  if (!telephone && !streetAddress && openingHours.length === 0) return null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${input.siteUrl}/#isletme`,
    name: input.name,
    url: input.siteUrl,
  };

  if (telephone) data.telephone = telephone.replace(/^tel:/i, "");
  if (streetAddress) {
    const address: Record<string, string> = {
      "@type": "PostalAddress",
      streetAddress,
    };
    if (input.district?.trim()) address.addressLocality = input.district.trim();
    if (input.city?.trim()) address.addressRegion = input.city.trim();
    data.address = address;
  }
  if (input.region?.trim()) data.areaServed = input.region.trim();
  if (openingHours.length > 0) data.openingHoursSpecification = openingHours;
  if (input.image?.trim()) {
    const image = absoluteAsset(input.siteUrl, input.image.trim());
    if (image) data.image = image;
  }
  return data;
}
