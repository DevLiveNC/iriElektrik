import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import type { ReactNode } from "react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import MobileCtaBar from "@/components/MobileCtaBar";
import ExampleBadge from "@/components/ExampleBadge";
import { getBusiness } from "@/lib/store";
import { getSiteUrl, isProduction, mapsDirectionsUrl } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#102A2A",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusiness();
  const siteUrl = getSiteUrl();
  const prod = isProduction();
  const description = `${business.name} — ${business.heroSubtitle}`;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${business.name} | Oto Elektrik`,
      template: `%s | ${business.name}`,
    },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: siteUrl,
      siteName: business.name,
      title: `${business.name} | Oto Elektrik`,
      description,
      images: [{ url: "/hero-atolye.svg", width: 1200, height: 900, alt: "Atölyede kaput altında çalışma" }],
    },
    twitter: { card: "summary_large_image", title: business.name, description },
    robots: prod
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

function jsonLd(business: Awaited<ReturnType<typeof getBusiness>>) {
  if (!business.verified) return null;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: business.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.district,
      addressCountry: "TR",
    },
    telephone: business.phoneHref.replace("tel:", ""),
    url: getSiteUrl(),
  };
  if (business.lat !== null && business.lng !== null) {
    data.geo = { "@type": "GeoCoordinates", latitude: business.lat, longitude: business.lng };
  }
  if (business.hours.length > 0) {
    data.openingHoursSpecification = business.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.open,
      closes: h.close,
    }));
  }
  return data;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const business = await getBusiness();
  const prod = isProduction();
  // Üretimde doğrulanmamış bilgi ve boş bağlantı gösterilmez.
  const showPhone = Boolean(business.phoneHref) && (business.verified || !prod);
  const mapsUrl = mapsDirectionsUrl(business.lat, business.lng, business.address);
  const showMaps = Boolean(mapsUrl) && (business.verified || !prod);
  const ld = jsonLd(business);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-paper text-graphite antialiased">
        <a href="#icerik" className="skip-link">
          İçeriğe atla
        </a>
        {ld && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        )}
        <SiteHeader
          name={business.name}
          phoneHref={business.phoneHref}
          phoneLabel={business.phone}
          showPhone={showPhone}
        />
        <main id="icerik" className="pb-28 md:pb-0">
          {children}
        </main>
        <footer className="border-t border-petrol/15 bg-petrol text-paper">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-display text-3xl font-bold" translate="no">
                  {business.name}
                </p>
                <p className="mt-2 max-w-md text-sm text-paper/80">
                  {business.heroSubtitle}
                </p>
                {!business.verified && (
                  <p className="mt-3">
                    <ExampleBadge label="Örnek veri — işletme bilgileri doğrulanacak" />
                  </p>
                )}
              </div>
              <nav aria-label="Alt bilgi" className="flex flex-col gap-2 text-sm">
                <Link href="/#hizmetler" className="text-paper/85 hover:text-lime hover:underline hover:underline-offset-4">
                  Hizmetler
                </Link>
                <Link href="/yapilan-isler" className="text-paper/85 hover:text-lime hover:underline hover:underline-offset-4">
                  Yapılan işler
                </Link>
                <Link href="/#konum" className="text-paper/85 hover:text-lime hover:underline hover:underline-offset-4">
                  Konum
                </Link>
              </nav>
            </div>
            <p className="mt-8 border-t border-paper/15 pt-4 text-xs text-paper/60">
              © {new Date().getFullYear()} {business.name}. Tüm hakları saklıdır.
            </p>
          </div>
        </footer>
        <MobileCtaBar phoneHref={business.phoneHref} mapsUrl={mapsUrl} showPhone={showPhone} showMaps={showMaps} />
      </body>
    </html>
  );
}
