import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readPages } from "@/lib/admin/tablero/read-pages";
import { orgOpenBars } from "@/lib/admin/tablero/org-open-bars";

export async function loadOrgOpens() {
  const db = await adminDb();
  const now = new Date();
  if (!db) return orgOpenBars({ orgs: [], opens: [], now });
  const [orgs, opens] = await Promise.all([
    readPages((from, to) => db.from("organizations").select("id, name").order("name").range(from, to)),
    readPages((from, to) => db.from("link_opens").select("organization_id, opened_at").order("opened_at").range(from, to)),
  ]);
  return orgOpenBars({
    orgs: orgs.map((row) => ({ id: row.id as string, name: (row.name as string | null) ?? "Sin organismo" })),
    opens: opens.map((row) => ({ organizationId: row.organization_id as string, at: row.opened_at as string })),
    now,
  });
}
