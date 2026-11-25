import type { Metadata } from "next";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { CATEGORIES } from "@/lib/types";
import { listJobs } from "@/lib/store";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yapılan işler",
  description: "Atölyede yapılan onarım örnekleri: belirti, teşhis, uygulama ve sonuç.",
  alternates: { canonical: "/yapilan-isler" },
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const active = kategori && (CATEGORIES as readonly string[]).includes(kategori) ? kategori : null;
  const jobs = await listJobs({ status: "published", category: active ?? undefined });

  return (
    <section aria-labelledby="arsiv-baslik" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <h1 id="arsiv-baslik" className="balance font-display text-6xl font-bold leading-none text-petrol sm:text-7xl">
        Yapılan işler
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite/85">
        Her kayıtta belirti, teşhis, uygulama ve sonucu birlikte görürsün. Fotoğraflar gerçek onarımlardan
        seçilir; plaka ve yüzler maskelenir.
      </p>

      <nav aria-label="Kategori filtresi" className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/yapilan-isler"
          aria-current={!active ? "page" : undefined}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
            !active ? "bg-petrol text-paper" : "border-2 border-petrol/25 text-petrol hover:border-petrol"
          }`}
        >
          Tümü
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/yapilan-isler?kategori=${encodeURIComponent(c)}`}
            aria-current={active === c ? "page" : undefined}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              active === c ? "bg-petrol text-paper" : "border-2 border-petrol/25 text-petrol hover:border-petrol"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {jobs.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-petrol/30 bg-paper-2 px-6 py-10 text-center text-graphite/80">
          Bu kategoride yayımlanmış iş yok. Yeni işler eklendikçe burada listelenecek.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
