export type JobStatus = "draft" | "published" | "archived";

export interface Service {
  id: string;
  title: string;
  symptom: string;
  service: string;
  approved: boolean;
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
  isExample?: boolean;
}

export const CATEGORIES = [
  "Akü ve şarj",
  "Marş ve alternatör",
  "Aydınlatma",
  "Tesisat ve arıza tespiti",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivde",
};
