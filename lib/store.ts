import { cache } from "react";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./db";
import { businessSettings, jobs, redirects } from "./db/schema";
import type { Business, Job, JobStatus } from "./types";
import seed from "@/data/seed.json";

interface StoreData {
  business: Business;
  jobs: Job[];
  redirects: Record<string, string>;
}

const STORE_PATH = join(process.cwd(), "data", "store.json");

function readFileStore(): StoreData {
  if (!existsSync(STORE_PATH)) {
    return structuredClone(seed) as unknown as StoreData;
  }
  return JSON.parse(readFileSync(STORE_PATH, "utf-8")) as StoreData;
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
    if (rows[0]) return rows[0].data as Business;
    return (seed as unknown as StoreData).business;
  }
  return readFileStore().business;
});

export const listJobs = cache(
  async (opts: {
    status?: JobStatus;
    featured?: boolean;
    category?: string;
  } = {}): Promise<Job[]> => {
    const db = getDb();
    let all: Job[];
    if (db) {
      const rows = await db.select().from(jobs);
      all = rows.map(toJob);
    } else {
      all = readFileStore().jobs;
    }
    return all
      .filter((j) => (opts.status ? j.status === opts.status : true))
      .filter((j) => (opts.featured !== undefined ? j.featured === opts.featured : true))
      .filter((j) => (opts.category ? j.category === opts.category : true))
      .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt));
  },
);

export const getJobBySlug = cache(async (slug: string): Promise<Job | null> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
    return rows[0] ? toJob(rows[0]) : null;
  }
  return readFileStore().jobs.find((j) => j.slug === slug) ?? null;
});

export const getJobById = cache(async (id: string): Promise<Job | null> => {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return rows[0] ? toJob(rows[0]) : null;
  }
  return readFileStore().jobs.find((j) => j.id === id) ?? null;
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
  const idx = data.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  const existing = data.jobs[idx];
  const next: Job = { ...existing, ...patch, updatedAt: new Date().toISOString() };
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
  data.jobs = data.jobs.filter((j) => j.id !== id);
  writeFileStore(data);
  return data.jobs.length < before;
}

export async function updateBusiness(next: Business): Promise<Business> {
  const db = getDb();
  if (db) {
    await db
      .insert(businessSettings)
      .values({ id: 1, data: next })
      .onConflictDoUpdate({ target: businessSettings.id, set: { data: next } });
    return next;
  }
  const data = readFileStore();
  data.business = next;
  writeFileStore(data);
  return next;
}

export function isDbConfigured() {
  return hasDb();
}
