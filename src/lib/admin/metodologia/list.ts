import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listMetodologia(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("instrument_sections")
    .select("id, name, position, range_kind")
    .order("position")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      position: String(row.position),
      range_kind: row.range_kind,
      range_label: row.range_kind === "high" ? "Alto" : row.range_kind === "low" ? "Bajo" : row.range_kind,
    })),
  };
}
