import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSesiones(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("sessions")
    .select("id, venue, format_name, starts_local, ends_local, is_current")
    .order("is_current", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      venue: row.venue,
      format_name: row.format_name,
      starts_local: row.starts_local,
      ends_local: row.ends_local,
      is_current: row.is_current ? "Vigente" : "",
    })),
  };
}
