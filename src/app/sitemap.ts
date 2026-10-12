import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const catalog = await getCatalog();
  return [
    { url: site, priority: 1 },
    { url: `${site}/services`, priority: 0.9 },
    { url: `${site}/gallery`, priority: 0.7 },
    { url: `${site}/contact`, priority: 0.8 },
    ...catalog.map((item) => ({ url: `${site}/services/${item.slug}`, priority: 0.7 })),
  ];
}
