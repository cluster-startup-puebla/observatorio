import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listSesiones(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) {
    return {
      page: page.page,
      rows: [] as Record<string, string>[],
      quotasBySession: {} as Record<string, Record<string, number>>,
    };
  }
  const result = await db
    .from("sessions")
    .select(
      "id, venue, format_name, starts_local, ends_local, capacity_min, capacity_max, audience, includes, is_current, session_sector_quotas(sector_id, capacity)",
    )
    .order("is_current", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);

  const quotasBySession: Record<string, Record<string, number>> = {};
  const rows = (result.data ?? []).map((row) => {
    const quotas = (row.session_sector_quotas ?? []) as { sector_id: string; capacity: number }[];
    quotasBySession[row.id] = Object.fromEntries(quotas.map((item) => [item.sector_id, item.capacity]));
    return {
      id: row.id,
      venue: row.venue,
      format_name: row.format_name,
      starts_local: row.starts_local,
      ends_local: row.ends_local,
      capacity_min: String(row.capacity_min),
      capacity_max: String(row.capacity_max),
      audience: row.audience,
      includes: row.includes,
      is_current: row.is_current ? "Vigente" : "",
      current_flag: row.is_current ? "1" : "",
      quota_count: String(quotas.length),
    };
  });

  return { page: page.page, rows, quotasBySession };
}
