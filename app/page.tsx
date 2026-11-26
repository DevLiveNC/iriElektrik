import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroStage from "@/components/motion/HeroStage";
import AlternatorFrameStage from "@/components/motion/AlternatorFrameStage";
import DiagnosticFrameLab from "@/components/motion/DiagnosticFrameLab";
import ServicesMatrix from "@/components/motion/ServicesMatrix";
import ProtocolTimeline from "@/components/motion/ProtocolTimeline";
import ScrollRevealSection from "@/components/motion/ScrollRevealSection";
import { getBusiness, listPublishedJobs } from "@/lib/store";
import { getApprovedServices, getHeroPhoto } from "@/lib/content";
import { getVerifiedContact } from "@/lib/contact";
import { isIndexableProduction } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusiness();
  const contact = getVerifiedContact(business);
  const services = getApprovedServices(business);
  const region = contact.region;
  const title = region
    ? `${business.name} — ${region} oto elektrik`
    : `${business.name} — Oto elektrik arıza tespiti`;
  const serviceSummary = services.length
    ? ` Onaylı hizmetler: ${services.map((service) => service.title).join(", ")}.`
    : "";
  const description = `${business.heroSubtitle}${serviceSummary}`.slice(0, 160);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title,
      description,
    },
    robots: isIndexableProduction()
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

function heroTitleLines(title: string): string[] {
  const words = title.trim().split(/\s+/);
  if (words.length === 3) return words;
  if (words.length > 1) return [words.slice(0, -1).join(" "), words[words.length - 1]];
  return words;
}

