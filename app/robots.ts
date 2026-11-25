import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableProduction } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  if (!isIndexableProduction()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/yapilan-isler?kategori="],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
