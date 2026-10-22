import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listPases(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const passes = await db
    .from("passes")
    .select("profile_id, image_asset_id, issued_at")
    .order("issued_at", { ascending: false })
    .range(page.from, page.to);
  if (passes.error) throw new Error(passes.error.message);
  const ids = (passes.data ?? []).map((row) => row.profile_id);
  const arrivals = ids.length
    ? await db.from("arrivals").select("profile_id, scanned_at").in("profile_id", ids)
    : { data: [], error: null };
  if (arrivals.error) throw new Error(arrivals.error.message);
  const arrived = new Set((arrivals.data ?? []).map((row) => row.profile_id));
  return {
    page: page.page,
    rows: (passes.data ?? []).map((row) => ({
      id: row.profile_id,
      profile_id: row.profile_id,
      issued_at: row.issued_at,
      llegada: arrived.has(row.profile_id) ? "Llegó" : "Sin escanear",
    })),
  };
}
