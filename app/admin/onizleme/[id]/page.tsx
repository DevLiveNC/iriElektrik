import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getJobById } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "symptom", label: "Belirti" },
  { key: "diagnosis", label: "Teşhis" },
  { key: "application", label: "Uygulama" },
  { key: "result", label: "Sonuç" },
] as const;

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();
  const gallery = job.gallery.filter(Boolean);

  return (
    <div>
      <p role="status" className="rounded-xl border border-petrol/20 bg-paper-2 px-5 py-4 font-semibold text-petrol">
        Önizleme — bu sayfa yalnızca yönetim oturumuyla görünür. Durum: {STATUS_LABELS[job.status]}
      </p>
      <article className="mx-auto mt-8 max-w-4xl">
        <Link href="/admin" className="font-bold text-petrol underline underline-offset-4">
          Panele dön
        </Link>
        <p className="mt-6 text-sm font-bold uppercase tracking-wide text-petrol/60">{job.category}</p>
        <h1 className="balance mt-1 font-display text-5xl font-bold leading-[0.95] text-petrol sm:text-6xl">
          {job.title}
        </h1>
        {job.vehicle && <p className="mt-3 text-sm text-graphite/75">{job.vehicle}</p>}
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
        </figure>
        <dl className="mt-10 divide-y divide-petrol/15 border-y border-petrol/15">
          {STEPS.map((step) => (
            <div key={step.key} className="grid gap-1 py-5 md:grid-cols-12 md:gap-6">
              <dt className="font-display text-2xl font-semibold text-petrol md:col-span-3">{step.label}</dt>
              <dd className="leading-relaxed text-graphite/90 md:col-span-9">{job[step.key] || "—"}</dd>
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
    </div>
  );
}
