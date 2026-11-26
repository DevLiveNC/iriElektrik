import type { Metadata } from "next";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import ScrollRevealSection from "@/components/motion/ScrollRevealSection";
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
    <ScrollRevealSection>
      <div className="archive-hero on-dark">
        <div className="section__inner archive-hero__inner" data-gsap-item>
          <div className="tech-eyebrow">
            <span aria-hidden="true" className="tech-eyebrow__bar" />
            <span>ONARIM ARŞİVİ // BELİRTİ · TEŞHİS · UYGULAMA · SONUÇ</span>
          </div>
          <h1 id="arsiv-baslik" className="page-title">
            Yapılan işler
          </h1>
          <p className="page-intro">
            Gerçek onarım kayıtlarında aracın verdiği belirti, ölçümle konulan teşhis, yapılan
            uygulama ve teslim sonucunu birlikte incelersin.
          </p>
        </div>
      </div>

      <section aria-labelledby="arsiv-baslik" className="section__inner archive-content">
        {allJobs.length > 0 && (
          <nav aria-label="Kategori filtresi" className="filter-nav" data-gsap-item>
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
        )}

        {jobs.length === 0 ? (
          <div className="empty-state" data-gsap-item>
            <p className="empty-state__code">ARŞİV DURUMU // 0 YAYIMLANMIŞ KAYIT</p>
            <p className="empty-state__title">Henüz yayımlanmış iş yok.</p>
            <p className="empty-state__sub">
              Müşteri onayı alınmış gerçek atölye onarımları yayımlandığında burada dört aşamalı
              kayıtlarıyla listelenir.
            </p>
            <p className="archive-empty__link">
              <Link href="/#anatomi" className="button button--secondary button--small">
                3B Kesit ve Simülatörü İncele
              </Link>{" "}
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
    </ScrollRevealSection>
  );
}
