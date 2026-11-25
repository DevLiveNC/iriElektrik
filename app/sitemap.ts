import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableProduction } from "@/lib/seo";
import { listPublishedJobs } from "@/lib/store";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableProduction()) return [];
  const siteUrl = getSiteUrl();
  const jobs = await listPublishedJobs();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/yapilan-isler`, changeFrequency: "weekly", priority: 0.8 },
    ...jobs.map((job) => ({
      url: `${siteUrl}/yapilan-isler/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
