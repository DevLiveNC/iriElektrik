import { z } from "zod";
import { CATEGORIES } from "./types";

export const slugSchema = z
  .string()
  .min(3, "Slug en az 3 karakter olmalı.")
  .max(80, "Slug en fazla 80 karakter olmalı.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, rakam ve tire içermeli.");

function isSafeImage(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/design-preview/")) return false;
  // Yeni yüklemeler erişim denetimli /api/media üzerinden sunulur.
  if (/^\/api\/media\/[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(value)) return true;
  // Eski dağıtımlarda kalan yerel/Blob görselleri okunmaya devam eder.
  if (/^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(value)) return true;
  if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s]+$/i.test(value)) return true;
  return false;
}

function isSafeHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const imageSchema = z
  .string()
  .max(2048)
  .refine(isSafeImage, "Yalnızca yüklenen yerel görseller veya Vercel Blob URL’leri kabul edilir.");

const httpsUrlSchema = z
  .string()
  .max(1000)
  .refine(isSafeHttpsUrl, "Bağlantı https:// ile başlamalı.");

const phoneHrefSchema = z
  .string()
  .max(60)
  .refine(
    (value) => !value || /^tel:\+?[0-9][0-9\s().-]*$/i.test(value),
    "Telefon bağlantısı tel: ile başlamalı ve yalnızca numara içermeli.",
  );

export const jobSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı.").max(120),
  slug: slugSchema,
  category: z.enum(CATEGORIES),
  vehicle: z.string().max(120).default(""),
  symptom: z.string().max(2000).default(""),
  diagnosis: z.string().max(2000).default(""),
  application: z.string().max(2000).default(""),
  result: z.string().max(2000).default(""),
  cover: imageSchema.default(""),
  gallery: z.array(imageSchema).max(12).default([]),
  alt: z.string().max(200).default(""),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const publishSchema = jobSchema.superRefine((data, ctx) => {
  const required: Array<[string, string]> = [
    ["symptom", data.symptom],
    ["diagnosis", data.diagnosis],
    ["application", data.application],
    ["result", data.result],
  ];
  for (const [field, value] of required) {
    if (value.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Yayımlamak için bu alan en az 10 karakter olmalı.",
      });
    }
  }
  if (!data.cover.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["cover"],
      message: "Yayımlamak için önce bir kapak fotoğrafı yükleyin.",
    });
  }
  if (data.alt.trim().length < 5) {
    ctx.addIssue({
      code: "custom",
      path: ["alt"],
      message: "Yayımlamak için anlamlı bir fotoğraf alt metni yazın.",
    });
  }
});

const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(80),
  symptom: z.string().min(5).max(500),
  service: z.string().min(5).max(500),
  approved: z.boolean(),
  image: imageSchema.default(""),
  imageAlt: z.string().max(200).default(""),
  proposed: z.boolean().default(false),
});

const hoursSchema = z.object({
  day: z.string().min(1).max(30),
  open: z.string().max(10).default(""),
  close: z.string().max(10).default(""),
});

const businessBaseSchema = z.object({
  name: z.string().min(2).max(80),
  district: z.string().max(80).default(""),
  city: z.string().max(80).default(""),
  address: z.string().max(300).default(""),
  phone: z.string().max(40).default(""),
  phoneHref: phoneHrefSchema.default(""),
  whatsapp: httpsUrlSchema.default(""),
  email: z.string().max(120).default(""),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  mapsUrl: httpsUrlSchema.default(""),
  hours: z.array(hoursSchema).max(14).default([]),
  profileUrl: httpsUrlSchema.default(""),
  verified: z.boolean(),
  heroTitle: z.string().min(3).max(120),
  heroSubtitle: z.string().min(10).max(300),
  heroSubtitleSecondary: z.string().max(300).default(""),
  heroSecondaryEnabled: z.boolean().default(false),
  shortDescription: z.string().max(300).default(""),
  heroImage: imageSchema.default(""),
  heroImageAlt: z.string().max(200).default(""),
  heroPhotoApproved: z.boolean().default(false),
  services: z.array(serviceSchema).max(12).default([]),
});

export const businessSchema = businessBaseSchema.superRefine((data, ctx) => {
  if (data.heroPhotoApproved) {
    if (!data.heroImage.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["heroImage"],
        message: "Fotoğrafı onaylamak için önce gerçek bir atölye fotoğrafı yükleyin.",
      });
    }
    if (data.heroImageAlt.trim().length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["heroImageAlt"],
        message: "Onaylı fotoğraf için anlamlı bir alt metin yazın.",
      });
    }
  }
  if (data.verified && data.phone.trim() && !data.phoneHref.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["phoneHref"],
      message: "Doğrulanmış telefon için tel: bağlantısını da girin.",
    });
  }
});

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
