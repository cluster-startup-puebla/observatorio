import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pendingLinkEmails } from "@/lib/admin/empresas/pending-link-emails";
import { companySeatColumns, toQuota, toSeat } from "./cupo-seat";
import { sectorFill } from "./sector-fill";

type CupoSession = { id: string; venue: string; sessionOn: string | null };

function idle() {
  return { ...sectorFill([], []), session: null as CupoSession | null };
}

function chosen(row: { id: string; venue: string; session_on: string | null }): CupoSession {
  return { id: row.id, venue: row.venue, sessionOn: row.session_on };
}

function releasedIds(rows: { company_id?: string | null }[] | null) {
  return new Set((rows ?? []).map((row) => String(row.company_id ?? "")).filter(Boolean));
}

export async function loadCupos(sessionId?: string | null) {
  const db = await adminDb();
  if (!db) return idle();
  const columns = "id, venue, session_on, capacity_max";
  const session = sessionId
    ? await db.from("sessions").select(columns).eq("id", sessionId).maybeSingle()
    : await db.from("sessions").select(columns).eq("is_current", true).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return idle();
  const [quotas, companies, pending, cancelled] = await Promise.all([
    db.from("session_sector_quotas").select("capacity, sectors(name, slug)").eq("session_id", session.data.id),
    db.from("companies").select(companySeatColumns).eq("owner.role", "empresario").not("owner.onboarded_at", "is", null),
    pendingLinkEmails(db),
    db.from("attendance_cancellations").select("company_id"),
  ]);
  if (quotas.error) throw new Error(quotas.error.message);
  if (companies.error) throw new Error(companies.error.message);
  if (cancelled.error) throw new Error(cancelled.error.message);
  const released = releasedIds(cancelled.data);
  const seats = (companies.data ?? []).map((row) => toSeat(row, pending, released));
  const rows = (quotas.data ?? []).flatMap((row) => {
    const quota = toQuota(row);
    return quota ? [quota] : [];
  });
  return { ...sectorFill(rows, seats), session: chosen(session.data) };
}
