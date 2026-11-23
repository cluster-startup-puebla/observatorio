import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { fetchCuposSessionData } from "./cupos-session-data";
import { omittedCompanyRows } from "./omitted-companies";
import { sectorFill } from "./sector-fill";

type CupoSession = { id: string; venue: string; sessionOn: string | null };

function idle() {
  return { ...sectorFill([], []), companies: [] as Record<string, string>[], session: null as CupoSession | null };
}

function chosen(row: { id: string; venue: string; session_on: string | null }): CupoSession {
  return { id: row.id, venue: row.venue, sessionOn: row.session_on };
}

export async function loadCupos(sessionId?: string | null) {
  if (!sessionId) return idle();
  const db = await adminDb();
  if (!db) return idle();
  const session = await db
    .from("sessions")
    .select("id, venue, session_on, capacity_max, is_current")
    .eq("id", sessionId)
    .maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return idle();
  const data = await fetchCuposSessionData(db, session.data.id);
  const fill = sectorFill(data.quotasRows, data.seats);
  const outside = await omittedCompanyRows(
    db,
    data.companies,
    new Set(fill.omitidos.map((row) => row.slug)),
    data.pending,
    data.released,
  );
  return { ...fill, companies: outside, session: chosen(session.data) };
}