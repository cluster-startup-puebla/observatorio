import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSectores(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db.from("sectors").select("id, slug, name, position").order("position").range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      position: String(row.position),
    })),
  };
}
