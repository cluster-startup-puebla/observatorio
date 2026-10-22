import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readPages } from "@/lib/admin/tablero/read-pages";
import { buildTablero, emptyTablero } from "@/lib/admin/tablero/snapshot";
import type { Tablero } from "@/lib/admin/tablero/types";

export async function loadTablero(): Promise<Tablero> {
  const db = await adminDb();
  if (!db) return emptyTablero();
  const [contacts, statuses, orgs, events] = await Promise.all([
    readPages((from, to) => db.from("crm_contacts").select("id, source, organization_id").order("id").range(from, to)),
    readPages((from, to) => db.from("crm_contact_status").select("contact_id, status").order("contact_id").range(from, to)),
    readPages((from, to) => db.from("organizations").select("id, name").order("id").range(from, to)),
    readPages((from, to) =>
      db.from("crm_events").select("contact_id, occurred_at").eq("event", "confirmar").order("id").range(from, to),
    ),
  ]);
  return buildTablero({
    contacts: contacts.map((row) => ({ id: row.id, source: row.source, organizationId: row.organization_id })),
    statuses: statuses.map((row) => ({ contactId: row.contact_id, status: row.status ?? "" })),
    orgs: orgs.map((row) => ({ id: row.id, name: row.name ?? "Sin organismo" })),
    confirmations: events.map((row) => ({ contactId: row.contact_id, occurredAt: row.occurred_at })),
  });
}
