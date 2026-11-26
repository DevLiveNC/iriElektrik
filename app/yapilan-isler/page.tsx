import type { Metadata } from "next";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { CATEGORIES } from "@/lib/types";
import { listPublishedJobs } from "@/lib/store";
import { isIndexableProduction } from "@/lib/seo";
import { JOBS_EMPTY_SUB, JOBS_EMPTY_TITLE, JOBS_EYEBROW, UI } from "@/data/landing-content";

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
    <div className="public-page">
      <div className="archive-hero">
        <div className="section__inner archive-hero__inner">
          <span className="eyebrow">{JOBS_EYEBROW}</span>
          <h1 id="arsiv-baslik" className="page-title">
            Yapılan işler
          </h1>
          <p className="page-intro">
            Gerçek onarım kayıtlarında aracın verdiği belirti, ölçümle konulan teşhis, yapılan
            uygulama ve teslim sonucunu birlikte görebilirsin.
          </p>
        </div>
      </div>

      <section aria-labelledby="arsiv-baslik" className="section__inner archive-content">
        {allJobs.length > 0 ? (
          <nav aria-label="Kategori filtresi" className="filter-nav">
            <Link
              href="/yapilan-isler"
              aria-current={!active ? "page" : undefined}
              className="filter-link"
            >
              Tümü ({allJobs.length})
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
        ) : null}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">{JOBS_EMPTY_TITLE}</p>
            <p className="empty-state__sub">{JOBS_EMPTY_SUB}</p>
            <p className="archive-empty__link">
              <Link href="/" className="button button--outline-paper button--small">
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

      <div className="section__inner" style={{ paddingBottom: "3.5rem" }}>
        <Link href="/#hizmetler" className="button button--metal">
          {UI.servicesCta}
        </Link>
      </div>
    </div>
  );
}
