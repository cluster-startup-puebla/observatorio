import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { attendeesFor } from "./current";

export async function loadSesion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const session = await db.from("sessions").select("id, venue, format_name, starts_local, ends_local, capacity_min, capacity_max, audience, includes, is_current, time_zone").eq("id", id).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return null;
  const [topics, arrivals, all] = await Promise.all([
    db.from("session_topics").select("id, position, title").eq("session_id", id).order("position"),
    db.from("arrivals").select("profile_id, scanned_at").order("scanned_at", { ascending: false }),
    db.from("sessions").select("id, is_current"),
  ]);
  for (const result of [topics, arrivals, all]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    session: session.data,
    topics: topics.data ?? [],
    attendees: attendeesFor(session.data.is_current, arrivals.data ?? []),
    rows: (all.data ?? []).map((row) => ({ id: row.id, isCurrent: row.is_current })),
  };
}
