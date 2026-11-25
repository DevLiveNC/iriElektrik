import { z } from "zod";
import { CATEGORIES } from "./types";

export const slugSchema = z
  .string()
  .min(3, "Slug en az 3 karakter olmalı.")
  .max(80, "Slug en fazla 80 karakter olmalı.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, rakam ve tire içermeli.");

export const jobSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı.").max(120),
  slug: slugSchema,
  category: z.enum(CATEGORIES),
  vehicle: z.string().max(120).default(""),
  symptom: z.string().max(2000).default(""),
  diagnosis: z.string().max(2000).default(""),
  application: z.string().max(2000).default(""),
  result: z.string().max(2000).default(""),
  cover: z.string().max(2048).default(""),
  gallery: z.array(z.string().max(2048)).max(12).default([]),
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
});

const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(80),
  symptom: z.string().min(5).max(500),
  service: z.string().min(5).max(500),
  approved: z.boolean(),
});

const hoursSchema = z.object({
  day: z.string().min(1).max(30),
  open: z.string().max(10).default(""),
  close: z.string().max(10).default(""),
});

export const businessSchema = z.object({
  name: z.string().min(2).max(80),
  district: z.string().max(80).default(""),
  city: z.string().max(80).default(""),
  address: z.string().max(300).default(""),
  phone: z.string().max(40).default(""),
  phoneHref: z.string().max(60).default(""),
  whatsapp: z.string().max(300).default(""),
  email: z.string().max(120).default(""),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  mapsUrl: z.string().max(1000).default(""),
  hours: z.array(hoursSchema).max(14).default([]),
  profileUrl: z.string().max(1000).default(""),
  verified: z.boolean(),
  heroTitle: z.string().min(3).max(120),
  heroSubtitle: z.string().min(10).max(300),
  services: z.array(serviceSchema).max(12).default([]),
});

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
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
