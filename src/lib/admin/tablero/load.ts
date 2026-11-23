import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readPages } from "@/lib/admin/tablero/read-pages";
import { applyRsvpBoard, type RsvpBoardRow } from "@/lib/admin/tablero/rsvp-board-extras";
import { sessionContactIds } from "@/lib/admin/tablero/session-contact-ids";
import { buildTablero, emptyTablero } from "@/lib/admin/tablero/snapshot";
import type { Tablero } from "@/lib/admin/tablero/types";

export async function loadTablero(sessionId?: string | null): Promise<Tablero> {
  const db = await adminDb();
  if (!db) return emptyTablero();
  const allowed = sessionId ? await sessionContactIds(db, sessionId) : null;
  const [contacts, statuses, orgs, events, rsvps] = await Promise.all([
    readPages((from, to) => db.from("crm_contacts").select("id, source, organization_id").order("id").range(from, to)),
    readPages((from, to) => db.from("crm_contact_status").select("contact_id, status").order("contact_id").range(from, to)),
    readPages((from, to) => db.from("organizations").select("id, name").order("id").range(from, to)),
    readPages((from, to) =>
      db.from("crm_events").select("contact_id, occurred_at").eq("event", "confirmar").order("id").range(from, to),
    ),
    sessionId
      ? db
          .from("session_rsvps")
          .select("id, status, confirmed_at, organization_id, created_at")
          .eq("session_id", sessionId)
          .in("status", ["confirmed", "pending"])
      : Promise.resolve({ data: [] as RsvpBoardRow[], error: null }),
  ]);
  if (rsvps.error) throw new Error(rsvps.error.message);
  const orgRows = orgs.map((row) => ({ id: row.id, name: row.name ?? "Sin organismo" }));
  const scoped = allowed ? contacts.filter((row) => allowed.has(row.id)) : contacts;
  const scopedIds = allowed ?? new Set(scoped.map((row) => row.id));
  const board = buildTablero({
    contacts: scoped.map((row) => ({ id: row.id, source: row.source, organizationId: row.organization_id })),
    statuses: statuses
      .filter((row) => scopedIds.has(row.contact_id))
      .map((row) => ({ contactId: row.contact_id, status: row.status ?? "" })),
    orgs: orgRows,
    confirmations: events
      .filter((row) => scopedIds.has(row.contact_id))
      .map((row) => ({ contactId: row.contact_id, occurredAt: row.occurred_at })),
  });
  if (!sessionId) return board;
  return applyRsvpBoard(board, (rsvps.data ?? []) as RsvpBoardRow[], orgRows);
}
