import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSectores(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("sectors")
    .select("id, slug, name, position, sector_pages(headline, body)")
    .order("position")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => {
      const pageRow = row.sector_pages as { headline?: string | null; body?: string | null } | { headline?: string | null; body?: string | null }[] | null;
      const page = Array.isArray(pageRow) ? pageRow[0] : pageRow;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        position: String(row.position),
        headline: page?.headline ?? "",
        body: page?.body ?? "",
      };
    }),
  };
}
