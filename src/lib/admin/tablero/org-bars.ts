import type { OrgBar, TableroContact, TableroOrg } from "@/lib/admin/tablero/types";

const confirmed = new Set(["confirmo", "registrado", "llego"]);

export function orgBars(invites: TableroContact[], statusOf: Map<string, string>, orgs: TableroOrg[]): OrgBar[] {
  const names = new Map(orgs.map((org) => [org.id, org.name]));
  const buckets = new Map<string, OrgBar>();
  for (const row of invites) {
    const organismo = names.get(row.organizationId) || "Sin organismo";
    const bucket = buckets.get(organismo) ?? { organismo, invitaciones: 0, confirmaciones: 0 };
    bucket.invitaciones += 1;
    if (confirmed.has(statusOf.get(row.id) ?? "")) bucket.confirmaciones += 1;
    buckets.set(organismo, bucket);
  }
  return [...buckets.values()]
    .sort((a, b) => b.invitaciones - a.invitaciones || a.organismo.localeCompare(b.organismo, "es"))
    .slice(0, 8);
}
