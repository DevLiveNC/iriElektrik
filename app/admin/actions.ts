"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { businessSchema, jobSchema, publishSchema } from "@/lib/validation";
import { createJob, getJobById, listJobs, updateBusiness, updateJob, deleteJob } from "@/lib/store";
import type { Business, JobStatus } from "@/lib/types";

export interface ActionState {
  ok: boolean;
  errors: Record<string, string>;
  message?: string;
}

function revalidatePublic(slugs: string[] = []) {
  revalidatePath("/", "layout");
  revalidatePath("/yapilan-isler");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/yapilan-isler/${slug}`);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}

function parseGallery(raw: string): string[] {
  return raw
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function validationErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function saveJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    category: String(formData.get("category") ?? ""),
    vehicle: String(formData.get("vehicle") ?? ""),
    symptom: String(formData.get("symptom") ?? ""),
    diagnosis: String(formData.get("diagnosis") ?? ""),
    application: String(formData.get("application") ?? ""),
    result: String(formData.get("result") ?? ""),
    cover: String(formData.get("cover") ?? ""),
    gallery: parseGallery(String(formData.get("gallery") ?? "")),
    alt: String(formData.get("alt") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    featured: formData.get("featured") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) return { ok: false, errors: validationErrors(parsed.error) };

  if (parsed.data.status === "published") {
    const publish = publishSchema.safeParse(parsed.data);
    if (!publish.success) return { ok: false, errors: validationErrors(publish.error) };
  }

  const all = await listJobs({ includeExamples: true });
  if (all.some((job) => job.slug === parsed.data.slug && job.id !== id)) {
    return { ok: false, errors: { slug: "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." } };
  }

  const now = new Date().toISOString();
  const publishedAt = parsed.data.status === "published" ? now : null;

  if (id) {
    const existing = await getJobById(id);
    if (!existing) return { ok: false, errors: { form: "Kayıt bulunamadı." } };
    await updateJob(id, {
      ...parsed.data,
      publishedAt: parsed.data.status === "published" ? (existing.publishedAt ?? now) : null,
    });
    revalidatePublic([existing.slug, parsed.data.slug]);
    redirect(
      `/admin?ok=${encodeURIComponent(
        parsed.data.status === "published" ? "İş yayımlandı." : "Taslak kaydedildi.",
      )}`,
    );
  }

  await createJob({ ...parsed.data, publishedAt });
  revalidatePublic([parsed.data.slug]);
  redirect(
    `/admin?ok=${encodeURIComponent(
      parsed.data.status === "published" ? "İş yayımlandı." : "Taslak kaydedildi.",
    )}`,
  );
}

export async function setStatusAction(id: string, status: JobStatus) {
  await requireAdmin();
  const job = await getJobById(id);
  if (!job) redirect("/admin");
  if (status === "published") {
    const publish = publishSchema.safeParse(job);
    if (!publish.success) {
      redirect(
        `/admin/isler/${id}?hata=${encodeURIComponent(
          "Yayımlamak için dört aşama metni, kapak fotoğrafı ve alt metin eksiksiz olmalı.",
        )}`,
      );
    }
  }
  await updateJob(id, {
    status,
    publishedAt: status === "published" ? (job.publishedAt ?? new Date().toISOString()) : job.publishedAt,
  });
  revalidatePublic([job.slug]);
  const messages: Record<JobStatus, string> = {
    published: "İş yayımlandı.",
    draft: "İş taslağa alındı.",
    archived: "İş arşivlendi.",
  };
  redirect(`/admin?ok=${encodeURIComponent(messages[status])}`);
}

export async function deleteJobAction(id: string) {
  await requireAdmin();
  const job = await getJobById(id);
  await deleteJob(id);
  if (job) revalidatePublic([job.slug]);
  redirect(`/admin?ok=${encodeURIComponent("İş silindi.")}`);
}

export async function toggleFeaturedAction(id: string) {
  await requireAdmin();
  const job = await getJobById(id);
  if (!job) redirect("/admin");
  await updateJob(id, { featured: !job.featured });
  revalidatePublic([job.slug]);
  redirect(
    `/admin?ok=${encodeURIComponent(job.featured ? "Öne çıkarma kaldırıldı." : "İş öne çıkarıldı.")}`,
  );
}

export async function moveJobAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const all = await listJobs();
  const index = all.findIndex((job) => job.id === id);
  const otherIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || otherIndex < 0 || otherIndex >= all.length) redirect("/admin");
  const a = all[index];
  const b = all[otherIndex];
  await Promise.all([
    updateJob(a.id, { sortOrder: b.sortOrder }),
    updateJob(b.id, { sortOrder: a.sortOrder }),
  ]);
  revalidatePublic();
  redirect("/admin");
}

export async function saveBusinessAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  let services: unknown = [];
  let hours: unknown = [];
  try {
    services = JSON.parse(String(formData.get("servicesJson") ?? "[]"));
    hours = JSON.parse(String(formData.get("hoursJson") ?? "[]"));
  } catch {
    return { ok: false, errors: { form: "Hizmet veya çalışma saati verisi okunamadı." } };
  }
  const data = {
    name: String(formData.get("name") ?? ""),
    district: String(formData.get("district") ?? ""),
    city: String(formData.get("city") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    phoneHref: String(formData.get("phoneHref") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    mapsUrl: String(formData.get("mapsUrl") ?? ""),
    hours,
    profileUrl: String(formData.get("profileUrl") ?? ""),
    verified: formData.get("verified") === "on",
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroSubtitle: String(formData.get("heroSubtitle") ?? ""),
    heroSubtitleSecondary: String(formData.get("heroSubtitleSecondary") ?? ""),
    heroSecondaryEnabled: formData.get("heroSecondaryEnabled") === "on",
    shortDescription: String(formData.get("shortDescription") ?? ""),
    heroImage: String(formData.get("heroImage") ?? ""),
    heroImageAlt: String(formData.get("heroImageAlt") ?? ""),
    heroPhotoApproved: formData.get("heroPhotoApproved") === "on",
    services,
  };
  const parsed = businessSchema.safeParse(data);
  if (!parsed.success) return { ok: false, errors: validationErrors(parsed.error) };

  await updateBusiness(parsed.data as Business);
  revalidatePublic();
  redirect(`/admin/ayarlar?ok=${encodeURIComponent("İşletme ayarları kaydedildi.")}`);
}
