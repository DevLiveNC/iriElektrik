import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ExampleBadge from "@/components/ExampleBadge";
import { getJobBySlug, getRedirect, listJobs } from "@/lib/store";

export const revalidate = 3600;

export async function generateStaticParams() {
  const jobs = await listJobs({ status: "published" });
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job || job.status !== "published") return { title: "Kayıt bulunamadı" };
  const description = `${job.title} — Belirti: ${job.symptom} Sonuç: ${job.result}`.slice(0, 160);
  return {
    title: job.title,
    description,
    alternates: { canonical: `/yapilan-isler/${job.slug}` },
    openGraph: {
      type: "article",
      title: job.title,
      description,
      images: job.cover ? [{ url: job.cover, alt: job.alt || job.title }] : undefined,
    },
  };
}

const STEPS = [
  { key: "symptom", label: "Belirti" },
  { key: "diagnosis", label: "Teşhis" },
  { key: "application", label: "Uygulama" },
  { key: "result", label: "Sonuç" },
] as const;

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job || job.status !== "published") {
    const target = await getRedirect(slug);
    if (target) redirect(`/yapilan-isler/${target}`);
    notFound();
  }

  const gallery = job.gallery.filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/yapilan-isler" className="font-bold text-petrol underline underline-offset-4 hover:text-petrol-2">
        Tüm işler
      </Link>
      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-petrol/60">{job.category}</p>
      <h1 className="balance mt-1 font-display text-5xl font-bold leading-[0.95] text-petrol sm:text-6xl">
        {job.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-graphite/75">
        {job.vehicle && <span>{job.vehicle}</span>}
        {job.isExample && <ExampleBadge label="Örnek kayıt" />}
      </div>

      <figure className="mt-8">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-paper-2">
          <Image
            src={job.cover || "/placeholder-is.svg"}
            alt={job.alt || job.title}
            fill
            priority
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-sm text-graphite/70">
          {job.alt || "Onarım fotoğrafı"}
        </figcaption>
      </figure>

      <dl className="mt-10 divide-y divide-petrol/15 border-y border-petrol/15">
        {STEPS.map((step) => (
          <div key={step.key} className="grid gap-1 py-5 md:grid-cols-12 md:gap-6">
            <dt className="font-display text-2xl font-semibold text-petrol md:col-span-3">{step.label}</dt>
            <dd className="leading-relaxed text-graphite/90 md:col-span-9">{job[step.key]}</dd>
          </div>
        ))}
      </dl>

      {gallery.length > 0 && (
        <section aria-labelledby="galeri-baslik" className="mt-10">
          <h2 id="galeri-baslik" className="font-display text-3xl font-semibold text-petrol">
            Fotoğraflar
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-[3/2] overflow-hidden rounded-xl bg-paper-2">
                <Image
                  src={src}
                  alt={`${job.title} — fotoğraf ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
