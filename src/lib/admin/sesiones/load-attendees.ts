import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { attendingCompanies } from "@/lib/admin/empresas/attending";
import { loadAttendingRows } from "@/lib/admin/empresas/load-attending";

export type SessionAttendee = {
  companyId: string;
  legalName: string;
  sectorName: string;
  source: "session" | "rsvp";
};

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function loadSessionAttendees(sessionId: string): Promise<SessionAttendee[]> {
  const db = await adminDb();
  if (!db) return [];
  const columns = `id, legal_name, session_id, sectors(name), owner:${companyOwner}!inner(onboarded_at, role)`;
  const [bySession, rsvps] = await Promise.all([
    db
      .from("companies")
      .select(columns)
      .eq("session_id", sessionId)
      .eq("owner.role", "empresario")
      .not("owner.onboarded_at", "is", null),
    db
      .from("session_rsvps")
      .select("company_id")
      .eq("session_id", sessionId)
      .in("status", ["confirmed", "pending"])
      .not("company_id", "is", null),
  ]);
  if (bySession.error) throw new Error(bySession.error.message);
  if (rsvps.error) throw new Error(rsvps.error.message);
  const rsvpIds = [...new Set((rsvps.data ?? []).map((row) => String(row.company_id)))];
  const byRsvp = rsvpIds.length
    ? await db
        .from("companies")
        .select(columns)
        .in("id", rsvpIds)
        .eq("owner.role", "empresario")
        .not("owner.onboarded_at", "is", null)
    : { data: [] as typeof bySession.data, error: null };
  if (byRsvp.error) throw new Error(byRsvp.error.message);
  const map = new Map<string, SessionAttendee>();
  for (const row of bySession.data ?? []) {
    const sector = one(row.sectors as { name?: string } | { name?: string }[] | null);
    map.set(String(row.id), {
      companyId: String(row.id),
      legalName: String(row.legal_name),
      sectorName: sector?.name ?? "",
      source: "session",
    });
  }
  for (const row of byRsvp.data ?? []) {
    if (map.has(String(row.id))) continue;
    const sector = one(row.sectors as { name?: string } | { name?: string }[] | null);
    map.set(String(row.id), {
      companyId: String(row.id),
      legalName: String(row.legal_name),
      sectorName: sector?.name ?? "",
      source: "rsvp",
    });
  }
  // Misma regla que la lista general: solo entra quien ya fue aceptado.
  const accepted = new Set(attendingCompanies(await loadAttendingRows(db), null).rows.map((row) => row.id));
  return [...map.values()]
    .filter((attendee) => accepted.has(attendee.companyId))
    .sort((a, b) => a.legalName.localeCompare(b.legalName, "es"));
}
