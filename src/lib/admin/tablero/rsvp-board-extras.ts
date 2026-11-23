import type { LinkOrgBar, Tablero, TableroEvent, TableroOrg } from "@/lib/admin/tablero/types";
import { paceBars } from "@/lib/admin/tablero/pace-bars";

export type RsvpBoardRow = {
  id: string;
  status: string;
  confirmed_at: string | null;
  organization_id: string | null;
  created_at?: string | null;
};

export function rsvpPaceEvents(rows: RsvpBoardRow[]): TableroEvent[] {
  return rows
    .filter((row) => row.status === "confirmed" && row.confirmed_at)
    .map((row) => ({ contactId: row.id, occurredAt: String(row.confirmed_at) }));
}

export function rsvpLinkOrgBars(rows: RsvpBoardRow[], orgs: TableroOrg[]): LinkOrgBar[] {
  const names = new Map(orgs.map((org) => [org.id, org.name]));
  const buckets = new Map<string, LinkOrgBar>();
  for (const row of rows) {
    const orgId = row.organization_id;
    if (!orgId) continue;
    const organismo = names.get(orgId) || "Sin organismo";
    const bucket = buckets.get(orgId) ?? { organismo, enlaces: 0, registrados: 0, pendientes: 0 };
    bucket.enlaces += 1;
    if (row.status === "pending") bucket.pendientes += 1;
    if (row.status === "confirmed") bucket.registrados += 1;
    buckets.set(orgId, bucket);
  }
  return [...buckets.values()]
    .sort((a, b) => b.enlaces - a.enlaces || a.organismo.localeCompare(b.organismo, "es"))
    .slice(0, 8);
}

export function applyRsvpBoard(board: Tablero, rows: RsvpBoardRow[], orgs: TableroOrg[], now = new Date()): Tablero {
  const linked = rows.filter((row) => row.organization_id);
  const byLinkOrg = rsvpLinkOrgBars(rows, orgs);
  const fromRsvp = linked.length > 0;
  return {
    ...board,
    pace: paceBars(rsvpPaceEvents(rows), now),
    byLinkOrg: fromRsvp ? byLinkOrg : board.byLinkOrg,
    linkSignups: fromRsvp ? linked.length : board.linkSignups,
    linkPending: fromRsvp ? linked.filter((row) => row.status === "pending").length : board.linkPending,
    linkAccepted: fromRsvp ? linked.filter((row) => row.status === "confirmed").length : board.linkAccepted,
  };
}
