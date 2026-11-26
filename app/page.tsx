import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BatteryFinder from "@/components/night/BatteryFinder";
import HeroBeam from "@/components/night/HeroBeam";
import LampSlider from "@/components/night/LampSlider";
import Reveal from "@/components/night/Reveal";
import ScrollRail from "@/components/night/ScrollRail";
import SignalScope from "@/components/night/SignalScope";
import WorkflowSection from "@/components/night/WorkflowSection";
import { batteryFinderEntries } from "@/data/battery-finder";
import {
  BATTERY_FINDER_EYEBROW,
  BATTERY_FINDER_HEADING,
  BATTERY_FINDER_INTRO,
  CONTACT_EMPTY_SENTENCE,
  CONTACT_EYEBROW,
  CONTACT_HEADING,
  HERO_EYEBROW,
  JOBS_EMPTY_SUB,
  JOBS_EMPTY_TITLE,
  JOBS_EYEBROW,
  JOBS_HEADING,
  LABELS,
  LANDING_PRINCIPLES,
  SERVICES_EYEBROW,
  SERVICES_HEADING,
  SERVICES_INTRO,
  SECTION_MARKS,
  SOUND_BODY,
  SOUND_EYEBROW,
  SOUND_HEADING,
  UI,
  WORKFLOW_EYEBROW,
  WORKFLOW_HEADING,
  WORKFLOW_INTRO,
} from "@/data/landing-content";
import {
  getApprovedServices,
  getHeroMobilePhoto,
  getHeroPhoto,
  getLampPair,
  getServiceOwnerMarker,
  getServicePhoto,
} from "@/lib/content";
import { getVerifiedContact } from "@/lib/contact";
import { isIndexableProduction } from "@/lib/seo";
import { getBusiness, listPublishedJobs } from "@/lib/store";

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
      locale: "tr_TR",
    },
    robots: isIndexableProduction()
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

/** Başlığın son kelimesini vurgular; metin birebir korunur. */
function splitHeroTitle(title: string): { head: string; tail: string } {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return { head: title, tail: "" };
  const tail = words[words.length - 1];
  const head = words.slice(0, -1).join(" ");
  return { head, tail };
}