export default async function HomePage() {
  const [business, publishedJobs] = await Promise.all([
    getBusiness(),
    listPublishedJobs(),
  ]);
  const contact = getVerifiedContact(business);
  const services = getApprovedServices(business);
  const heroPhoto = getHeroPhoto(business);
  const heroLines = heroTitleLines(business.heroTitle);
  const leadJob = publishedJobs.find((job) => job.featured) ?? publishedJobs[0] ?? null;
  const moreJobs = leadJob
    ? publishedJobs.filter((job) => job.id !== leadJob.id).slice(0, 2)
    : [];

  return (
    <>
      <HeroStage
        heroTitle={business.heroTitle}
        heroLines={heroLines}
        heroSubtitle={business.heroSubtitle}
        region={contact.region}
        hasActions={contact.hasActions}
        hasPhone={contact.hasPhone}
        phoneHref={contact.phoneHref}
        hasMaps={contact.hasMaps}
        mapsUrl={contact.mapsUrl}
        heroPhoto={heroPhoto}
        hasServices={services.length > 0}
      />

      {/* Chapter 02: Pinned 72-Frame 3D Studio Cutaway Scrollytelling */}
      <AlternatorFrameStage />

      {/* Chapter 03: Interactive Vehicle X-Ray & Live Oscilloscope Frame Lab */}
      <DiagnosticFrameLab />

      {/* Chapter 04: Monumental Editorial Approved Services Matrix */}
      {services.length > 0 && <ServicesMatrix services={services} />}

      {/* Chapter 05: Scroll-Scrubbed 4-Step Copper Circuit Repair Discipline */}
      <ProtocolTimeline />

      {/* Chapter 06: Published Real Work Showcase (Only when real published jobs exist) */}
      {leadJob && (
        <section aria-labelledby="isler-baslik" className="section work-feature">
          <ScrollRevealSection className="section__inner">
            <div className="work-feature__head" data-gsap-item>
              <div className="section-head">
                <span aria-hidden="true" className="section-rule" />
                <h2 id="isler-baslik" className="section-title">
                  Yapılan işler
                </h2>
              </div>
              <Link href="/yapilan-isler" className="button button--secondary button--small">
                Tüm işleri gör
              </Link>
            </div>

            <div className="work-feature__grid">
              <figure className="work-feature__figure" data-gsap-mask>
                <div className="work-feature__frame">
                  <Image
                    src={leadJob.cover}
                    alt={leadJob.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 961px) 62vw, 100vw"
                    className="work-feature__image"
                  />
                </div>
                <figcaption className="work-feature__caption">{leadJob.alt}</figcaption>
              </figure>

              <div className="work-feature__summary" data-gsap-item>
                <p className="work-feature__meta">{leadJob.category}</p>
                <h3 className="work-feature__title">{leadJob.title}</h3>
                {leadJob.vehicle && <p className="work-feature__vehicle">{leadJob.vehicle}</p>}

                <div className="work-feature__dossier">
                  <div className="work-feature__dossier-item">
                    <span className="work-feature__label">Belirti</span>
                    <p className="work-feature__result">{leadJob.symptom}</p>
                  </div>
                  <div className="work-feature__dossier-item">
                    <span className="work-feature__label">Sonuç</span>
                    <p className="work-feature__result">{leadJob.result}</p>
                  </div>
                </div>

                <div className="work-feature__actions">
                  <Link
                    href={`/yapilan-isler/${leadJob.slug}`}
                    data-cursor="DOSYA"
                    className="button button--primary button--small"
                  >
                    İşi incele
                  </Link>
                </div>
              </div>
            </div>

            {moreJobs.length > 0 && (
              <div className="work-feature__secondary" data-gsap-item>
                {moreJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/yapilan-isler/${job.slug}`}
                    className="work-mini-card"
                  >
                    <span className="work-mini-card__cat">{job.category}</span>
                    <strong className="work-mini-card__title">{job.title}</strong>
                    <span className="work-mini-card__cta">Kaydı aç →</span>
                  </Link>
                ))}
              </div>
            )}
          </ScrollRevealSection>
        </section>
      )}

      {/* Chapter 07: Obsidian Command Bay — Verified Location & Contact */}
      <section id="konum" aria-labelledby="konum-baslik" className="contact on-dark">
        <ScrollRevealSection className="section__inner">
          <div className="contact__top" data-gsap-item>
            <div className="section-head">
              <div className="tech-eyebrow">
                <span aria-hidden="true" className="tech-eyebrow__bar" />
                <span>ATÖLYE KONUMU &amp; DOĞRUDAN İLETİŞİM</span>
              </div>
              <h2 id="konum-baslik" className="section-title">
                Konum ve iletişim
              </h2>
            </div>
          </div>

          {contact.hasDetails ? (
            <div className="contact__grid">
              <address className="contact__address contact__card" data-gsap-item>
                <div className="contact__row">
                  <span className="contact__label">İşletme</span>
                  <p className="contact__value contact__value--brand" translate="no">
                    {contact.name}
                  </p>
                </div>
                {contact.address && (
                  <div className="contact__row">
                    <span className="contact__label">Adres</span>
                    <p className="contact__value">{contact.address}</p>
                  </div>
                )}
                {contact.region && (
                  <div className="contact__row">
                    <span className="contact__label">Bölge</span>
                    <p className="contact__value">{contact.region}</p>
                  </div>
                )}
                {contact.hasPhone && (
                  <div className="contact__row">
                    <span className="contact__label">Telefon</span>
                    <p className="contact__value tabular">
                      <a href={contact.phoneHref} data-event="ara">
                        {contact.phone}
                      </a>
                    </p>
                  </div>
                )}
                {contact.emailHref && (
                  <div className="contact__row">
                    <span className="contact__label">E-posta</span>
                    <p className="contact__value">
                      <a href={contact.emailHref}>{contact.email}</a>
                    </p>
                  </div>
                )}
              </address>

              <div className="contact__card" data-gsap-item>
                {contact.hasHours && (
                  <>
                    <h3 className="contact__heading">Çalışma saatleri</h3>
                    <ul className="contact__hours">
                      {contact.hours.map((hour) => (
                        <li key={hour.day} className="contact__hour">
                          <span>{hour.day}</span>
                          <span>
                            {hour.open} – {hour.close}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {contact.hasActions && (
                  <div className="contact__actions">
                    {contact.hasPhone && (
                      <a
                        href={contact.phoneHref}
                        data-event="ara"
                        className="button button--primary"
                      >
                        Hemen ara
                      </a>
                    )}
                    {contact.hasMaps && (
                      <a
                        href={contact.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-event="yol_tarifi"
                        className="button button--on-dark"
                      >
                        Yol tarifi
                      </a>
                    )}
                    {contact.whatsapp && (
                      <a
                        href={contact.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        data-event="whatsapp"
                        className="button button--on-dark"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
                {contact.profileUrl && (
                  <p className="contact__value contact__value--spaced">
                    <a href={contact.profileUrl} target="_blank" rel="noreferrer">
                      Google İşletme Profili ↗
                    </a>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="contact__empty-card" data-gsap-item>
              <div className="contact__empty-indicator">
                <span aria-hidden="true" className="contact__empty-dot" />
                <span>DOĞRULAMA BEKLENİYOR</span>
              </div>
              <p className="contact__empty">
                İletişim bilgileri doğrulandığında açık adres, çalışma saatleri, telefon ve yol
                tarifi bağlantısı burada yayımlanır.
              </p>
            </div>
          )}
        </ScrollRevealSection>
      </section>
    </>
  );
}
