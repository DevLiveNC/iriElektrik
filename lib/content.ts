import type { Business, Service } from "./types";
import { looksLikePlaceholder } from "./contact";
import { isDesignPreview } from "./seo";

export const REPRESENTATIVE_HERO = {
  src: "/design-preview/atolye-onizleme.jpg",
  alt: "Açık kaput altında akü terminalini multimetreyle ölçen ustanın elleri",
} as const;

function clean(value: string): string {
  return (value ?? "").trim();
}

export function getApprovedServices(business: Business): Service[] {
  if (!Array.isArray(business.services)) return [];
  return business.services.filter((service) => {
    const title = clean(service.title);
    const symptom = clean(service.symptom);
    const work = clean(service.service);
    return (
      service.approved === true &&
      title.length >= 3 &&
      symptom.length >= 5 &&
      work.length >= 5 &&
      ![title, symptom, work].some(looksLikePlaceholder)
    );
  });
}

export interface HeroPhoto {
  src: string;
  alt: string;
  representative: boolean;
}

export function getHeroPhoto(
  business: Business,
  allowRepresentative: boolean = isDesignPreview(),
): HeroPhoto | null {
  const src = clean(business.heroImage);
  const alt = clean(business.heroImageAlt);
  const approved =
    business.heroPhotoApproved === true &&
    Boolean(src) &&
    Boolean(alt) &&
    !src.startsWith("/design-preview/") &&
    ![src, alt].some(looksLikePlaceholder);

  if (approved) return { src, alt, representative: false };
  if (allowRepresentative) {
    return { ...REPRESENTATIVE_HERO, representative: true };
  }
  return null;
}
