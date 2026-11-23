import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { loadSessionAttendees } from "./load-attendees";
import { mapSessionQuotas } from "./map-quotas";

export async function loadSesion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const session = await db
    .from("sessions")
    .select(
      "id, title, public_slug, venue, format_name, modality, kind, instrument_id, session_on, starts_local, ends_local, capacity_min, capacity_max, audience, includes, is_current, time_zone",
    )
    .eq("id", id)
    .maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return null;
  const [topics, all, quotas, attendees] = await Promise.all([
    db.from("session_topics").select("id, position, title").eq("session_id", id).order("position"),
    db.from("sessions").select("id, is_current"),
    db
      .from("session_sector_quotas")
      .select("sector_id, capacity, sectors(name, slug, position)")
      .eq("session_id", id),
    loadSessionAttendees(id),
  ]);
  for (const result of [topics, all, quotas]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    session: session.data,
    topics: topics.data ?? [],
    attendees,
    rows: (all.data ?? []).map((row) => ({ id: row.id, isCurrent: row.is_current })),
    quotas: mapSessionQuotas(quotas.data ?? []),
  };
}

