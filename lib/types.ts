export type JobStatus = "draft" | "published" | "archived";

export interface Service {
  id: string;
  title: string;
  symptom: string;
  service: string;
  approved: boolean;
  /** İşletmenin yüklediği gerçek fotoğraf (yoksa temsili görsel kullanılır). */
  image?: string;
  /** Gerçek fotoğrafın Türkçe alt metni. */
  imageAlt?: string;
  /** Kapsam genişletmesiyle eklenmiş, henüz resmî teyit edilmemiş hizmet. */
  proposed?: boolean;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
}

export interface Business {
  name: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  lat: number | null;
  lng: number | null;
  mapsUrl: string;
  hours: BusinessHours[];
  profileUrl: string;
  verified: boolean;
  heroTitle: string;
  heroSubtitle: string;
  /** Resmî alt başlığın altında gösterilecek isteğe bağlı ikinci satır. */
  heroSubtitleSecondary: string;
  /** İkinci satır yalnızca işletme açıkça açarsa gösterilir. */
  heroSecondaryEnabled: boolean;
  /** Footer ve kısa tanım için kullanılan özet cümle. */
  shortDescription: string;
  heroImage: string;
  heroImageAlt: string;
  heroPhotoApproved: boolean;
  services: Service[];
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  category: string;
  vehicle: string;
  symptom: string;
  diagnosis: string;
  application: string;
  result: string;
  cover: string;
  gallery: string[];
  alt: string;
  status: JobStatus;
  featured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Eski veritabanlarında kalan örnek kayıtları ayırt etmek için korunur. */
  isExample?: boolean;
}

export const CATEGORIES = [
  "Akü ve şarj",
  "Marş ve alternatör",
  "Aydınlatma",
  "Tesisat ve arıza tespiti",
  "Teyp ve multimedya",
  "Ses sistemi",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivde",
};
