import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { sitemapEntries } from "@/lib/site/sitemap-entries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  return sitemapEntries();
}
