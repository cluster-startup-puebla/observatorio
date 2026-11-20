import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listRetos(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const counted = await db.from("challenges").select("id", { count: "exact", head: true });
  if (counted.error) throw new Error(counted.error.message);
  const result = await db
    .from("challenges")
    .select(
      "id, name, area, status, visibility, show_company, company_name_snapshot, published_at, companies(legal_name)",
    )
    .order("updated_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const rows = (result.data ?? []).map((row) => {
    const company = row.companies as { legal_name?: string } | null;
    return {
      id: row.id,
      name: row.name,
      area: row.area,
      status: row.status,
      visibility: row.visibility,
      show_company: row.show_company ? "Sí" : "No",
      empresa: company?.legal_name ?? row.company_name_snapshot ?? "—",
      published_at: row.published_at ?? "",
    };
  });
  return { page: page.page, rows, total: counted.count ?? 0 };
}
