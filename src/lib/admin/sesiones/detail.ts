import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { attendeesFor } from "./current";

export async function loadSesion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const session = await db
    .from("sessions")
    .select(
      "id, venue, format_name, session_on, starts_local, ends_local, capacity_min, capacity_max, audience, includes, is_current, time_zone",
    )
    .eq("id", id)
    .maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return null;
  const [topics, arrivals, all, quotas] = await Promise.all([
    db.from("session_topics").select("id, position, title").eq("session_id", id).order("position"),
    db.from("arrivals").select("profile_id, scanned_at").order("scanned_at", { ascending: false }),
    db.from("sessions").select("id, is_current"),
    db
      .from("session_sector_quotas")
      .select("sector_id, capacity, sectors(name, slug, position)")
      .eq("session_id", id),
  ]);
  for (const result of [topics, arrivals, all, quotas]) {
    if (result.error) throw new Error(result.error.message);
  }
  const quotaRows = (quotas.data ?? []).map((row) => {
    const sector = row.sectors as { name?: string; slug?: string; position?: number } | { name?: string; slug?: string; position?: number }[] | null;
    const info = Array.isArray(sector) ? sector[0] : sector;
    return {
      sectorId: row.sector_id as string,
      capacity: row.capacity as number,
      name: info?.name ?? row.sector_id,
      slug: info?.slug ?? "",
      position: info?.position ?? 0,
    };
  });
  quotaRows.sort((a, b) => a.position - b.position);
  return {
    session: session.data,
    topics: topics.data ?? [],
    attendees: attendeesFor(session.data.is_current, arrivals.data ?? []),
    rows: (all.data ?? []).map((row) => ({ id: row.id, isCurrent: row.is_current })),
    quotas: quotaRows,
  };
}
