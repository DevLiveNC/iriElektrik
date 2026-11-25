import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPublishedJobBySlug, getRedirect, listPublishedJobs } from "@/lib/store";
import { isIndexableProduction } from "@/lib/seo";

export const revalidate = 3600;

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

const STEPS = [
  { key: "symptom", label: "Belirti" },
  { key: "diagnosis", label: "Teşhis" },
  { key: "application", label: "Uygulama" },
  { key: "result", label: "Sonuç" },
] as const;

export async function generateStaticParams() {
  const jobs = await listPublishedJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) {
    return {
      title: "Kayıt bulunamadı",
      robots: { index: false, follow: false },
    };
  }
  const description = `${job.title} — Belirti: ${job.symptom} Sonuç: ${job.result}`.slice(0, 160);
  return {
    title: job.title,
    description,
    alternates: { canonical: `/yapilan-isler/${job.slug}` },
    openGraph: {
      type: "article",
      title: job.title,
      description,
      url: `/yapilan-isler/${job.slug}`,
      images: [{ url: job.cover, alt: job.alt }],
    },
    robots: isIndexableProduction()
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    const target = await getRedirect(slug);
    if (target) {
      const redirected = await getPublishedJobBySlug(target);
      if (redirected) redirect(`/yapilan-isler/${redirected.slug}`);
    }
    notFound();
  }

  const gallery = job.gallery.filter(Boolean);
  const publishedAt = job.publishedAt ? dateFmt.format(new Date(job.publishedAt)) : null;

  return (
    <article className="job-detail">
      <Link href="/yapilan-isler" className="breadcrumb">
        Tüm işler
      </Link>
      <p className="job-category">{job.category}</p>
      <h1 className="job-title">{job.title}</h1>
      <p className="job-meta">
        {job.vehicle ? `${job.vehicle} · ` : ""}
        {publishedAt ?? "Yayımlanmış kayıt"}
      </p>

      <figure className="job-cover">
        <div className="job-cover__frame">
          <Image
            src={job.cover}
            alt={job.alt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="job-cover__image"
          />
        </div>
        <figcaption className="job-cover__caption">{job.alt}</figcaption>
      </figure>

      <dl className="job-steps">
        {STEPS.map((step) => (
          <div key={step.key} className="job-step">
            <dt className="job-step__label">{step.label}</dt>
            <dd className="job-step__value">{job[step.key]}</dd>
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
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
