import { cache } from "react";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./db";
import { businessSettings, jobs, redirects } from "./db/schema";
import type { Business, BusinessHours, Job, JobStatus, Service } from "./types";
import seed from "@/data/seed.json";

interface StoreData {
  business: Business;
  jobs: Job[];
  redirects: Record<string, string>;
}

const STORE_PATH = join(process.cwd(), "data", "store.json");

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asCoordinate(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeHours(value: unknown): BusinessHours[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item ?? {}) as Partial<BusinessHours>;
    return {
      day: asString(row.day),
      open: asString(row.open),
      close: asString(row.close),
    };
  });
}

function normalizeServices(value: unknown): Service[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row = (item ?? {}) as Partial<Service>;
    return {
      id: asString(row.id) || `hizmet-${index + 1}`,
      title: asString(row.title),
      symptom: asString(row.symptom),
      service: asString(row.service),
      approved: asBoolean(row.approved),
      image: asString(row.image),
      imageAlt: asString(row.imageAlt),
      proposed: asBoolean(row.proposed),
    };
  });
}

export function normalizeBusiness(value: Partial<Business> | null | undefined): Business {
  const raw = (value ?? {}) as Partial<Business>;
  return {
    name: asString(raw.name) || "İri Oto Elektrik",
    district: asString(raw.district),
    city: asString(raw.city),
    address: asString(raw.address),
    phone: asString(raw.phone),
    phoneHref: asString(raw.phoneHref),
    whatsapp: asString(raw.whatsapp),
    email: asString(raw.email),
    lat: asCoordinate(raw.lat),
    lng: asCoordinate(raw.lng),
    mapsUrl: asString(raw.mapsUrl),
    hours: normalizeHours(raw.hours),
    profileUrl: asString(raw.profileUrl),
    verified: asBoolean(raw.verified),
    heroTitle: asString(raw.heroTitle) || "Aracın elektriğini çözüyoruz.",
    heroSubtitle:
      asString(raw.heroSubtitle) ||
      "Akü, şarj, marş, aydınlatma ve tesisat arızalarında ölçüm ve arıza tespiti.",
    heroSubtitleSecondary: asString(raw.heroSubtitleSecondary),
    heroSecondaryEnabled: asBoolean(raw.heroSecondaryEnabled),
    shortDescription:
      asString(raw.shortDescription) ||
      "Akü, şarj, marş, aydınlatma ve tesisat arızalarında ölçüm ve arıza tespiti.",
    heroImage: asString(raw.heroImage),
    heroImageAlt: asString(raw.heroImageAlt),
    heroPhotoApproved: asBoolean(raw.heroPhotoApproved),
    services: normalizeServices(raw.services),
  };
}

const DEFAULT_BUSINESS = normalizeBusiness(seed.business as Partial<Business>);

function normalizeJob(value: Partial<Job> | null | undefined): Job {
  const raw = (value ?? {}) as Partial<Job>;
  const now = new Date().toISOString();
  return {
    id: asString(raw.id) || `job-${Math.random().toString(36).slice(2, 10)}`,
    title: asString(raw.title),
    slug: asString(raw.slug),
    category: asString(raw.category),
    vehicle: asString(raw.vehicle),
    symptom: asString(raw.symptom),
    diagnosis: asString(raw.diagnosis),
    application: asString(raw.application),
    result: asString(raw.result),
    cover: asString(raw.cover),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.filter((v): v is string => typeof v === "string") : [],
    alt: asString(raw.alt),
    status: (["draft", "published", "archived"] as const).includes(raw.status as JobStatus)
      ? (raw.status as JobStatus)
      : "draft",
    featured: asBoolean(raw.featured),
    sortOrder: typeof raw.sortOrder === "number" && Number.isFinite(raw.sortOrder) ? raw.sortOrder : 0,
    publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
    isExample: asBoolean(raw.isExample),
  };
}

function isExampleRecord(job: Job): boolean {
  return (
    job.isExample === true ||
    job.id.startsWith("ornek-") ||
    /(^|-)ornek(-|$)/i.test(job.slug) ||
    /örnek kayıt/i.test(job.title)
  );
}

export function isPublishableJob(job: Job): boolean {
  const narrative = [job.symptom, job.diagnosis, job.application, job.result];
  return (
    job.status === "published" &&
    !isExampleRecord(job) &&
    Boolean(job.cover.trim()) &&
    Boolean(job.alt.trim()) &&
    narrative.every((value) => value.trim().length >= 10)
  );
}

function readFileStore(): StoreData {
  if (!existsSync(STORE_PATH)) {
    return {
      business: structuredClone(DEFAULT_BUSINESS),
      jobs: [],
      redirects: {},
    };
  }
  const raw = JSON.parse(readFileSync(STORE_PATH, "utf-8")) as {
    business?: Partial<Business>;
    jobs?: Partial<Job>[];
    redirects?: Record<string, string> | unknown[];
  };
  const redirectsValue = raw.redirects;
  return {
    business: normalizeBusiness(raw.business),
    jobs: Array.isArray(raw.jobs) ? raw.jobs.map(normalizeJob) : [],
    redirects:
      redirectsValue && !Array.isArray(redirectsValue)
        ? Object.fromEntries(
            Object.entries(redirectsValue).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
  };
}

function writeFileStore(data: StoreData) {
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function hasDb() {
  return getDb() !== null;
}

function toJob(row: typeof jobs.$inferSelect): Job {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    vehicle: row.vehicle,
    symptom: row.symptom,
    diagnosis: row.diagnosis,
    application: row.application,
    result: row.result,
    cover: row.cover,
    gallery: row.gallery ?? [],
    alt: row.alt,
    status: row.status as JobStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isExample: row.isExample,
  };
}

export const getBusiness = cache(async (): Promise<Business> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(businessSettings).limit(1);
    if (rows[0]) return normalizeBusiness(rows[0].data as Partial<Business>);
    return structuredClone(DEFAULT_BUSINESS);
  }
  return readFileStore().business;
});

