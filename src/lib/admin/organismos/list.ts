import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listOrganismos(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("organizations")
    .select("id, name, brand_color, brand_completed_at")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      name: row.name ?? "",
      brand_color: row.brand_color ?? "",
      brand_completed_at: row.brand_completed_at ? "Lista" : "Incompleta",
    })),
  };
}
