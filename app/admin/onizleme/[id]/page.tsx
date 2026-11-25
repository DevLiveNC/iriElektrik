import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isPrivateMediaSrc } from "@/lib/media";
import { getJobById } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Taslak önizleme",
  robots: { index: false, follow: false },
};

const STEPS = [
  { key: "symptom", label: "Belirti" },
  { key: "diagnosis", label: "Teşhis" },
  { key: "application", label: "Uygulama" },
  { key: "result", label: "Sonuç" },
] as const;

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();
  const gallery = job.gallery.filter(Boolean);

  return (
    <div>
      <p role="status" className="toast admin-preview__notice">
        Önizleme — yalnızca yönetim oturumuyla görünür. Durum: {STATUS_LABELS[job.status]}
      </p>
      <article className="job-detail">
        <Link href="/admin" className="breadcrumb">
          Panele dön
        </Link>
        <p className="job-category">{job.category}</p>
        <h1 className="job-title">{job.title}</h1>
        {job.vehicle && <p className="job-meta">{job.vehicle}</p>}

        {job.cover ? (
          <figure className="job-cover">
            <div className="admin-preview__image">
              <Image
                src={job.cover}
                alt={job.alt || job.title}
                fill
                priority
                sizes="(min-width: 1024px) 960px, 100vw"
                unoptimized={isPrivateMediaSrc(job.cover)}
              />
            </div>
          </figure>
        ) : (
          <div className="admin-preview__empty">Kapak fotoğrafı henüz yüklenmedi.</div>
        )}

        <dl className="job-steps">
          {STEPS.map((step) => (
            <div key={step.key} className="job-step">
              <dt className="job-step__label">{step.label}</dt>
              <dd className="job-step__value">{job[step.key] || "—"}</dd>
            </div>
          ))}
        </dl>

        {gallery.length > 0 && (
          <section aria-labelledby="galeri-baslik" className="gallery">
            <h2 id="galeri-baslik" className="section-title">
              Fotoğraflar
            </h2>
            <div className="gallery__grid">
              {gallery.map((src, index) => (
                <div key={`${src}-${index}`} className="gallery__frame">
                  <Image
                    src={src}
                    alt={`${job.title} — fotoğraf ${index + 1}`}
                    fill
                    loading="lazy"
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="gallery__image"
                    unoptimized={isPrivateMediaSrc(src)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