export const listJobs = cache(
  async (
    opts: {
      status?: JobStatus;
      featured?: boolean;
      category?: string;
      includeExamples?: boolean;
    } = {},
  ): Promise<Job[]> => {
    const db = getDb();
    let all: Job[];
    if (db) {
      const rows = await db.select().from(jobs);
      all = rows.map(toJob);
    } else {
      all = readFileStore().jobs;
    }
    return all
      .filter((job) => opts.includeExamples || !isExampleRecord(job))
      .filter((job) => (opts.status ? job.status === opts.status : true))
      .filter((job) => (opts.featured !== undefined ? job.featured === opts.featured : true))
      .filter((job) => (opts.category ? job.category === opts.category : true))
      .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt));
  },
);

/** Public sayfalar ve sitemap için tek kaynak: yalnızca gerçek, eksiksiz, yayımlanmış işler. */
export const listPublishedJobs = cache(
  async (opts: { featured?: boolean; category?: string } = {}): Promise<Job[]> => {
    const published = await listJobs({ ...opts, status: "published" });
    return published.filter(isPublishableJob);
  },
);

export const getJobBySlug = cache(async (slug: string): Promise<Job | null> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
    return rows[0] ? toJob(rows[0]) : null;
  }
  const job = readFileStore().jobs.find((item) => item.slug === slug);
  return job ? normalizeJob(job) : null;
});

export const getPublishedJobBySlug = cache(async (slug: string): Promise<Job | null> => {
  const job = await getJobBySlug(slug);
  return job && isPublishableJob(job) ? job : null;
});

export const getJobById = cache(async (id: string): Promise<Job | null> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return rows[0] ? toJob(rows[0]) : null;
  }
  const job = readFileStore().jobs.find((item) => item.id === id);
  return job ? normalizeJob(job) : null;
});

export const getRedirect = cache(async (slug: string): Promise<string | null> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(redirects).where(eq(redirects.oldSlug, slug)).limit(1);
    return rows[0]?.newSlug ?? null;
  }
  return readFileStore().redirects[slug] ?? null;
});

export async function createJob(input: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
  const now = new Date().toISOString();
  const job: Job = {
    ...input,
    id: `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    isExample: false,
  };
  const db = getDb();
  if (db) {
    await db.insert(jobs).values({
      ...job,
      publishedAt: job.publishedAt ? new Date(job.publishedAt) : null,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    });
    return job;
  }
  const data = readFileStore();
  data.jobs.push(job);
  writeFileStore(data);
  return job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job | null> {
  const db = getDb();
  if (db) {
    const existing = await getJobById(id);
    if (!existing) return null;
    const next: Job = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await db
      .update(jobs)
      .set({
        ...next,
        publishedAt: next.publishedAt ? new Date(next.publishedAt) : null,
        createdAt: new Date(next.createdAt),
        updatedAt: new Date(next.updatedAt),
      })
      .where(eq(jobs.id, id));
    if (patch.slug && patch.slug !== existing.slug) {
      await db
        .insert(redirects)
        .values({ oldSlug: existing.slug, newSlug: patch.slug })
        .onConflictDoUpdate({ target: redirects.oldSlug, set: { newSlug: patch.slug } });
    }
    return next;
  }
  const data = readFileStore();
  const idx = data.jobs.findIndex((job) => job.id === id);
  if (idx === -1) return null;
  const existing = data.jobs[idx];
  const next: Job = { ...existing, ...patch, updatedAt: new Date().toISOString(), isExample: false };
  data.jobs[idx] = next;
  if (patch.slug && patch.slug !== existing.slug) {
    data.redirects[existing.slug] = patch.slug;
  }
  writeFileStore(data);
  return next;
}

export async function deleteJob(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    const rows = await db.delete(jobs).where(eq(jobs.id, id)).returning({ id: jobs.id });
    return rows.length > 0;
  }
  const data = readFileStore();
  const before = data.jobs.length;
  data.jobs = data.jobs.filter((job) => job.id !== id);
  writeFileStore(data);
  return data.jobs.length < before;
}

export async function updateBusiness(next: Business): Promise<Business> {
  const clean = normalizeBusiness(next);
  const db = getDb();
  if (db) {
    await db
      .insert(businessSettings)
      .values({ id: 1, data: clean })
      .onConflictDoUpdate({ target: businessSettings.id, set: { data: clean } });
    return clean;
  }
  const data = readFileStore();
  data.business = clean;
  writeFileStore(data);
  return clean;
}

export function isDbConfigured() {
  return hasDb();
}
