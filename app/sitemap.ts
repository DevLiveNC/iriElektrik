import type { MetadataRoute } from "next";
import { getSiteUrl, isProduction } from "@/lib/seo";
import { listJobs } from "@/lib/store";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProduction()) return [];
  const siteUrl = getSiteUrl();
  const jobs = await listJobs({ status: "published" });
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/yapilan-isler`, changeFrequency: "weekly", priority: 0.8 },
    ...jobs.map((j) => ({
      url: `${siteUrl}/yapilan-isler/${j.slug}`,
      lastModified: j.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
