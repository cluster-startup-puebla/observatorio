import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listRegistros(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const result = await db
    .from("public_registrations")
    .select("id, full_name, company_name, email, sector_slug, completed_at, poured_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: (result.data ?? []).map((row) => ({
      id: row.id ?? "",
      full_name: row.full_name ?? "",
      company_name: row.company_name ?? "",
      email: row.email ?? "",
      sector_slug: row.sector_slug ?? "",
      completed_at: row.completed_at ?? "",
      poured_at: row.poured_at ?? "",
    })),
  };
}
