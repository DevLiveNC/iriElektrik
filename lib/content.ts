import type { Business, Service } from "./types";
import { looksLikePlaceholder } from "./contact";
import { isDesignPreview } from "./seo";
import { PLACEHOLDER_IMAGES, SERVICE_PLACEHOLDER, type PlaceholderId } from "@/data/placeholders";

function clean(value: string | undefined | null): string {
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
    const placeholder = PLACEHOLDER_IMAGES["hero-bay-16x9"];
    return { src: placeholder.src, alt: placeholder.alt, representative: true };
  }
  return null;
}

/**
 * Hero karesi için mobil kırpım kaynağı.
 * Yalnızca temsili önizlemede anlamlıdır; onaylı gerçek fotoğrafta mobil
 * varyantı yoktur ve aynı görsel kırpılır.
 */
export function getHeroMobilePhoto(
  business: Business,
  allowRepresentative: boolean = isDesignPreview(),
): string {
  if (!allowRepresentative) return "";
  const src = clean(business.heroImage);
  const approved =
    business.heroPhotoApproved === true &&
    Boolean(src) &&
    !src.startsWith("/design-preview/");
  if (approved) return "";
  return PLACEHOLDER_IMAGES["hero-bay-4x5"].src;
}

export interface ResolvedPhoto {
  src: string;
  alt: string;
  /** Temsili önizleme görseli mi? */
  representative: boolean;
  /** Temseli ise görünen açıklama. */
  caption: string;
  /** Gerçek fotoğraf yoksa gösterilecek owner işareti. */
  ownerMarker: string;
}

/**
 * Hizmet bayı için görsel çözer.
 *
 * Öncelik sırası:
 *  1. İşletmenin yüklediği gerçek fotoğraf + alt metin (her zaman gerçek).
 *  2. Tasarım önizlemesinde etiketli temsili görsel.
 *  3. Her iki durumda da yoksa `null` — bay grafit plaka ile gösterilir.
 */
export function getServicePhoto(
  service: Service,
  allowRepresentative: boolean = isDesignPreview(),
): ResolvedPhoto | null {
  const ownSrc = clean(service.image);
  const ownAlt = clean(service.imageAlt);
  const ownIsReal =
    Boolean(ownSrc) &&
    Boolean(ownAlt) &&
    !ownSrc.startsWith("/design-preview/") &&
    ![ownSrc, ownAlt].some(looksLikePlaceholder);
  if (ownIsReal) {
    return {
      src: ownSrc,
      alt: ownAlt,
      representative: false,
      caption: "",
      ownerMarker: "",
    };
  }

  const placeholderId: PlaceholderId | undefined = SERVICE_PLACEHOLDER[service.id];
  if (allowRepresentative && placeholderId) {
    const placeholder = PLACEHOLDER_IMAGES[placeholderId];
    return {
      src: placeholder.src,
      alt: placeholder.alt,
      representative: true,
      caption: placeholder.caption,
      ownerMarker: placeholder.ownerMarker,
    };
  }

  return null;
}

/** Karşılaştırma kaydırıcısının görsel çifti (yalnızca önizlemede). */
export function getLampPair(
  allowRepresentative: boolean = isDesignPreview(),
): { before: ResolvedPhoto; after: ResolvedPhoto } | null {
  if (!allowRepresentative) return null;
  const before = PLACEHOLDER_IMAGES["lamba-once-16x9"];
  const after = PLACEHOLDER_IMAGES["lamba-sonra-16x9"];
  return {
    before: {
      src: before.src,
      alt: before.alt,
      representative: true,
      caption: before.caption,
      ownerMarker: before.ownerMarker,
    },
    after: {
      src: after.src,
      alt: after.alt,
      representative: true,
      caption: after.caption,
      ownerMarker: after.ownerMarker,
    },
  };
}

/** Temsili görseller yalnızca önizlemede gösterilir. */
export function getPlaceholderPhoto(
  id: PlaceholderId,
  allowRepresentative: boolean = isDesignPreview(),
): ResolvedPhoto | null {
  if (!allowRepresentative) return null;
  const placeholder = PLACEHOLDER_IMAGES[id];
  return {
    src: placeholder.src,
    alt: placeholder.alt,
    representative: true,
    caption: placeholder.caption,
    ownerMarker: placeholder.ownerMarker,
  };
}

/**
 * Hizmetin gerçek fotoğrafı yokken gösterilecek owner işareti.
 * Bu işaret public arayüzde görünür kalır; tasarım önizlemesi kapalıyken de
 * “fotoğraf bekleniyor” durumu dürüst biçimde anlatılır.
 */
export function getServiceOwnerMarker(service: Service): string {
  const placeholderId = SERVICE_PLACEHOLDER[service.id];
  if (placeholderId) return PLACEHOLDER_IMAGES[placeholderId].ownerMarker;
  return "[SAHİP DOLDURACAK: onaylı hizmet fotoğrafı + alt metin; plaka ve yüz yok]";
}
