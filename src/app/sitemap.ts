import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const clubs = await db.club.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/clubs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact` },
    { url: `${base}/terms` },
    { url: `${base}/privacy` },
    ...clubs.map((c) => ({ url: `${base}/clubs/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
  ];
}
