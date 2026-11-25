import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <>
      <section
        aria-labelledby="hero-baslik"
        className={heroPhoto ? "hero" : "hero hero--compact"}
      >
        <div className="hero__text">
          <span aria-hidden="true" className="hero__rule" />
          <h1
            id="hero-baslik"
            aria-label={business.heroTitle}
            className="hero__title"
          >
            {heroLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </h1>
          <p className="hero__summary">{business.heroSubtitle}</p>
          {contact.region && <p className="hero__region">{contact.region}</p>}
          {contact.hasActions && (
            <div className="hero__actions">
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
                  className="button button--secondary"
                >
                  Yol tarifi
                </a>
              )}
            </div>
          )}
        </div>

        {heroPhoto && (
          <figure className="hero__figure">
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              fill
              priority
              quality={85}
              sizes="(min-width: 961px) 56vw, 100vw"
              className="hero__image"
            />
            {heroPhoto.representative && (
              <figcaption className="hero__caption">
                Temsili fotoğraf — yalnızca tasarım önizlemesi. Üretimde yayımlanmaz.
              </figcaption>
            )}
          </figure>
        )}
      </section>

      {services.length > 0 && (
        <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="section services">
          <div className="section__inner">
            <div className="section-head">
              <span aria-hidden="true" className="section-rule" />
              <h2 id="hizmetler-baslik" className="section-title">
                Hizmetler
              </h2>
              <p className="section-intro">
                Aracın verdiği belirtiden başlıyoruz. Her satırda sürücünün fark ettiği sorun ve
                atölyede yapılan kontrol birlikte yazılı.
              </p>
            </div>
            <ul className="service-list">
              {services.map((service) => (
                <li key={service.id} className="service-row">
                  <h3 className="service-row__title">
                    <span aria-hidden="true" className="service-row__icon" />
                    {service.title}
                  </h3>
                  <div className="service-row__detail">
                    <p className="service-row__label">Belirti</p>
                    <p className="service-row__text">{service.symptom}</p>
                  </div>
                  <div className="service-row__detail">
                    <p className="service-row__label">Yapılan iş</p>
                    <p className="service-row__text">{service.service}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {leadJob && (
        <section aria-labelledby="isler-baslik" className="section work-feature">
          <div className="section__inner">
            <div className="work-feature__head">
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
              <figure className="work-feature__figure">
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
              <div className="work-feature__summary">
                <p className="work-feature__meta">{leadJob.category}</p>
                <h3 className="work-feature__title">{leadJob.title}</h3>
                <p className="work-feature__label">Sonuç</p>
                <p className="work-feature__result">{leadJob.result}</p>
                <div className="work-feature__actions">
                  <Link
                    href={`/yapilan-isler/${leadJob.slug}`}
                    className="button button--primary button--small"
                  >
                    İşi incele
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="konum" aria-labelledby="konum-baslik" className="contact on-dark">
        <div className="section__inner">
          <div className="section-head">
            <span aria-hidden="true" className="section-rule" />
            <h2 id="konum-baslik" className="section-title">
              Konum ve iletişim
            </h2>
          </div>

          {contact.hasDetails ? (
            <div className="contact__grid">
              <address className="contact__address contact__block">
                <div>
                  <span className="contact__label">İşletme</span>
                  <p className="contact__value" translate="no">
                    {contact.name}
                  </p>
                </div>
                {contact.address && (
                  <div className="contact__value contact__value--spaced">
                    <span className="contact__label">Adres</span>
                    {contact.address}
                  </div>
                )}
                {contact.region && (
                  <div className="contact__value contact__value--spaced">
                    <span className="contact__label">Bölge</span>
                    {contact.region}
                  </div>
                )}
                {contact.hasPhone && (
                  <div className="contact__value contact__value--spaced">
                    <span className="contact__label">Telefon</span>
                    <a href={contact.phoneHref} data-event="ara">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.emailHref && (
                  <div className="contact__value contact__value--spaced">
                    <span className="contact__label">E-posta</span>
                    <a href={contact.emailHref}>{contact.email}</a>
                  </div>
                )}
              </address>

              <div className="contact__block">
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
                      <a href={contact.phoneHref} data-event="ara" className="button button--primary">
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
                      Google İşletme Profili
                    </a>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="contact__empty">
              İletişim bilgileri doğrulandığında burada yayımlanır.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