export default async function HomePage() {
  const [business, publishedJobs] = await Promise.all([
    getBusiness(),
    listPublishedJobs(),
  ]);
  const contact = getVerifiedContact(business);
  const services = getApprovedServices(business);
  const heroPhoto = getHeroPhoto(business);
  const heroMobilePhoto = getHeroMobilePhoto(business);
  const lampPair = getLampPair();
  const heroParts = splitHeroTitle(business.heroTitle);
  const leadJob = publishedJobs.find((job) => job.featured) ?? publishedJobs[0] ?? null;

  const whatsappHref = contact.whatsapp;
  const phoneHref = contact.hasPhone ? contact.phoneHref : "";
  const phoneLabel = contact.phone;

  return (
    <div className="public-page">
      <ScrollRail marks={SECTION_MARKS.map((mark) => ({ ...mark }))} />

      {/* ================= HERO ================= */}
      <section id="hero" data-beam-hero className="hero" aria-labelledby="hero-baslik">
        <div className="hero__inner">
          <div className="hero__plate">
            <span className="eyebrow">{HERO_EYEBROW}</span>

            <h1 id="hero-baslik" className="hero__title">
              {heroParts.head}
              {heroParts.tail ? (
                <>
                  {" "}
                  <em>{heroParts.tail}</em>
                </>
              ) : null}
            </h1>

            <p className="hero__subtitle">{business.heroSubtitle}</p>

            {business.heroSecondaryEnabled && business.heroSubtitleSecondary ? (
              <p className="hero__subtitle hero__subtitle--secondary">
                {business.heroSubtitleSecondary}
              </p>
            ) : null}

            <div className="hero__actions">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp"
                  className="button button--primary"
                >
                  {UI.whatsapp}
                </a>
              ) : null}
              {phoneHref ? (
                <a href={phoneHref} data-event="ara" className="button button--metal">
                  {UI.callNow}
                </a>
              ) : null}
              <a href="#hizmetler" className="button button--ghost">
                {UI.servicesCta}
              </a>
              <a href="#is-akisi" className="button button--ghost">
                {UI.workflowCta}
              </a>
            </div>

            <dl className="hero__principles">
              {LANDING_PRINCIPLES.map((principle) => (
                <div key={principle.title} className="hero__principle">
                  <dt>{principle.title}</dt>
                  <dd>{principle.description}</dd>
                </div>
              ))}
            </dl>

            <p className="hero__cue">KAYDIR</p>
          </div>

          <figure className="hero__frame">
            <div className="cinema" data-beam-frame>
              <div className="cinema__stage">
                {heroPhoto ? (
                  <picture>
                    {heroMobilePhoto ? (
                      <source media="(max-width: 720px)" srcSet={heroMobilePhoto} />
                    ) : null}
                    <Image
                      src={heroPhoto.src}
                      alt={heroPhoto.alt}
                      fill
                      priority
                      quality={85}
                      sizes="(min-width: 1100px) 58vw, 100vw"
                      className="cinema__media-image"
                    />
                  </picture>
                ) : null}
                <span className="cinema__glow" aria-hidden="true" />
                <HeroBeam />
                <span className="cinema__ticks" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span className="cinema__bar" aria-hidden="true">
                  <span />
                </span>
              </div>
            </div>
            <figcaption className="cinema__caption">
              {heroPhoto?.representative ? (
                <>
                  <span className="cinema__caption-tag">{LABELS.representativeTag}</span>
                  <span>{UI.representativeCaption}</span>
                </>
              ) : heroPhoto ? (
                <span>{heroPhoto.alt}</span>
              ) : (
                <>
                  <span className="cinema__caption-tag">{LABELS.pendingTag}</span>
                  <span className="owner-marker">
                    [SAHİP DOLDURACAK: onaylı hero ve hizmet fotoğrafları + alt metin; plaka ve yüz
                    yok]
                  </span>
                  <span className="owner-note">{UI.ownerNote}</span>
                </>
              )}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= HİZMETLER — BAŞLIK ================= */}
      <section id="hizmetler" className="section section--paper" aria-labelledby="hizmetler-baslik">
        <div className="section__inner">
          <div className="section-head">
            <span className="eyebrow">{SERVICES_EYEBROW}</span>
            <h2 id="hizmetler-baslik" className="section-title">
              {SERVICES_HEADING}
            </h2>
            <p className="section-intro">{SERVICES_INTRO}</p>
          </div>
        </div>
      </section>

      {/* ================= HİZMET BAYLARI ================= */}
      <div className="bays">
        <Reveal>
          <ol className="bays__list">
            {services.map((service, index) => {
              const photo = getServicePhoto(service);
              const isLampBay = service.id === "aydinlatma" && lampPair !== null;
              return (
                <li
                  key={service.id}
                  id={service.id === "aydinlatma" ? "aydinlatma" : undefined}
                  className={index % 2 === 1 ? "bay bay--flip" : "bay"}
                >
                  <div className="bay__grid">
                    <div className="bay__media" data-reveal>
                      {isLampBay && lampPair ? (
                        <LampSlider
                          before={{ src: lampPair.before.src, alt: lampPair.before.alt }}
                          after={{ src: lampPair.after.src, alt: lampPair.after.alt }}
                          label={LABELS.slider}
                          note={`${lampPair.before.caption} Karşılaştırma, bu atölyenin belgelenmiş bir işi değildir; ölçülmüş bir lüks değeri ifade etmez.`}
                        />
                      ) : photo ? (
                        <>
                          <div className="bay__frame">
                            <Image
                              src={photo.src}
                              alt={photo.alt}
                              fill
                              loading="lazy"
                              sizes="(min-width: 1100px) 58vw, 100vw"
                              className="bay__image"
                            />
                          </div>
                          <p className="bay__caption">
                            {photo.representative ? (
                              <>
                                <span className="cinema__caption-tag">{LABELS.representativeTag}</span>
                                <span>{photo.caption}</span>
                              </>
                            ) : (
                              <span>{photo.alt}</span>
                            )}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="bay__frame">
                            <div className="bay__empty">
                              <span className="bay__empty-mark">{LABELS.pendingTag}</span>
                              <span className="owner-marker">{getServiceOwnerMarker(service)}</span>
                              <span className="bay__empty-note">{UI.ownerNote}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bay__plate">
                      <span className="bay__index">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="bay__title">{service.title}</h3>
                      {service.proposed ? (
                        <>
                          <span className="bay__badge">{LABELS.scopeBadge}</span>
                          <p className="bay__badge-note">{UI.scopeNote}</p>
                        </>
                      ) : null}
                      <div className="bay__rows">
                        <div>
                          <span className="bay__label">{LABELS.symptom}</span>
                          <p className="bay__text">{service.symptom}</p>
                        </div>
                        <div>
                          <span className="bay__label">{LABELS.work}</span>
                          <p className="bay__text">{service.service}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>

      {/* ================= AKÜ SEÇİCİ ================= */}
      <section
        id="aku-secici"
        className="section section--dark"
        aria-labelledby="aku-secici-baslik"
      >
        <div className="section__inner">
          <div className="section-head">
            <span className="eyebrow">{BATTERY_FINDER_EYEBROW}</span>
            <h2 id="aku-secici-baslik" className="section-title">
              {BATTERY_FINDER_HEADING}
            </h2>
            <p className="section-intro">{BATTERY_FINDER_INTRO}</p>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <BatteryFinder
              entries={batteryFinderEntries}
              whatsappHref={whatsappHref}
              phoneHref={phoneHref}
              phoneLabel={phoneLabel}
              emptyText="Araç listesi işletme tarafından henüz girilmedi. Akü için bize yazın, aracınızın marka, model ve yılını iletelim."
              referenceNote="Bu bilgi genel bir referanstır; stok, fiyat veya birebir uyum garantisi değildir. Uygun akü, ölçümle netleşir."
              contactFallback={CONTACT_EMPTY_SENTENCE}
              ownerNote={UI.ownerNote}
            />
          </div>
        </div>
      </section>

      {/* ================= TEYP VE SES ================= */}
      <section id="teyp-ses" className="section section--dark" aria-labelledby="teyp-ses-baslik">
        <div className="section__inner">
          <div className="section-head">
            <span className="eyebrow">{SOUND_EYEBROW}</span>
            <h2 id="teyp-ses-baslik" className="section-title">
              {SOUND_HEADING}
            </h2>
            <p className="section-intro">{SOUND_BODY}</p>
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            <div className="bay__frame bay__frame--wide" style={{ position: "relative" }}>
              <Image
                src="/design-preview/ses-door-3x2.jpg"
                alt="Sökülmüş kapı döşemesi ve yerleştirilen hoparlör; bakır ve siyah metaller, doğal çalışma lambası ışığı."
                fill
                loading="lazy"
                sizes="(min-width: 900px) 40vw, 100vw"
                className="bay__image"
              />
            </div>
            <SignalScope />
          </div>

          <p className="owner-note">
            Görsel ve ölçer temsili önizlemedir; işletmenin kendi atölye kaydı değildir.
          </p>
        </div>
      </section>

      {/* ================= NASIL ÇALIŞIYORUZ ================= */}
      <WorkflowSection
        heading={WORKFLOW_HEADING}
        eyebrow={WORKFLOW_EYEBROW}
        intro={WORKFLOW_INTRO}
      />

      {/* ================= YAPILAN İŞLER ================= */}
      <section
        id="yapilan-isler"
        className="section section--paper"
        aria-labelledby="yapilan-isler-baslik"
      >
        <div className="section__inner">
          <div className="jobs__head">
            <div className="section-head">
              <span className="eyebrow">{JOBS_EYEBROW}</span>
              <h2 id="yapilan-isler-baslik" className="section-title">
                {JOBS_HEADING}
              </h2>
            </div>
            <Link href="/yapilan-isler" className="button button--outline-paper">
              {UI.seeAllJobs}
            </Link>
          </div>

          {leadJob ? (
            <div className="jobs__grid">
              <figure className="jobs__frame">
                <Image
                  src={leadJob.cover}
                  alt={leadJob.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 900px) 55vw, 100vw"
                />
              </figure>
              <div>
                <p className="jobs__meta">{leadJob.category}</p>
                <h3 className="jobs__title">{leadJob.title}</h3>
                {leadJob.vehicle ? <p className="jobs__meta">{leadJob.vehicle}</p> : null}
                <dl className="jobs__dossier">
                  <div>
                    <dt>{LABELS.symptom}</dt>
                    <dd>{leadJob.symptom}</dd>
                  </div>
                  <div>
                    <dt>SONUÇ</dt>
                    <dd>{leadJob.result}</dd>
                  </div>
                </dl>
                <p style={{ marginTop: "1.25rem" }}>
                  <Link href={`/yapilan-isler/${leadJob.slug}`} className="button button--paper">
                    Detayı incele
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="jobs__empty">
              <p className="jobs__empty-title">{JOBS_EMPTY_TITLE}</p>
              <p className="jobs__empty-sub">{JOBS_EMPTY_SUB}</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= KONUM VE İLETİŞİM ================= */}
      <section id="konum" className="section section--paper" aria-labelledby="konum-baslik">
        <div className="section__inner">
          <div className="section-head">
            <span className="eyebrow">{CONTACT_EYEBROW}</span>
            <h2 id="konum-baslik" className="section-title">
              {CONTACT_HEADING}
            </h2>
          </div>

          {contact.hasDetails ? (
            <div className="contact__grid">
              <div className="contact__card">
                <dl className="contact__rows">
                  <div className="contact__row">
                    <dt className="contact__label">İşletme</dt>
                    <dd className="contact__value contact__value--brand" translate="no">
                      {contact.name}
                    </dd>
                  </div>
                  {contact.address ? (
                    <div className="contact__row">
                      <dt className="contact__label">Adres</dt>
                      <dd className="contact__value">{contact.address}</dd>
                    </div>
                  ) : null}
                  {contact.region ? (
                    <div className="contact__row">
                      <dt className="contact__label">Bölge</dt>
                      <dd className="contact__value">{contact.region}</dd>
                    </div>
                  ) : null}
                  {contact.hasPhone ? (
                    <div className="contact__row">
                      <dt className="contact__label">Telefon</dt>
                      <dd className="contact__value">
                        <a href={contact.phoneHref} data-event="ara">
                          {contact.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {contact.emailHref ? (
                    <div className="contact__row">
                      <dt className="contact__label">E-posta</dt>
                      <dd className="contact__value">
                        <a href={contact.emailHref}>{contact.email}</a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="contact__card">
                {contact.hasHours ? (
                  <>
                    <h3 className="contact__label" style={{ marginBottom: "0.6rem" }}>
                      Çalışma saatleri
                    </h3>
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
                ) : null}

                {contact.hasActions || contact.whatsapp ? (
                  <div className="contact__actions">
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        data-event="whatsapp"
                        className="button button--primary"
                      >
                        {UI.whatsapp}
                      </a>
                    ) : null}
                    {contact.hasPhone ? (
                      <a href={contact.phoneHref} data-event="ara" className="button button--paper">
                        {UI.callNow}
                      </a>
                    ) : null}
                    {contact.hasMaps ? (
                      <a
                        href={contact.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-event="yol_tarifi"
                        className="button button--outline-paper"
                      >
                        {UI.directions}
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {contact.profileUrl ? (
                  <p className="contact__value" style={{ marginTop: "1.25rem" }}>
                    <a href={contact.profileUrl} target="_blank" rel="noreferrer">
                      Google İşletme Profili ↗
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="contact__empty">
              <p>{CONTACT_EMPTY_SENTENCE}</p>
              <div className="contact__pending">
                <p className="contact__pending-title">{LABELS.pendingFieldsTitle}</p>
                <ul className="contact__pending-list">
                  <li>[SAHİP DOLDURACAK: açık adres]</li>
                  <li>[SAHİP DOLDURACAK: ilçe / mahalle]</li>
                  <li>[SAHİP DOLDURACAK: şehir]</li>
                  <li>[SAHİP DOLDURACAK: ülke / hizmet bölgesi]</li>
                  <li>[SAHİP DOLDURACAK: telefon, görünen yazım ve tel:+… bağlantısı]</li>
                  <li>[SAHİP DOLDURACAK: WhatsApp bağlantısı, https://wa.me/…]</li>
                  <li>[SAHİP DOLDURACAK: e-posta]</li>
                  <li>[SAHİP DOLDURACAK: çalışma saatleri, gün gün]</li>
                  <li>[SAHİP DOLDURACAK: Google Haritalar yol tarifi URL veya enlem/boylam]</li>
                  <li>[SAHİP DOLDURACAK: Google İşletme Profili URL]</li>
                </ul>
                <span className="owner-note owner-note--paper">{UI.ownerNote}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
