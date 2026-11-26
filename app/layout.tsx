import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/big-shoulders-display/wght";
import "@fontsource-variable/source-sans-3/wght.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-ext-500.css";
import type { ReactNode } from "react";
import "./globals.css";
import "./night-bay.css";
import SiteHeader from "@/components/SiteHeader";
import PublicActions from "@/components/PublicActions";
import { getBusiness } from "@/lib/store";
import { getApprovedServices, getHeroPhoto } from "@/lib/content";
import { getVerifiedContact } from "@/lib/contact";
import { buildAutoRepairJsonLd } from "@/lib/structured-data";
import { getSiteUrl, isIndexableProduction } from "@/lib/seo";
import { UI } from "@/data/landing-content";

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusiness();
  const contact = getVerifiedContact(business);
  const approvedHero = getHeroPhoto(business, false);
  const indexable = isIndexableProduction();
  const region = contact.region;
  const title = region
    ? `${business.name} — ${region} oto elektrik`
    : `${business.name} — Oto elektrik arıza tespiti`;
  const description = `${business.name}: ${business.heroSubtitle}`.slice(0, 160);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${business.name}`,
    },
    description,
    applicationName: business.name,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "/",
      siteName: business.name,
      title,
      description,
      images: approvedHero ? [{ url: approvedHero.src, alt: approvedHero.alt }] : undefined,
    },
    twitter: {
      card: approvedHero ? "summary_large_image" : "summary",
      title,
      description,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const business = await getBusiness();
  const contact = getVerifiedContact(business);
  const services = getApprovedServices(business);
  const approvedHero = getHeroPhoto(business, false);
  const siteUrl = getSiteUrl();
  const structuredData = contact.verified
    ? buildAutoRepairJsonLd({
        siteUrl,
        name: contact.name,
        telephone: contact.phoneHref,
        streetAddress: contact.address,
        district: contact.district,
        city: contact.city,
        region: contact.region,
        hours: contact.hours,
        image: approvedHero?.src,
      })
    : null;
  const safeJson = structuredData
    ? JSON.stringify(structuredData).replace(/</g, "\\u003c")
    : null;

  return (
    <html lang="tr" id="ust">
      <body className="site-body">
        <a href="#icerik" className="skip-link">
          {UI.skipToContent}
        </a>
        {safeJson ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson }} />
        ) : null}
        <SiteHeader
          name={business.name}
          phoneHref={contact.phoneHref}
          phoneLabel={contact.phone}
          showPhone={contact.hasPhone}
          whatsappHref={contact.whatsapp}
          hasServices={services.length > 0}
        />
        <main id="icerik" tabIndex={-1} className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <div>
              <p className="site-footer__brand" translate="no">
                {business.name}
              </p>
              <p className="site-footer__tagline">{business.shortDescription}</p>
            </div>
            <nav aria-label="Alt bilgi" className="site-footer__nav">
              {services.length > 0 ? <Link href="/#hizmetler">Hizmetler</Link> : null}
              <Link href="/#is-akisi">Nasıl çalışıyoruz</Link>
              <Link href="/yapilan-isler">Yapılan işler</Link>
              <Link href="/#konum">İletişim</Link>
            </nav>
            <div className="site-footer__bottom">
              <p className="site-footer__legal">
                © {new Date().getFullYear()} {business.name}
              </p>
              <a href="#ust" className="site-footer__top-link">
                {UI.backToTop}
              </a>
            </div>
          </div>
        </footer>
        <PublicActions
          phoneHref={contact.phoneHref}
          phoneLabel={contact.phone}
          whatsappHref={contact.whatsapp}
          mapsUrl={contact.mapsUrl}
          showPhone={contact.hasPhone}
          showMaps={contact.hasMaps}
        />
      </body>
    </html>
  );
}
