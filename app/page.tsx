import Image from "next/image";
import Link from "next/link";
import CableDivider from "@/components/CableDivider";
import JobCard from "@/components/JobCard";
import ExampleBadge from "@/components/ExampleBadge";
import TrackLink from "@/components/TrackLink";
import { getBusiness, listJobs } from "@/lib/store";
import { isProduction, mapsDirectionsUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function HomePage() {
  const [business, featured] = await Promise.all([
    getBusiness(),
    listJobs({ status: "published", featured: true }),
  ]);
  const prod = isProduction();
  const showPhone = Boolean(business.phoneHref) && (business.verified || !prod);
  const mapsUrl = mapsDirectionsUrl(business.lat, business.lng, business.address);
  const showMaps = Boolean(mapsUrl) && (business.verified || !prod);
  const services = prod
    ? business.services.filter((s) => s.approved)
    : business.services;
  const region = [business.district, business.city].filter(Boolean).join(", ");

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-baslik" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-14">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <h1
              id="hero-baslik"
              className="balance font-display text-6xl font-bold leading-[0.95] tracking-tight text-petrol sm:text-7xl lg:text-8xl"
            >
              {business.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-graphite/85">
              {business.heroSubtitle}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-petrol">
              {region && <span>{region}</span>}
              {!business.verified && <ExampleBadge />}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {showPhone ? (
                <TrackLink
                  href={business.phoneHref}
                  event="ara"
                  className="rounded-full bg-lime px-8 py-4 text-center text-lg font-bold text-petrol transition-colors hover:bg-lime-deep"
                >
                  Hemen ara
                </TrackLink>
              ) : (
                <span className="rounded-full bg-paper-2 px-8 py-4 text-center text-lg font-bold text-petrol/50">
                  Hemen ara
                </span>
              )}
              {showMaps ? (
                <TrackLink
                  href={mapsUrl}
                  event="yol_tarifi"
                  target="_blank"
                  className="rounded-full border-2 border-petrol px-8 py-4 text-center text-lg font-bold text-petrol transition-colors hover:bg-petrol hover:text-paper"
                >
                  Yol tarifi
                </TrackLink>
              ) : (
                <span className="rounded-full border-2 border-petrol/20 px-8 py-4 text-center text-lg font-bold text-petrol/50">
                  Yol tarifi
                </span>
              )}
            </div>
          </div>
          <figure className="md:col-span-5 md:mt-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-petrol">
              <Image
                src="/hero-atolye.svg"
                alt="Kaput altında çalışan ustanın elleri — atölye fotoğrafı eklenecek"
                fill
                priority
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-graphite/70">
              Kaput altında çalışma. Gerçek atölye fotoğrafı eklenecek.
            </figcaption>
          </figure>
        </div>
      </section>

      <CableDivider className="mt-14 md:mt-20" />

      {/* Hizmetler */}
      {services.length > 0 && (
        <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="hizmetler-baslik" className="balance font-display text-5xl font-bold leading-none text-petrol sm:text-6xl">
              Hizmetler
            </h2>
            {!business.verified && <ExampleBadge label="Aday hizmetler — onay bekliyor" />}
          </div>
          <ul className="mt-8 divide-y divide-petrol/15 border-y border-petrol/15">
            {services.map((s) => (
              <li key={s.id} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
                <h3 className="font-display text-3xl font-semibold text-petrol md:col-span-4">{s.title}</h3>
                <div className="md:col-span-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-petrol/60">Belirti</p>
                  <p className="mt-1 leading-relaxed text-graphite/85">{s.symptom}</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-petrol/60">Ne yapıyoruz</p>
                  <p className="mt-1 leading-relaxed text-graphite/85">{s.service}</p>
                  {!s.approved && (
                    <p className="mt-2">
                      <ExampleBadge label="Onay bekliyor" />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CableDivider />

      {/* Yapılan işler — öne çıkanlar */}
      {featured.length > 0 && (
        <section aria-labelledby="isler-baslik" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="isler-baslik" className="balance font-display text-5xl font-bold leading-none text-petrol sm:text-6xl">
              Yapılan işler
            </h2>
            <Link
              href="/yapilan-isler"
              className="rounded-full border-2 border-petrol px-6 py-2.5 font-bold text-petrol transition-colors hover:bg-petrol hover:text-paper"
            >
              Tüm işler
            </Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {featured.slice(0, 4).map((job, i) => (
              <JobCard key={job.id} job={job} priority={i === 0} />
            ))}
          </div>
        </section>
      )}

      <CableDivider />

      {/* Konum ve iletişim */}
      <section id="konum" aria-labelledby="konum-baslik" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="konum-baslik" className="balance font-display text-5xl font-bold leading-none text-petrol sm:text-6xl">
            Konum ve iletişim
          </h2>
          {!business.verified && <ExampleBadge />}
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <address className="not-italic">
            <p className="text-lg font-semibold text-petrol">{business.name}</p>
            <p className="mt-2 leading-relaxed text-graphite/85">
              {business.address}
              <br />
              {region}
            </p>
            {showPhone && (
              <p className="mt-4">
                <a href={business.phoneHref} className="text-lg font-bold text-petrol underline underline-offset-4 hover:text-petrol-2">
                  {business.phone}
                </a>
              </p>
            )}
            {business.email && (
              <p className="mt-1">
                <a href={`mailto:${business.email}`} className="text-petrol underline underline-offset-4">
                  {business.email}
                </a>
              </p>
            )}
          </address>
          <div>
            {business.hours.length > 0 && (
              <>
                <h3 className="font-display text-2xl font-semibold text-petrol">Çalışma saatleri</h3>
                <ul className="tabular mt-2 space-y-1 text-graphite/85">
                  {business.hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4 border-b border-petrol/10 py-1.5">
                      <span>{h.day}</span>
                      <span>
                        {h.open} – {h.close}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {showMaps && (
                <TrackLink
                  href={mapsUrl}
                  event="yol_tarifi"
                  target="_blank"
                  className="rounded-full bg-lime px-6 py-3 text-center font-bold text-petrol transition-colors hover:bg-lime-deep"
                >
                  Yol tarifi al
                </TrackLink>
              )}
              {business.whatsapp && (business.verified || !prod) && (
                <TrackLink
                  href={business.whatsapp}
                  event="whatsapp"
                  target="_blank"
                  className="rounded-full border-2 border-petrol px-6 py-3 text-center font-bold text-petrol transition-colors hover:bg-petrol hover:text-paper"
                >
                  WhatsApp
                </TrackLink>
              )}
              {business.profileUrl && (business.verified || !prod) && (
                <a
                  href={business.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-petrol px-6 py-3 text-center font-bold text-petrol transition-colors hover:bg-petrol hover:text-paper"
                >
                  Google profili
                </a>
              )}
            </div>
            <p className="mt-3 text-sm text-graphite/70">
              Harita, tıkladığında açılır; sayfa yavaşlamaz.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
