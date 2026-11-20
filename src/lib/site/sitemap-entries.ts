import type { MetadataRoute } from "next";
import type { PublicSession } from "@/lib/sessions/load-public";
import { listPublicSessions } from "@/lib/sessions/load-public";
import { sessionPath } from "@/lib/sessions/public-path";
import { absoluteUrl } from "@/lib/site/origin";
import { pressNotes } from "@/lib/site/press-notes";
import { staticPublicPages } from "@/lib/site/public-paths";

type SitemapOptions = {
  origin?: string;
  sessions?: PublicSession[];
};

async function publishedSessions(sessions?: PublicSession[]) {
  if (sessions) return sessions;
  try {
    return await listPublicSessions();
  } catch {
    return [];
  }
}

export async function sitemapEntries({ origin, sessions }: SitemapOptions = {}): Promise<MetadataRoute.Sitemap> {
  const listed = await publishedSessions(sessions);
  const pages = staticPublicPages.map((page) => ({
    url: absoluteUrl(page.path, origin),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
  const events = listed.map((session) => ({
    url: absoluteUrl(sessionPath(session.publicSlug), origin),
    lastModified: session.sessionOn,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const notes = pressNotes().map((note) => ({
    url: absoluteUrl(`/blog/${note.slug}`, origin),
    lastModified: note.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...events, ...notes];
}
