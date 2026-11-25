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

function revalidatePublic(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/yapilan-isler");
  if (slug) revalidatePath(`/yapilan-isler/${slug}`);
  revalidatePath("/sitemap.xml");
}

function parseGallery(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
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
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  if (parsed.data.status === "published") {
    const pub = publishSchema.safeParse(parsed.data);
    if (!pub.success) {
      const errors: Record<string, string> = {};
      for (const issue of pub.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      return { ok: false, errors };
    }
  }

  const all = await listJobs();
  const slugTaken = all.some((j) => j.slug === parsed.data.slug && j.id !== id);
  if (slugTaken) {
    return { ok: false, errors: { slug: "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." } };
  }

  const publishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;

  if (id) {
    const existing = await getJobById(id);
    if (!existing) return { ok: false, errors: { form: "Kayıt bulunamadı." } };
    await updateJob(id, {
      ...parsed.data,
      publishedAt: existing.publishedAt ?? publishedAt,
    });
    revalidatePublic(parsed.data.slug);
    redirect(`/admin?ok=${encodeURIComponent("İş kaydedildi.")}`);
  }

  await createJob({ ...parsed.data, publishedAt });
  revalidatePublic(parsed.data.slug);
  redirect(`/admin?ok=${encodeURIComponent("İş oluşturuldu.")}`);
}

export async function setStatusAction(id: string, status: JobStatus) {
  await requireAdmin();
  const job = await getJobById(id);
  if (!job) redirect("/admin");
  if (status === "published") {
    const pub = publishSchema.safeParse(job);
    if (!pub.success) {
      redirect(`/admin/isler/${id}?hata=${encodeURIComponent("Yayımlamak için belirti, teşhis, uygulama ve sonuç alanları en az 10 karakter olmalı.")}`);
    }
  }
  await updateJob(id, {
    status,
    publishedAt: status === "published" ? (job.publishedAt ?? new Date().toISOString()) : job.publishedAt,
  });
  revalidatePublic(job.slug);
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
  if (job) revalidatePublic(job.slug);
  redirect(`/admin?ok=${encodeURIComponent("İş silindi.")}`);
}

export async function toggleFeaturedAction(id: string) {
  await requireAdmin();
  const job = await getJobById(id);
  if (!job) redirect("/admin");
  await updateJob(id, { featured: !job.featured });
  revalidatePublic(job.slug);
  redirect(`/admin?ok=${encodeURIComponent(job.featured ? "Öne çıkarma kaldırıldı." : "İş öne çıkarıldı.")}`);
}

export async function moveJobAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const all = await listJobs();
  const idx = all.findIndex((j) => j.id === id);
  if (idx === -1) redirect("/admin");
  const otherIdx = direction === "up" ? idx - 1 : idx + 1;
  if (otherIdx < 0 || otherIdx >= all.length) redirect("/admin");
  const a = all[idx];
  const b = all[otherIdx];
  await updateJob(a.id, { sortOrder: b.sortOrder });
  await updateJob(b.id, { sortOrder: a.sortOrder });
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
    return { ok: false, errors: { form: "Hizmet/saat verisi okunamadı." } };
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
    services,
  };
  const parsed = businessSchema.safeParse(data);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  await updateBusiness(parsed.data as Business);
  revalidatePublic();
  redirect(`/admin/ayarlar?ok=${encodeURIComponent("İşletme ayarları kaydedildi.")}`);
}
