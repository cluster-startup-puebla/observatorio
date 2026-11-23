import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readPages } from "@/lib/admin/tablero/read-pages";
import { orgOpenBars } from "@/lib/admin/tablero/org-open-bars";

export async function loadOrgOpens(sessionId?: string | null) {
  const db = await adminDb();
  const now = new Date();
  if (!db) return orgOpenBars({ orgs: [], opens: [], now });
  const allowedOrgs = sessionId ? await orgIdsForSession(db, sessionId) : null;
  const [orgs, opens] = await Promise.all([
    readPages((from, to) => db.from("organizations").select("id, name").order("name").range(from, to)),
    readPages((from, to) => db.from("link_opens").select("organization_id, opened_at").order("opened_at").range(from, to)),
  ]);
  const scopedOrgs = allowedOrgs ? orgs.filter((row) => allowedOrgs.has(row.id as string)) : orgs;
  const scopedOpens = allowedOrgs
    ? opens.filter((row) => allowedOrgs.has(row.organization_id as string))
    : opens;
  return orgOpenBars({
    orgs: scopedOrgs.map((row) => ({ id: row.id as string, name: (row.name as string | null) ?? "Sin organismo" })),
    opens: scopedOpens.map((row) => ({ organizationId: row.organization_id as string, at: row.opened_at as string })),
    now,
  });
}

async function orgIdsForSession(db: NonNullable<Awaited<ReturnType<typeof adminDb>>>, sessionId: string) {
  const links = await db.from("link_copies").select("organization_id").eq("session_id", sessionId);
  if (links.error) throw new Error(links.error.message);
  return new Set((links.data ?? []).map((row) => row.organization_id as string).filter(Boolean));
}
