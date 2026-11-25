import type { Metadata } from "next";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { CATEGORIES } from "@/lib/types";
import { listPublishedJobs } from "@/lib/store";
import { isIndexableProduction } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Yapılan işler",
    description:
      "Yayımlanmış oto elektrik onarımları: belirti, teşhis, uygulama ve sonuç.",
    alternates: { canonical: "/yapilan-isler" },
    openGraph: {
      title: "Yapılan işler",
      description:
        "Yayımlanmış oto elektrik onarımları: belirti, teşhis, uygulama ve sonuç.",
      url: "/yapilan-isler",
      type: "website",
    },
    robots: isIndexableProduction()
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const active =
    kategori && (CATEGORIES as readonly string[]).includes(kategori) ? kategori : null;
  const allJobs = await listPublishedJobs();
  const jobs = active ? allJobs.filter((job) => job.category === active) : allJobs;
  const availableCategories = CATEGORIES.filter((category) =>
    allJobs.some((job) => job.category === category),
  );

  return (
    <div className="section__inner page-head">
      <section aria-labelledby="arsiv-baslik">
        <h1 id="arsiv-baslik" className="page-title">
          Yapılan işler
        </h1>
        <p className="page-intro">
          Gerçek onarım kayıtlarında belirti, teşhis, uygulama ve sonucu birlikte görürsün.
        </p>

        {allJobs.length > 0 && (
          <nav aria-label="Kategori filtresi" className="filter-nav">
            <Link
              href="/yapilan-isler"
              aria-current={!active ? "page" : undefined}
              className="filter-link"
            >
              Tümü
            </Link>
            {availableCategories.map((category) => (
              <Link
                key={category}
                href={`/yapilan-isler?kategori=${encodeURIComponent(category)}`}
                aria-current={active === category ? "page" : undefined}
                className="filter-link"
              >
                {category}
              </Link>
            ))}
          </nav>
        )}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>Henüz yayımlanmış iş yok.</p>
            <p className="archive-empty__link">
              <Link href="/" className="text-link">
                Ana sayfaya dön
              </Link>
            </p>
          </div>
        ) : (
          <div className="archive-list">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
